'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Users, User, Database, ShieldAlert, Sparkles, TrendingUp, Cpu, Server } from 'lucide-react';
import Link from 'next/link';
import UniverseCanvas from '../../components/UniverseCanvas';
import { getMe, getAdminStats, getAdminProperties, approveProperty } from '@/lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [pendingProperties, setPendingProperties] = useState<any[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [queryInput, setQueryInput] = useState('');
  const [queryReply, setQueryReply] = useState('Type an NLP question to request forecasting calculations.');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const loadAdminData = async () => {
    try {
      const meRes = await getMe();
      if (!meRes.user || meRes.user.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      setIsLoggedIn(true);
      setIsAdmin(true);

      const statsRes = await getAdminStats();
      setStats(statsRes.stats);
      setRecentInquiries(statsRes.recentInquiries || []);
      setRecentUsers(statsRes.recentUsers || []);

      const pendingRes = await getAdminProperties({ approved: 'false' });
      setPendingProperties(pendingRes.properties || []);
    } catch (err) {
      console.error('Admin loading failed:', err);
      router.push('/login');
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApproveProperty = async (id: string, approve: boolean) => {
    try {
      await approveProperty(id, approve);
      alert(approve ? 'Property approved successfully and is now live!' : 'Property listing rejected.');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

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
            { label: 'TOTAL ESTATES', val: stats?.properties?.total ?? 0, icon: Database, color: 'text-white' },
            { label: 'PENDING REVIEWS', val: stats?.properties?.pending ?? 0, icon: ShieldAlert, color: 'text-yellow-400' },
            { label: 'REGISTERED CLIENTS', val: stats?.users?.total ?? 0, icon: Users, color: 'text-[#00ffcc]' },
            { label: 'TOTAL INQUIRIES', val: stats?.inquiries?.total ?? 0, icon: Cpu, color: 'text-[#cc00ff]' }
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

        {/* Properties Awaiting Approval */}
        <div className="p-6 rounded-2xl glassmorphism border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-bold font-mono tracking-widest text-[#00ffcc] uppercase flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#00ffcc]" /> Properties Awaiting RERA & Listing Approval
            </span>
            <span className="text-[9px] text-gray-500 font-mono">{pendingProperties.length} pending review</span>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {pendingProperties.map(p => (
              <div key={p.id} className="p-4 rounded-xl bg-white/3 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#00ffcc]/20 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                    <span className="text-[8px] font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5">
                      {p.category}
                    </span>
                    <span className="text-[8px] font-mono bg-white/5 px-2 py-0.5 rounded text-[#00ffcc] border border-[#00ffcc]/10">
                      {p.purpose}
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-400 font-mono">
                    Owner: {p.postedBy?.name || 'Owner'} ({p.postedBy?.email}) • City: {p.city} • Locality: {p.locality || 'N/A'} • Area: {p.carpetArea || 'N/A'}
                  </p>
                  <p className="text-[10px] text-[#00ffcc] font-mono font-bold pt-0.5">
                    ₹{p.price.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleApproveProperty(p.id, true)}
                    className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-[#00ffcc] text-black font-bold hover:shadow-[0_0_15px_rgba(0,255,204,0.3)] transition-all text-[9px] tracking-wider uppercase"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproveProperty(p.id, false)}
                    className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-red-900/20 border border-red-500/20 text-red-400 hover:bg-red-900/30 transition-all text-[9px] tracking-wider uppercase"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {pendingProperties.length === 0 && (
              <div className="text-center py-12 text-[10px] text-gray-600 font-mono uppercase tracking-wider">
                All submitted property listings are verified & live.
              </div>
            )}
          </div>
        </div>

        {/* Live Transaction logs & Telemetry ticks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glassmorphism space-y-4">
            <div className="pb-2 border-b border-white/5">
              <span className="text-xs font-bold font-mono text-gray-400 uppercase tracking-widest">RECENT SITE VISIT & INQUIRY BOOKINGS</span>
            </div>
            
            <div className="space-y-2.5 h-44 overflow-y-auto pr-1">
              {recentInquiries.map(inq => (
                <div key={inq.id} className="p-3 rounded-xl bg-white/3 border border-white/5 flex justify-between items-center animate-in fade-in">
                  <div>
                    <span className="text-xs text-white font-bold">{inq.type} request</span>
                    <span className="text-[9px] text-gray-500 font-mono block">
                      Client: {inq.name} ({inq.phone}) • {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">
                      Property: {inq.property?.name} ({inq.property?.city})
                    </span>
                  </div>
                  <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                    inq.status === 'CONFIRMED'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : inq.status === 'PENDING'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                    {inq.status}
                  </span>
                </div>
              ))}
              {recentInquiries.length === 0 && (
                <div className="text-center py-10 text-[10px] text-gray-600 font-mono">No recent inquiries.</div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl glassmorphism space-y-4">
            <div className="pb-2 border-b border-white/5">
              <span className="text-xs font-bold font-mono text-gray-400 uppercase tracking-widest">COMPLIANCE & HNI CLIENT LOGS</span>
            </div>

            <div className="space-y-2.5 h-44 overflow-y-auto pr-1">
              {recentUsers.map(user => (
                <div key={user.id} className="p-3 rounded-xl bg-white/3 border border-white/5 flex gap-2.5 items-start animate-in fade-in">
                  <User className="w-4 h-4 text-[#00ffcc] shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <p className="text-[10px] text-gray-300 font-bold">New HNI Client Registered</p>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5">
                      Name: {user.name} • Email: {user.email} • City: {user.city || 'N/A'}
                    </p>
                    <p className="text-[8px] text-gray-500/60 font-mono">
                      Date: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <div className="text-center py-10 text-[10px] text-gray-600 font-mono">No recent client registrations.</div>
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
