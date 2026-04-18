#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

// ── Helpers ──────────────────────────────────────────────────────────────────

fn setup() -> (Env, TixSiguradoClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(TixSigurado, ());
    let client = TixSiguradoClient::new(&env, &contract_id);

    let organizer = Address::generate(&env);
    client.initialize(&organizer);

    (env, client, organizer)
}

fn sample_ticket(env: &Env, client: &TixSiguradoClient, owner: &Address) -> Ticket {
    client.mint_ticket(
        owner,
        &String::from_str(env, "Stellar Fest 2025"),
        &1_u64,
        &500_u64,       // price
        &800_u64,       // max_resale_price
        &3_u32,         // max_transfers
    )
}

// ── Test 1: Mint ticket successfully ─────────────────────────────────────────

#[test]
fn test_mint_ticket_success() {
    let (env, client, _organizer) = setup();
    let owner = Address::generate(&env);

    let ticket = sample_ticket(&env, &client, &owner);

    assert_eq!(ticket.ticket_id, 1);
    assert_eq!(ticket.event_name, String::from_str(&env, "Stellar Fest 2025"));
    assert_eq!(ticket.owner, owner);
    assert_eq!(ticket.price, 500);
    assert_eq!(ticket.max_resale_price, 800);
    assert_eq!(ticket.max_transfers, 3);
    assert_eq!(ticket.transfers_used, 0);
    assert_eq!(ticket.status, TicketStatus::Valid);
}

// ── Test 2: Transfer ticket successfully ─────────────────────────────────────

#[test]
fn test_transfer_ticket_success() {
    let (env, client, _organizer) = setup();
    let owner = Address::generate(&env);
    let new_owner = Address::generate(&env);

    sample_ticket(&env, &client, &owner);

    let transferred = client.transfer_ticket(&1_u64, &new_owner);

    assert_eq!(transferred.owner, new_owner);
    assert_eq!(transferred.transfers_used, 1);
    assert_eq!(transferred.status, TicketStatus::Valid);
}

// ── Test 3: Price cap enforcement on resale listing ───────────────────────────

#[test]
#[should_panic(expected = "ask price exceeds cap")]
fn test_resale_price_cap_enforced() {
    let (env, client, _organizer) = setup();
    let owner = Address::generate(&env);

    sample_ticket(&env, &client, &owner);

    // ask_price (1000) > max_resale_price (800) → must panic
    client.list_for_resale(&1_u64, &1000_u64);
}

#[test]
fn test_resale_buy_within_cap() {
    let (env, client, _organizer) = setup();
    let owner = Address::generate(&env);
    let buyer = Address::generate(&env);

    sample_ticket(&env, &client, &owner);

    // List at valid price
    let listing = client.list_for_resale(&1_u64, &750_u64);
    assert_eq!(listing.ask_price, 750);

    // Buy: royalty = 750 / 20 = 37, seller gets 713
    let (ticket, royalty, seller_proceeds) = client.buy_from_resale(&1_u64, &buyer);
    assert_eq!(ticket.owner, buyer);
    assert_eq!(royalty, 37);
    assert_eq!(seller_proceeds, 713);
    assert_eq!(ticket.status, TicketStatus::Valid);
}

// ── Test 4: Cannot transfer an already-used ticket ───────────────────────────

#[test]
#[should_panic(expected = "ticket already used")]
fn test_cannot_transfer_used_ticket() {
    let (env, client, _organizer) = setup();
    let owner = Address::generate(&env);
    let new_owner = Address::generate(&env);

    sample_ticket(&env, &client, &owner);

    client.mark_ticket_used(&1_u64);

    // This must panic
    client.transfer_ticket(&1_u64, &new_owner);
}

// ── Test 5: Storage state after mint + transfer ───────────────────────────────

#[test]
fn test_storage_state_after_mint_and_transfer() {
    let (env, client, _organizer) = setup();
    let owner = Address::generate(&env);
    let buyer = Address::generate(&env);

    sample_ticket(&env, &client, &owner);

    // Verify state directly from storage via the read helper
    let before = client.get_ticket(&1_u64);
    assert_eq!(before.owner, owner);
    assert_eq!(before.transfers_used, 0);

    client.transfer_ticket(&1_u64, &buyer);

    let after = client.get_ticket(&1_u64);
    assert_eq!(after.owner, buyer);
    assert_eq!(after.transfers_used, 1);
    assert_eq!(after.status, TicketStatus::Valid);
    // Immutable fields unchanged
    assert_eq!(after.max_transfers, before.max_transfers);
    assert_eq!(after.max_resale_price, before.max_resale_price);
    assert_eq!(after.price, before.price);
}
