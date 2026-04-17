import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StatusBar } from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import { EVENTS } from '../context/AppContext';

export default function MyTickets() {
  const { wallet, tickets, buyTicket, xlmBalance, loading, demoSetBalance } = useApp();
  const navigate = useNavigate();
  const [showBuy, setShowBuy] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (!wallet) {
    return (
      <div className="bg-[#031042] font-body text-white min-h-screen overflow-x-hidden">
        <Navbar active="tickets" />
        <main className="max-w-7xl mx-auto px-8 py-32 text-center relative">
          {/* Animated gradient orbs */}
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#147DE1] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse pointer-events-none" />
          <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#B1E5F5] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse delay-1000 pointer-events-none" />
          
          <div className="relative z-10 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-[#147DE1]/20 to-[#B1E5F5]/10 mb-8">
              <span className="material-symbols-outlined text-6xl text-[#B1E5F5]" style={{fontVariationSettings:"'FILL' 1"}}>account_balance_wallet</span>
            </div>
            <h2 className="font-headline font-black text-4xl md:text-5xl bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent mb-4">Connect your wallet to view tickets</h2>
            <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">Your blockchain-secured tickets will appear here once you connect.</p>
            <button onClick={() => navigate('/connect')} className="group relative bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">Connect Wallet</span>
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  async function handleBuy() {
    if (!selectedEvent) return;
    setShowBuy(false);
    const result = await buyTicket({
      eventId: selectedEvent.eventId,
      eventName: selectedEvent.name,
      tier: selectedEvent.tier,
      date: selectedEvent.date,
      location: selectedEvent.location,
      priceXLM: selectedEvent.priceXLM,
    });
    if (result) setSelectedEvent(null);
  }

  return (
    <div className="bg-[#031042] font-body text-white min-h-screen overflow-x-hidden">
      <Navbar active="tickets" />
      <StatusBar />
      <main className="max-w-7xl mx-auto px-8 py-12 relative">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 -left-40 w-96 h-96 bg-[#147DE1] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-[#B1E5F5] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse delay-1000 pointer-events-none" />
        
        <header className="mb-12 flex items-start justify-between flex-wrap gap-4 relative z-10 animate-fade-in-up">
          <div>
            <h1 className="font-headline font-black text-4xl md:text-5xl bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent tracking-tight mb-3">
              My Tickets
            </h1>
            <p className="text-white/60 text-lg max-w-2xl leading-relaxed">Manage your verified on-chain event passes. Each ticket is cryptographically tied to your wallet.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* XLM Balance Display */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/20">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </div>
              <span className="text-sm font-mono font-bold text-white">{xlmBalance.toFixed(4)} XLM</span>
              <span className="text-xs text-white/40">Testnet</span>
            </div>
            <button
              onClick={() => setShowBuy(true)}
              className="group relative bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white px-6 py-3 rounded-xl font-bold hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex items-center gap-2"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="material-symbols-outlined text-lg relative">add_circle</span>
              <span className="relative">Buy Ticket</span>
            </button>
          </div>
        </header>

        {tickets.length === 0 ? (
          <div className="text-center py-32 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl relative z-10 animate-fade-in-up">
            <span className="material-symbols-outlined text-6xl text-white/30 mb-4 block">confirmation_number</span>
            <h3 className="font-headline font-bold text-2xl text-white mb-3">No tickets yet</h3>
            <p className="text-white/60 mb-8">Purchase your first ticket from the event catalog.</p>
            <button onClick={() => setShowBuy(true)} className="group relative bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white px-8 py-3 rounded-xl font-bold hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">Browse Events</span>
            </button>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {tickets.map((ticket, idx) => (
              <TicketCard key={ticket.ticketId} ticket={ticket} onClick={() => navigate(`/tickets/${ticket.ticketId}`)} index={idx} />
            ))}
          </section>
        )}

        {/* Resale CTA */}
        <section className="mt-24 relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-white/10 transition-all duration-500">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
              <span className="material-symbols-outlined text-[#B1E5F5] text-sm" style={{fontVariationSettings:"'FILL' 1"}}>currency_exchange</span>
              <span className="text-xs font-bold text-[#B1E5F5] uppercase tracking-widest">Anti-Scalping Marketplace</span>
            </div>
            <h2 className="font-headline font-black text-3xl md:text-4xl bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent tracking-tight">Need to resell?</h2>
            <p className="text-white/60 max-w-md leading-relaxed">Our peer-to-peer marketplace enforces price caps on-chain. No fake tickets, no scalping.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={() => navigate('/marketplace')} className="flex-1 md:flex-none px-8 py-4 bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5">
              View Marketplace
            </button>
            <button onClick={() => navigate('/scan')} className="flex-1 md:flex-none px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
              Gate Scanner
            </button>
          </div>
        </section>

        {/* Demo Controls — presenter use only */}
        <details className="mt-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative z-10">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors">
            Demo Controls (Presenter Use Only)
          </summary>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => demoSetBalance(0.01)}
              className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold rounded-lg hover:bg-red-500/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              Simulate Low Balance (0.01 XLM)
            </button>
            <button
              onClick={() => demoSetBalance(100)}
              className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold rounded-lg hover:bg-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              Reset Balance (100 XLM)
            </button>
          </div>
          <p className="text-xs text-white/30 mt-3 leading-relaxed">
            Use "Simulate Low Balance" then click "Buy Ticket" to demonstrate insufficient funds rejection. Ticket TIX-DEMO003 is pre-seeded as used. TIX-DEMO004 belongs to a different wallet (for ownership mismatch demo in Gate Scanner).
          </p>
        </details>
      </main>

      {/* Buy Ticket Modal — Premium Glassmorphism */}
      {showBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#031042]/80 backdrop-blur-md animate-fade-in-up" onClick={() => { setShowBuy(false); setSelectedEvent(null); }}>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
            
            <div className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/10 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="font-headline font-bold text-2xl bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent">Buy a Ticket</h2>
                <p className="text-xs text-white/50 mt-1">Balance: <strong className="text-[#B1E5F5] font-mono">{xlmBalance.toFixed(4)} XLM</strong></p>
              </div>
              <button onClick={() => { setShowBuy(false); setSelectedEvent(null); }} className="text-3xl text-white/50 hover:text-white transition-colors leading-none">×</button>
            </div>

            <div className="p-6 space-y-3">
              {EVENTS.map(event => {
                const selected = selectedEvent?.eventId === event.eventId;
                const canAfford = xlmBalance >= event.priceXLM;
                return (
                  <button
                    key={event.eventId}
                    onClick={() => setSelectedEvent(selected ? null : event)}
                    className={`w-full text-left rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selected ? 'border-[#147DE1] shadow-lg shadow-[#147DE1]/20' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex gap-0 bg-white/5">
                      <div className="w-24 h-24 shrink-0">
                        <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-headline font-bold text-white">{event.name}</h3>
                          <p className="text-xs text-white/50 mt-0.5">{event.tier}</p>
                          <p className="text-xs text-white/50">{event.date} · {event.location}</p>
                        </div>
                        <div className="text-right shrink-0 pl-4">
                          <p className="font-black text-[#B1E5F5] text-lg">{event.priceXLM} XLM</p>
                          {!canAfford && <p className="text-[10px] text-red-400 font-bold">Insufficient</p>}
                          {selected && canAfford && <p className="text-[10px] text-emerald-400 font-bold">Selected ✓</p>}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="sticky bottom-0 bg-white/10 backdrop-blur-xl border-t border-white/10 px-8 py-6">
              {selectedEvent && xlmBalance < selectedEvent.priceXLM && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-sm text-red-400 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  Insufficient XLM — transaction will be rejected by Stellar network
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setShowBuy(false); setSelectedEvent(null); }} className="flex-1 py-3 border border-white/20 rounded-xl font-bold text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300">
                  Cancel
                </button>
                <button
                  onClick={handleBuy}
                  disabled={loading || !selectedEvent || xlmBalance < (selectedEvent?.priceXLM || 0)}
                  className="flex-1 py-3 bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white rounded-xl font-bold hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing…
                    </span>
                  ) : selectedEvent ? `Buy for ${selectedEvent.priceXLM} XLM` : 'Select an Event'}
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </div>
                <span className="text-xs text-white/40">Stellar Testnet · Simulated transaction</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

function TicketCard({ ticket, onClick, index }) {
  const used = ticket.status === 'used';
  const listed = ticket.status === 'listed';
  return (
    <div className={`group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:border-white/20 shadow-xl animate-fade-in-up`} style={{animationDelay: `${index * 100}ms`}}>
      <div className="relative w-full h-48 mb-6 overflow-hidden rounded-xl">
        <img
          className={`w-full h-full object-cover transition-transform duration-700 ${!used ? 'group-hover:scale-110' : ''}`}
          src={ticket.image}
          alt={ticket.eventName}
        />
        {used ? (
          <div className="absolute inset-0 bg-[#031042]/60 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-black text-2xl uppercase tracking-tighter border-2 border-white px-4 py-1 rotate-[-12deg]">Used</span>
          </div>
        ) : listed ? (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
            Listed for Resale
          </div>
        ) : (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <span className="material-symbols-outlined text-[#147DE1] text-sm" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
            <span className="text-[10px] font-bold tracking-wider text-[#147DE1] uppercase">On-Chain NFT</span>
          </div>
        )}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-headline font-bold text-xl text-white leading-tight group-hover:text-[#B1E5F5] transition-colors duration-300">
            {ticket.eventName}
          </h3>
          <span className={`text-[10px] font-black px-2 py-1 rounded-full border uppercase tracking-widest shrink-0 ml-2 ${
            used ? 'bg-white/10 text-white/50 border-white/20' :
            listed ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
            'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }`}>
            {used ? 'Used' : listed ? 'Listed' : 'Valid'}
          </span>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Tier</span>
            <span className="font-bold text-white">{ticket.tier}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Date</span>
            <span className="font-bold text-white">{ticket.date}</span>
          </div>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`w-full py-4 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
          used ? 'bg-white/10 text-white/50 cursor-default' :
          'group/btn relative bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 overflow-hidden'
        }`}
      >
        {!used && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
        )}
        <span className="material-symbols-outlined text-xl relative">{used ? 'history' : 'confirmation_number'}</span>
        <span className="relative">{used ? 'View History' : 'View Ticket'}</span>
      </button>
    </div>
  );
}