import { createContext, useContext, useState, useEffect } from 'react';
import {
  connectWallet as connectFreighter,
  getWalletAddress,
  shortenAddress,
  checkFreighterInstalled,
} from '../lib/freighter';
import {
  createTicket,
  transferTicket,
  listForResale as sorobanListForResale,
  buyFromResale,
  cancelListing as sorobanCancelListing,
  markTicketUsed,
  validateTicket,
  getUserTicketsFromChain,
  getMarketplaceListingsFromChain,
  ORGANIZER_ADDRESS,
} from '../lib/soroban';

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

const INITIAL_REGISTRY = {};

const INITIAL_MARKETPLACE = [];

export function AppProvider({ children }) {
  const [wallet, setWallet] = useState(null);

  const [xlmBalance, setXlmBalance] = useState(() => {
    try {
      const v = localStorage.getItem('tix_balance');
      return v !== null ? parseFloat(v) : 100.00;
    } catch { return 100.00; }
  });

  const [ticketRegistry, setTicketRegistry] = useState(() => {
    try {
      const v = localStorage.getItem('tix_registry');
      return v ? JSON.parse(v) : INITIAL_REGISTRY;
    } catch { return INITIAL_REGISTRY; }
  });

  const [marketplace, setMarketplace] = useState(() => {
    try {
      const v = localStorage.getItem('tix_marketplace');
      return v ? JSON.parse(v) : INITIAL_MARKETPLACE;
    } catch { return INITIAL_MARKETPLACE; }
  });

  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [hasFreighter, setHasFreighter] = useState(true);

  useEffect(() => { localStorage.setItem('tix_balance', xlmBalance); }, [xlmBalance]);
  useEffect(() => { localStorage.setItem('tix_registry', JSON.stringify(ticketRegistry)); }, [ticketRegistry]);
  useEffect(() => { localStorage.setItem('tix_marketplace', JSON.stringify(marketplace)); }, [marketplace]);

  useEffect(() => {
    checkFreighterInstalled().then(ok => {
      setHasFreighter(ok);
      if (ok) getWalletAddress().then(addr => { if (addr) setWallet(addr); });
    });
  }, []);

  async function loadBlockchainTickets(userAddress) {
    try {
      console.log("🔄 Loading tickets from blockchain for:", userAddress);
      const onChainTickets = await getUserTicketsFromChain(userAddress);
      console.log("📦 Blockchain tickets:", onChainTickets);
      
      if (onChainTickets.length > 0) {
        setTicketRegistry(prev => {
          const next = { ...prev };
          onChainTickets.forEach(ticket => {
  next[ticket.ticketId] = {
    ...(prev[ticket.ticketId] || {}),
    ...ticket
  };
});
          return next;
        });
        console.log(`✅ Loaded ${onChainTickets.length} tickets from blockchain`);
      } else {
        console.log("⚠️ No blockchain tickets found for this wallet");
      }
    } catch (err) {
      console.error('❌ Failed to load blockchain tickets:', err);
    }
  }

  async function loadBlockchainMarketplace() {
    try {
      const onChainListings = await getMarketplaceListingsFromChain();
      if (!Array.isArray(onChainListings)) { setMarketplace([]); return; }

      const enriched = onChainListings.map(listing => {
        const event = EVENTS.find(e => e.name === listing.ticket?.eventName);
        return {
          ...listing,
          ticket: {
            ...listing.ticket,
            tier: event?.tier || 'General Admission',
            date: event?.date || 'See event details',
            location: event?.location || 'Venue TBA',
            image: event?.image || listing.ticket?.image || TICKET_IMAGES[0],
          },
        };
      });

      setMarketplace(enriched);
    } catch (err) {
      console.error('Failed to load blockchain listings:', err);
      setMarketplace([]);
    }
  }

 useEffect(() => {
  if (wallet) {
    (async () => {
      await loadBlockchainTickets(wallet);
      await loadBlockchainMarketplace();
    })();
  }
}, [wallet]);

  const tickets = wallet
  ? Object.values(ticketRegistry || {}).filter(t => t && t.owner === wallet)
  : [];

  const marketplaceListings = marketplace;

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
      showStatus('error', `Insufficient XLM balance — need ${priceXLM} XLM, have ${xlmBalance.toFixed(4)} XLM.`);
      return null;
    }
    setLoading(true);
    showStatus('pending', 'Submitting transaction to Stellar Testnet...');
    try {
      const result = await createTicket({
        eventName,
        ownerAddress: wallet,
        priceXLM,
        maxResaleXLM: parseFloat((priceXLM * 1.1).toFixed(4)),
        maxTransfers: 2,
      });
      
      if (!result.success) throw new Error('Transaction failed');
      
      const event = EVENTS.find(e => e.eventId === eventId);
      const newTicket = {
        ticketId: result.ticketId,
        onChainId: result.onChainId,
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

  const mintTicket = ({ eventName, tier, date, location }) =>
    buyTicket({ eventName, tier, date, location, priceXLM: 0.05 });

  async function listForResale(ticketId, priceXLM) {
    const ticket = ticketRegistry[ticketId];
    if (!ticket) { showStatus('error', 'Ticket not found'); return false; }
    if (ticket.owner !== wallet) { showStatus('error', 'You do not own this ticket'); return false; }
    if (ticket.status === 'used') { showStatus('error', 'Cannot resell a used ticket'); return false; }
    if (ticket.status === 'listed') { showStatus('error', 'Ticket already listed'); return false; }
    if (ticket.transfers >= ticket.maxTransfers) {
      showStatus('error', `Transfer limit reached (${ticket.maxTransfers} max)`);
      return false;
    }
    if (ticket.maxResaleXLM > 0 && priceXLM > ticket.maxResaleXLM) {
      showStatus('error', `Price ${priceXLM} XLM exceeds resale cap of ${ticket.maxResaleXLM} XLM`);
      return false;
    }
    setLoading(true);
    showStatus('pending', 'Listing ticket on marketplace...');
    try {
      await sorobanListForResale({ 
        onChainId: ticket.onChainId, 
        signerAddress: wallet, 
        priceXLM 
      });
      
      // Create local listing
      const listingId = `LST-${Date.now().toString(36).toUpperCase()}`;
      const newListing = {
        listingId,
        ticketId: ticket.ticketId,
        onChainId: ticket.onChainId,
        sellerWallet: wallet,
        priceXLM,
        listedAt: new Date().toISOString(),
        ticket: { ...ticket, onChainId: ticket.onChainId },
      };
      
      setTicketRegistry(prev => ({ 
        ...prev, 
        [ticketId]: { ...prev[ticketId], status: 'listed' } 
      }));
      
      setMarketplace(prev => [...prev, newListing]);
      showStatus('success', `Listed for ${priceXLM} XLM`);
      return true;
    } catch (err) {
      showStatus('error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function cancelListing(listingId) {
    const listing = marketplace.find(l => l.listingId === listingId);
    if (!listing || listing.sellerWallet !== wallet) return false;
    const ticket = ticketRegistry[listing.ticketId];
    
    if (!ticket?.onChainId) {
      // Fallback for demo listings
      setTicketRegistry(prev => ({ 
        ...prev, 
        [listing.ticketId]: { ...prev[listing.ticketId], status: 'valid' } 
      }));
      setMarketplace(prev => prev.filter(l => l.listingId !== listingId));
      showStatus('success', 'Listing cancelled');
      return true;
    }
    
    setLoading(true);
    showStatus('pending', 'Cancelling listing...');
    try {
      await sorobanCancelListing({ 
        onChainId: ticket.onChainId, 
        signerAddress: wallet 
      });
      
      setTicketRegistry(prev => ({ 
        ...prev, 
        [listing.ticketId]: { ...prev[listing.ticketId], status: 'valid' } 
      }));
      setMarketplace(prev => prev.filter(l => l.listingId !== listingId));
      showStatus('success', 'Listing cancelled');
      return true;
    } catch (err) {
      showStatus('error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function buyFromMarket(listingId) {
    const listing = marketplace.find(l => l.listingId === listingId);
    if (!listing) { showStatus('error', 'Listing not found'); return false; }
    if (listing.sellerWallet === wallet) { showStatus('error', 'Cannot buy your own listing'); return false; }
    if (xlmBalance < listing.priceXLM) {
      showStatus('error', `Insufficient XLM — need ${listing.priceXLM} XLM`);
      return false;
    }

    setLoading(true);
    showStatus('pending', 'Waiting for Freighter confirmation…');
    try {
      await buyFromResale({
        onChainId: listing.onChainId,
        buyerAddress: wallet,
      });

      const newTicket = {
        ...listing.ticket,
        ticketId: listing.ticketId,
        onChainId: listing.onChainId,
        owner: wallet,
        status: 'valid',
        transfers: (listing.ticket?.transfers || 0) + 1,
        seatRow: `GA-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
        txHash: `resale-${listingId}`,
        createdAt: new Date().toISOString(),
      };

      setTicketRegistry(prev => ({ ...prev, [listing.ticketId]: newTicket }));
      setMarketplace(prev => prev.filter(l => l.listingId !== listingId));
      setXlmBalance(prev => parseFloat((prev - listing.priceXLM).toFixed(4)));
      showStatus('success', 'Ticket purchased! Check My Tickets.');
      return true;
    } catch (err) {
      showStatus('error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function validateQR(ticketId) {
    const ticket = ticketRegistry[ticketId];
    if (!ticket) {
      return { isValid: false, reason: 'TICKET_NOT_FOUND', message: 'Ticket not found', ticket };
    }
    
    if (ticket.onChainId) {
      try {
        const result = await validateTicket({
          ticketId,
          onChainId: ticket.onChainId,
          claimerAddress: wallet || ORGANIZER_ADDRESS,
          status: ticket.status,
        });
        return {
          isValid: result.status === 'valid',
          reason: result.status.toUpperCase(),
          message: result.status === 'valid' ? 'Ticket is valid' : `Ticket status: ${result.status}`,
          ticket,
        };
      } catch (err) {
        console.warn('On-chain validation failed, using local state:', err);
      }
    }
    
    if (ticket.status === 'used') {
      return { isValid: false, reason: 'ALREADY_USED', message: 'Ticket already used', ticket };
    }
    if (wallet && ticket.owner !== wallet) {
      return { isValid: false, reason: 'OWNERSHIP_MISMATCH', message: 'Wrong wallet', ticket };
    }
    if (ticket.status === 'listed') {
      return { isValid: false, reason: 'LISTED_FOR_RESALE', message: 'Ticket listed for resale', ticket };
    }
    return { isValid: true, reason: 'VALID', message: 'Ticket is valid', ticket };
  }

  async function markUsed(ticketId) {
    const ticket = ticketRegistry[ticketId];
    if (ticket?.onChainId) {
      try {
        await markTicketUsed({ onChainId: ticket.onChainId, signerAddress: wallet });
      } catch (err) {
        console.warn('Contract mark_ticket_used failed:', err.message);
      }
    }
    setTicketRegistry(prev => ({ ...prev, [ticketId]: { ...prev[ticketId], status: 'used' } }));
    showStatus('success', 'Ticket marked as used');
  }

  async function doTransfer(ticketId, toAddress) {
    const ticket = ticketRegistry[ticketId];
    if (!ticket) { showStatus('error', 'Ticket not found'); return false; }
    if (ticket.owner !== wallet) { showStatus('error', 'You do not own this ticket'); return false; }
    if (ticket.status === 'used') { showStatus('error', 'Cannot transfer used ticket'); return false; }
    
    setLoading(true);
    showStatus('pending', 'Transferring ticket...');
    try {
      if (ticket.onChainId) {
        const result = await transferTicket({ 
          ticketId, 
          onChainId: ticket.onChainId, 
          fromAddress: wallet, 
          toAddress 
        });
        
        setTicketRegistry(prev => ({
          ...prev,
          [ticketId]: {
            ...prev[ticketId],
            owner: toAddress,
            transfers: (prev[ticketId].transfers || 0) + 1,
            txHash: result.txHash,
          },
        }));
      } else {
        // Demo transfer
        setTicketRegistry(prev => ({
          ...prev,
          [ticketId]: {
            ...prev[ticketId],
            owner: toAddress,
            transfers: (prev[ticketId].transfers || 0) + 1,
          },
        }));
      }
      
      showStatus('success', `Transferred!`);
      return true;
    } catch (err) {
      showStatus('error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  function demoSetBalance(amount) {
    setXlmBalance(amount);
    showStatus('success', `Demo: XLM balance set to ${amount} XLM`);
  }

  function demoReset() {
    localStorage.removeItem('tix_balance');
    localStorage.removeItem('tix_registry');
    localStorage.removeItem('tix_marketplace');
    setTicketRegistry({});
    setMarketplace([]);
    setXlmBalance(100.00);
    showStatus('success', 'Demo state reset');
    
    // Reload blockchain data
    if (wallet) {
      loadBlockchainTickets(wallet);
      loadBlockchainMarketplace();
    }
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
      refreshBlockchain: () => {
        if (wallet) {
          loadBlockchainTickets(wallet);
          loadBlockchainMarketplace();
        }
      }
    }}>
      {children}
    </AppContext.Provider>
  );
}