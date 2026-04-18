import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { QRCode } from '../components/QRCode';
import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const { connect, loading, wallet } = useApp();
  const navigate = useNavigate();

  async function handleConnect() {
    if (wallet) { navigate('/tickets'); return; }
    const ok = await connect();
    if (ok) navigate('/tickets');
  }

  return (
    <div className="bg-[#031042] font-body text-white min-h-screen overflow-x-hidden">
      <Navbar active="explore" />
      <main>
     {/* Hero */}
<section className="relative overflow-hidden pt-24 pb-36 px-8 -mt-20">
  {/* Animated gradient orbs */}
  <div className="absolute top-0 -left-40 w-96 h-96 bg-[#147DE1] rounded-full mix-blend-screen filter blur-[140px] opacity-30 animate-pulse" />
  <div className="absolute top-0 -right-40 w-96 h-96 bg-[#B1E5F5] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse delay-1000" />
  
  {/* Content wrapper */}
  <div className="relative z-10 mt-20 md:mt-32">
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
      {/* Left column - Text content */}
      <div className="space-y-8 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-5 py-2 rounded-full border border-white/10 shadow-lg">
          <span className="material-symbols-outlined text-[#B1E5F5] text-sm" style={{fontVariationSettings:"'FILL' 1"}}>verified_user</span>
          <span className="text-[#B1E5F5] font-semibold text-xs tracking-widest">ON-CHAIN VERIFICATION</span>
        </div>
        <h1 className="text-[4rem] md:text-[5rem] font-headline font-black leading-[1.1] tracking-tighter bg-gradient-to-r from-white via-[#B1E5F5] to-[#147DE1] bg-clip-text text-transparent">
          Trust built into every ticket.
        </h1>
        <p className="text-xl text-white/70 max-w-lg leading-relaxed">
          Eliminate fake tickets and scalping with secure, on-chain ownership. TixSigurado brings institutional stability to the secondary market.
        </p>
        <div className="flex flex-col sm:flex-row gap-5 pt-4">
          <button
            onClick={handleConnect}
            disabled={loading}
            className="group relative bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_8px_32px_rgba(20,125,225,0.3)] hover:shadow-[0_12px_40px_rgba(20,125,225,0.5)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {loading ? 'Connecting…' : wallet ? 'View My Tickets' : 'Connect Wallet'}
          </button>
          <button
            onClick={() => navigate('/scan')}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg text-white bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
            Gate Scanner
          </button>
        </div>
      </div>

      {/* Right column - Ticket Visual */}
      <div className="relative flex justify-center animate-fade-in-up animation-delay-200">
        <div className="relative w-full max-w-md aspect-[3/4] rounded-[2rem] p-8 flex flex-col justify-between overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/20 bg-white/10 backdrop-blur-xl">
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#147DE1]/20 via-transparent to-[#B1E5F5]/10 pointer-events-none" />
          <div className="absolute inset-0 rounded-[2rem] ring-1 ring-white/20 pointer-events-none" />
          
          <div className="relative space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-label text-white/60 tracking-[0.2em]">VIP ACCESS</p>
                <h3 className="text-2xl font-headline font-black text-white mt-1">Hackathon Manila 2026</h3>
              </div>
              <div className="bg-gradient-to-br from-[#147DE1] to-[#0E5AA8] p-2.5 rounded-xl shadow-lg">
                <span className="material-symbols-outlined text-white">confirmation_number</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[0.65rem] font-label text-white/50">DATE</p>
                <p className="font-bold text-white">OCT 24, 2026</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-label text-white/50">LOCATION</p>
                <p className="font-bold text-white">Manila Convention Center</p>
              </div>
            </div>
          </div>
          <div className="relative flex flex-col items-center gap-6 py-8">
            <div className="w-48 h-48 bg-white rounded-xl shadow-inner flex items-center justify-center transition-transform hover:scale-105 duration-300">
              <QRCode value="TIX-DEMO001" size={160} />
            </div>
            <div className="text-center">
              <p className="text-[0.65rem] font-label text-white/50">BLOCKCHAIN HASH</p>
              <p className="font-mono text-[0.65rem] text-[#B1E5F5] truncate w-full max-w-[200px] bg-black/20 px-2 py-1 rounded-md">A3F7C9B2...B7C8</p>
            </div>
          </div>
          <div className="relative pt-4 border-t border-white/20 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[0.65rem] text-white/50 uppercase">Tier</span>
              <span className="font-black text-[#B1E5F5]">VIP DEVELOPER</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[0.65rem] text-white/50 uppercase">Status</span>
              <span className="text-xs font-bold text-[#4ade80] flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
                VERIFIED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

        {/* 3-Step Section */}
        <section className="py-36 px-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#031042] via-[#0a1a5e]/30 to-[#031042] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-headline font-black bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent mb-5 tracking-tight">The Future of Ticketing</h2>
              <p className="text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
                Say goodbye to static PDF screenshots. Experience a truly secure journey from discovery to entry.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: 'account_balance_wallet', step: '01', title: 'Connect wallet', desc: 'Link your digital wallet to prove identity and access the global ticket marketplace without centralized intermediaries.' },
                { icon: 'confirmation_number', step: '02', title: 'Receive ticket', desc: 'Your NFT ticket is minted instantly to your wallet. You own it completely—sell it, gift it, or use it with full transparency.' },
                { icon: 'qr_code_scanner', step: '03', title: 'Scan at entry', desc: 'Simply present your dynamic QR code at the gate. Authenticity is checked in milliseconds on the blockchain.' },
              ].map(({ icon, step, title, desc }, idx) => (
                <div key={step} className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-10 transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:border-white/20 shadow-xl animate-fade-in-up" style={{animationDelay: `${idx * 100}ms`}}>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#147DE1]/20 to-[#B1E5F5]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-[#B1E5F5] text-3xl">{icon}</span>
                  </div>
                  <p className="text-[#147DE1] font-black text-sm mb-4 tracking-wider">STEP {step}</p>
                  <h3 className="text-2xl font-headline font-bold text-white mb-4">{title}</h3>
                  <p className="text-white/60 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Grid - Glassmorphism Enhanced */}
        <section className="py-36 px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-gradient-to-br from-[#147DE1] to-[#0E5AA8] rounded-[2rem] p-12 flex flex-col justify-between overflow-hidden relative min-h-[400px] group hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.15),transparent)]" />
              <div className="relative z-10">
                <h2 className="text-4xl font-headline font-black mb-6">Institutional Security.<br />Creator Freedom.</h2>
                <p className="text-white/70 text-lg max-w-md">Organizers set secondary market rules directly on-chain, ensuring fair pricing and automated royalties.</p>
              </div>
              <div className="absolute bottom-0 right-0 w-1/2 opacity-20 transform translate-y-20 translate-x-10 group-hover:scale-110 transition-transform duration-700">
                <span className="material-symbols-outlined text-[300px]">security</span>
              </div>
            </div>
            <div className="md:col-span-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-12 flex flex-col justify-center items-center text-center hover:bg-white/10 transition-all duration-500 hover:-translate-y-1">
              <span className="material-symbols-outlined text-[#B1E5F5] text-7xl mb-6" style={{fontVariationSettings:"'FILL' 1"}}>verified_user</span>
              <h3 className="text-2xl font-headline font-bold text-white mb-4">Zero Fake Tickets</h3>
              <p className="text-white/60">Every single pass is verified through our immutable cryptographic ledger.</p>
            </div>
            <div className="md:col-span-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-12 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1">
              <h3 className="text-xl font-headline font-bold text-[#B1E5F5] mb-3">Smart Scalping Protection</h3>
              <p className="text-white/60 text-sm leading-relaxed">Hard-coded price ceilings prevent predatory resale practices automatically.</p>
            </div>
            <div className="md:col-span-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-12 flex items-center justify-between hover:bg-white/10 transition-all duration-500 hover:-translate-y-1">
              <div>
                <h3 className="text-xl font-headline font-bold text-[#B1E5F5] mb-3">Instant Resale Liquidity</h3>
                <p className="text-white/60 text-sm leading-relaxed">List your ticket and get paid instantly the moment it's sold. No waiting weeks for payouts.</p>
              </div>
              <span className="material-symbols-outlined text-[#147DE1] text-5xl">currency_exchange</span>
            </div>
          </div>
        </section>

        {/* CTA - Premium Gradient */}
        <section className="py-36 px-8">
          <div className="max-w-7xl mx-auto rounded-[3rem] p-16 text-center relative overflow-hidden group">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0E5AA8] via-[#147DE1] to-[#031042] animate-gradient-xy" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2),transparent)]" />
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-headline font-black mb-8 leading-tight text-white drop-shadow-lg">Ready to upgrade your event experience?</h2>
              <p className="text-xl text-white/80 mb-12 drop-shadow">Join thousands of fans already using TixSigurado for a safer, more transparent way to attend live events.</p>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="group relative bg-white text-[#031042] px-12 py-5 rounded-xl font-black text-xl shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#147DE1]/10 to-[#B1E5F5]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative">{loading ? 'Connecting…' : 'Connect Wallet Now'}</span>
              </button>
            </div>
          </div>
        </section>
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
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 8s ease infinite;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}