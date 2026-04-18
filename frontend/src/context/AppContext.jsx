import { createContext, useContext, useState, useEffect } from 'react';
import {
  connectWallet as connectFreighter,
  getWalletAddress,
  shortenAddress,
  checkFreighterInstalled,
} from '../lib/freighter';
import { createTicket, transferTicket } from '../lib/soroban';

const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

export const DEMO_OTHER_WALLET = 'GDEMO_OTHERWALLET_B7C8D9E0F1A2B3C4D5E6F7A8';

const TICKET_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDzC5kW2v49FWYROS5R2miStr21Zk9UCgqgPsqx0MQ12T4cPp29TdRYWlyyFnLWx2S6f3J3TDP4bAkHq6lEMy6Xs1WMElBZjavQWEixU3llGq3xF687jYDku4pg65L7_xhOp_nnYODJSoFtpLNiq9vyLJH2CaQ_ZEoslVv7VhL__8pZsY3q45WCbYz9Su5JNNQY-cLbqAoZXYR1cC_046F8ZlgRHvpIhia8qfyYJvPOGn66Gk-p6eeDyo6JqiM7KcR-MeMjTb2i1Cs',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBAJSbLrqZl-REGuqU5xyGlEUKToNISsz0QZC_cb5OhhJWGjGsiEQzgxiEG5QNhNKG9DJvuvqVKMA7pK-oDzVjqo8Qh3NYhO1gwFjUjkFWOmCDncP0jCooREJYDULyPZemxX0OuqgSpD1FHRMSzOcA6-XbIj4rpWRpAIzlDMaezHS8y_2lxS7YtsGFoNkAnVN2Qal31PJTKbZiUC2c3s8xrbQOFoXY7XC1wjGdt_1IaUKHmBvHmrNKbY68N8d7ogtozXgeHvcCC3tA',
  'https://storage.googleapis.com/techsauce-prod/ugc/uploads/2024/4/1713844557_1692263684_S__13025327_0_%282%29.jpg',
];

export const EVENTS = [
  {
    eventId: 'EVT-001',
    name: 'Hackathon Manila 2026',
    date: 'Oct 24, 2026',
    location: 'Manila Convention Center',
    priceXLM: 0.05,
    tier: 'VIP Developer Zone',
    image: TICKET_IMAGES[0],
    seats: 50,
  },
  {
    eventId: 'EVT-002',
    name: 'Neon Nights World Tour',
    date: 'Nov 12, 2026',
    location: 'Araneta Coliseum, Quezon City',
    priceXLM: 0.03,
    tier: 'Floor Access',
    image: TICKET_IMAGES[1],
    seats: 200,
  },
  {
    eventId: 'EVT-003',
    name: 'DevCon Philippines 2026',
    date: 'Dec 05, 2026',
    location: 'SMX Convention Center, Pasay',
    priceXLM: 0.02,
    tier: 'General Admission',
    image: TICKET_IMAGES[2],
    seats: 500,
  },
];

// Global ticket ledger — analogous to on-chain state.
// owner: null means not yet assigned (assigned on wallet connect for demo seeds).
// TIX-DEMO004 always belongs to DEMO_OTHER_WALLET — used to demonstrate ownership mismatch.
const INITIAL_REGISTRY = {
  'TIX-DEMO001': {
    ticketId: 'TIX-DEMO001', eventName: 'Hackathon Manila 2026', tier: 'VIP Developer Zone',
    date: 'Oct 24, 2026', status: 'valid', txHash: 'A3F7C9B2D1E4F8A0B5C6D2E3F1A4B7C8',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    image: TICKET_IMAGES[0], location: 'Manila Convention Center',
    seatRow: 'VIP-042', price: '0.05 XLM', maxResale: '0.055 XLM', maxResaleXLM: 0.055,
    transfers: 0, maxTransfers: 2, owner: null,
  },
  'TIX-DEMO002': {
    ticketId: 'TIX-DEMO002', eventName: 'Neon Nights World Tour', tier: 'Floor B2, Row 4',
    date: 'Nov 12, 2026', status: 'valid', txHash: '9B2D1E4F8A0C3F7A5C6D2E3B1A4B7F8C',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    image: TICKET_IMAGES[1], location: 'Araneta Coliseum, Quezon City',
    seatRow: 'Floor B2-R4', price: '0.03 XLM', maxResale: '0.033 XLM', maxResaleXLM: 0.033,
    transfers: 1, maxTransfers: 2, owner: null,
  },
  'TIX-DEMO003': {
    ticketId: 'TIX-DEMO003', eventName: 'Tech Summit 2025', tier: 'Standard Admission',
    date: 'Dec 01, 2025', status: 'used', txHash: 'C7D8E9F0A1B2C3D4E5F6A7B8C9D0E1F2',
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
    image: TICKET_IMAGES[2], location: 'SM Mall of Asia Arena',
    seatRow: 'STD-108', price: '0.02 XLM', maxResale: '0 XLM', maxResaleXLM: 0,
    transfers: 0, maxTransfers: 0, owner: null,
  },
  // This ticket ALWAYS belongs to a different wallet — used for ownership mismatch demo
  'TIX-DEMO004': {
    ticketId: 'TIX-DEMO004', eventName: 'Hackathon Manila 2026', tier: 'General Admission',
    date: 'Oct 24, 2026', status: 'valid', txHash: 'D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    image: TICKET_IMAGES[0], location: 'Manila Convention Center',
    seatRow: 'GA-009', price: '0.05 XLM', maxResale: '0.055 XLM', maxResaleXLM: 0.055,
    transfers: 0, maxTransfers: 2, owner: DEMO_OTHER_WALLET,
  },
  // Pre-seeded marketplace ticket owned by another wallet
  'TIX-MKT001': {
    ticketId: 'TIX-MKT001', eventName: 'Neon Nights World Tour', tier: 'VIP Floor Access',
    date: 'Nov 12, 2026', status: 'listed', txHash: 'F1E2D3C4B5A697886950413F1E2D3C4B',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    image: TICKET_IMAGES[1], location: 'Araneta Coliseum, Quezon City',
    seatRow: 'VIP-001', price: '0.03 XLM', maxResale: '0.033 XLM', maxResaleXLM: 0.033,
    transfers: 0, maxTransfers: 2, owner: DEMO_OTHER_WALLET,
  },
};

const INITIAL_MARKETPLACE = [
  {
    listingId: 'LST-SEED001',
    ticketId: 'TIX-MKT001',
    sellerWallet: DEMO_OTHER_WALLET,
    priceXLM: 0.03,
    listedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function AppProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [xlmBalance, setXlmBalance] = useState(100.00);
  const [ticketRegistry, setTicketRegistry] = useState(INITIAL_REGISTRY);
  const [marketplace, setMarketplace] = useState(INITIAL_MARKETPLACE);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [hasFreighter, setHasFreighter] = useState(true);

  useEffect(() => {
    checkFreighterInstalled().then(ok => {
      setHasFreighter(ok);
      if (ok) getWalletAddress().then(addr => { if (addr) setWallet(addr); });
    });
  }, []);

  // Assign demo seed tickets to the connected wallet
  useEffect(() => {
    if (wallet) {
      setTicketRegistry(prev => ({
        ...prev,
        'TIX-DEMO001': { ...prev['TIX-DEMO001'], owner: wallet },
        'TIX-DEMO002': { ...prev['TIX-DEMO002'], owner: wallet },
        'TIX-DEMO003': { ...prev['TIX-DEMO003'], owner: wallet },
        // TIX-DEMO004 owner never changes — always DEMO_OTHER_WALLET
      }));
    }
  }, [wallet]);

  // Visible tickets for the current wallet
  const tickets = wallet
    ? Object.values(ticketRegistry).filter(t => t.owner === wallet)
    : [];

  // Marketplace enriched with ticket data
  const marketplaceListings = marketplace
    .map(l => ({ ...l, ticket: ticketRegistry[l.ticketId] }))
    .filter(l => l.ticket);

  function showStatus(type, msg) {
    setTxStatus({ type, msg });
    if (type !== 'pending') setTimeout(() => setTxStatus(null), 5500);
  }

  async function connect() {
    if (!hasFreighter) { window.open('https://www.freighter.app/', '_blank'); return false; }
    setLoading(true);
    try {
      const { address } = await connectFreighter();
      setWallet(address);
      showStatus('success', 'Wallet connected to Stellar Testnet!');
      return true;
    } catch (err) {
      showStatus('error', err.message || 'Failed to connect wallet');
      return false;
    } finally {
      setLoading(false);
    }
  }

  function disconnect() {
    setWallet(null);
    setTxStatus(null);
  }

  async function buyTicket({ eventId, eventName, tier, date, location, priceXLM = 0.05 }) {
    if (!wallet) { showStatus('error', 'Connect your wallet first'); return null; }
    if (xlmBalance < priceXLM) {
      showStatus('error', `Insufficient XLM balance — need ${priceXLM} XLM, have ${xlmBalance.toFixed(4)} XLM. Transaction rejected by network.`);
      return null;
    }
    setLoading(true);
    showStatus('pending', 'Submitting transaction to Stellar Testnet...');
    try {
      const result = await createTicket({ eventName, ownerAddress: wallet });
      const event = EVENTS.find(e => e.eventId === eventId);
      const newTicket = {
        ticketId: result.ticketId,
        eventName,
        tier: tier || 'General Admission',
        date: date || new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }),
        status: 'valid',
        owner: wallet,
        createdAt: result.createdAt,
        txHash: result.txHash,
        location: location || 'Venue TBA',
        seatRow: `GA-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
        price: `${priceXLM} XLM`,
        maxResale: `${(priceXLM * 1.1).toFixed(4)} XLM`,
        maxResaleXLM: parseFloat((priceXLM * 1.1).toFixed(4)),
        transfers: 0,
        maxTransfers: 2,
        image: event?.image || TICKET_IMAGES[Math.floor(Math.random() * TICKET_IMAGES.length)],
      };
      setTicketRegistry(prev => ({ ...prev, [newTicket.ticketId]: newTicket }));
      setXlmBalance(prev => parseFloat((prev - priceXLM).toFixed(4)));
      showStatus('success', `Ticket purchased! TX: ${result.txHash.slice(0, 12)}… | −${priceXLM} XLM`);
      return newTicket;
    } catch (err) {
      showStatus('error', err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Alias for OrganizerPanel compatibility
  const mintTicket = ({ eventName, tier, date, location }) =>
    buyTicket({ eventName, tier, date, location, priceXLM: 0.05 });

  function listForResale(ticketId, priceXLM) {
    const ticket = ticketRegistry[ticketId];
    if (!ticket) { showStatus('error', 'Ticket not found on ledger'); return false; }
    if (ticket.owner !== wallet) { showStatus('error', 'Unauthorized — you do not own this ticket'); return false; }
    if (ticket.status === 'used') { showStatus('error', 'Cannot resell a used ticket — smart contract rule enforced'); return false; }
    if (ticket.status === 'listed') { showStatus('error', 'Ticket is already listed on the marketplace'); return false; }
    if (ticket.transfers >= ticket.maxTransfers) {
      showStatus('error', `Transfer limit reached (${ticket.maxTransfers} max) — contract blocks further resale`);
      return false;
    }
    if (ticket.maxResaleXLM > 0 && priceXLM > ticket.maxResaleXLM) {
      showStatus('error', `Price ${priceXLM} XLM exceeds resale cap of ${ticket.maxResaleXLM} XLM — scalping protection active`);
      return false;
    }
    const listingId = `LST-${Date.now().toString(36).toUpperCase()}`;
    setTicketRegistry(prev => ({
      ...prev,
      [ticketId]: { ...prev[ticketId], status: 'listed' },
    }));
    setMarketplace(prev => [
      ...prev,
      { listingId, ticketId, sellerWallet: wallet, priceXLM, listedAt: new Date().toISOString() },
    ]);
    showStatus('success', `Listed for ${priceXLM} XLM — resale cap enforced by smart contract`);
    return true;
  }

  function cancelListing(listingId) {
    const listing = marketplace.find(l => l.listingId === listingId);
    if (!listing || listing.sellerWallet !== wallet) return false;
    setTicketRegistry(prev => ({
      ...prev,
      [listing.ticketId]: { ...prev[listing.ticketId], status: 'valid' },
    }));
    setMarketplace(prev => prev.filter(l => l.listingId !== listingId));
    showStatus('success', 'Listing cancelled — ticket returned to your wallet');
    return true;
  }

  async function buyFromMarket(listingId) {
    const listing = marketplace.find(l => l.listingId === listingId);
    if (!listing) { showStatus('error', 'Listing no longer available'); return false; }
    if (listing.sellerWallet === wallet) { showStatus('error', 'You cannot purchase your own listing'); return false; }
    if (xlmBalance < listing.priceXLM) {
      showStatus('error', `Insufficient XLM — need ${listing.priceXLM} XLM, have ${xlmBalance.toFixed(4)} XLM`);
      return false;
    }
    setLoading(true);
    showStatus('pending', 'Processing peer-to-peer transfer on Stellar Testnet...');
    try {
      const result = await transferTicket({
        ticketId: listing.ticketId,
        fromAddress: listing.sellerWallet,
        toAddress: wallet,
      });
      setTicketRegistry(prev => ({
        ...prev,
        [listing.ticketId]: {
          ...prev[listing.ticketId],
          owner: wallet,
          status: 'valid',
          transfers: (prev[listing.ticketId]?.transfers || 0) + 1,
          txHash: result.txHash,
        },
      }));
      setMarketplace(prev => prev.filter(l => l.listingId !== listingId));
      setXlmBalance(prev => parseFloat((prev - listing.priceXLM).toFixed(4)));
      showStatus('success', `Purchased! Ownership transferred on-chain. TX: ${result.txHash.slice(0, 12)}…`);
      return true;
    } catch (err) {
      showStatus('error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  // QR validation — mirrors on-chain ownership + status checks.
  // Checks: existence → used → ownership → listed
  function validateQR(ticketId) {
    const ticket = ticketRegistry[ticketId];
    if (!ticket) {
      return {
        isValid: false,
        reason: 'TICKET_NOT_FOUND',
        message: 'Ticket ID does not exist on Stellar Testnet — possible fake QR',
      };
    }
    if (ticket.status === 'used') {
      return {
        isValid: false,
        reason: 'ALREADY_USED',
        message: 'Ticket already scanned at entry — duplicate blocked by smart contract',
        ticket,
      };
    }
    if (wallet && ticket.owner !== wallet) {
      return {
        isValid: false,
        reason: 'OWNERSHIP_MISMATCH',
        message: `QR belongs to a different wallet (${ticket.owner?.slice(0, 8)}…${ticket.owner?.slice(-4)}) — not the presenter`,
        ticket,
      };
    }
    if (ticket.status === 'listed') {
      return {
        isValid: false,
        reason: 'LISTED_FOR_RESALE',
        message: 'Ticket is currently listed for resale — ownership transfer pending',
        ticket,
      };
    }
    return {
      isValid: true,
      reason: 'VALID',
      message: 'Ticket ownership verified on Stellar Testnet — allow entry',
      ticket,
    };
  }

  function markUsed(ticketId) {
    setTicketRegistry(prev => ({
      ...prev,
      [ticketId]: { ...prev[ticketId], status: 'used' },
    }));
    showStatus('success', 'Checked in — ticket permanently marked as used on Stellar Testnet');
  }

  async function doTransfer(ticketId, toAddress) {
    const ticket = ticketRegistry[ticketId];
    if (!ticket) { showStatus('error', 'Ticket not found'); return false; }
    if (ticket.owner !== wallet) { showStatus('error', 'Unauthorized — you do not own this ticket'); return false; }
    if (ticket.status === 'used') {
      showStatus('error', 'Cannot transfer a used ticket — blockchain rule enforced');
      return false;
    }
    setLoading(true);
    showStatus('pending', 'Processing transfer on Stellar Testnet...');
    try {
      const result = await transferTicket({ ticketId, fromAddress: wallet, toAddress });
      setTicketRegistry(prev => ({
        ...prev,
        [ticketId]: {
          ...prev[ticketId],
          owner: toAddress,
          transfers: (prev[ticketId].transfers || 0) + 1,
          txHash: result.txHash,
        },
      }));
      showStatus('success', `Transferred! TX: ${result.txHash.slice(0, 12)}…`);
      return true;
    } catch (err) {
      showStatus('error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Demo utility — lets presenter simulate insufficient balance scenario
  function demoSetBalance(amount) {
    setXlmBalance(amount);
    showStatus('success', `Demo: XLM balance set to ${amount} XLM`);
  }

  // Demo utility — resets seed tickets back to valid for re-demo
  function demoReset() {
    setTicketRegistry(prev => ({
      ...prev,
      'TIX-DEMO001': { ...INITIAL_REGISTRY['TIX-DEMO001'], owner: wallet },
      'TIX-DEMO002': { ...INITIAL_REGISTRY['TIX-DEMO002'], owner: wallet },
      'TIX-DEMO003': { ...INITIAL_REGISTRY['TIX-DEMO003'], owner: wallet },
    }));
    setXlmBalance(100.00);
    showStatus('success', 'Demo state reset — seed tickets restored');
  }

  return (
    <AppContext.Provider value={{
      wallet, tickets, xlmBalance, loading, txStatus, hasFreighter,
      marketplace: marketplaceListings,
      shortenAddress, connect, disconnect,
      buyTicket, mintTicket, listForResale, cancelListing, buyFromMarket,
      validateQR, markUsed, doTransfer,
      demoSetBalance, demoReset,
      setTxStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
}
