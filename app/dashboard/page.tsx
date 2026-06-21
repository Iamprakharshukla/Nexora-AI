'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Bookmark, Calendar, User, MapPin, DollarSign, LogOut, CheckCircle, Trash2, ArrowRight, MessageSquare, ChevronRight, Home, PlusCircle, List } from 'lucide-react';
import Link from 'next/link';
import UniverseCanvas from '../../components/UniverseCanvas';
import { Product } from '../../types';
import { productsDb } from '../../types/properties';
import { getMe, getProperties, postProperty, deleteProperty, getShortlist, removeFromShortlist, submitInquiry, setAuthToken } from '@/lib/api';

interface UserSession {
  isLoggedIn: boolean;
  name: string;
  phone: string;
  email: string;
  budget: string;
  city: string;
  role: string;
  shortlistedIds: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  
  // Real database shortlist state
  const [shortlistedProperties, setShortlistedProperties] = useState<Product[]>([]);

  // Site visits state
  const [siteVisits, setSiteVisits] = useState<{ id: string; propertyName: string; date: string; time: string; status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' }[]>([]);

  // Profile preferences state
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [budgetInput, setBudgetInput] = useState('₹5 Cr - ₹10 Cr');
  const [cityInput, setCityInput] = useState('Mumbai');
  const [editSuccess, setEditSuccess] = useState(false);

  // Listing Properties State (Sell/Rent Out)
  const [activePanel, setActivePanel] = useState<'OVERVIEW' | 'LIST_PROPERTY'>('OVERVIEW');
  const [userListedProperties, setUserListedProperties] = useState<Product[]>([]);
  
  // Form fields for listing property
  const [postPropertyName, setPostPropertyName] = useState('');
  const [postDeveloper, setPostDeveloper] = useState('');
  const [postPrice, setPostPrice] = useState('');
  const [postPurpose, setPostPurpose] = useState<'BUY' | 'RENT'>('BUY');
  const [postCategory, setPostCategory] = useState('Apartments');
  const [postCarpetArea, setPostCarpetArea] = useState('');
  const [postFacing, setPostFacing] = useState('East Facing');
  const [postDescription, setPostDescription] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const meRes = await getMe();
        const me = meRes.user;
        
        const userSes = {
          isLoggedIn: true,
          name: me.name,
          phone: me.phone || '',
          email: me.email,
          budget: me.budget || '₹5 Cr - ₹15 Cr',
          city: me.city || 'Mumbai',
          role: me.role,
          shortlistedIds: []
        };

        setSession(userSes);
        setNameInput(userSes.name);
        setEmailInput(userSes.email);
        setPhoneInput(userSes.phone);
        setBudgetInput(userSes.budget);
        setCityInput(userSes.city);

        // Load Real Shortlist from API
        const shortlistRes = await getShortlist();
        setShortlistedProperties(shortlistRes.properties || []);

        // Load Real Listed Properties from API
        const listedRes = await getProperties({ owner: 'true' });
        setUserListedProperties(listedRes.properties || []);
      } catch (err) {
        redirectToLogin();
      }
    }

    loadDashboardData();

    // Set initial mock site visits
    setSiteVisits([
      { id: 'visit-1', propertyName: 'Lodha World Tower Duplex', date: '2026-06-25', time: '11:00 AM', status: 'CONFIRMED' },
      { id: 'visit-2', propertyName: 'Godrej Horizon Smart Duplex', date: '2026-06-29', time: '04:30 PM', status: 'PENDING' }
    ]);
  }, []);

  const redirectToLogin = () => {
    localStorage.removeItem('nexora_user_session');
    setAuthToken(null);
    router.push('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('nexora_user_session');
    setAuthToken(null);
    router.push('/');
  };

  const handleRemoveShortlist = async (productId: string) => {
    try {
      await removeFromShortlist(productId);
      setShortlistedProperties(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Failed to remove shortlist:', err);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const updatedSession = {
      ...session,
      name: nameInput,
      email: emailInput,
      phone: phoneInput,
      budget: budgetInput,
      city: cityInput
    };
    setSession(updatedSession);
    localStorage.setItem('nexora_user_session', JSON.stringify(updatedSession));
    
    setEditSuccess(true);
    setTimeout(() => setEditSuccess(false), 2000);
  };

  const handleBookVisitFromDashboard = async (propertyId: string, propertyName: string) => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    const dateStr = today.toISOString().split('T')[0];
    
    try {
      await submitInquiry({
        name: session?.name || 'Guest',
        phone: session?.phone || '9876543210',
        email: session?.email,
        message: `Dashboard request for site visit at 12:00 PM on ${dateStr}`,
        type: 'SITE_VISIT',
        propertyId
      });

      const newVisit = {
        id: `visit-${Date.now()}`,
        propertyName,
        date: dateStr,
        time: '12:00 PM',
        status: 'PENDING' as const
      };
      setSiteVisits(prev => [...prev, newVisit]);
      alert(`Site visit requested for ${propertyName}! It is added to your tours list below.`);
    } catch (err: any) {
      alert(err.message || 'Failed to request site visit.');
    }
  };

  const handleCancelVisit = (visitId: string) => {
    setSiteVisits(prev => prev.filter(v => v.id !== visitId));
  };

  // Post Property handler
  const handlePostProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postPropertyName || !postPrice || !postDeveloper) {
      alert('Please fill in Property Name, Developer, and Price.');
      return;
    }

    const defaultImages = postPurpose === 'RENT' 
      ? [
          '/lodha_ext.png',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
        ]
      : [
          '/dlf_ext.png',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
        ];

    try {
      await postProperty({
        name: postPropertyName,
        price: parseFloat(postPrice),
        brand: postDeveloper,
        description: postDescription || 'Premium developer estate listing.',
        category: postCategory,
        purpose: postPurpose === 'RENT' ? 'RENT' : 'BUY',
        bhk: 3,
        locality: 'Worli',
        city: cityInput,
        furnishing: 'FURNISHED',
        facing: postFacing,
        carpetArea: postCarpetArea ? `${postCarpetArea} sq. ft.` : '4,000 sq. ft.',
        carpetAreaSqFt: postCarpetArea ? parseFloat(postCarpetArea) : 4000,
        amenities: ['Power Backup', 'Security', 'Parking'],
        images: defaultImages
      });

      setPostSuccess(true);

      const listedRes = await getProperties({ owner: 'true' });
      setUserListedProperties(listedRes.properties || []);

      setTimeout(() => {
        setPostSuccess(false);
        setPostPropertyName('');
        setPostDeveloper('');
        setPostPrice('');
        setPostCarpetArea('');
        setPostDescription('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to post property.');
    }
  };

  const handleDeleteUserListing = async (id: string) => {
    try {
      await deleteProperty(id);
      setUserListedProperties(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing.');
    }
  };

  if (!session) return null;

  // Merge default properties with user listed ones for dynamic selections
  const allProperties = [...productsDb, ...userListedProperties];

  // AI recommendations (excluding shortlisted ones)
  const recommendedProperties = allProperties.filter(p => !shortlistedProperties.some(sp => sp.id === p.id));

  const formatPrice = (amount: number, purpose?: string) => {
    let text = '';
    if (amount >= 10000000) {
      text = `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      text = `₹${(amount / 100000).toFixed(2)} Lakhs`;
    } else {
      text = `₹${amount.toLocaleString('en-IN')}`;
    }
    return purpose === 'RENT' ? `${text} / month` : text;
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
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-gray-400 hover:text-white transition-colors"
            >
              ← BACK TO PROPERTIES
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {session.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="px-3 py-1 rounded-xl border border-[#cc00ff]/30 bg-[#cc00ff]/10 text-[10px] font-bold font-mono tracking-wider transition-all hover:bg-[#cc00ff]/20 text-[#cc00ff] flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#cc00ff]" /> ADMIN DASHBOARD
              </Link>
            )}
            <span className="text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase">
              Buyer & Seller Portal
            </span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-white/5 bg-white/3 text-gray-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main dashboard content */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 space-y-10 relative z-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-2xl glassmorphism border border-white/5 gap-4">
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono tracking-widest text-[#00ffcc] uppercase">
                Account Overview
              </span>
              <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono tracking-widest text-[#cc00ff] uppercase">
                RERA Sync Verified
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Namaste, {session.name}
            </h2>
            
            {/* Dashboard Sidebar Tabs Switch */}
            <div className="flex bg-white/3 border border-white/5 rounded-xl p-1 select-none font-mono mt-2 w-max">
              <button
                onClick={() => setActivePanel('OVERVIEW')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 ${
                  activePanel === 'OVERVIEW'
                    ? 'bg-[#00ffcc] text-black shadow-glow-cyan font-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Home className="w-3 h-3" /> Overview Panel
              </button>
              <button
                onClick={() => setActivePanel('LIST_PROPERTY')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 ${
                  activePanel === 'LIST_PROPERTY'
                    ? 'bg-[#cc00ff] text-white shadow-glow-pink font-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <PlusCircle className="w-3 h-3" /> Post Property (Sell/Rent)
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-4 bg-white/3 border border-white/5 rounded-xl text-center min-w-[100px]">
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">SHORTLISTED</span>
              <span className="text-xl font-bold font-mono text-[#00ffcc] mt-1 block">{shortlistedProperties.length}</span>
            </div>
            <div className="p-4 bg-white/3 border border-white/5 rounded-xl text-center min-w-[100px]">
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">LISTED BY ME</span>
              <span className="text-xl font-bold font-mono text-[#cc00ff] mt-1 block">{userListedProperties.length}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Panels */}
        {activePanel === 'OVERVIEW' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Shortlists and Site Visits */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Shortlisted Properties */}
              <div className="p-6 rounded-2xl glassmorphism border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-bold font-mono tracking-widest text-[#00ffcc] uppercase flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-[#00ffcc]" /> Shortlisted Estates
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">My Selection</span>
                </div>

                <div className="space-y-4">
                  {shortlistedProperties.map(p => (
                    <div key={p.id} className="p-4 rounded-xl bg-white/3 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#00ffcc]/20 transition-all group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white group-hover:text-[#00ffcc] transition-colors">{p.name}</h4>
                          <span className="text-[8px] font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5">
                            {p.category}
                          </span>
                          <span className="text-[8px] font-mono bg-white/5 px-2 py-0.5 rounded text-[#00ffcc] border border-[#00ffcc]/10">
                            {p.purpose === 'RENT' ? 'RENTAL' : 'SALE'}
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-400 font-mono">{p.brand} • Carpet: {p.carpetArea || 'N/A'} • Facing: {p.facing || 'N/A'}</p>
                        <p className="text-[10px] text-[#00ffcc] font-mono font-bold pt-1">{formatPrice(p.price, p.purpose)}</p>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleBookVisitFromDashboard(p.id, p.name)}
                          className="flex-1 md:flex-none px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-[#00ffcc] hover:text-black transition-all text-[9px] font-bold tracking-wider uppercase flex items-center justify-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Book Tour
                        </button>
                        <button
                          onClick={() => handleRemoveShortlist(p.id)}
                          className="p-1.5 rounded-lg border border-white/5 hover:border-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                          title="Remove Shortlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {shortlistedProperties.length === 0 && (
                    <div className="text-center py-12 text-[10px] text-gray-600 font-mono uppercase tracking-wider">
                      No shortlisted properties. Start shortlisting from home page.
                    </div>
                  )}
                </div>
              </div>

              {/* Booked Site Visits */}
              <div className="p-6 rounded-2xl glassmorphism border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-bold font-mono tracking-widest text-[#cc00ff] uppercase flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#cc00ff]" /> Scheduled Site Visits
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">Tours History</span>
                </div>

                <div className="space-y-4">
                  {siteVisits.map(v => (
                    <div key={v.id} className="p-4 rounded-xl bg-white/3 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#cc00ff]/20 transition-all">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white">{v.propertyName}</h4>
                        <p className="text-[9px] text-gray-400 font-mono">Date: {v.date} • Schedule Time: {v.time}</p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                        <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                          v.status === 'CONFIRMED'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : v.status === 'PENDING'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {v.status}
                        </span>
                        <button
                          onClick={() => handleCancelVisit(v.id)}
                          className="text-[9px] text-gray-500 hover:text-red-400 underline font-mono tracking-wide"
                        >
                          Cancel Visit
                        </button>
                      </div>
                    </div>
                  ))}

                  {siteVisits.length === 0 && (
                    <div className="text-center py-12 text-[10px] text-gray-600 font-mono uppercase tracking-wider">
                      No scheduled site visits. Book a tour on any shortlist item.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Preferences, Budget Chart, and Agent Contacts */}
            <div className="space-y-8">
              
              {/* Preferences Form */}
              <div className="p-6 rounded-2xl glassmorphism border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold font-mono tracking-widest text-gray-300 uppercase flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-300" /> Buyer Profile
                  </span>
                  <Sparkles className="w-4 h-4 text-[#00ffcc]" />
                </div>

                {editSuccess && (
                  <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-center flex items-center justify-center gap-1.5 text-[9px] font-mono font-bold uppercase animate-in fade-in">
                    <CheckCircle className="w-4 h-4" /> Preference parameters saved
                  </div>
                )}

                <form onSubmit={handleSavePreferences} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white/3 border border-white/5 focus:outline-none focus:border-[#00ffcc]/30 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Email Address</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white/3 border border-white/5 focus:outline-none focus:border-[#00ffcc]/30 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Mobile</label>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white/3 border border-white/5 focus:outline-none focus:border-[#00ffcc]/30 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Preferred Location</label>
                    <select
                      value={cityInput}
                      onChange={e => setCityInput(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 focus:outline-none focus:border-[#00ffcc]/30 rounded-lg text-white font-mono text-xs"
                    >
                      <option value="Mumbai">Mumbai (Worli / Bandra)</option>
                      <option value="Gurugram">Gurugram (Golf Course Rd)</option>
                      <option value="Bengaluru">Bengaluru (Whitefield)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Budget Bracket</label>
                    <select
                      value={budgetInput}
                      onChange={e => setBudgetInput(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 focus:outline-none focus:border-[#00ffcc]/30 rounded-lg text-white font-mono text-xs"
                    >
                      <option value="₹1 Cr - ₹3 Cr">₹1 Cr - ₹3 Cr</option>
                      <option value="₹3 Cr - ₹5 Cr">₹3 Cr - ₹5 Cr</option>
                      <option value="₹5 Cr - ₹10 Cr">₹5 Cr - ₹10 Cr</option>
                      <option value="₹10 Cr+">₹10 Cr+</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-white text-black font-black text-[9px] tracking-widest uppercase hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                  >
                    Save Profile Settings <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Budget SVG allocation chart */}
              <div className="p-6 rounded-2xl glassmorphism border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold font-mono tracking-widest text-[#cc00ff] uppercase">
                    Budget Matrix Allocation
                  </span>
                  <span className="text-[8px] font-mono text-gray-500">Live share</span>
                </div>

                <div className="flex items-center justify-center py-2 relative">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="50"
                      fill="transparent"
                      stroke="#00ffcc"
                      strokeWidth="12"
                      strokeDasharray="314"
                      strokeDashoffset="188.4"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="50"
                      fill="transparent"
                      stroke="#cc00ff"
                      strokeWidth="12"
                      strokeDasharray="314"
                      strokeDashoffset="204.1"
                      transform="rotate(144 72 72)"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="50"
                      fill="transparent"
                      stroke="#0077ff"
                      strokeWidth="12"
                      strokeDasharray="314"
                      strokeDashoffset="235.5"
                      transform="rotate(270 72 72)"
                    />
                  </svg>
                  
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[8px] font-mono text-gray-500">Max Bracket</span>
                    <span className="text-xs font-bold text-white font-mono mt-0.5">{budgetInput.split(' ')[2] || '₹10 Cr+'}</span>
                  </div>
                </div>

                <div className="text-[8px] font-mono text-gray-500 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#00ffcc]" /> Penthouses (40%)</span>
                    <span className="text-white">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#cc00ff]" /> Luxury Villas (35%)</span>
                    <span className="text-white">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#0077ff]" /> Smart Duplexes (25%)</span>
                    <span className="text-white">Active</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* List Property / Seller Tab Panel */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* List Property Form */}
            <div className="lg:col-span-2 p-6 rounded-2xl glassmorphism border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold font-mono tracking-widest text-[#cc00ff] uppercase flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-[#cc00ff]" /> List Property Details
                </span>
                <span className="text-[8px] text-gray-500 font-mono">Owner / Dealer Form</span>
              </div>

              {postSuccess && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-center flex items-center justify-center gap-2 text-[10px] font-mono font-bold uppercase animate-in fade-in">
                  <CheckCircle className="w-4 h-4" /> PROPERTY LISTED SUCCESSFULLY (Sent for RERA review verification)
                </div>
              )}

              <form onSubmit={handlePostProperty} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Property Name</label>
                  <input
                    type="text"
                    value={postPropertyName}
                    onChange={e => setPostPropertyName(e.target.value)}
                    placeholder="e.g. DLF The Camellias Villa..."
                    className="w-full px-3 py-2 bg-white/3 border border-white/5 focus:outline-none focus:border-[#cc00ff]/30 rounded-lg text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Developer / Brand</label>
                  <input
                    type="text"
                    value={postDeveloper}
                    onChange={e => setPostDeveloper(e.target.value)}
                    placeholder="e.g. DLF Luxury, Lodha Luxury..."
                    className="w-full px-3 py-2 bg-white/3 border border-white/5 focus:outline-none focus:border-[#cc00ff]/30 rounded-lg text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Property Purpose</label>
                  <div className="flex bg-black border border-white/5 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setPostPurpose('BUY')}
                      className={`flex-1 py-1.5 rounded text-[9px] font-bold uppercase ${
                        postPurpose === 'BUY' ? 'bg-[#00ffcc] text-black font-black' : 'text-gray-400'
                      }`}
                    >
                      For Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostPurpose('RENT')}
                      className={`flex-1 py-1.5 rounded text-[9px] font-bold uppercase ${
                        postPurpose === 'RENT' ? 'bg-[#00ffcc] text-black font-black' : 'text-gray-400'
                      }`}
                    >
                      For Rent
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Property Category</label>
                  <select
                    value={postCategory}
                    onChange={e => setPostCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/5 focus:outline-none focus:border-[#cc00ff]/30 rounded-lg text-white font-mono text-xs"
                  >
                    <option value="Apartments">Apartment / Flat</option>
                    <option value="Penthouses">Luxury Penthouse</option>
                    <option value="Villas & Estates">Villa / Mansion</option>
                    <option value="Smart Townships">Smart Township / Duplex</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Price / Rent Rate (INR)</label>
                  <input
                    type="number"
                    value={postPrice}
                    onChange={e => setPostPrice(e.target.value)}
                    placeholder={postPurpose === 'RENT' ? "e.g. 350000 (monthly rent)" : "e.g. 120000000 (sale price)"}
                    className="w-full px-3 py-2 bg-white/3 border border-white/5 focus:outline-none focus:border-[#cc00ff]/30 rounded-lg text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Carpet Area (sq. ft.)</label>
                  <input
                    type="text"
                    value={postCarpetArea}
                    onChange={e => setPostCarpetArea(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 4500..."
                    className="w-full px-3 py-2 bg-white/3 border border-white/5 focus:outline-none focus:border-[#cc00ff]/30 rounded-lg text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Facing Direction</label>
                  <select
                    value={postFacing}
                    onChange={e => setPostFacing(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/5 focus:outline-none focus:border-[#cc00ff]/30 rounded-lg text-white font-mono text-xs"
                  >
                    <option value="East Facing">East Facing</option>
                    <option value="West Facing">West Facing</option>
                    <option value="North Facing">North Facing</option>
                    <option value="Sea Facing / West Facing">Sea Facing</option>
                    <option value="Golf Course Facing">Golf Course Facing</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[8px] font-mono text-gray-500 uppercase tracking-wider block">Description Details</label>
                  <textarea
                    value={postDescription}
                    onChange={e => setPostDescription(e.target.value)}
                    placeholder="Describe amenities (pool, private lawn, security, etc.)..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white/3 border border-white/5 focus:outline-none focus:border-[#cc00ff]/30 rounded-lg text-white font-mono text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full md:col-span-2 py-3 rounded-xl bg-[#cc00ff] text-white font-black text-[10px] tracking-widest uppercase hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-glow-pink"
                >
                  Post Property Listing <PlusCircle className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* My Listed Properties */}
            <div className="p-6 rounded-2xl glassmorphism border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold font-mono tracking-widest text-gray-300 uppercase flex items-center gap-1.5">
                  <List className="w-4 h-4 text-gray-300" /> My Active Listings
                </span>
                <span className="text-[8px] font-mono text-gray-500">{userListedProperties.length} active</span>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {userListedProperties.map(p => (
                  <div key={p.id} className="p-3 rounded-xl bg-white/2 border border-white/3 flex justify-between items-center hover:border-white/10 transition-all">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-white truncate max-w-[130px]">{p.name}</span>
                        <span className="text-[7px] font-mono bg-[#00ffcc]/10 text-[#00ffcc] px-1 rounded uppercase">
                          {p.purpose}
                        </span>
                      </div>
                      <p className="text-[8px] text-gray-500 font-mono">Area: {p.carpetArea}</p>
                      <p className="text-[9px] text-[#00ffcc] font-mono">{formatPrice(p.price, p.purpose)}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteUserListing(p.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/3 rounded transition-colors"
                      title="Remove Listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {userListedProperties.length === 0 && (
                  <div className="text-center py-12 text-[10px] text-gray-600 font-mono uppercase tracking-wider">
                    You have not posted any property listings yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* AI Recommendations */}
        <div className="space-y-6 pt-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h3 className="text-xs font-bold font-mono tracking-widest text-[#00ffcc] uppercase flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-[#00ffcc] animate-pulse" /> AI Recommended Properties
              </h3>
              <p className="text-[9px] text-gray-500 font-mono mt-0.5">Custom matches compiled based on location ({cityInput}) and budget ({budgetInput})</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedProperties.map(p => (
              <div key={p.id} className="p-4 rounded-xl bg-white/3 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-[#00ffcc]/30 transition-all duration-300">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5 uppercase">
                      {p.category}
                    </span>
                    <span className="text-[8px] font-mono bg-[#00ffcc]/10 text-[#00ffcc] px-2 py-0.5 rounded uppercase">
                      {p.purpose === 'RENT' ? 'RENT' : 'BUY'}
                    </span>
                    <span className="text-[9px] text-yellow-500 font-bold">★ {p.rating}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#00ffcc] transition-colors">{p.name}</h4>
                  <p className="text-[10px] text-gray-400 leading-normal line-clamp-1">{p.description}</p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                  <span className="text-xs font-bold font-mono text-[#00ffcc]">{formatPrice(p.price, p.purpose)}</span>
                  <Link
                    href={`/product/${p.id}`}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
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
