'use client';

import { useState, useEffect, useRef, use } from 'react';
import { Sparkles, Star, ChevronLeft, ShieldCheck, Calendar, User, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import UniverseCanvas from '../../../components/UniverseCanvas';

import { Product } from '../../../types';
import { productsDb } from '../../../types/properties';

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [viewAngle, setViewAngle] = useState(0);
  const [explosionOffset, setExplosionOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SPECIFICATIONS'>('OVERVIEW');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let activeProps = [...productsDb];
    const savedProperties = localStorage.getItem('nexora_user_posted_properties');
    if (savedProperties) {
      try {
        const userProps = JSON.parse(savedProperties) as Product[];
        activeProps = [...productsDb, ...userProps];
      } catch (e) {}
    }

    const match = activeProps.find(p => p.id === unwrappedParams.id);
    setProduct(match || activeProps[0]);
    setActiveImageIdx(0);

    const saved = localStorage.getItem('nexora_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isLoggedIn) {
          setIsLoggedIn(true);
        }
      } catch (e) {}
    }
  }, [unwrappedParams]);

  if (!product) return null;

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
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#00ffcc]" /> BACK TO PROPERTIES
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold font-mono tracking-widest text-[#00ffcc] uppercase hidden md:inline">
              3D PROPERTY LAYOUT
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

      {/* Main product view grid */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        {/* Interactive 3D Model Explorer */}
        <div className="p-8 rounded-3xl glassmorphism border border-white/5 flex flex-col space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-[10px] font-mono tracking-widest text-[#00ffcc]">3D SPATIAL EXPLORER</span>
            <span className="text-[9px] font-mono text-gray-500">Angle: {viewAngle}° • Expansion: {Math.round(explosionOffset * 100)}%</span>
          </div>

          {/* Interactive model space */}
          <div className="h-72 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center relative overflow-hidden select-none">
            {/* Visual circles projecting the product */}
            <div className="absolute w-56 h-56 rounded-full border border-dashed border-[#00ffcc]/10 animate-[spin_40s_linear_infinite]" />
            <div className="absolute w-36 h-36 rounded-full border border-dashed border-[#cc00ff]/10 animate-[spin_20s_linear_reverse_infinite]" />
            
            {/* Hologram product representation */}
            <div 
              style={{ 
                transform: `rotateY(${viewAngle}deg) scale(${1 + explosionOffset * 0.15})`,
                transition: 'transform 0.1s ease-out'
              }}
              className="text-[#00ffcc] flex flex-col items-center justify-center relative"
            >
              {/* Glowing crystal parts showing explodable visual representation */}
              <div className="w-16 h-16 rounded-xl border-2 border-t-[#00ffcc] border-r-transparent border-b-[#cc00ff] border-l-transparent animate-spin duration-1000 relative">
                {explosionOffset > 0 && (
                  <div className="absolute -top-6 -left-6 w-8 h-8 rounded-full border border-[#0077ff] animate-ping" />
                )}
              </div>
              <span className="text-[9px] font-mono text-white tracking-widest uppercase mt-4">{product.brand} VIRTUAL NODE</span>
            </div>

            {/* Orbit lines */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={() => setViewAngle(prev => (prev + 45) % 360)}
                className="p-2 rounded-lg bg-white/3 border border-white/5 text-[10px] text-gray-400 hover:text-white transition-colors"
                title="Rotate Y Axis"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setExplosionOffset(prev => (prev === 0 ? 0.8 : 0))}
                className="px-2.5 py-1 rounded-lg bg-white/3 border border-white/5 text-[9px] font-mono text-gray-400 hover:text-white transition-colors"
              >
                {explosionOffset === 0 ? 'EXPAND LAYOUT' : 'COLLAPSE LAYOUT'}
              </button>
            </div>
          </div>

          <div className="text-center text-[10px] font-mono text-gray-500">
            Interact to explore spatial structure and layouts.
          </div>

          {/* Photo Gallery Selector */}
          {product.images && product.images.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/5">
              <span className="text-[10px] font-mono tracking-widest text-[#00ffcc] uppercase block">ESTATE PHOTO GALLERY</span>
              
              {/* Main Preview */}
              <div className="h-64 rounded-2xl border border-white/5 relative overflow-hidden bg-black/40">
                <img
                  src={product.images[activeImageIdx]}
                  alt={`${product.name} preview`}
                  className="w-full h-full object-cover opacity-80"
                />
              </div>

              {/* Thumbnails list */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-12 rounded-lg border overflow-hidden shrink-0 transition-all ${
                      activeImageIdx === idx ? 'border-[#00ffcc] scale-105' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Specifications and Purchase details */}
        <div className="p-8 rounded-3xl glassmorphism border border-white/5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono tracking-widest text-[#00ffcc] uppercase">
                {product.category}
              </span>
              <span className="flex items-center text-[10px] text-yellow-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-yellow-500 mr-0.5" /> {product.rating} ({product.reviewsCount} reviews)
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl md:text-3xl font-black tracking-tight text-white">
                {product.name}
              </h2>
              <p className="text-[10px] font-mono text-gray-500">DEVELOPED BY: {product.brand.toUpperCase()}</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5">
              {['OVERVIEW', 'SPECIFICATIONS'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 text-[10px] font-mono font-bold tracking-widest transition-all relative ${
                    activeTab === tab ? 'text-[#00ffcc]' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#00ffcc] shadow-glow-cyan" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="min-h-[100px]">
              {activeTab === 'OVERVIEW' ? (
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                  {product.description} Verified listing under local RERA guidelines. Features high-end modern layout specifications.
                </p>
              ) : (
                <div className="text-[10px] font-mono text-gray-400 space-y-2">
                  <div className="flex justify-between border-b border-white/3 pb-1"><span>CARPET AREA:</span> <span className="text-white">{product.carpetArea || 'N/A'}</span></div>
                  <div className="flex justify-between border-b border-white/3 pb-1"><span>FACING:</span> <span className="text-white">{product.facing || 'N/A'}</span></div>
                  <div className="flex justify-between border-b border-white/3 pb-1"><span>STATUS:</span> <span className="text-white">{product.completionStatus || 'N/A'}</span></div>
                  <div className="flex justify-between border-b border-white/3 pb-1"><span>RERA ID:</span> <span className="text-white">{product.reraId || 'N/A'}</span></div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing checkouts */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-gray-500 block uppercase tracking-wider">
                {product.purpose === 'RENT' ? 'Monthly Rent' : 'Valuation Estimate'}
              </span>
              <span className="text-xl font-bold font-mono text-[#00ffcc] text-glow-cyan">
                {formatPrice(product.price, product.purpose)}
              </span>
            </div>

            <button
              onClick={() => alert(product.purpose === 'RENT' ? 'Rental viewing requested! The agent will schedule a call shortly.' : 'Site tour requested! The developer agent will schedule a call shortly.')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-[#00ffcc] hover:scale-105 active:scale-95 transition-all text-xs font-black tracking-widest uppercase shadow-lg shadow-white/5"
            >
              <Calendar className="w-4 h-4" /> {product.purpose === 'RENT' ? 'BOOK RENTAL VIEWING' : 'BOOK SITE VISIT'}
            </button>
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
