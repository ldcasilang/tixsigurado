import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useApp } from '../context/AppContext';

export default function ConnectWallet() {
  const { wallet, loading, hasFreighter, connect, shortenAddress } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (wallet) navigate('/tickets');
  }, [wallet, navigate]);

  async function handleConnect() {
    if (!hasFreighter) { window.open('https://www.freighter.app/', '_blank'); return; }
    const ok = await connect();
    if (ok) navigate('/tickets');
  }

  return (
    <div className="bg-[#031042] font-body text-white min-h-screen overflow-x-hidden">
      <Navbar active="" />
      <main className="min-h-[calc(100vh-180px)] flex flex-col items-center justify-center relative px-6 py-20 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#147DE1] rounded-full mix-blend-screen filter blur-[140px] opacity-30 animate-pulse" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#B1E5F5] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#147DE1]/10 to-[#B1E5F5]/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" />
        
        <div className="max-w-md w-full relative z-10 animate-fade-in-up">
          {/* Main Glass Card */}
          <div className="relative rounded-2xl p-8 backdrop-blur-xl bg-white/5 border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] overflow-hidden group">
            {/* Inner gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#147DE1]/10 via-transparent to-[#B1E5F5]/5 pointer-events-none" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
            
            {/* Content */}
            <div className="relative">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#147DE1]/20 to-[#B1E5F5]/10 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-5xl text-[#B1E5F5]" style={{fontVariationSettings:"'FILL' 1"}}>account_balance_wallet</span>
                </div>
                <h1 className="font-headline text-3xl font-black bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent mb-3 tracking-tight">
                  Secure Gateway
                </h1>
                <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                  Bridge your assets to the Stellar network to access immutable event ticketing.
                </p>
              </div>
              
              <div className="space-y-4">
                {!wallet ? (
                  <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="group relative w-full flex items-center justify-between bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 p-4 rounded-xl hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#147DE1]/20 to-[#B1E5F5]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined text-[#B1E5F5] text-2xl">account_balance_wallet</span>
                      </div>
                      <span className="font-headline font-bold text-white text-lg">
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Connecting…
                          </span>
                        ) : hasFreighter ? 'Connect Freighter Wallet' : 'Install Freighter Wallet'}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-white/60 group-hover:translate-x-1 group-hover:text-white transition-all duration-300 relative z-10">
                      chevron_right
                    </span>
                  </button>
                ) : (
                  <div className="animate-fade-in-up">
                    <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 overflow-hidden group hover:border-white/30 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#147DE1]/5 via-transparent to-[#B1E5F5]/5" />
                      <div className="absolute top-0 right-0 p-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 backdrop-blur-sm">
                          <span className="material-symbols-outlined text-[14px] text-emerald-400" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
                          <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">Verified</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#147DE1]/20 to-[#B1E5F5]/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-3xl text-[#B1E5F5]" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                        </div>
                        <div className="space-y-2 flex-1">
                          <p className="text-[10px] font-label font-bold text-white/50 tracking-widest uppercase">Active Wallet</p>
                          <p className="font-headline text-lg font-bold text-white font-mono tracking-wide">{shortenAddress(wallet)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="relative">
                              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse" />
                              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                            </div>
                            <span className="text-xs text-white/60 font-medium">Connected to Stellar Testnet</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8 text-center pt-6 border-t border-white/10">
                <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-label">
                  Trust built into every ticket.
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer Links */}
          <div className="mt-8 flex justify-center gap-6">
            <a href="#" className="text-xs font-medium text-white/40 hover:text-[#B1E5F5] transition-all duration-300 hover:scale-105">
              Privacy Policy
            </a>
            <a href="#" className="text-xs font-medium text-white/40 hover:text-[#B1E5F5] transition-all duration-300 hover:scale-105">
              Stellar Guide
            </a>
            <a href="#" className="text-xs font-medium text-white/40 hover:text-[#B1E5F5] transition-all duration-300 hover:scale-105">
              Support
            </a>
          </div>
        </div>
      </main>
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
        
        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 8s ease infinite;
        }
      `}</style>
    </div>
  );
}