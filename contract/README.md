
# TixSigurado — Soroban Smart Contract

Blockchain ticketing contract for the TixSigurado platform, built on [Soroban](https://soroban.stellar.org) (Stellar's smart-contract platform).

---

## Contract functions

| Function | Auth required | Description |
|---|---|---|
| `initialize(organizer)` | — | One-time setup, registers organizer |
| `mint_ticket(owner, event_name, ticket_id, price, max_resale_price, max_transfers)` | organizer | Creates a new ticket NFT |
| `transfer_ticket(ticket_id, new_owner)` | current owner | Transfers ownership (counts toward limit) |
| `list_for_resale(ticket_id, ask_price)` | current owner | Lists on marketplace (price ≤ cap) |
| `buy_from_resale(ticket_id, buyer)` | buyer | Buys listed ticket; returns (ticket, royalty, seller_proceeds) |
| `mark_ticket_used(ticket_id)` | organizer | Marks ticket scanned / used at gate |
| `validate_ticket(ticket_id, claimer)` | — | Returns "valid" / "used" / "listed" / "wrong_owner" |
| `cancel_listing(ticket_id)` | current owner | Removes ticket from marketplace |
| `get_ticket(ticket_id)` | — | Read-only ticket lookup |
| `get_listing(ticket_id)` | — | Read-only listing lookup |

### Business rules
- **Price cap** — `list_for_resale` panics if `ask_price > max_resale_price`.
- **Transfer limit** — `transfer_ticket` and `buy_from_resale` panic when `transfers_used >= max_transfers`.
- **Royalty** — organizer receives 5 % of every resale (`ask_price / 20`); the dApp is responsible for settling token transfers using the returned `royalty` and `seller_proceeds` values.
- **Used tickets** — cannot be transferred or listed after `mark_ticket_used`.

---

## Prerequisites

```bash
# Rust toolchain (stable)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# WASM target
rustup target add wasm32-unknown-unknown

# Soroban CLI
cargo install --locked soroban-cli
```

---

## Build

```bash
cd contract

# Debug build (used by tests)
cargo build

# Optimised WASM for deployment
cargo build --release --target wasm32-unknown-unknown
# Output: target/wasm32-unknown-unknown/release/tixsigurado.wasm
```

---

## Run tests

```bash
cd contract
cargo test
```

Expected output: 6 tests pass (5 named tests + the embedded resale-buy sub-test).

---

## Deploy to Testnet

```bash
# 1. Configure CLI for testnet
soroban config network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# 2. Generate / fund a deployer identity
soroban keys generate deployer --network testnet
soroban keys fund deployer --network testnet

# 3. Deploy the contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/tixsigurado.wasm \
  --source deployer \
  --network testnet
# → prints CONTRACT_ID

# 4. Initialize with organizer address
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source deployer \
  --network testnet \
  -- initialize \
  --organizer <ORGANIZER_ADDRESS>
```

---

## Example invocations

```bash
# Mint a ticket
soroban contract invoke --id <CONTRACT_ID> --source deployer --network testnet \
  -- mint_ticket \
  --owner <OWNER_ADDRESS> \
  --event_name "Stellar Fest 2025" \
  --ticket_id 1 \
  --price 500 \
  --max_resale_price 800 \
  --max_transfers 3

# Validate a ticket
soroban contract invoke --id <CONTRACT_ID> --network testnet \
  -- validate_ticket \
  --ticket_id 1 \
  --claimer <CLAIMER_ADDRESS>
```

---

## Connecting to the React frontend

The React frontend currently uses mock functions in `src/context/AppContext.jsx`.  
When you are ready to wire up real contract calls, replace each mock with a call using the [Stellar SDK](https://github.com/stellar/js-stellar-sdk) or [Soroban React hooks](https://github.com/paltalabs/soroban-react):

```js
// Example: replace mockMintTicket with a real contract call
import { Contract, SorobanRpc } from "@stellar/stellar-sdk";

const contract = new Contract(CONTRACT_ID);
const tx = await contract.call("mint_ticket", owner, eventName, ticketId, price, maxResale, maxTransfers);
```

No frontend files need to change until you are ready for that swap.
