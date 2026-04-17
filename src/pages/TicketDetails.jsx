import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StatusBar } from '../components/StatusBar';
import { QRCode } from '../components/QRCode';
import { useApp } from '../context/AppContext';

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets, wallet, loading, doTransfer, validateQR, markUsed, listForResale, shortenAddress } = useApp();
  const ticket = tickets.find(t => t.ticketId === id);

  const [showTransfer, setShowTransfer] = useState(false);
  const [showResell, setShowResell] = useState(false);
  const [toAddr, setToAddr] = useState('');
  const [resellPrice, setResellPrice] = useState('');
  const [resellError, setResellError] = useState('');
  const [validateState, setValidateState] = useState(null);

  if (!wallet) {
    return (
      <div className="bg-[#031042] font-body text-white min-h-screen overflow-x-hidden">
        <Navbar active="tickets" />
        <main className="max-w-7xl mx-auto px-8 py-32 text-center relative">
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#147DE1] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse pointer-events-none" />
          <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#B1E5F5] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse delay-1000 pointer-events-none" />
          
          <div className="relative z-10 animate-fade-in-up">
            <h2 className="font-headline font-black text-4xl md:text-5xl bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent mb-4">Connect your wallet first</h2>
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

  if (!ticket) {
    return (
      <div className="bg-[#031042] font-body text-white min-h-screen overflow-x-hidden">
        <Navbar active="tickets" />
        <main className="max-w-7xl mx-auto px-8 py-32 text-center relative">
          <div className="relative z-10 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 mb-6">
              <span className="material-symbols-outlined text-5xl text-white/40">error</span>
            </div>
            <h2 className="font-headline font-black text-4xl bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent mb-4">Ticket not found</h2>
            <button onClick={() => navigate('/tickets')} className="group relative bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white px-8 py-4 rounded-xl font-bold hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">← Back to My Tickets</span>
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const used = ticket.status === 'used';
  const listed = ticket.status === 'listed';

  function handleValidate() {
    setValidateState('loading');
    setTimeout(() => {
      setValidateState(validateQR(ticket.ticketId));
    }, 1200);
  }

  async function handleTransfer(e) {
    e.preventDefault();
    if (!toAddr.trim()) return;
    setShowTransfer(false);
    const ok = await doTransfer(ticket.ticketId, toAddr.trim());
    if (ok) navigate('/tickets');
  }

  function handleMarkUsed() {
    markUsed(ticket.ticketId);
    setValidateState(null);
  }

  function handleResell(e) {
    e.preventDefault();
    setResellError('');
    const price = parseFloat(resellPrice);
    if (!price || price <= 0) { setResellError('Enter a valid price'); return; }
    const cap = ticket.maxResaleXLM;
    if (cap > 0 && price > cap) {
      setResellError(`Exceeds resale cap of ${cap} XLM — scalping protection enforced`);
      return;
    }
    const ok = listForResale(ticket.ticketId, price);
    if (ok) {
      setShowResell(false);
      navigate('/marketplace');
    }
  }

  return (
    <div className="bg-[#031042] font-body text-white min-h-screen overflow-x-hidden">
      <Navbar active="tickets" />
      <StatusBar />
      <main className="max-w-7xl mx-auto px-8 py-12 lg:py-20 relative">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 -left-40 w-96 h-96 bg-[#147DE1] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-[#B1E5F5] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse delay-1000 pointer-events-none" />
        
        <button onClick={() => navigate('/tickets')} className="flex items-center gap-2 text-white/50 hover:text-[#B1E5F5] mb-8 transition-all duration-300 hover:translate-x-[-4px] relative z-10 group">
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to My Tickets
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          {/* Left: Ticket Visual */}
          <div className="lg:col-span-7">
            <div className="relative group">
              <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/30">
                <div className="h-80 relative overflow-hidden">
                  <img alt="Event" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={ticket.image} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#031042] via-[#031042]/50 to-transparent" />
                  <div className="absolute bottom-6 left-8">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 mb-3">
                      <span className="material-symbols-outlined text-[14px] text-[#B1E5F5]" style={{fontVariationSettings:"'FILL' 1"}}>verified_user</span>
                      <span className="text-white">Verified Blockchain Asset</span>
                    </span>
                    <h1 className="font-headline text-3xl md:text-4xl font-black text-white tracking-tight">{ticket.eventName}</h1>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <div className="flex justify-between items-start border-b border-white/10 pb-8 flex-wrap gap-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">Date & Time</p>
                        <p className="text-lg font-bold text-white">{ticket.date} · 8:00 PM</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">Location</p>
                        <p className="text-lg font-bold text-white">{ticket.location}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/20">
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">Seat / Row</p>
                      <p className="text-3xl font-black bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent tracking-tighter">{ticket.seatRow}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-10 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    <div className={`bg-white p-3 rounded-xl shadow-xl transition-all duration-300 ${used ? 'grayscale opacity-50' : 'hover:scale-105'}`}>
                      <QRCode value={ticket.ticketId} size={160} />
                    </div>
                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <h3 className="text-xl font-bold text-white">Your Entry Pass</h3>
                      <p className="text-white/50 text-sm leading-relaxed">
                        {used
                          ? 'This ticket has been used. The QR is no longer valid for entry.'
                          : listed
                          ? 'This ticket is listed for resale. The QR is locked until resale completes or is cancelled.'
                          : 'Present this QR at the entrance. Cryptographically bound to your wallet address.'}
                      </p>
                      <div className="pt-4 flex items-center justify-center md:justify-start gap-2">
                        <div className={`relative ${!used && !listed ? 'animate-pulse' : ''}`}>
                          <div className={`w-2.5 h-2.5 rounded-full ${used ? 'bg-white/30' : listed ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-400 to-green-500'}`} />
                          {!used && !listed && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />}
                        </div>
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${used ? 'text-white/30' : listed ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {used ? 'Ticket Used' : listed ? 'Listed for Resale' : 'Live Blockchain Sync'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm px-8 py-4 flex justify-between items-center border-t border-white/10">
                  <span className="text-white/30 text-[10px] font-mono tracking-widest uppercase">TIX_ID: #{ticket.ticketId}</span>
                  <span className="text-white/30 text-[10px] font-mono tracking-widest uppercase">STELLAR TESTNET</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Metadata & Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-6 hover:border-white/20 transition-all duration-500">
              <h2 className="font-headline text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent">Ticket Ownership</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#B1E5F5]">person</span>
                    <span className="text-sm font-medium text-white/60">Current Owner</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#B1E5F5]">{shortenAddress(ticket.owner || wallet)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/10 rounded-xl">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Purchase Price</p>
                    <p className="text-xl font-bold text-white">{ticket.price}</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-xl">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Resale Cap</p>
                    <p className="text-xl font-bold text-[#B1E5F5]">{ticket.maxResale}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#B1E5F5]">repeat</span>
                    <span className="text-sm font-medium text-white/60">Transfers Used</span>
                  </div>
                  <span className="font-bold text-white">{ticket.transfers} / {ticket.maxTransfers}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handleValidate}
                disabled={loading || used}
                className="group relative w-full py-5 bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="material-symbols-outlined relative">qr_code_scanner</span>
                <span className="relative">Validate Ticket</span>
              </button>

              <button
                onClick={() => setShowResell(true)}
                disabled={used || listed || ticket.transfers >= ticket.maxTransfers}
                className="group relative w-full py-5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">sell</span>
                {listed ? 'Listed for Resale' : 'Resell Ticket'}
              </button>

              <button
                onClick={() => setShowTransfer(true)}
                disabled={used || listed}
                className="w-full py-5 bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/20 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">send</span>
                Transfer Ticket
              </button>

              {used && <p className="text-center text-xs text-white/40 italic">This ticket has been used — all actions locked on-chain.</p>}
              {listed && (
                <p className="text-center text-xs text-amber-400 italic">
                  Listed on marketplace — go to <button className="underline font-bold hover:text-amber-300 transition-colors" onClick={() => navigate('/marketplace')}>Marketplace</button> to cancel.
                </p>
              )}
            </div>

            {/* Trust Badge */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex gap-4 group hover:bg-white/10 transition-all duration-500">
              <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-[#147DE1]/20 to-[#B1E5F5]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[#B1E5F5]" style={{fontVariationSettings:"'FILL' 1"}}>shield</span>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Smart Contract Protection</h4>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">
                  Resale cap: {ticket.maxResale} · Max transfers: {ticket.maxTransfers} · Enforced on Stellar Testnet. No override possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Resell Modal - Premium Glassmorphism */}
      {showResell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#031042]/80 backdrop-blur-md animate-fade-in-up" onClick={() => setShowResell(false)}>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline font-bold text-2xl bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent">List for Resale</h2>
                <button onClick={() => setShowResell(false)} className="text-3xl text-white/50 hover:text-white transition-colors leading-none">×</button>
              </div>

              <div className="mb-4 p-4 bg-white/5 rounded-xl text-sm space-y-2 border border-white/10">
                <div className="flex justify-between"><span className="text-white/50">Ticket</span><span className="font-bold text-white font-mono">{ticket.ticketId}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Event</span><span className="font-bold text-white">{ticket.eventName}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Transfers left</span><span className="font-bold text-[#B1E5F5]">{ticket.maxTransfers - ticket.transfers} remaining</span></div>
              </div>

              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400">
                <span className="font-bold">Resale cap: {ticket.maxResale}</span> — Smart contract will reject higher prices to prevent scalping.
              </div>

              <form onSubmit={handleResell} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                    Your Asking Price (XLM)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      max={ticket.maxResaleXLM > 0 ? ticket.maxResaleXLM : undefined}
                      className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-4 pr-14 focus:outline-none focus:ring-2 focus:ring-[#147DE1]/50 focus:border-transparent transition-all duration-300 text-white placeholder:text-white/30"
                      placeholder={`max ${ticket.maxResaleXLM} XLM`}
                      value={resellPrice}
                      onChange={e => { setResellPrice(e.target.value); setResellError(''); }}
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">XLM</span>
                  </div>
                  {resellError && <p className="text-xs text-red-400 mt-2 font-medium">{resellError}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowResell(false)} className="flex-1 py-3 border border-white/20 rounded-xl font-bold text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading || !resellPrice} className="flex-1 py-3 bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white rounded-xl font-bold hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0">
                    {loading ? 'Processing…' : 'List on Marketplace'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal - Premium Glassmorphism */}
      {showTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#031042]/80 backdrop-blur-md animate-fade-in-up" onClick={() => setShowTransfer(false)}>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline font-bold text-2xl bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent">Transfer Ticket</h2>
                <button onClick={() => setShowTransfer(false)} className="text-3xl text-white/50 hover:text-white transition-colors leading-none">×</button>
              </div>
              <div className="mb-6 p-4 bg-white/5 rounded-xl flex items-center gap-3 border border-white/10">
                <span className="text-[10px] font-black px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">VALID</span>
                <div>
                  <p className="font-bold text-white text-sm">{ticket.eventName}</p>
                  <p className="font-mono text-xs text-white/50">{ticket.ticketId}</p>
                </div>
              </div>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Recipient Stellar Address</label>
                  <input
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#147DE1]/50 focus:border-transparent transition-all duration-300 font-mono text-sm text-white placeholder:text-white/30"
                    placeholder="G… (Stellar address)"
                    value={toAddr}
                    onChange={e => setToAddr(e.target.value)}
                    required
                  />
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400">
                  ⚠ Transfer counts toward the resale limit ({ticket.transfers}/{ticket.maxTransfers} used). Used tickets cannot be transferred.
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowTransfer(false)} className="flex-1 py-3 border border-white/20 rounded-xl font-bold text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading || !toAddr.trim()} className="flex-1 py-3 bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white rounded-xl font-bold hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
                    {loading ? 'Processing…' : 'Confirm Transfer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Validate Modal - Premium Glassmorphism */}
      {validateState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#031042]/80 backdrop-blur-md animate-fade-in-up" onClick={() => setValidateState(null)}>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
            
            {validateState === 'loading' ? (
              <div className="p-12 text-center">
                <svg className="animate-spin w-12 h-12 mx-auto mb-4 text-[#147DE1]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-white/60 font-medium">Verifying on Stellar Testnet…</p>
              </div>
            ) : (
              <>
                <div className={`w-full py-8 flex flex-col items-center justify-center gap-4 ${validateState.isValid ? 'bg-gradient-to-r from-emerald-600 to-green-600' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-5xl" style={{color: validateState.isValid ? '#00C853' : '#ba1a1a', fontVariationSettings:"'FILL' 1"}}>
                      {validateState.isValid ? 'check_circle' : 'cancel'}
                    </span>
                  </div>
                  <div className="text-center">
                    <h3 className="text-white font-headline font-black text-2xl tracking-tight">
                      {validateState.isValid ? 'Valid Ticket' : 'Invalid Ticket'}
                    </h3>
                    <p className="text-white/80 font-bold text-sm tracking-widest uppercase">
                      {validateState.isValid ? 'Verified on Blockchain' : validateState.reason?.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <div className="p-8 w-full space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Validation Result</p>
                    <p className="text-sm text-white font-medium">{validateState.message}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tier</p>
                      <p className="font-headline font-bold text-white">{ticket.tier}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Seat</p>
                      <p className="font-headline font-bold text-white">{ticket.seatRow}</p>
                    </div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#B1E5F5]" style={{fontVariationSettings:"'FILL' 1"}}>shield</span>
                      <div>
                        <p className="text-[10px] font-bold text-[#B1E5F5] uppercase">TX Hash</p>
                        <p className="text-[10px] font-mono text-white/60 truncate w-40">{ticket.txHash}</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black text-white/30">{new Date().toLocaleTimeString()}</span>
                  </div>
                  {validateState.isValid && (
                    <button
                      onClick={handleMarkUsed}
                      className="group relative w-full bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] transition-all duration-300 overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="material-symbols-outlined relative">how_to_reg</span>
                      <span className="relative">CHECK IN — Mark as Used</span>
                    </button>
                  )}
                  <button onClick={() => setValidateState(null)} className="w-full py-3 text-white/50 font-medium hover:text-white transition-all duration-300">
                    Close
                  </button>
                </div>
              </>
            )}
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