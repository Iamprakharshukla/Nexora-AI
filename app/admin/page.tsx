'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Users, User, Database, ShieldAlert, Sparkles, TrendingUp, Cpu, Server } from 'lucide-react';
import Link from 'next/link';
import UniverseCanvas from '../../components/UniverseCanvas';

import { Transaction, FraudAlert } from '../../types';

export default function AdminDashboard() {
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [activeUsers, setActiveUsers] = useState(1450);
  const [ordersCount, setOrdersCount] = useState(342);
  const [dailyRevenue, setDailyRevenue] = useState(18450000);
  
  const [queryInput, setQueryInput] = useState('');
  const [queryReply, setQueryReply] = useState('Type an NLP question to request forecasting calculations.');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nexora_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isLoggedIn) {
          setIsLoggedIn(true);
        }
      } catch (e) {}
    }
  }, []);

  // Simulate Socket connection via random intervals
  useEffect(() => {
    const timer = setInterval(() => {
      const seconds = new Date().getSeconds();
      
      // Volatility logic
      const uCount = 1420 + Math.floor(Math.sin(seconds / 5) * 60);
      const oCount = 342 + Math.floor(seconds / 2.5);
      const rev = 18450000 + Math.floor(seconds * 12000);

      setActiveUsers(uCount);
      setOrdersCount(oCount);
      setDailyRevenue(rev);

      // Random new transaction
      if (Math.random() > 0.4) {
        const tx: Transaction = {
          id: `tx-${Date.now()}`,
          amount: [100000, 200000, 500000, 1000000][Math.floor(Math.random() * 4)],
          location: ['Mumbai Worli', 'Gurugram Golf Course Rd', 'Whitefield Bengaluru', 'South Delhi', 'Kolkata New Town'][Math.floor(Math.random() * 5)],
          timestamp: new Date().toLocaleTimeString()
        };
        setLiveTransactions(prev => [tx, ...prev].slice(0, 3));
      }

      // Random compliance alert
      if (seconds % 17 === 0) {
        setFraudAlerts(prev => [
          {
            id: `fa-${Date.now()}`,
            message: 'Verification check: Duplicate site visit request flagged and merged',
            severity: 'MEDIUM' as const,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ].slice(0, 2));
      } else if (seconds % 29 === 0) {
        setFraudAlerts(prev => [
          {
            id: `fa-${Date.now()}`,
            message: 'Security alert: Multiple site visit requests from single IP blocked',
            severity: 'HIGH' as const,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ].slice(0, 2));
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleAdminQuery = () => {
    if (!queryInput.trim()) return;

    setIsEvaluating(true);
    setQueryReply('Analyzing booking database...');

    setTimeout(() => {
      const q = queryInput.toLowerCase();
      if (q.includes('revenue') || q.includes('sales') || q.includes('predict') || q.includes('forecast') || q.includes('booking')) {
        setQueryReply('AI Forecast: Weekly site-visit interest shows a predicted surge of +14.2% in Mumbai Worli properties. Recommended strategy: prioritize premium duplex inventory.');
      } else if (q.includes('churn') || q.includes('fraud') || q.includes('alert') || q.includes('security')) {
        setQueryReply('AI Diagnostics: Checked security token status. RERA ID verification matches successfully across all developer endpoints.');
      } else {
        setQueryReply('AI Summary: Property databases are fully synced with RERA portals. System operational.');
      }
      setIsEvaluating(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-black text-white relative flex flex-col justify-between">
      {/* 3D background */}
      <div className="absolute inset-0 h-[600px] w-full z-0 overflow-hidden">
        <UniverseCanvas />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Header back link */}
      <header className="sticky top-0 w-full z-40 glassmorphism border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#00ffcc]" /> BACK TO PROPERTIES
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold font-mono tracking-widest text-[#cc00ff] uppercase hidden md:inline">
              DEVELOPER DASHBOARD
            </span>
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="px-3.5 py-1.5 rounded-xl border border-white/5 bg-white/3 text-[10px] font-bold font-mono tracking-wider transition-all hover:text-[#00ffcc] hover:border-[#00ffcc]/30 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" /> {isLoggedIn ? 'MY ACCOUNT' : 'LOGIN'}
            </Link>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-6 py-12 space-y-8 relative z-10">
        {/* Core Live Metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'ACTIVE SITE VISITORS', val: activeUsers, icon: Users, color: 'text-[#00ffcc]' },
            { label: 'REGISTERED AGENTS', val: '88 active', icon: Server, color: 'text-gray-400' },
            { label: 'VISITS BOOKED TODAY', val: ordersCount, icon: Cpu, color: 'text-white' },
            { label: 'SHORTLISTED PORTFOLIO VALUE', val: `₹${dailyRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-[#cc00ff]' }
          ].map((m, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[8px] font-mono tracking-widest text-gray-500 font-bold uppercase">{m.label}</p>
                <h3 className={`text-lg font-bold font-mono mt-1 ${m.color}`}>{m.val}</h3>
              </div>
              <div className="p-2 bg-white/3 border border-white/5 rounded-lg">
                <m.icon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl glassmorphism space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold font-mono text-gray-400 uppercase tracking-widest">PROPERTY DEMAND PROJECTION</span>
              <span className="text-[8px] font-mono text-[#00ffcc] bg-[#00ffcc]/10 px-2 py-0.5 rounded-full">AI Trend</span>
            </div>

            {/* SVG graph */}
            <div className="h-56 relative flex items-end pt-4">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.02)" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.02)" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.02)" />

                {/* CI confidence area */}
                <polygon
                  points="100,120 180,95 260,78 340,65 420,50 420,95 340,110 260,125 180,140 100,165"
                  fill="rgba(204, 0, 255, 0.04)"
                />

                {/* Target projection */}
                <polyline
                  fill="none"
                  stroke="#cc00ff"
                  strokeWidth="2"
                  points="100,140 180,120 260,98 340,82 420,65"
                  strokeDasharray="4,3"
                />

                {/* Actual inputs */}
                <polyline
                  fill="none"
                  stroke="#00ffcc"
                  strokeWidth="2"
                  points="100,140 180,115 260,105"
                />

                <circle cx="100" cy="140" r="3.5" fill="#00ffcc" />
                <circle cx="180" cy="115" r="3.5" fill="#00ffcc" />
                <circle cx="260" cy="105" r="3.5" fill="#00ffcc" />
                <circle cx="340" cy="82" r="3.5" fill="#cc00ff" />
                <circle cx="420" cy="65" r="3.5" fill="#cc00ff" />
              </svg>

              {/* Labels */}
              <div className="absolute bottom-1 left-0 w-full flex justify-between px-10 text-[8px] font-mono text-gray-500">
                <span>06/15</span>
                <span>06/17</span>
                <span>06/19 (TODAY)</span>
                <span>06/21 (AI)</span>
                <span>06/23 (AI)</span>
              </div>
            </div>

            <div className="flex gap-4 text-[9px] font-mono text-gray-500 pt-2">
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-[#00ffcc] block" /> ACTUAL BOOKINGS</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 border-t border-dashed border-[#cc00ff] block" /> AI DEMAND FORECAST</span>
            </div>
          </div>

          {/* NLP Command compiler */}
          <div className="p-6 rounded-2xl glassmorphism flex flex-col justify-between space-y-4">
            <div className="pb-3 border-b border-white/5">
              <span className="text-xs font-bold font-mono text-gray-400 uppercase tracking-widest">NEURAL INTENT CONSOLE</span>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-between pt-2">
              <div className="relative">
                <input
                  type="text"
                  value={queryInput}
                  onChange={e => setQueryInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdminQuery()}
                  placeholder="Ask 'Predict booking trajectory' or 'Check compliance status'..."
                  className="w-full pr-10 pl-3 py-2.5 bg-white/3 border border-white/5 focus:outline-none focus:border-[#cc00ff]/30 rounded-xl text-xs text-white placeholder-gray-600"
                />
                <button
                  onClick={handleAdminQuery}
                  className="absolute right-2.5 top-2 text-[#cc00ff] hover:scale-105 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/3 text-[10px] font-mono text-gray-400 leading-relaxed min-h-[110px] relative">
                {isEvaluating && (
                  <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-t-[#cc00ff] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                  </div>
                )}
                {queryReply}
              </div>
            </div>
          </div>
        </div>

        {/* Live Transaction logs & Telemetry ticks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glassmorphism space-y-4">
            <div className="pb-2 border-b border-white/5">
              <span className="text-xs font-bold font-mono text-gray-400 uppercase tracking-widest">LIVE BOOKING LOGS (TOKEN PAYMENTS)</span>
            </div>
            
            <div className="space-y-2.5 h-44 overflow-y-auto pr-1">
              {liveTransactions.map(tx => (
                <div key={tx.id} className="p-3 rounded-xl bg-white/3 border border-white/5 flex justify-between items-center animate-in fade-in">
                  <div>
                    <span className="text-xs text-white font-bold">Booking deposit verified</span>
                    <span className="text-[9px] text-gray-500 font-mono block">{tx.location} • {tx.timestamp}</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-[#00ffcc]">+₹{tx.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              {liveTransactions.length === 0 && (
                <div className="text-center py-10 text-[10px] text-gray-600 font-mono">Listening for site visits...</div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl glassmorphism space-y-4">
            <div className="pb-2 border-b border-white/5">
              <span className="text-xs font-bold font-mono text-gray-400 uppercase tracking-widest">COMPLIANCE & AUDIT LOGS</span>
            </div>

            <div className="space-y-2.5 h-44 overflow-y-auto pr-1">
              {fraudAlerts.map(fa => (
                <div key={fa.id} className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 flex gap-2.5 items-start animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-red-400 font-bold">{fa.message}</p>
                    <p className="text-[8px] text-red-500/60 font-mono mt-0.5">STATUS: {fa.severity} • {fa.timestamp}</p>
                  </div>
                </div>
              ))}
              {fraudAlerts.length === 0 && (
                <div className="text-center py-10 text-[10px] text-gray-600 font-mono">No compliance alerts. Database fully verified.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#030303] py-8 text-center text-[9px] text-gray-600 font-mono tracking-widest uppercase">
        NEXORA LUXURY ESTATES • RERA COMPLIANT • POWERED BY AI
      </footer>
    </main>
  );
}
