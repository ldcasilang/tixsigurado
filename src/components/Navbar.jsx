import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export function Navbar({ active }) {
  const { wallet, loading, connect, disconnect, shortenAddress } = useApp();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleConnect() {
    const ok = await connect();
    if (ok) navigate('/tickets');
  }

  const linkClass = (tab) =>
    `relative font-medium transition-all duration-300 font-headline text-lg tracking-tight ${
      active === tab
        ? 'text-white font-bold'
        : 'text-white/60 hover:text-white'
    }`;

  const activeIndicatorClass = (tab) =>
    active === tab
      ? 'absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#B1E5F5] to-[#147DE1] rounded-full shadow-[0_0_8px_rgba(20,125,225,0.6)]'
      : '';

  return (
    <nav className={`fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50 rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
        scrolled
          ? 'bg-white/10 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
          : 'bg-white/5 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
      }`}>
      <div className="flex justify-between items-center w-full px-6 py-3 md:px-8 md:py-4">
        <div className="flex items-center gap-8 md:gap-12">
          <Link to="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="TixSigurado Logo"
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <div className="hidden md:flex gap-8 items-center">
            <Link to="/" className={linkClass('explore')}>
              Explore
              <span className={activeIndicatorClass('explore')} />
            </Link>
            <Link to="/tickets" className={linkClass('tickets')}>
              My Tickets
              <span className={activeIndicatorClass('tickets')} />
            </Link>
            <Link to="/marketplace" className={linkClass('marketplace')}>
              Marketplace
              <span className={activeIndicatorClass('marketplace')} />
            </Link>
            <Link to="/organizer" className={linkClass('organizer')}>
              Organizer
              <span className={activeIndicatorClass('organizer')} />
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {wallet ? (
            <div className="flex items-center gap-3 group">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/30">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse" />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </div>
                <span className="font-mono text-sm font-bold text-white truncate max-w-[140px] tracking-wide">
                  {shortenAddress(wallet)}
                </span>
              </div>
              <button 
                onClick={disconnect} 
                className="text-sm text-white/50 hover:text-white/90 transition-all duration-300 hover:scale-105"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="group relative overflow-hidden bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white px-6 py-2.5 rounded-xl font-bold tracking-tight transition-all duration-300 hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting…
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu button - visible only on mobile */}
      <div className="md:hidden absolute right-6 top-1/2 -translate-y-1/2">
        <button className="p-2 rounded-lg bg-white/10 border border-white/20 text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
}