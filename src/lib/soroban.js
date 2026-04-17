// Soroban abstraction layer — Stellar Testnet only
// TODO: Replace mock implementations with real Soroban contract calls once deployed
// Contract ID: not yet deployed — using testnet simulation

// eslint-disable-next-line no-unused-vars
import { Networks } from '@stellar/stellar-sdk';

export const NETWORK = Networks.TESTNET;
export const CONTRACT_ID = null; // TODO: set after deployment

const delay = (ms = 1500) => new Promise(r => setTimeout(r, ms));

function mockTxHash() {
  const hex = () => Math.random().toString(16).slice(2, 10);
  return `${hex()}${hex()}${hex()}${hex()}`.toUpperCase();
}

export async function createTicket({ eventName, ownerAddress }) {
  await delay();

  if (CONTRACT_ID) {
    // TODO: real call
    // const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
    // const contract = new Contract(CONTRACT_ID);
    // ...
  }

  const ticketId = `TIX-${Date.now().toString(36).toUpperCase()}`;
  return {
    success: true,
    ticketId,
    txHash: mockTxHash(),
    network: 'testnet',
    eventName,
    owner: ownerAddress,
    status: 'valid',
    createdAt: new Date().toISOString(),
  };
}

export async function transferTicket({ ticketId, fromAddress, toAddress }) {
  await delay();

  if (CONTRACT_ID) {
    // TODO: real call
  }

  return {
    success: true,
    ticketId,
    from: fromAddress,
    to: toAddress,
    txHash: mockTxHash(),
    network: 'testnet',
    transferredAt: new Date().toISOString(),
  };
}

export async function validateTicket({ ticketId, status }) {
  await delay(1000);

  if (CONTRACT_ID) {
    // TODO: real call
  }

  return {
    success: true,
    ticketId,
    isValid: status !== 'used',
    status: status || 'valid',
    network: 'testnet',
    validatedAt: new Date().toISOString(),
  };
}
