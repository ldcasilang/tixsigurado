import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const DEMO_SCENARIOS = [
  {
    label: 'Valid Scan',
    icon: 'check_circle',
    color: 'from-emerald-500 to-green-600',
    ticketId: 'TIX-DEMO001',
    hint: 'Your valid ticket',
  },
  {
    label: 'Already Used',
    icon: 'block',
    color: 'from-orange-500 to-red-600',
    ticketId: 'TIX-DEMO003',
    hint: 'Pre-used ticket',
  },
  {
    label: 'Wrong Wallet',
    icon: 'person_off',
    color: 'from-red-500 to-red-700',
    ticketId: 'TIX-DEMO004',
    hint: 'Another wallet owns it',
  },
  {
    label: 'Not Found',
    icon: 'search_off',
    color: 'from-slate-500 to-slate-700',
    ticketId: 'TIX-FAKEID999',
    hint: 'Non-existent / fake QR',
  },
];

const RESULT_META = {
  VALID:             { bg: '#00C853', icon: 'check_circle',    label: 'Verified on Blockchain' },
  ALREADY_USED:      { bg: '#E65100', icon: 'block',           label: 'Already Checked In' },
  OWNERSHIP_MISMATCH:{ bg: '#ba1a1a', icon: 'person_off',      label: 'Ownership Mismatch' },
  LISTED_FOR_RESALE: { bg: '#ba1a1a', icon: 'currency_exchange',label: 'Transfer Pending' },
  TICKET_NOT_FOUND:  { bg: '#43474e', icon: 'search_off',      label: 'Ticket Not Found' },
};

export default function GateScanner() {
  const navigate = useNavigate();
  const { wallet, validateQR, markUsed, shortenAddress } = useApp();
  const [input, setInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  async function runValidation(ticketId) {
    const id = (ticketId || input).trim().toUpperCase();
    if (!id) return;
    setInput(id);
    setScanning(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 1000));
    setScanning(false);
    setResult(validateQR(id));
  }

  function handleCheckIn() {
    if (!result?.isValid || !result.ticket) return;
    markUsed(result.ticket.ticketId);
    setResult(prev => ({
      ...prev,
      isValid: false,
      reason: 'ALREADY_USED',
      message: 'Just checked in — ticket permanently marked as used on Stellar Testnet',
      ticket: { ...prev.ticket, status: 'used' },
    }));
  }

  const meta = result ? (RESULT_META[result.reason] || RESULT_META.TICKET_NOT_FOUND) : null;

  if (!wallet) {
    return (
      <div className="bg-[#031042] font-body text-white min-h-screen flex flex-col items-center justify-center gap-6 p-8 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#147DE1] rounded-full mix-blend-screen filter blur-[140px] opacity-30 animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#B1E5F5] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse delay-1000 pointer-events-none" />
        
        <div className="relative z-10 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-[#147DE1]/20 to-[#B1E5F5]/10 mb-6">
            <span className="material-symbols-outlined text-6xl text-[#B1E5F5]">qr_code_scanner</span>
          </div>
          <h2 className="font-headline font-black text-3xl md:text-4xl bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent mb-4">Connect Wallet to Scan</h2>
          <p className="text-white/60 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
            Gate scanning requires wallet connection to verify ticket ownership on-chain.
          </p>
          <button
            onClick={() => navigate('/connect')}
            className="group relative bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white px-8 py-3 rounded-xl font-bold hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative">Connect Wallet</span>
          </button>
          <button onClick={() => navigate(-1)} className="block mt-6 text-white/40 text-sm hover:text-white/70 transition-colors">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#031042] text-white font-body min-h-screen relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-[#147DE1] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#B1E5F5] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse delay-1000 pointer-events-none" />
      
      {/* Camera simulation background with overlay */}
      <div className="fixed inset-0 z-0">
        <img
          className="w-full h-full object-cover opacity-30 brightness-50"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBttMFXlKGgeSBmRs1qM0yHlQW4kwcXN7ZX8wVA7hGlbQH6J6fgxDG8AEBj7yMNvO6ZPwnVhiytnwcEyzZ7pxvlKaGSZwhPH2_P2yW8wBxBiYWsf7CGUv0QTlBZv0Zogfscg0s3BGMfu3wNs4UNjIi-sWaUsV5o6cEovYSUrlJ552SRKKWx85ma7umvl2LPO0nyg0fSlJp0ceK9uJXdl0yFTt8Y6HDkRasvCQYJzctYxh3aNL34OHXQoXDfvIWruiyK4UG-XoW2POU"
          alt="camera background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#031042]/80 via-transparent to-[#031042]/80" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen overflow-y-auto">
        {/* Header - Premium Glassmorphism */}
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-xl m-4 p-4 rounded-2xl border border-white/20 shadow-xl">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#B1E5F5] font-bold block">
              Gate Scanner · Organizer Mode
            </span>
            <h1 className="font-headline font-black text-xl tracking-tighter bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent">
              TixSigurado
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full hidden sm:flex items-center gap-2 border border-white/20">
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse" />
                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </div>
              <span className="text-[10px] font-mono text-white/80">{shortenAddress(wallet)}</span>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-white/20"
            >
              <span className="material-symbols-outlined text-white text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Viewfinder - Enhanced Scanner Animation */}
        <div className="flex justify-center my-6 shrink-0">
          <div className="relative w-56 h-56">
            <div className={`scanner-viewfinder absolute inset-0 rounded-3xl border-2 transition-all duration-500 ${scanning ? 'border-[#147DE1] shadow-[0_0_20px_rgba(20,125,225,0.5)]' : 'border-white/30'}`} />
            <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-[#147DE1] rounded-tl-2xl" />
            <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-[#147DE1] rounded-tr-2xl" />
            <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-[#147DE1] rounded-bl-2xl" />
            <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-[#147DE1] rounded-br-2xl" />
            
            {/* Scanning line animation */}
            {scanning && (
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#147DE1] to-transparent animate-scan" />
              </div>
            )}
            
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              {scanning ? (
                <>
                  <svg className="animate-spin w-8 h-8 text-[#147DE1]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-[#147DE1] text-[10px] font-bold tracking-widest animate-pulse">VERIFYING…</p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-white/30 text-4xl">qr_code_scanner</span>
                  <p className="text-white/30 text-[10px] font-medium tracking-wide">ENTER ID BELOW</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Manual input - Glassmorphism Cards */}
        <div className="px-4 pb-4 space-y-3">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">keyboard</span>
              Manual Ticket ID Entry
            </p>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#147DE1]/50 focus:border-transparent transition-all duration-300"
                placeholder="e.g. TIX-DEMO001"
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && runValidation()}
              />
              <button
                onClick={() => runValidation()}
                disabled={scanning || !input.trim()}
                className="group relative px-6 py-3 bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white font-bold rounded-xl disabled:opacity-40 hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">{scanning ? '…' : 'Scan'}</span>
              </button>
            </div>
          </div>

          {/* Demo Scenario Buttons */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">science</span>
              Demo Scenarios <span className="normal-case text-white/25 font-normal">(tap to auto-scan)</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_SCENARIOS.map(s => (
                <button
                  key={s.ticketId}
                  onClick={() => runValidation(s.ticketId)}
                  disabled={scanning}
                  className={`group relative bg-gradient-to-r ${s.color} text-white font-bold py-3 px-3 rounded-xl text-xs disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg overflow-hidden`}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="flex items-start gap-2 relative">
                    <span className="material-symbols-outlined text-base mt-0.5 shrink-0" style={{fontVariationSettings:"'FILL' 1"}}>
                      {s.icon}
                    </span>
                    <div className="text-left">
                      <div className="font-black text-xs">{s.label}</div>
                      <div className="font-normal opacity-70 text-[9px]">{s.hint}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#147DE1] animate-pulse" />
                <span className="text-[10px] font-bold uppercase text-white/60 tracking-widest">Gate 04 · South Entrance</span>
              </div>
              <span className="text-[10px] font-bold text-[#B1E5F5] bg-white/10 px-2 py-1 rounded-full">STELLAR TESTNET</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Result Modal - Premium Glassmorphism */}
      {result && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#031042]/90 backdrop-blur-md animate-fade-in-up">
          <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            {/* Result header */}
            <div
              className="w-full py-8 flex flex-col items-center justify-center gap-4"
              style={{ backgroundColor: meta.bg }}
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                <span
                  className="material-symbols-outlined text-5xl animate-bounce-in"
                  style={{ color: meta.bg, fontVariationSettings: "'FILL' 1" }}
                >
                  {meta.icon}
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-white font-headline font-black text-2xl tracking-tight">
                  {result.isValid ? 'Valid Ticket' : 'Invalid Ticket'}
                </h3>
                <p className="text-white/80 font-bold text-sm tracking-widest uppercase">{meta.label}</p>
              </div>
            </div>

            {/* Result body */}
            <div className="p-6 space-y-4">
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[12px]">blockchain</span>
                  Blockchain Response
                </p>
                <p className="text-sm text-white font-medium leading-relaxed">{result.message}</p>
              </div>

              {result.ticket && (
                <div className="space-y-2 text-sm bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Event</span>
                    <span className="font-bold text-white text-right max-w-[55%] truncate">{result.ticket.eventName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Ticket ID</span>
                    <span className="font-mono font-bold text-xs text-[#B1E5F5]">{result.ticket.ticketId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Chain Status</span>
                    <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded-full ${result.isValid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {result.ticket.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">TX Hash</span>
                    <span className="font-mono text-[10px] text-white/60 truncate max-w-[55%]">
                      {result.ticket.txHash?.slice(0, 16)}…
                    </span>
                  </div>
                </div>
              )}

              {result.isValid && (
                <button
                  onClick={handleCheckIn}
                  className="group relative w-full bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="material-symbols-outlined relative">how_to_reg</span>
                  <span className="relative">CHECK IN — Mark as Used</span>
                </button>
              )}

              <button
                onClick={() => { setResult(null); setInput(''); }}
                className="w-full py-3 text-white/50 font-medium hover:text-white transition-all duration-300 hover:scale-105"
              >
                Scan Next
              </button>
            </div>
          </div>
        </div>
      )}

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
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
        
        .animate-scan {
          animation: scan 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}