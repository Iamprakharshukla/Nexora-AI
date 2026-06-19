'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Bookmark, User as UserIcon, LayoutDashboard, Command, Calendar, CheckCircle, Trash2, TrendingUp, Award, Clock, ArrowRight, ShieldCheck, Mail, Star, Users, ArrowUpRight, Search, MapPin, Home as HomeIcon, X, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import UniverseCanvas from '../components/UniverseCanvas';
import CommandPalette from '../components/CommandPalette';
import ProductGrid from '../components/ProductGrid';
import JarvisOrb from '../components/JarvisOrb';
import EMICalculator from '../components/EMICalculator';
import LocalityInsights from '../components/LocalityInsights';
import PostPropertyWizard from '../components/PostPropertyWizard';
import confetti from 'canvas-confetti';

import { Product } from '../types';
import { productsDb } from '../types/properties';
import { getProperties, getShortlist, addToShortlist, removeFromShortlist, subscribeNewsletter } from '@/lib/api';

export default function Home() {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [propertiesList, setPropertiesList] = useState<Product[]>(productsDb);
  const [selectedChartPoint, setSelectedChartPoint] = useState<{ year: number; yieldVal: string; growth: string }>({
    year: 2026,
    yieldVal: '11.4%',
    growth: '+18.2% YoY'
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'IDLE' | 'SUCCESS'>('IDLE');
  const [isPostPropertyOpen, setIsPostPropertyOpen] = useState(false);
  // Hero search state
  const [heroSearch, setHeroSearch] = useState({ city: '', bhk: '', type: 'BUY' as 'BUY' | 'RENT' });
  const [heroSearchTriggered, setHeroSearchTriggered] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'ESTATES' | 'LOCALITIES' | 'EMI' | 'ABOUT' | 'ANALYTICS' | 'REVIEWS'>('ESTATES');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await subscribeNewsletter(newsletterEmail);
      setNewsletterStatus('SUCCESS');
      confetti({
        particleCount: 50,
        spread: 50,
        colors: ['#00ffcc', '#cc00ff', '#ffffff']
      });
      setTimeout(() => {
        setNewsletterEmail('');
        setNewsletterStatus('IDLE');
      }, 4000);
    } catch (err: any) {
      alert(err.message || 'Subscription failed.');
    }
  };

  useEffect(() => {
    async function loadPropertiesAndSession() {
      try {
        const propsRes = await getProperties();
        if (propsRes.properties?.length > 0) {
          setPropertiesList(propsRes.properties);
        }
      } catch (e) {
        console.error('Failed to fetch properties from API:', e);
      }

      const saved = localStorage.getItem('nexora_user_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.isLoggedIn) {
            setIsLoggedIn(true);
            try {
              const shortlistRes = await getShortlist();
              const loadedCart = shortlistRes.properties.map((p: Product) => ({ product: p, quantity: 1 }));
              setCart(loadedCart);
            } catch (err) {
              console.error('Failed to load user shortlist:', err);
            }
          }
        } catch (e) {}
      }
    }
    loadPropertiesAndSession();
  }, []);

  const handleAddToCart = async (product: Product) => {
    try {
      if (isLoggedIn) {
        await addToShortlist(product.id);
      }
      setCart(prev => {
        const match = prev.find(item => item.product.id === product.id);
        if (match) return prev;
        return [...prev, { product, quantity: 1 }];
      });
      setIsCartOpen(true);
    } catch (err: any) {
      alert(err.message || 'Please log in to shortlist properties.');
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    try {
      if (isLoggedIn) {
        await removeFromShortlist(productId);
      }
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } catch (e) {
      console.error('Failed to remove shortlist item:', e);
    }
  };

  const triggerCheckout = () => {
    setCheckoutStep('PROCESSING');
    setTimeout(() => {
      setCheckoutStep('SUCCESS');
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ffcc', '#cc00ff', '#ffffff']
      });
      setTimeout(() => {
        setCart([]);
        setIsCartOpen(false);
        setCheckoutStep('IDLE');
      }, 2500);
    }, 2000);
  };

  const cartTotal = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);

  return (
    <main className="relative min-h-screen text-white">
      {/* 3D Universe interactive canvas */}
      <div className="absolute inset-0 h-[650px] w-full z-0 overflow-hidden">
        <UniverseCanvas />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Nav bar */}
      <header className="sticky top-0 w-full z-40 glassmorphism border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-nexora-gradient flex items-center justify-center font-black text-black text-sm tracking-tighter shadow-glow-cyan">
              N
            </div>
            <span className="font-bold text-sm tracking-widest text-glow-cyan bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              NEXORA.AI
            </span>
          </div>

          {/* Upgraded Center Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <a href="#properties" className="text-[10px] font-bold font-mono tracking-wider text-gray-400 hover:text-[#00ffcc] transition-colors uppercase">Estates</a>
            <a href="#locality-insights" className="text-[10px] font-bold font-mono tracking-wider text-gray-400 hover:text-[#00ffcc] transition-colors uppercase">Localities</a>
            <a href="#emi-calculator" className="text-[10px] font-bold font-mono tracking-wider text-gray-400 hover:text-[#00ffcc] transition-colors uppercase">EMI Calc</a>
            <a href="#about" className="text-[10px] font-bold font-mono tracking-wider text-gray-400 hover:text-[#00ffcc] transition-colors uppercase">About Us</a>
            <a href="#sales" className="text-[10px] font-bold font-mono tracking-wider text-gray-400 hover:text-[#00ffcc] transition-colors uppercase">Sales</a>
            <a href="#testimonials" className="text-[10px] font-bold font-mono tracking-wider text-gray-400 hover:text-[#00ffcc] transition-colors uppercase">Reviews</a>
          </nav>

          {/* Action tags */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPostPropertyOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-[#cc00ff]/30 bg-[#cc00ff]/10 text-[10px] font-bold font-mono tracking-wider transition-all hover:bg-[#cc00ff]/20 text-[#cc00ff] flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" /> POST PROPERTY
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-white/5 bg-white/3 text-[10px] font-bold font-mono tracking-wider transition-all hover:text-[#00ffcc] hover:border-[#00ffcc]/30 flex items-center gap-1.5"
            >
              <Command className="w-3.5 h-3.5" /> AI FINDER
            </button>

            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="px-3.5 py-1.5 rounded-xl border border-white/5 bg-white/3 text-[10px] font-bold font-mono tracking-wider transition-all hover:text-[#00ffcc] hover:border-[#00ffcc]/30 flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" /> {isLoggedIn ? 'MY ACCOUNT' : 'LOGIN'}
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-xl border border-white/5 bg-white/3 text-gray-300 hover:text-[#00ffcc] relative transition-all"
              title="View Shortlisted Properties"
            >
              <Bookmark className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#00ffcc] text-black font-black text-[9px] flex items-center justify-center font-mono shadow-glow-cyan">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero section with Search Console */}
      <section className="relative z-10 pt-24 pb-12 max-w-5xl mx-auto text-center px-4 space-y-8">
        <span className="px-3.5 py-1.5 rounded-full bg-white/3 border border-white/5 text-[9px] font-bold font-mono tracking-widest text-[#00ffcc] uppercase inline-flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-[#00ffcc] animate-spin" /> India's #1 Luxury Estates Portal — AI Powered
        </span>
        <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none bg-gradient-to-b from-white via-white to-gray-600 bg-clip-text text-transparent">
          FIND YOUR NEXT <br />
          <span className="bg-gradient-to-r from-[#00ffcc] to-[#cc00ff] bg-clip-text text-transparent text-glow-cyan">
            LUXURY HOME
          </span>
        </h1>
        <p className="text-xs md:text-sm text-gray-400 font-light max-w-xl mx-auto leading-relaxed uppercase tracking-wider font-mono">
          Penthouses • Villas • Smart Estates across Mumbai, Gurugram & Bengaluru
        </p>

        {/* ── Hero Search Console ── */}
        <div className="glassmorphism rounded-3xl p-3 border border-white/8 shadow-2xl max-w-4xl mx-auto">
          {/* Buy / Rent tabs */}
          <div className="flex border-b border-white/5 mb-3">
            {(['BUY', 'RENT'] as const).map(t => (
              <button
                key={t}
                onClick={() => setHeroSearch(s => ({ ...s, type: t }))}
                className={`px-6 py-2 text-[10px] font-bold font-mono tracking-wider transition-all rounded-t-xl ${
                  heroSearch.type === t
                    ? 'text-[#00ffcc] border-b-2 border-[#00ffcc]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t === 'BUY' ? '🏠 BUY / SALE' : '🔑 RENT / LEASE'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {/* City */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              <select
                value={heroSearch.city}
                onChange={e => setHeroSearch(s => ({ ...s, city: e.target.value }))}
                style={{ colorScheme: 'dark', backgroundColor: '#0d0d0d' }}
                className="w-full border border-white/10 rounded-xl pl-9 pr-3 py-3 text-[10px] font-mono text-gray-300 appearance-none cursor-pointer focus:outline-none hover:border-[#00ffcc]/30 transition-all"
              >
                <option value="" style={{ background: '#0d0d0d' }}>All Cities</option>
                {['Mumbai', 'Gurugram', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune'].map(c => (
                  <option key={c} value={c} style={{ background: '#0d0d0d' }}>{c}</option>
                ))}
              </select>
            </div>

            {/* BHK */}
            <div className="relative">
              <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              <select
                value={heroSearch.bhk}
                onChange={e => setHeroSearch(s => ({ ...s, bhk: e.target.value }))}
                style={{ colorScheme: 'dark', backgroundColor: '#0d0d0d' }}
                className="w-full border border-white/10 rounded-xl pl-9 pr-3 py-3 text-[10px] font-mono text-gray-300 appearance-none cursor-pointer focus:outline-none hover:border-[#00ffcc]/30 transition-all"
              >
                <option value="" style={{ background: '#0d0d0d' }}>Any BHK</option>
                {['1', '2', '3', '4', '5', '6+'].map(b => (
                  <option key={b} value={b} style={{ background: '#0d0d0d' }}>{b} BHK</option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              <select
                style={{ colorScheme: 'dark', backgroundColor: '#0d0d0d' }}
                className="w-full border border-white/10 rounded-xl pl-9 pr-3 py-3 text-[10px] font-mono text-gray-300 appearance-none cursor-pointer focus:outline-none hover:border-[#00ffcc]/30 transition-all"
              >
                <option value="" style={{ background: '#0d0d0d' }}>All Types</option>
                {['Apartment', 'Penthouse', 'Villa', 'Smart Township', 'Plot'].map(t => (
                  <option key={t} value={t} style={{ background: '#0d0d0d' }}>{t}</option>
                ))}
              </select>
            </div>

            {/* Search button */}
            <a
              href="#properties"
              onClick={() => setHeroSearchTriggered(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00ffcc] to-[#00ccaa] text-black font-black text-[10px] tracking-widest uppercase hover:shadow-[0_0_20px_rgba(0,255,204,0.4)] active:scale-95 transition-all"
            >
              <Search className="w-4 h-4" /> Search Estates
            </a>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex justify-center gap-8 pt-2">
          {[
            { label: '12+ Cities', sub: 'Pan India Coverage' },
            { label: '100% RERA', sub: 'Verified Listings' },
            { label: '320+ HNIs', sub: 'Trust Nexora' }
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <span className="text-sm font-black text-white block">{stat.label}</span>
              <span className="text-[9px] text-gray-500 font-mono uppercase">{stat.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Tab Selector - Only visible on Mobile */}
      <div className="block md:hidden sticky top-16 z-30 bg-[#030303]/90 backdrop-blur-md border-b border-white/5 py-3 overflow-x-auto whitespace-nowrap px-4 scroll-mt-16 scrollbar-none">
        <div className="flex gap-2 min-w-max">
          {[
            { id: 'ESTATES', label: '🏠 Estates' },
            { id: 'LOCALITIES', label: '📍 Localities' },
            { id: 'EMI', label: '🧮 EMI Calc' },
            { id: 'ABOUT', label: '✨ About Us' },
            { id: 'ANALYTICS', label: '📊 Yields' },
            { id: 'REVIEWS', label: '★ Reviews' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveMobileTab(tab.id as any);
                const target = document.getElementById('mobile-anchor');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`px-4 py-2 rounded-xl text-[9px] font-bold font-mono tracking-wider transition-all border ${
                activeMobileTab === tab.id
                  ? 'bg-[#00ffcc] text-black border-[#00ffcc] font-black shadow-glow-cyan'
                  : 'bg-white/3 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      {/* Mobile scroll target */}
      <div id="mobile-anchor" className="scroll-mt-28" />

      {/* Product list */}
      <div className={`md:block ${activeMobileTab === 'ESTATES' ? 'block' : 'hidden'}`}>
        <div id="properties" className="scroll-mt-20">
          <ProductGrid products={propertiesList} onAddToCart={handleAddToCart} />
        </div>
      </div>

      {/* About Us & History Section Wrapper */}
      <div className={`md:block ${activeMobileTab === 'ABOUT' ? 'block' : 'hidden'}`}>
        {/* 1. About Us Section */}
        <section id="about" className="relative z-10 py-24 max-w-7xl mx-auto px-6 border-t border-white/5 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="px-3.5 py-1.5 rounded-full bg-white/3 border border-white/5 text-[9px] font-bold font-mono tracking-widest text-[#00ffcc] uppercase inline-flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ffcc]" /> About Nexora AI
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              CRAFTING FUTURE <br />
              <span className="bg-gradient-to-r from-[#00ffcc] to-[#cc00ff] bg-clip-text text-transparent text-glow-cyan">
                LIVING EXPERIENCES
              </span>
            </h2>
            <p className="text-xs md:text-sm text-gray-400 font-light leading-relaxed uppercase tracking-wider font-mono">
              Nexora AI is India's premier boutique real estate technology house. We curate only the top 1% of ultra-luxury penthouses, duplexes, and villas across Mumbai sea faces, Gurugram Golf Course extensions, and Bengaluru elite suburbs.
            </p>
            <p className="text-xs text-gray-500 font-light leading-relaxed font-mono uppercase">
              By combining AI-driven structural search models, localized real-time market yield assessments, and interactive virtual site visits, we streamline acquisitions for HNIs, founders, and global Indian professionals. Every single listed property features pre-verified RERA registrations to ensure absolute trust.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 flex items-center gap-3">
                <Award className="w-5 h-5 text-[#cc00ff] shadow-glow-pink" />
                <div>
                  <h4 className="text-[10px] font-bold font-mono text-white uppercase">100% RERA Compliant</h4>
                  <p className="text-[9px] text-gray-500 font-mono">Fully Verified Listings</p>
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#00ffcc] shadow-glow-cyan" />
                <div>
                  <h4 className="text-[10px] font-bold font-mono text-white uppercase">Seamless Closures</h4>
                  <p className="text-[9px] text-gray-500 font-mono">In-House Advisory Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side glassmorphic stats card */}
          <div className="p-8 rounded-2xl glassmorphism border border-white/10 relative overflow-hidden group hover:border-[#00ffcc]/30 transition-all duration-500 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ffcc]/5 rounded-full blur-3xl group-hover:bg-[#00ffcc]/10 transition-colors" />
            <h3 className="text-xs font-mono font-bold tracking-widest text-[#00ffcc] uppercase mb-6 flex items-center gap-2">
              <span>●</span> Why Discerning Buyers Choose Us
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-mono text-gray-400">PARTNER DEVELOPERS</span>
                <span className="text-[10px] font-mono text-white font-bold">DLF, Lodha, Sobha, Godrej</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-mono text-gray-400">AVERAGE PROPERTY VALUE</span>
                <span className="text-[10px] font-mono text-[#00ffcc] font-bold">₹12.5 Crores</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-mono text-gray-400">AVERAGE SITE VISITS</span>
                <span className="text-[10px] font-mono text-white font-bold">4.2 visits per closure</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-mono text-gray-400">COMMUNITY</span>
                <span className="text-[10px] font-mono text-[#cc00ff] font-bold">320+ HNIs & Founders</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-gray-400">VERIFICATION SUCCESS RATE</span>
                <span className="text-[10px] font-mono text-white font-bold">100.0% Verified</span>
              </div>
            </div>
            <div className="mt-8 p-3.5 rounded-xl bg-[#00ffcc]/5 border border-[#00ffcc]/15 text-center">
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#00ffcc] uppercase block">
                Official RERA Agent ID: PRM/KA/RERA/1251/AG/220910
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. History Section */}
      <section id="history" className="relative z-10 py-24 max-w-7xl mx-auto px-6 border-t border-white/5 scroll-mt-20 bg-black/40">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="px-3.5 py-1.5 rounded-full bg-white/3 border border-white/5 text-[9px] font-bold font-mono tracking-widest text-[#cc00ff] uppercase inline-flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#cc00ff]" /> Our Milestone Journey
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
            A Legacy of <span className="bg-gradient-to-r from-[#00ffcc] to-[#cc00ff] bg-clip-text text-transparent text-glow-cyan">Excellence</span>
          </h2>
          <p className="text-xs text-gray-400 font-light uppercase tracking-wider font-mono">
            How we evolved into India's leading luxury residential gateway.
          </p>
        </div>

        {/* Timeline representation */}
        <div className="relative border-l border-white/10 max-w-3xl mx-auto pl-8 md:pl-12 space-y-12 py-4">
          {/* Milestone 1 */}
          <div className="relative group">
            <div className="absolute -left-[39px] md:-left-[55px] top-1 w-4 h-4 rounded-full bg-black border-2 border-[#00ffcc] group-hover:scale-125 transition-transform duration-300 shadow-glow-cyan" />
            <div className="p-6 rounded-2xl glassmorphism border border-white/5 hover:border-white/10 transition-colors">
              <span className="text-xs font-mono font-bold text-[#00ffcc] tracking-widest block mb-1">2018</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2">Inception & South Mumbai Curation</h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed font-mono uppercase">
                Founded as a bespoke digital-first concierge in Colaba, Mumbai. Cataloged 15 highly exclusive sea-facing penthouses, catering strictly to single-family office accounts.
              </p>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="relative group">
            <div className="absolute -left-[39px] md:-left-[55px] top-1 w-4 h-4 rounded-full bg-black border-2 border-[#cc00ff] group-hover:scale-125 transition-transform duration-300 shadow-glow-pink" />
            <div className="p-6 rounded-2xl glassmorphism border border-white/5 hover:border-white/10 transition-colors">
              <span className="text-xs font-mono font-bold text-[#cc00ff] tracking-widest block mb-1">2021</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2">Expanding the Luxury Golden Triangle</h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed font-mono uppercase">
                Expanded operations to Delhi NCR (DLF Golf Course Road, Gurugram) and Bengaluru (Indiranagar / Whitefield duplexes). Surpassed ₹5,000 Crores in transactional bookings.
              </p>
            </div>
          </div>

          {/* Milestone 3 */}
          <div className="relative group">
            <div className="absolute -left-[39px] md:-left-[55px] top-1 w-4 h-4 rounded-full bg-black border-2 border-[#00ffcc] group-hover:scale-125 transition-transform duration-300 shadow-glow-cyan" />
            <div className="p-6 rounded-2xl glassmorphism border border-white/5 hover:border-white/10 transition-colors">
              <span className="text-xs font-mono font-bold text-[#00ffcc] tracking-widest block mb-1">2024</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2">AI Valuation Engine & Interactive Tours</h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed font-mono uppercase">
                Launched our immersive rendering platform alongside Jarvis, the AI conversational assistant. Empowered international buyers to complete virtual walkthroughs and secure bookings.
              </p>
            </div>
          </div>

          {/* Milestone 4 */}
          <div className="relative group">
            <div className="absolute -left-[39px] md:-left-[55px] top-1 w-4 h-4 rounded-full bg-black border-2 border-[#cc00ff] group-hover:scale-125 transition-transform duration-300 shadow-glow-pink" />
            <div className="p-6 rounded-2xl glassmorphism border border-white/5 hover:border-white/10 transition-colors">
              <span className="text-xs font-mono font-bold text-[#cc00ff] tracking-widest block mb-1">2026</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2">India's Luxury Real Estate Apex</h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed font-mono uppercase">
                Crossing ₹24,500 Crores in transacted assets. Serving over 320+ luxury property portfolios across high-end developments with 100% digital client-portal integrations.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Sales & Analytics Section Wrapper */}
      <div className={`md:block ${activeMobileTab === 'ANALYTICS' ? 'block' : 'hidden'}`}>
        {/* 3. Sales & Analytics Section */}
        <section id="sales" className="relative z-10 py-24 max-w-7xl mx-auto px-6 border-t border-white/5 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="px-3.5 py-1.5 rounded-full bg-white/3 border border-white/5 text-[9px] font-bold font-mono tracking-widest text-[#00ffcc] uppercase inline-flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#00ffcc]" /> Performance Analytics
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
              Sales <br />
              <span className="bg-gradient-to-r from-[#00ffcc] to-[#cc00ff] bg-clip-text text-transparent text-glow-cyan">Performance</span>
            </h2>
            <p className="text-xs text-gray-400 font-light leading-relaxed uppercase tracking-wider font-mono">
              Luxury housing in Tier-1 cities continues to deliver strong returns. Browse average rental and investment yield curves mapped by our evaluation core.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                <span className="text-[9px] font-mono text-gray-500 block uppercase">TOTAL PORTFOLIO</span>
                <span className="text-lg font-black font-mono text-white tracking-tight">₹24,500+ Cr</span>
              </div>
              <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                <span className="text-[9px] font-mono text-gray-500 block uppercase">UNITS CLOSED</span>
                <span className="text-lg font-black font-mono text-[#00ffcc] tracking-tight">320+ Estates</span>
              </div>
              <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                <span className="text-[9px] font-mono text-gray-500 block uppercase">AVG DEAL CYCLE</span>
                <span className="text-lg font-black font-mono text-[#cc00ff] tracking-tight">48 Days</span>
              </div>
              <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                <span className="text-[9px] font-mono text-gray-500 block uppercase">ANNUAL GROWTH</span>
                <span className="text-lg font-black font-mono text-white tracking-tight">+14.2% YoY</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-8 rounded-2xl glassmorphism border border-white/10 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Average Luxury Property Yield Trend</h3>
                <p className="text-[9px] text-gray-500 font-mono">YoY rental yield + asset appreciation combined (Tier-1 Indian Hubs)</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#00ffcc]/10 border border-[#00ffcc]/20 text-[9px] font-bold font-mono text-[#00ffcc] uppercase">
                Interactive Chart
              </span>
            </div>

            <div className="relative h-64 w-full flex items-end">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ffcc" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#cc00ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="5,5" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="5,5" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="5,5" />

                <path
                  d="M 50,150 L 150,130 L 250,95 L 350,70 L 450,45 L 450,195 L 50,195 Z"
                  fill="url(#chartGradient)"
                />

                <path
                  d="M 50,150 L 150,130 L 250,95 L 350,70 L 450,45"
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3.5"
                  className="stroke-cyan-400"
                />

                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00ffcc" />
                  <stop offset="100%" stopColor="#cc00ff" />
                </linearGradient>

                <circle
                  cx="50"
                  cy="150"
                  r="6"
                  className={`fill-black stroke-2 transition-all cursor-pointer ${selectedChartPoint.year === 2020 ? 'stroke-[#00ffcc]' : 'stroke-gray-600 hover:stroke-white'}`}
                  onClick={() => setSelectedChartPoint({ year: 2020, yieldVal: '5.2%', growth: '+4.2% YoY' })}
                />
                <circle
                  cx="150"
                  cy="130"
                  r="6"
                  className={`fill-black stroke-2 transition-all cursor-pointer ${selectedChartPoint.year === 2022 ? 'stroke-[#00ffcc]' : 'stroke-gray-600 hover:stroke-white'}`}
                  onClick={() => setSelectedChartPoint({ year: 2022, yieldVal: '6.8%', growth: '+8.5% YoY' })}
                />
                <circle
                  cx="250"
                  cy="95"
                  r="6"
                  className={`fill-black stroke-2 transition-all cursor-pointer ${selectedChartPoint.year === 2024 ? 'stroke-[#00ffcc]' : 'stroke-gray-600 hover:stroke-white'}`}
                  onClick={() => setSelectedChartPoint({ year: 2024, yieldVal: '8.9%', growth: '+12.1% YoY' })}
                />
                <circle
                  cx="350"
                  cy="70"
                  r="6"
                  className={`fill-black stroke-2 transition-all cursor-pointer ${selectedChartPoint.year === 2025 ? 'stroke-[#cc00ff]' : 'stroke-gray-600 hover:stroke-white'}`}
                  onClick={() => setSelectedChartPoint({ year: 2025, yieldVal: '10.1%', growth: '+15.5% YoY' })}
                />
                <circle
                  cx="450"
                  cy="45"
                  r="6"
                  className={`fill-black stroke-2 transition-all cursor-pointer ${selectedChartPoint.year === 2026 ? 'stroke-[#cc00ff]' : 'stroke-gray-600 hover:stroke-white'}`}
                  onClick={() => setSelectedChartPoint({ year: 2026, yieldVal: '11.4%', growth: '+18.2% YoY' })}
                />
              </svg>

              <div className="absolute bottom-1 w-full flex justify-between px-[30px] text-[8px] font-mono text-gray-500">
                <span>2020</span>
                <span>2022</span>
                <span>2024</span>
                <span>2025</span>
                <span>2026</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[8px] font-mono text-gray-500 uppercase">SELECTED FISCAL YEAR</span>
                <p className="text-sm font-bold font-mono text-white tracking-widest">{selectedChartPoint.year}</p>
              </div>
              <div>
                <span className="text-[8px] font-mono text-gray-500 uppercase">AVG YIELD RATE</span>
                <p className="text-sm font-bold font-mono text-[#00ffcc] tracking-widest">{selectedChartPoint.yieldVal}</p>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-mono text-gray-500 uppercase">CAPITAL GAINS</span>
                <p className="text-sm font-bold font-mono text-[#cc00ff] tracking-widest">{selectedChartPoint.growth}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Testimonials Section Wrapper */}
      <div className={`md:block ${activeMobileTab === 'REVIEWS' ? 'block' : 'hidden'}`}>
        {/* 4. Testimonials Section */}
        <section id="testimonials" className="relative z-10 py-24 max-w-7xl mx-auto px-6 border-t border-white/5 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="px-3.5 py-1.5 rounded-full bg-white/3 border border-white/5 text-[9px] font-bold font-mono tracking-widest text-[#00ffcc] uppercase inline-flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#00ffcc]" /> Client Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
            Trusted by <span className="bg-gradient-to-r from-[#00ffcc] to-[#cc00ff] bg-clip-text text-transparent text-glow-cyan">Pioneers</span>
          </h2>
          <p className="text-xs text-gray-400 font-light uppercase tracking-wider font-mono">
            Hear from our homeowners and luxury real estate investors across the globe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glassmorphism border border-white/5 hover:border-[#00ffcc]/30 transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#00ffcc] text-[#00ffcc]" />
                ))}
              </div>
              <p className="text-xs text-gray-300 font-light leading-relaxed font-mono uppercase">
                "Finding a ₹35 Crore penthouse in Worli, Mumbai used to be a grueling month-long hassle. Nexora's AI search pointed out the perfect unit and booked an off-market private site visit in hours. Truly elite service."
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-nexora-gradient flex items-center justify-center font-bold font-mono text-black text-xs">
                RM
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-white block uppercase">Rohan Malhotra</span>
                <span className="text-[8px] font-mono text-gray-500 uppercase">Managing Partner, Triton Capital</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl glassmorphism border border-white/5 hover:border-[#cc00ff]/30 transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#cc00ff] text-[#cc00ff]" />
                ))}
              </div>
              <p className="text-xs text-gray-300 font-light leading-relaxed font-mono uppercase">
                "The transparency surrounding carpet area, RERA registration, and high-fidelity specifications is outstanding. It feels less like browsing standard real estate listings and more like touring a digital art gallery."
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold font-mono text-white text-xs">
                PN
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-white block uppercase">Priya Nair</span>
                <span className="text-[8px] font-mono text-gray-500 uppercase">Director of UX, DesignGrid India</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl glassmorphism border border-white/5 hover:border-[#00ffcc]/30 transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#00ffcc] text-[#00ffcc]" />
                ))}
              </div>
              <p className="text-xs text-gray-300 font-light leading-relaxed font-mono uppercase">
                "Nexora has transformed real estate acquisition for Indian founders. You get clear numbers, instant developer chat access, and zero broker spam. Their Jarvis virtual agent is extremely helpful too."
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-nexora-gradient flex items-center justify-center font-bold font-mono text-black text-xs">
                AG
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-white block uppercase">Aditya Goel</span>
                <span className="text-[8px] font-mono text-gray-500 uppercase">Founder, NexusFlow AI</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Locality Insights */}
      <div className={`md:block ${activeMobileTab === 'LOCALITIES' ? 'block' : 'hidden'}`}>
        <div className="border-t border-white/5">
          <LocalityInsights />
        </div>
      </div>

      {/* EMI Calculator */}
      <div className={`md:block ${activeMobileTab === 'EMI' ? 'block' : 'hidden'}`}>
        <div className="border-t border-white/5 bg-black/20">
          <EMICalculator />
        </div>
      </div>

      {/* Jarvis chatbot assistant */}
      <JarvisOrb onAddToCart={handleAddToCart} />

      {/* Command Search Palette */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Post Property Modal */}
      {isPostPropertyOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsPostPropertyOpen(false)}>
          <div
            className="glassmorphism border border-white/10 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-base font-bold text-white tracking-wider">Post Your Property</h2>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">List your property to 10,000+ HNI buyers & renters on Nexora AI</p>
              </div>
              <button onClick={() => setIsPostPropertyOpen(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <PostPropertyWizard onClose={() => setIsPostPropertyOpen(false)} />
          </div>
        </div>
      )}

      {/* Sliding cart drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md h-full glassmorphism border-l border-white/10 flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-xs font-bold tracking-widest font-mono text-[#00ffcc]">SHORTLISTED PROPERTIES</span>
              <button onClick={() => setIsCartOpen(false)} className="text-[10px] text-gray-500 hover:text-white underline font-mono">
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="p-3.5 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{item.product.name}</p>
                    <p className="text-[10px] text-[#00ffcc] font-mono mt-0.5">
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.product.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-20 text-[10px] text-gray-600 font-mono">No properties shortlisted. Explore our listings.</div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-white/5 pt-4 space-y-4">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">Total Portfolio Value:</span>
                  <span className="text-white font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>

                {checkoutStep === 'PROCESSING' ? (
                  <div className="w-full py-3.5 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-[#00ffcc] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#00ffcc]">REQUESTING TOUR BOOKING...</span>
                  </div>
                ) : checkoutStep === 'SUCCESS' ? (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-center flex flex-col items-center gap-1">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-[9px] font-mono font-bold tracking-wider uppercase">TOUR REQUEST SUBMITTED SECURELY</span>
                  </div>
                ) : (
                  <button
                    onClick={triggerCheckout}
                    className="w-full py-3 rounded-xl bg-[#00ffcc] text-black font-black text-[10px] tracking-widest uppercase hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" /> BOOK SITE VISIT (FREE)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#030303] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Left brand details */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-nexora-gradient flex items-center justify-center font-black text-black text-sm tracking-tighter">
                N
              </div>
              <span className="font-bold text-sm tracking-widest text-glow-cyan bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                NEXORA.AI
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono uppercase leading-relaxed max-w-sm">
              Shaping future living experiences. India's premium boutique luxury property platform powered by curated intelligence.
            </p>
            
            {/* Newsletter form */}
            <div className="space-y-2 pt-2">
              <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase tracking-wider">
                Subscribe to Off-Market Estates
              </span>
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 max-w-xs relative">
                {newsletterStatus === 'SUCCESS' ? (
                  <div className="w-full p-2.5 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-center font-mono text-[9px] uppercase font-bold tracking-wider">
                    Invitation Sent!
                  </div>
                ) : (
                  <>
                    <input
                      type="email"
                      required
                      placeholder="Enter your professional email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#00ffcc]/30 transition-all uppercase"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-white text-black hover:bg-[#00ffcc] active:scale-95 transition-all"
                      title="Subscribe"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-black" />
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>

          {/* Links col 1 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[10px] font-bold font-mono tracking-widest text-white uppercase">COMPANY</h4>
            <div className="flex flex-col gap-2 text-[9px] font-mono text-gray-500 uppercase">
              <a href="#about" className="hover:text-[#00ffcc] transition-colors">About Us</a>
              <a href="#history" className="hover:text-[#00ffcc] transition-colors">History</a>
              <a href="#sales" className="hover:text-[#00ffcc] transition-colors">Sales & Stats</a>
              <a href="#testimonials" className="hover:text-[#00ffcc] transition-colors">Testimonials</a>
              <a href="#locality-insights" className="hover:text-[#00ffcc] transition-colors">Locality Insights</a>
              <a href="#emi-calculator" className="hover:text-[#00ffcc] transition-colors">EMI Calculator</a>
              <button onClick={() => setIsPostPropertyOpen(true)} className="text-left text-[#cc00ff] hover:underline">Post Property Free</button>
            </div>
          </div>

          {/* Links col 2 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[10px] font-bold font-mono tracking-widest text-white uppercase">PORTFOLIOS</h4>
            <div className="flex flex-col gap-2 text-[9px] font-mono text-gray-500 uppercase font-light">
              <span className="text-gray-600">Mumbai Seafront</span>
              <span className="text-gray-600">Gurugram Duplexes</span>
              <span className="text-gray-600">Bengaluru Estates</span>
              <span className="text-gray-600 font-bold text-[#00ffcc]">Off-Market Club</span>
            </div>
          </div>

          {/* Links col 3 */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[10px] font-bold font-mono tracking-widest text-white uppercase">REGULATORY & RERA</h4>
            <p className="text-[8px] text-gray-600 font-mono uppercase leading-relaxed">
              All properties listed are RERA registered in respective states. License IDs are provided in individual details pages.
              RERA Agent ID: PRM/KA/RERA/1251/446/AG/220910/003450.
            </p>
            <p className="text-[8px] text-gray-600 font-mono uppercase leading-relaxed">
              Disclaimer: Images are artistic representations. Site visits can be scheduled for actual inspection.
            </p>
          </div>
        </div>

        {/* Bottom footer bar */}
        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[9px] text-gray-600 font-mono tracking-widest uppercase">
          <span>NEXORA LUXURY ESTATES PRIVATE LIMITED</span>
          <span className="mt-2 sm:mt-0">© 2026 NEXORA • ALL RIGHTS RESERVED</span>
        </div>
      </footer>
    </main>
  );
}
