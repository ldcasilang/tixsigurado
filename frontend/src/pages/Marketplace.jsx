import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StatusBar } from '../components/StatusBar';
import { useApp } from '../context/AppContext';

export default function Marketplace() {
  const { wallet, marketplace, xlmBalance, buyFromMarket, cancelListing, loading, shortenAddress } = useApp();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(null);

  async function handleBuy(listingId) {
    setConfirming(null);
    const ok = await buyFromMarket(listingId);
    if (ok) navigate('/tickets');
  }

  return (
    <div className="bg-[#031042] font-body text-white min-h-screen overflow-x-hidden">
      <Navbar active="marketplace" />
      <StatusBar />
      <main className="max-w-7xl mx-auto px-8 py-12 pt-36 relative">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 -left-40 w-96 h-96 bg-[#147DE1] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-[#B1E5F5] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse delay-1000 pointer-events-none" />
        
        <header className="mb-12 relative z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-5 py-2 rounded-full border border-white/10 shadow-lg mb-5">
            <span className="material-symbols-outlined text-[#B1E5F5] text-sm" style={{fontVariationSettings:"'FILL' 1"}}>currency_exchange</span>
            <span className="text-[#B1E5F5] font-semibold text-xs tracking-widest uppercase">Anti-Scalping Resale Market</span>
          </div>
          <h1 className="font-headline font-black text-4xl md:text-5xl bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent tracking-tight mb-3">
            Ticket Marketplace
          </h1>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
            Peer-to-peer resale with smart contract price caps. Every transfer is verified on-chain.
          </p>
        </header>

        {marketplace.length === 0 ? (
          <div className="text-center py-32 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl animate-fade-in-up">
            <span className="material-symbols-outlined text-6xl text-white/30 mb-4 block">sell</span>
            <h3 className="font-headline font-bold text-2xl text-white mb-3">No Listings Yet</h3>
            <p className="text-white/60 mb-8">Be the first to list a ticket for resale from My Tickets.</p>
            {wallet && (
              <button onClick={() => navigate('/tickets')} className="group relative bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white px-8 py-3 rounded-xl font-bold hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">View My Tickets</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {marketplace.map((listing, idx) => (
              <ListingCard
                key={listing.listingId}
                listing={listing}
                wallet={wallet}
                xlmBalance={xlmBalance}
                onBuy={() => setConfirming(listing)}
                onCancel={() => cancelListing(listing.listingId)}
                shortenAddress={shortenAddress}
                index={idx}
              />
            ))}
          </div>
        )}

        {/* Anti-scalping explainer */}
        <section className="mt-20 grid md:grid-cols-3 gap-6 relative z-10">
          {[
            { icon: 'price_check', title: 'Price Cap Enforced', desc: 'Smart contracts reject listings above the organizer-set resale ceiling. No manual override possible.' },
            { icon: 'swap_horiz', title: 'Limited Transfers', desc: 'Each ticket can only change hands a fixed number of times, set at mint time and stored immutably on-chain.' },
            { icon: 'verified_user', title: 'Instant Ownership Proof', desc: 'Ownership transfers atomically on Stellar Testnet. The buyer\'s QR is valid the moment the transaction confirms.' },
          ].map(({ icon, title, desc }, idx) => (
            <div key={title} className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex gap-4 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: `${idx * 100}ms`}}>
              <div className="w-12 h-12 bg-gradient-to-br from-[#147DE1]/20 to-[#B1E5F5]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[#B1E5F5] text-2xl">{icon}</span>
              </div>
              <div>
                <h3 className="font-bold text-white mb-2 text-lg">{title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Confirm Purchase Modal - Premium Glassmorphism */}
      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#031042]/80 backdrop-blur-md animate-fade-in-up"
          onClick={() => setConfirming(null)}
        >
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline font-bold text-2xl bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent">Confirm Purchase</h2>
                <button onClick={() => setConfirming(null)} className="text-3xl text-white/50 hover:text-white transition-colors leading-none">×</button>
              </div>
              <p className="text-white/60 text-sm mb-6">
                This on-chain transaction is irreversible. Ownership transfers atomically upon confirmation.
              </p>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 mb-5 space-y-3 border border-white/10">
                {[
                  ['Event', confirming.ticket?.eventName],
                  ['Tier', confirming.ticket?.tier],
                  ['Date', confirming.ticket?.date],
                  ['Seller', shortenAddress(confirming.sellerWallet)],
                  ['Resale #', `${(confirming.ticket?.transfers || 0) + 1} of ${confirming.ticket?.maxTransfers}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-white/50">{label}</span>
                    <span className="font-bold text-white">{value}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="font-bold text-white">Total Cost</span>
                  <span className="font-black text-[#B1E5F5] text-2xl">{confirming.priceXLM} XLM</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm p-3 rounded-lg mb-5 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse" />
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  </div>
                  <span className="text-xs text-white/60">Your XLM balance</span>
                </div>
                <span className="font-black text-sm text-[#B1E5F5]">{xlmBalance.toFixed(4)} XLM</span>
              </div>

              {xlmBalance < confirming.priceXLM && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5 flex items-center gap-2 text-sm text-red-400 font-medium backdrop-blur-sm">
                  <span className="material-symbols-outlined text-base">error</span>
                  Insufficient balance — transaction will be rejected by the network
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirming(null)}
                  className="flex-1 py-3 border border-white/20 rounded-xl font-bold text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBuy(confirming.listingId)}
                  disabled={loading || xlmBalance < confirming.priceXLM}
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
                  ) : `Buy for ${confirming.priceXLM} XLM`}
                </button>
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

function ListingCard({ listing, wallet, xlmBalance, onBuy, onCancel, shortenAddress, index }) {
  const { ticket, priceXLM, sellerWallet } = listing;
  if (!ticket) return null;
  const isOwnListing = sellerWallet === wallet;
  const canAfford = xlmBalance >= priceXLM;

  return (
    <div className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:border-white/20 shadow-xl animate-fade-in-up" style={{animationDelay: `${index * 100}ms`}}>
      <div className="relative h-48 overflow-hidden">
        <img src={ticket.image} alt={ticket.eventName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031042] via-transparent to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
            For Resale
          </span>
        </div>
        {isOwnListing && (
          <div className="absolute top-4 right-4">
            <span className="bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              Your Listing
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-headline font-bold text-xl text-white mb-1 leading-tight group-hover:text-[#B1E5F5] transition-colors duration-300">
          {ticket.eventName}
        </h3>
        <p className="text-sm text-white/50 mb-4">{ticket.tier} · {ticket.date}</p>

        <div className="space-y-2 mb-4 flex-grow text-sm">
          <div className="flex justify-between">
            <span className="text-white/50">Seller</span>
            <span className="font-mono text-xs font-bold text-[#B1E5F5]">{shortenAddress(sellerWallet)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Transfer</span>
            <span className="font-bold text-white">
              {(ticket.transfers || 0) + 1} of {ticket.maxTransfers} allowed
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Resale cap</span>
            <span className="font-bold text-emerald-400">{ticket.maxResale}</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-white/50 uppercase tracking-widest">Price</span>
            <span className="text-3xl font-black text-[#B1E5F5]">{priceXLM} <span className="text-sm">XLM</span></span>
          </div>

          {isOwnListing ? (
            <button
              onClick={onCancel}
              className="w-full py-3 border border-white/20 rounded-xl font-bold text-white/70 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 text-sm"
            >
              Cancel Listing
            </button>
          ) : !wallet ? (
            <div className="w-full py-3 bg-white/5 text-white/50 text-center rounded-xl font-bold text-sm border border-white/10">
              Connect wallet to buy
            </div>
          ) : !canAfford ? (
            <div className="w-full py-3 bg-red-500/10 text-red-400 text-center rounded-xl font-bold text-sm border border-red-500/30">
              Insufficient XLM Balance
            </div>
          ) : (
            <button
              onClick={onBuy}
              className="group/btn relative w-full py-3 bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white rounded-xl font-bold hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              <span className="relative">Buy Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}