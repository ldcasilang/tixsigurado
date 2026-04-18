#![no_std]

mod test;

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
};

// ── Storage keys ────────────────────────────────────────────────────────────

const ORGANIZER: Symbol = symbol_short!("ORGANIZER");

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Ticket(u64),
    Listing(u64),
}

// ── Data types ───────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum TicketStatus {
    Valid,
    Used,
    Listed,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Ticket {
    pub ticket_id: u64,
    pub event_name: String,
    pub owner: Address,
    pub organizer: Address,
    pub price: u64,
    pub max_resale_price: u64,
    pub max_transfers: u32,
    pub transfers_used: u32,
    pub status: TicketStatus,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Listing {
    pub ticket_id: u64,
    pub seller: Address,
    pub ask_price: u64,
}

// ── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct TixSigurado;

#[contractimpl]
impl TixSigurado {
    // ── Admin ────────────────────────────────────────────────────────────────

    /// Must be called once to register the contract organizer/deployer.
    pub fn initialize(env: Env, organizer: Address) {
        if env.storage().instance().has(&ORGANIZER) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ORGANIZER, &organizer);
    }

    // ── Core ticket functions ─────────────────────────────────────────────────

    /// Mint a new ticket NFT and assign it to `owner`.
    pub fn mint_ticket(
        env: Env,
        owner: Address,
        event_name: String,
        ticket_id: u64,
        price: u64,
        max_resale_price: u64,
        max_transfers: u32,
    ) -> Ticket {
        let organizer = Self::get_organizer(&env);
        organizer.require_auth();

        let key = DataKey::Ticket(ticket_id);
        if env.storage().persistent().has(&key) {
            panic!("ticket already exists");
        }

        let ticket = Ticket {
            ticket_id,
            event_name,
            owner,
            organizer,
            price,
            max_resale_price,
            max_transfers,
            transfers_used: 0,
            status: TicketStatus::Valid,
        };

        env.storage().persistent().set(&key, &ticket);
        ticket
    }

    /// Transfer ticket ownership to `new_owner`.
    /// Requires authorization from the current owner.
    /// Fails if ticket is Used or has hit max_transfers.
    pub fn transfer_ticket(env: Env, ticket_id: u64, new_owner: Address) -> Ticket {
        let mut ticket = Self::load_ticket(&env, ticket_id);

        if ticket.status == TicketStatus::Used {
            panic!("ticket already used");
        }
        if ticket.transfers_used >= ticket.max_transfers {
            panic!("transfer limit reached");
        }

        ticket.owner.require_auth();

        ticket.owner = new_owner;
        ticket.transfers_used += 1;
        if ticket.status == TicketStatus::Listed {
            ticket.status = TicketStatus::Valid;
            env.storage()
                .temporary()
                .remove(&DataKey::Listing(ticket_id));
        }

        env.storage()
            .persistent()
            .set(&DataKey::Ticket(ticket_id), &ticket);
        ticket
    }

    /// List a ticket on the resale marketplace.
    /// `ask_price` must not exceed `max_resale_price`.
    pub fn list_for_resale(env: Env, ticket_id: u64, ask_price: u64) -> Listing {
        let mut ticket = Self::load_ticket(&env, ticket_id);

        if ticket.status == TicketStatus::Used {
            panic!("ticket already used");
        }
        if ask_price > ticket.max_resale_price {
            panic!("ask price exceeds cap");
        }

        ticket.owner.require_auth();

        let listing = Listing {
            ticket_id,
            seller: ticket.owner.clone(),
            ask_price,
        };

        ticket.status = TicketStatus::Listed;
        env.storage()
            .persistent()
            .set(&DataKey::Ticket(ticket_id), &ticket);
        // Listings live in temporary storage (auto-expired by Soroban ledger TTL).
        env.storage()
            .temporary()
            .set(&DataKey::Listing(ticket_id), &listing);

        listing
    }

    /// Buy a listed ticket.
    /// Caller (`buyer`) pays `ask_price`; organizer receives 5% royalty,
    /// seller receives the remainder.  Ownership is transferred to buyer.
    ///
    /// NOTE: Token transfers (XLM / SAC) are handled off-chain or via a
    /// separate token contract call wired in by the dApp.  This function
    /// records ownership and emits the royalty split for the dApp to act on.
    pub fn buy_from_resale(env: Env, ticket_id: u64, buyer: Address) -> (Ticket, u64, u64) {
        buyer.require_auth();

        let listing: Listing = env
            .storage()
            .temporary()
            .get(&DataKey::Listing(ticket_id))
            .unwrap_or_else(|| panic!("ticket not listed"));

        let mut ticket = Self::load_ticket(&env, ticket_id);

        if ticket.status != TicketStatus::Listed {
            panic!("ticket not listed");
        }
        if ticket.transfers_used >= ticket.max_transfers {
            panic!("transfer limit reached");
        }

        let royalty = listing.ask_price / 20; // 5 %
        let seller_proceeds = listing.ask_price - royalty;

        ticket.owner = buyer;
        ticket.transfers_used += 1;
        ticket.status = TicketStatus::Valid;

        env.storage()
            .persistent()
            .set(&DataKey::Ticket(ticket_id), &ticket);
        env.storage()
            .temporary()
            .remove(&DataKey::Listing(ticket_id));

        // Returns (updated ticket, royalty_amount, seller_proceeds) so the
        // calling dApp can settle the token transfers accordingly.
        (ticket, royalty, seller_proceeds)
    }

    /// Mark a ticket as used (gate scanning).
    /// Only the organizer may call this.
    pub fn mark_ticket_used(env: Env, ticket_id: u64) -> Ticket {
        let organizer = Self::get_organizer(&env);
        organizer.require_auth();

        let mut ticket = Self::load_ticket(&env, ticket_id);

        if ticket.status == TicketStatus::Used {
            panic!("ticket already used");
        }

        ticket.status = TicketStatus::Used;
        env.storage()
            .persistent()
            .set(&DataKey::Ticket(ticket_id), &ticket);
        ticket
    }

    /// Validate a ticket for a given `claimer`.
    /// Returns a status string: "valid" | "used" | "listed" | "wrong_owner".
    pub fn validate_ticket(env: Env, ticket_id: u64, claimer: Address) -> String {
        let ticket = Self::load_ticket(&env, ticket_id);

        if ticket.status == TicketStatus::Used {
            return String::from_str(&env, "used");
        }
        if ticket.status == TicketStatus::Listed {
            return String::from_str(&env, "listed");
        }
        if ticket.owner != claimer {
            return String::from_str(&env, "wrong_owner");
        }
        String::from_str(&env, "valid")
    }

    /// Cancel an active resale listing.
    /// Only the current ticket owner (seller) may call this.
    pub fn cancel_listing(env: Env, ticket_id: u64) -> Ticket {
        let mut ticket = Self::load_ticket(&env, ticket_id);

        if ticket.status != TicketStatus::Listed {
            panic!("ticket is not listed");
        }

        ticket.owner.require_auth();

        ticket.status = TicketStatus::Valid;
        env.storage()
            .persistent()
            .set(&DataKey::Ticket(ticket_id), &ticket);
        env.storage()
            .temporary()
            .remove(&DataKey::Listing(ticket_id));

        ticket
    }

    // ── Read-only helpers ────────────────────────────────────────────────────

    pub fn get_ticket(env: Env, ticket_id: u64) -> Ticket {
        Self::load_ticket(&env, ticket_id)
    }

    pub fn get_listing(env: Env, ticket_id: u64) -> Listing {
        env.storage()
            .temporary()
            .get(&DataKey::Listing(ticket_id))
            .unwrap_or_else(|| panic!("no listing found"))
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    fn load_ticket(env: &Env, ticket_id: u64) -> Ticket {
        env.storage()
            .persistent()
            .get(&DataKey::Ticket(ticket_id))
            .unwrap_or_else(|| panic!("ticket not found"))
    }

    fn get_organizer(env: &Env) -> Address {
        env.storage()
            .instance()
            .get(&ORGANIZER)
            .unwrap_or_else(|| panic!("contract not initialized"))
    }
}
