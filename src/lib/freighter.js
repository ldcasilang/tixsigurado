import {
  isConnected,
  getAddress,
  requestAccess,
} from '@stellar/freighter-api';

export async function checkFreighterInstalled() {
  try {
    const result = await isConnected();
    if (typeof result === 'boolean') return result;
    return result?.isConnected ?? false;
  } catch {
    return false;
  }
}

export async function connectWallet() {
  try {
    const accessResult = await requestAccess();
    if (accessResult?.error) throw new Error(accessResult.error);
  } catch (err) {
    if (!err.message?.toLowerCase().includes('already')) {
      throw new Error(err.message || 'Access denied by user');
    }
  }

  const addressResult = await getAddress();

  let address;
  if (typeof addressResult === 'string') {
    address = addressResult;
  } else if (addressResult && typeof addressResult === 'object') {
    if (addressResult.error) throw new Error(addressResult.error);
    address = addressResult.address;
  }

  if (!address) throw new Error('Could not get wallet address from Freighter');
  return { address };
}

export async function getWalletAddress() {
  try {
    const result = await getAddress();
    if (typeof result === 'string') return result || null;
    if (result && typeof result === 'object') {
      if (result.error) return null;
      return result.address || null;
    }
    return null;
  } catch {
    return null;
  }
}

export function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
