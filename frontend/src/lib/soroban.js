import * as StellarSdk from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

// ── Config ─────────────────────────────────────────────────────────────────

export const RPC_URL        = 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const CONTRACT_ID    = 'CDLNFFKNU45J32XPEIHYQ7BM555VILUF4CMCUM55D7AHBF4K3FXR4S6B';
export const ORGANIZER_ADDRESS = 'GB67ZIMOK4XJQNWS5PBAP77BHSLODRX54QWFU3CR6L2DSMD65JKXKPAG';

const KNOWN_TICKET_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ── Helpers ────────────────────────────────────────────────────────────────

const rpc      = () => new StellarSdk.rpc.Server(RPC_URL);
const contract = () => new StellarSdk.Contract(CONTRACT_ID);

function stroopsToXlm(stroops) { return Number(stroops) / 10_000_000; }
function xlmToStroops(xlm)     { return BigInt(Math.round(xlm * 10_000_000)); }

function normalizeStatus(status) {
  if (Array.isArray(status)) return String(status[0]).toLowerCase();
  return String(status).toLowerCase();
}

function requireId(id, name = 'onChainId') {
  if (id === undefined || id === null || id === '') {
    throw new Error(`Missing ${name} — cannot build transaction`);
  }
  return BigInt(id);
}

// ── READ: single ticket ────────────────────────────────────────────────────

export async function getTicketFromChain(onChainId) {
  const srv = rpc();
  const account = await srv.getAccount(ORGANIZER_ADDRESS);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract().call(
      'get_ticket',
      StellarSdk.nativeToScVal(BigInt(onChainId), { type: 'u64' }),
    ))
    .setTimeout(30)
    .build();

  const sim = await srv.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim)) return null;

  const r = StellarSdk.scValToNative(sim.result.retval);
  return {
    onChainId:      String(onChainId),
    owner:          r.owner.toString(),
    eventName:      r.event_name,
    price:          stroopsToXlm(r.price),
    maxResalePrice: stroopsToXlm(r.max_resale_price),
    maxTransfers:   Number(r.max_transfers),
    transfersUsed:  Number(r.transfers_used),
    status:         normalizeStatus(r.status),
  };
}

// ── READ: marketplace listings ─────────────────────────────────────────────

export async function getMarketplaceListingsFromChain() {
  const srv = rpc();
  const account = await srv.getAccount(ORGANIZER_ADDRESS);
  const listings = [];

  for (const id of KNOWN_TICKET_IDS) {
    try {
      const listingTx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract().call(
          'get_listing',
          StellarSdk.nativeToScVal(BigInt(id), { type: 'u64' }),
        ))
        .setTimeout(30)
        .build();

      const listingSim = await srv.simulateTransaction(listingTx);
      if (StellarSdk.rpc.Api.isSimulationError(listingSim)) continue;

      const listingData = StellarSdk.scValToNative(listingSim.result.retval);
      const ticket = await getTicketFromChain(id);
      if (!ticket) continue;

      listings.push({
        listingId:    `LST-${id}`,
        ticketId:     `TIX-${String(id).padStart(3, '0')}`,
        onChainId:    String(id),
        sellerWallet: listingData.seller.toString(),
        priceXLM:     stroopsToXlm(listingData.ask_price),
        listedAt:     new Date().toISOString(),
        ticket: {
          ticketId:     `TIX-${String(id).padStart(3, '0')}`,
          onChainId:    String(id),
          eventName:    ticket.eventName,
          price:        `${ticket.price} XLM`,
          maxResale:    `${ticket.maxResalePrice} XLM`,
          maxResaleXLM: ticket.maxResalePrice,
          transfers:    ticket.transfersUsed,
          maxTransfers: ticket.maxTransfers,
          status:       ticket.status,
        },
      });
    } catch {
      // no listing for this id
    }
  }

  return listings;
}

// ── READ: user tickets ─────────────────────────────────────────────────────

export async function getUserTicketsFromChain(userAddress) {
  const tickets = [];

  for (const id of KNOWN_TICKET_IDS) {
    try {
      const ticket = await getTicketFromChain(id);
      if (ticket && ticket.owner === userAddress) {
        tickets.push({
          ticketId:     `TIX-${String(id).padStart(3, '0')}`,
          onChainId:    String(id),
          eventName:    ticket.eventName,
          owner:        ticket.owner,
          status:       ticket.status,
          price:        `${ticket.price} XLM`,
          maxResale:    `${ticket.maxResalePrice} XLM`,
          maxResaleXLM: ticket.maxResalePrice,
          transfers:    ticket.transfersUsed,
          maxTransfers: ticket.maxTransfers,
          date:         'TBD',
          location:     'TBD',
          seatRow:      `ROW-${id}`,
          image:        `https://picsum.photos/400/300?random=${id}`,
          txHash:       `on-chain-${id}`,
          createdAt:    new Date().toISOString(),
        });
      }
    } catch {
      // ticket not found — skip
    }
  }

  return tickets;
}

// ── WRITE: shared build → simulate → sign → submit helper ──────────────────
// Following the pattern from the Stellar dev skill: frontend-stellar-sdk.md

async function buildAndSend(signerAddress, buildOp) {
  const srv = rpc();

  // 1. Load fresh account (avoids seq-number issues)
  const account = await srv.getAccount(signerAddress);

  // 2. Build the transaction
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(buildOp(contract()))
    .setTimeout(180)
    .build();

  // 3. Simulate — required for Soroban; populates resource fees + footprint
  const sim = await srv.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }

  // 4. Assemble: injects sorobanData (footprint + resource fees) into tx
  const prepared = StellarSdk.rpc.assembleTransaction(tx, sim).build();

  // 5. Sign with Freighter (opens wallet popup)
  const signResult = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    accountToSign: signerAddress,
  });

  const signedXdr =
    typeof signResult === 'string' ? signResult : signResult.signedTxXdr;

  if (!signedXdr) throw new Error('Freighter did not return a signed transaction');

  // 6. Submit to Soroban RPC
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE,
  );
  const sendResp = await srv.sendTransaction(signedTx);

  if (sendResp.status === 'ERROR') {
    let detail = 'unknown error';
    try {
      detail = sendResp.errorResult?.toXDR?.('base64') ?? JSON.stringify(sendResp.errorResult);
    } catch {
      detail = String(sendResp.errorResult ?? 'no details');
    }
    throw new Error(`Transaction rejected by network: ${detail}`);
  }

  // 7. Poll until confirmed (NOT_FOUND = still pending)
  let resp;
  let attempts = 0;
  do {
    await new Promise(r => setTimeout(r, 1500));
    resp = await srv.getTransaction(sendResp.hash);
    attempts++;
  } while (
    resp.status === StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND &&
    attempts < 30
  );

  if (resp.status !== StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS) {
    let detail = resp.status;
    try {
      if (resp.resultXdr) detail += `: ${resp.resultXdr.toXDR?.('base64') ?? resp.resultXdr}`;
    } catch { /* ignore */ }
    throw new Error(`Transaction failed: ${detail}`);
  }

  return { txHash: sendResp.hash };
}

// ── WRITE: mint_ticket  (organizer auth required) ──────────────────────────

export async function createTicket({ eventName, ownerAddress, priceXLM, maxResaleXLM, maxTransfers }) {
  const ticketId = BigInt(Date.now() % 10_000_000 + 100);

  const { txHash } = await buildAndSend(ORGANIZER_ADDRESS, (c) =>
    c.call(
      'mint_ticket',
      new StellarSdk.Address(ownerAddress).toScVal(),
      StellarSdk.nativeToScVal(eventName, { type: 'string' }),
      StellarSdk.nativeToScVal(ticketId, { type: 'u64' }),
      StellarSdk.nativeToScVal(xlmToStroops(priceXLM), { type: 'u64' }),
      StellarSdk.nativeToScVal(xlmToStroops(maxResaleXLM), { type: 'u64' }),
      StellarSdk.nativeToScVal(Number(maxTransfers), { type: 'u32' }),
    )
  );

  return {
    success: true,
    ticketId: `TIX-${ticketId.toString().padStart(3, '0')}`,
    onChainId: ticketId.toString(),
    txHash,
    createdAt: new Date().toISOString(),
  };
}

// ── WRITE: transfer_ticket  (owner auth) ──────────────────────────────────

export async function transferTicket({ onChainId, fromAddress, toAddress }) {
  const id = requireId(onChainId);
  return buildAndSend(fromAddress, (c) =>
    c.call(
      'transfer_ticket',
      StellarSdk.nativeToScVal(id, { type: 'u64' }),
      new StellarSdk.Address(toAddress).toScVal(),
    )
  );
}

// ── WRITE: list_for_resale  (owner auth) ──────────────────────────────────

export async function listForResale({ onChainId, signerAddress, priceXLM }) {
  const id = requireId(onChainId);
  return buildAndSend(signerAddress, (c) =>
    c.call(
      'list_for_resale',
      StellarSdk.nativeToScVal(id, { type: 'u64' }),
      StellarSdk.nativeToScVal(xlmToStroops(priceXLM), { type: 'u64' }),
    )
  );
}

// ── WRITE: buy_from_resale  (buyer auth) ──────────────────────────────────

export async function buyFromResale({ onChainId, buyerAddress }) {
  const id = requireId(onChainId);
  return buildAndSend(buyerAddress, (c) =>
    c.call(
      'buy_from_resale',
      StellarSdk.nativeToScVal(id, { type: 'u64' }),
      new StellarSdk.Address(buyerAddress).toScVal(),
    )
  );
}

// ── WRITE: cancel_listing  (owner auth) ───────────────────────────────────

export async function cancelListing({ onChainId, signerAddress }) {
  const id = requireId(onChainId);
  return buildAndSend(signerAddress, (c) =>
    c.call(
      'cancel_listing',
      StellarSdk.nativeToScVal(id, { type: 'u64' }),
    )
  );
}

// ── WRITE: mark_ticket_used  (organizer auth) ─────────────────────────────

export async function markTicketUsed({ onChainId, signerAddress }) {
  const id = requireId(onChainId);
  return buildAndSend(signerAddress || ORGANIZER_ADDRESS, (c) =>
    c.call(
      'mark_ticket_used',
      StellarSdk.nativeToScVal(id, { type: 'u64' }),
    )
  );
}

// ── READ: validate_ticket  (no auth) ──────────────────────────────────────
// validate_ticket(ticket_id: u64, claimer: Address) → "valid"|"used"|"listed"|"wrong_owner"

export async function validateTicket({ onChainId, claimerAddress }) {
  const srv = rpc();
  const account = await srv.getAccount(ORGANIZER_ADDRESS);
  const claimer = claimerAddress || ORGANIZER_ADDRESS;

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract().call(
      'validate_ticket',
      StellarSdk.nativeToScVal(BigInt(onChainId), { type: 'u64' }),
      new StellarSdk.Address(claimer).toScVal(),
    ))
    .setTimeout(30)
    .build();

  const sim = await srv.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim)) return { status: 'not_found' };

  const result = StellarSdk.scValToNative(sim.result.retval);
  return { status: String(result) };
}
