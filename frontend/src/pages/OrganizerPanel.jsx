import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StatusBar } from '../components/StatusBar';
import { useApp } from '../context/AppContext';

export default function OrganizerPanel() {
  const { wallet, mintTicket, loading } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ eventName: '', basePrice: '0.05', maxResale: '110', maxResales: '2', location: '', date: '', tier: 'General Admission' });
  const [submitted, setSubmitted] = useState(false);

  function update(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!wallet) { navigate('/connect'); return; }
    const result = await mintTicket({
      eventName: form.eventName,
      tier: form.tier,
      date: form.date,
      location: form.location,
    });
    if (result) {
      setSubmitted(true);
      setTimeout(() => navigate('/tickets'), 2000);
    }
  }

  return (
    <div className="bg-[#031042] font-body text-white min-h-screen overflow-x-hidden">
      <Navbar active="organizer" />
      <StatusBar />
      <main className="max-w-7xl mx-auto px-8 py-12 pt-36 relative">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 -left-40 w-96 h-96 bg-[#147DE1] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-[#B1E5F5] rounded-full mix-blend-screen filter blur-[140px] opacity-20 animate-pulse delay-1000 pointer-events-none" />
        
        <header className="mb-12 relative z-10 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent mb-3 font-headline">
            Organizer Dashboard
          </h1>
          <p className="text-white/60 max-w-2xl leading-relaxed">Manage your events and set immutable resale rules on the blockchain. Ensure trust and transparency for every ticket issued.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Form */}
          <section className="lg:col-span-7">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 transition-all duration-500 hover:border-white/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-[#147DE1]/20 to-[#B1E5F5]/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#B1E5F5]">add_circle</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white font-headline">Create New Event</h2>
              </div>
              {submitted ? (
                <div className="text-center py-16 animate-fade-in-up">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 mb-6">
                    <span className="material-symbols-outlined text-5xl text-emerald-400" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                  </div>
                  <h3 className="font-headline font-black text-3xl bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent mb-3">Ticket Minted!</h3>
                  <p className="text-white/60">Redirecting to My Tickets…</p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2" htmlFor="event-name">Event Name</label>
                    <input
                      id="event-name"
                      className="w-full bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-[#147DE1]/50 focus:border-transparent transition-all duration-300 py-3 px-4 placeholder:text-white/30 outline-none text-white"
                      placeholder="e.g., Grand Symphony Night"
                      value={form.eventName}
                      onChange={update('eventName')}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2" htmlFor="tier">Ticket Tier</label>
                      <input
                        id="tier"
                        className="w-full bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-[#147DE1]/50 focus:border-transparent transition-all duration-300 py-3 px-4 placeholder:text-white/30 outline-none text-white"
                        placeholder="VIP / General Admission"
                        value={form.tier}
                        onChange={update('tier')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2" htmlFor="date">Event Date</label>
                      <input
                        id="date"
                        className="w-full bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-[#147DE1]/50 focus:border-transparent transition-all duration-300 py-3 px-4 placeholder:text-white/30 outline-none text-white"
                        placeholder="Apr 20, 2025"
                        value={form.date}
                        onChange={update('date')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2" htmlFor="location">Location</label>
                    <input
                      id="location"
                      className="w-full bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-[#147DE1]/50 focus:border-transparent transition-all duration-300 py-3 px-4 placeholder:text-white/30 outline-none text-white"
                      placeholder="e.g., Manila Convention Center"
                      value={form.location}
                      onChange={update('location')}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2" htmlFor="base-price">Base Ticket Price (XLM)</label>
                      <div className="relative">
                        <input
                          id="base-price"
                          className="w-full bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-[#147DE1]/50 focus:border-transparent transition-all duration-300 py-3 pl-4 pr-12 outline-none text-white"
                          placeholder="0.05"
                          step="0.01"
                          type="number"
                          value={form.basePrice}
                          onChange={update('basePrice')}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-medium text-sm">XLM</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2" htmlFor="max-resale">Max Resale Percentage</label>
                      <div className="relative">
                        <input
                          id="max-resale"
                          className="w-full bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-[#147DE1]/50 focus:border-transparent transition-all duration-300 py-3 pl-4 pr-12 outline-none text-white"
                          placeholder="110"
                          type="number"
                          value={form.maxResale}
                          onChange={update('maxResale')}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-medium text-sm">%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2" htmlFor="max-resales-count">Max Number of Resales</label>
                    <input
                      id="max-resales-count"
                      className="w-full bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-[#147DE1]/50 focus:border-transparent transition-all duration-300 py-3 px-4 outline-none text-white"
                      placeholder="2"
                      type="number"
                      value={form.maxResales}
                      onChange={update('maxResales')}
                    />
                    <p className="mt-2 text-[11px] text-white/40 italic">Set how many times a single ticket can change owners in the secondary market.</p>
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading || !form.eventName.trim() || !wallet}
                      className="group relative w-full bg-gradient-to-r from-[#147DE1] to-[#0E5AA8] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-[0_8px_25px_rgba(20,125,225,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="material-symbols-outlined relative">token</span>
                      <span className="relative">
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Minting…
                          </span>
                        ) : wallet ? 'Mint Tickets' : 'Connect Wallet to Mint'}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-start gap-4 group hover:bg-white/10 transition-all duration-500">
              <div className="w-12 h-12 bg-gradient-to-br from-[#147DE1]/20 to-[#B1E5F5]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[#B1E5F5]" style={{fontVariationSettings:"'FILL' 1"}}>verified_user</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Blockchain Verified</h3>
                <p className="text-sm text-white/50 leading-relaxed mt-1">Every ticket minted through TixSigurado is automatically verified on the ledger. Trust built into every ticket.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1">
                <span className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Total Revenue</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent">12.84</span>
                  <span className="text-xs font-bold text-[#B1E5F5]">XLM</span>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1">
                <span className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Active Events</span>
                <span className="text-3xl font-black bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent">04</span>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2 font-headline text-lg">
                <span className="material-symbols-outlined text-[#B1E5F5] text-xl">history</span>
                Recent Operations
              </h3>
              <div className="space-y-6">
                {[
                  { label: '500 Tickets Minted', sub: 'Summer Jazz Festival • 2 hours ago', active: true },
                  { label: 'Royalties Collected', sub: '0.12 XLM from secondary sales • 1 day ago', active: false },
                  { label: 'Event Finalized', sub: 'Opera Premiere • 3 days ago', active: false },
                ].map(({ label, sub, active }) => (
                  <div key={label} className={`flex gap-4 group/item transition-all duration-300 ${!active ? 'opacity-50' : ''}`}>
                    <div className={`w-1 rounded-full transition-all duration-300 ${active ? 'bg-gradient-to-b from-[#147DE1] to-[#B1E5F5]' : 'bg-white/20'}`} />
                    <div>
                      <p className="text-sm font-bold text-white group-hover/item:text-[#B1E5F5] transition-colors">{label}</p>
                      <p className="text-xs text-white/40 mt-1">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Ticket Design Preview - Premium Glassmorphism */}
        <section className="mt-16 relative z-10">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6">Ticket Design Preview</h2>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#147DE1]/20 via-transparent to-[#B1E5F5]/10 blur-3xl -z-10 opacity-50" />
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-10 shadow-2xl transition-all duration-500 hover:border-white/30">
              <div className="relative h-48 w-48 shrink-0 rounded-xl overflow-hidden shadow-xl">
                <img
                  alt="Event visual"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBU-cfBXZ0NpWH55vUFJOTZ6IbVag_8TC6-C38mNs4TxIQ5UM7iQKwFkerBJRqjIJ-KoCilKMdyFHxdIPKbbsC1BFtVb5Q7T93XTWrkGq-GiOgAGxk5J-tdPMopHSnA1iqDzeF8JVleZBYTwogIcwJC3JJvQt3p0QYNHVBeWkzDgKnePFK_TOWi-I7ka86RDilAuJGHM4cf4mWTD9ZIxg0Ar_xyhRjEZGXX_JsAlqSElwffzWlrGbsQwMW2VKKbE6XJFlaMMTMQAZc"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#031042]/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Premium Pass</span>
                </div>
              </div>
              <div className="flex-grow space-y-5">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <span className="text-[#B1E5F5] font-bold text-sm tracking-wide">CONFIRMED MINT</span>
                    <h3 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white to-[#B1E5F5] bg-clip-text text-transparent mt-1 tracking-tight font-headline">
                      {form.eventName || 'Your Event Name Here'}
                    </h3>
                  </div>
                  <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                    <span className="block text-[10px] font-bold text-white/50 uppercase tracking-widest">Resale Cap</span>
                    <span className="text-xl font-black text-[#B1E5F5]">{form.maxResale}%</span>
                  </div>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <span className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Base Price</span>
                    <span className="font-bold text-white text-lg">{form.basePrice} XLM</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Max Resales</span>
                    <span className="font-bold text-white text-lg">{form.maxResales} Times</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Royalties</span>
                    <span className="font-bold text-[#B1E5F5] text-lg">5% Earned</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Network</span>
                    <span className="font-bold text-[#147DE1] text-lg">Stellar Testnet</span>
                  </div>
                </div>
              </div>
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
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}