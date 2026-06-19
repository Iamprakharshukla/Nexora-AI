'use client';

import { useState, useEffect, useMemo } from 'react';
import { Star, Bookmark, ArrowRightLeft, Sparkles, TrendingUp, TrendingDown, Eye, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';

import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
}

const CITIES = ['All Cities', 'Mumbai', 'Gurugram', 'Bengaluru'];
const BHK_OPTS = ['Any BHK', '1', '2', '3', '4', '5', '6+'];
const SORT_OPTS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Top Rated', value: 'rating' }
];

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [tickerPrices, setTickerPrices] = useState<Record<string, number>>({});
  const [trendStatus, setTrendStatus] = useState<Record<string, 'UP' | 'DOWN' | 'STABLE'>>({});

  // Filters
  const [purposeFilter, setPurposeFilter] = useState<'ALL' | 'BUY' | 'RENT'>('ALL');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [bhkFilter, setBhkFilter] = useState('Any BHK');
  const [furnishFilter, setFurnishFilter] = useState('Any');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 500000000]);
  const [showFilters, setShowFilters] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  const formatPrice = (amount: number, purpose?: string) => {
    let text = '';
    if (amount >= 10000000) {
      text = `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      text = `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      text = `₹${amount.toLocaleString('en-IN')}`;
    }
    return purpose === 'RENT' ? `${text} / month` : text;
  };

  // Price ticker simulation
  useEffect(() => {
    const initialPrices: Record<string, number> = {};
    products.forEach(p => { initialPrices[p.id] = p.price; });
    setTickerPrices(initialPrices);

    const interval = setInterval(() => {
      setTickerPrices(prev => {
        const next = { ...prev };
        const trends: Record<string, 'UP' | 'DOWN' | 'STABLE'> = {};
        products.forEach(p => {
          if (Math.random() > 0.6) {
            const shift = (Math.random() * 0.02 - 0.01) * p.price;
            next[p.id] = Math.round(p.price + shift);
            trends[p.id] = shift > 0 ? 'UP' : 'DOWN';
          } else {
            trends[p.id] = 'STABLE';
          }
        });
        setTrendStatus(trends);
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [products]);

  const toggleComparison = (p: Product) => {
    if (comparisonList.some(item => item.id === p.id)) {
      setComparisonList(prev => prev.filter(item => item.id !== p.id));
    } else {
      if (comparisonList.length >= 3) {
        alert('Compare a maximum of 3 properties.');
        return;
      }
      setComparisonList(prev => [...prev, p]);
    }
  };

  // Filtered & sorted
  const displayedProducts = useMemo(() => {
    let filtered = products.filter(p => {
      if (purposeFilter !== 'ALL' && p.purpose !== purposeFilter) return false;
      if (cityFilter !== 'All Cities' && p.city !== cityFilter) return false;
      if (bhkFilter !== 'Any BHK') {
        const n = parseInt(bhkFilter);
        if (bhkFilter === '6+') { if ((p.bhk || 0) < 6) return false; }
        else if (p.bhk !== n) return false;
      }
      if (furnishFilter !== 'Any' && p.furnishing !== furnishFilter) return false;
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (p.price < budgetRange[0] || p.price > budgetRange[1]) return false;
      return true;
    });

    switch (sortBy) {
      case 'price_asc': filtered = filtered.sort((a, b) => a.price - b.price); break;
      case 'price_desc': filtered = filtered.sort((a, b) => b.price - a.price); break;
      case 'rating': filtered = filtered.sort((a, b) => b.rating - a.rating); break;
      default: break;
    }

    return filtered;
  }, [products, purposeFilter, cityFilter, bhkFilter, furnishFilter, categoryFilter, sortBy, budgetRange]);

  const activeFilterCount = [
    cityFilter !== 'All Cities',
    bhkFilter !== 'Any BHK',
    furnishFilter !== 'Any',
    categoryFilter !== 'All',
    budgetRange[0] > 0 || budgetRange[1] < 500000000
  ].filter(Boolean).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6 relative z-10">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h2 className="text-base font-bold tracking-wider uppercase text-gray-200 flex items-center gap-1.5">
            PREMIUM PROPERTIES CATALOG <Sparkles className="w-4 h-4 text-[#00ffcc] animate-pulse" />
          </h2>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">
            {displayedProducts.length} properties • Live valuation indexing
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Buy/Rent tabs */}
          <div className="flex bg-white/3 border border-white/5 rounded-xl p-1 select-none font-mono">
            {(['ALL', 'BUY', 'RENT'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setPurposeFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all ${
                  purposeFilter === tab
                    ? 'bg-[#00ffcc] text-black shadow-glow-cyan font-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'Show All' : tab === 'BUY' ? 'Buy / Sale' : 'Rent / Lease'}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ colorScheme: 'dark', backgroundColor: '#0d0d0d' }}
              className="border border-white/10 rounded-xl px-3 py-2 text-[9px] font-mono text-gray-400 appearance-none cursor-pointer pr-7 focus:outline-none hover:border-[#00ffcc]/30 transition-all"
            >
              {SORT_OPTS.map(o => <option key={o.value} value={o.value} style={{ background: '#0d0d0d' }}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[9px] font-mono font-bold transition-all ${
              showFilters || activeFilterCount > 0
                ? 'bg-[#00ffcc]/10 border-[#00ffcc]/30 text-[#00ffcc]'
                : 'bg-white/3 border-white/8 text-gray-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="glassmorphism rounded-2xl p-5 border border-white/8 space-y-4 animate-in">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-300">Advanced Filters</span>
            <button
              onClick={() => { setCityFilter('All Cities'); setBhkFilter('Any BHK'); setFurnishFilter('Any'); setCategoryFilter('All'); setBudgetRange([0, 500000000]); }}
              className="text-[9px] text-[#00ffcc] hover:underline font-mono"
            >
              Reset All
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* City */}
            <div>
              <label className="text-[9px] font-mono text-gray-500 uppercase mb-1.5 block">City</label>
              <div className="flex flex-wrap gap-1.5">
                {CITIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCityFilter(c)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-mono border transition-all ${
                      cityFilter === c ? 'bg-[#00ffcc]/10 border-[#00ffcc]/30 text-[#00ffcc]' : 'bg-white/3 border-white/8 text-gray-500 hover:text-white'
                    }`}
                  >{c}</button>
                ))}
              </div>
            </div>
            {/* BHK */}
            <div>
              <label className="text-[9px] font-mono text-gray-500 uppercase mb-1.5 block">BHK</label>
              <div className="flex flex-wrap gap-1.5">
                {BHK_OPTS.map(b => (
                  <button
                    key={b}
                    onClick={() => setBhkFilter(b)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-mono border transition-all ${
                      bhkFilter === b ? 'bg-[#cc00ff]/10 border-[#cc00ff]/30 text-[#cc00ff]' : 'bg-white/3 border-white/8 text-gray-500 hover:text-white'
                    }`}
                  >{b}</button>
                ))}
              </div>
            </div>
            {/* Furnishing */}
            <div>
              <label className="text-[9px] font-mono text-gray-500 uppercase mb-1.5 block">Furnishing</label>
              <div className="flex flex-wrap gap-1.5">
                {['Any', 'Furnished', 'Semi-Furnished', 'Unfurnished'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFurnishFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-mono border transition-all ${
                      furnishFilter === f ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' : 'bg-white/3 border-white/8 text-gray-500 hover:text-white'
                    }`}
                  >{f}</button>
                ))}
              </div>
            </div>
            {/* Category */}
            <div>
              <label className="text-[9px] font-mono text-gray-500 uppercase mb-1.5 block">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-mono border transition-all ${
                      categoryFilter === c ? 'bg-white/10 border-white/20 text-white' : 'bg-white/3 border-white/8 text-gray-500 hover:text-white'
                    }`}
                  >{c}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {displayedProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-mono">No properties match your current filters.</p>
          <button onClick={() => { setPurposeFilter('ALL'); setCityFilter('All Cities'); setBhkFilter('Any BHK'); setFurnishFilter('Any'); setCategoryFilter('All'); }} className="mt-3 text-[#00ffcc] text-xs hover:underline font-mono">Reset Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map(p => {
            const currentPrice = tickerPrices[p.id] || p.price;
            const trend = trendStatus[p.id] || 'STABLE';
            const inComparison = comparisonList.some(item => item.id === p.id);

            return (
              <div
                key={p.id}
                className="rounded-2xl glassmorphism border border-white/5 hover:border-[#00ffcc]/30 transition-all duration-300 flex flex-col group overflow-hidden"
              >
                {/* Image */}
                <div className="h-52 relative overflow-hidden bg-black/40">
                  {p.images && p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,204,0.06),transparent)]" />
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                    <span className="text-[8px] font-mono font-bold px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-gray-300">
                      {p.brand.toUpperCase()}
                    </span>
                    <span className={`text-[8px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                      p.purpose === 'RENT' ? 'bg-[#cc00ff]/15 text-[#cc00ff] border-[#cc00ff]/30' : 'bg-[#00ffcc]/15 text-[#00ffcc] border-[#00ffcc]/30'
                    }`}>
                      {p.purpose === 'RENT' ? '🔑 RENT' : '🏷️ BUY'}
                    </span>
                  </div>
                  {trend !== 'STABLE' && (
                    <span className={`absolute top-3 right-3 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10 ${
                      trend === 'UP' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                      {trend === 'UP' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      Valuation
                    </span>
                  )}
                  {/* BHK badge */}
                  {p.bhk && (
                    <span className="absolute bottom-3 left-3 z-10 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-yellow-400">
                      {p.bhk} BHK
                    </span>
                  )}
                  {p.locality && (
                    <span className="absolute bottom-3 right-3 z-10 text-[8px] font-mono px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-gray-300">
                      📍 {p.locality}
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1 space-y-3">
                  {/* Title */}
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold text-white leading-snug max-w-[200px]">{p.name}</h3>
                    <span className="flex items-center text-[10px] text-yellow-500 font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-yellow-500 mr-0.5" /> {p.rating}
                    </span>
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {p.carpetArea && (
                      <span className="text-[8px] font-mono text-gray-500 border border-white/8 px-2 py-0.5 rounded-full">{p.carpetArea}</span>
                    )}
                    {p.furnishing && (
                      <span className="text-[8px] font-mono text-gray-500 border border-white/8 px-2 py-0.5 rounded-full">{p.furnishing}</span>
                    )}
                    {p.completionStatus && (
                      <span className={`text-[8px] font-mono border px-2 py-0.5 rounded-full ${
                        p.completionStatus.includes('Ready') ? 'text-green-400 border-green-400/20 bg-green-400/5' : 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5'
                      }`}>{p.completionStatus}</span>
                    )}
                  </div>

                  {/* Price row */}
                  <div className="flex items-end justify-between pt-2 border-t border-white/5">
                    <div>
                      <span className="text-[8px] font-mono text-gray-500 block">{p.purpose === 'RENT' ? 'MONTHLY RENT' : 'MARKET VALUE'}</span>
                      <span className="text-sm font-bold font-mono text-[#00ffcc] text-glow-cyan">
                        {formatPrice(currentPrice, p.purpose)}
                      </span>
                      {p.pricePerSqFt && (
                        <span className="text-[8px] text-gray-600 font-mono block">
                          ₹{p.pricePerSqFt.toLocaleString('en-IN')}/sq.ft
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/product/${p.id}`}
                        className="p-2 rounded-xl border border-white/5 bg-white/3 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => toggleComparison(p)}
                        className={`p-2 rounded-xl border transition-all ${
                          inComparison
                            ? 'bg-[#cc00ff]/10 border-[#cc00ff]/30 text-[#cc00ff]'
                            : 'bg-white/3 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        title="Compare"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAddToCart(p)}
                        className="px-3 py-2 rounded-xl bg-white text-black hover:bg-[#00ffcc] hover:scale-105 active:scale-95 transition-all text-[10px] font-bold flex items-center gap-1"
                      >
                        <Bookmark className="w-3.5 h-3.5" /> Shortlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Panel */}
      {comparisonList.length > 0 && (
        <div className="p-5 rounded-2xl glassmorphism border border-white/10 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-bold font-mono tracking-widest text-gray-400">
              ESTATE COMPARISON MATRIX ({comparisonList.length}/3)
            </span>
            <button onClick={() => setComparisonList([])} className="text-[9px] text-[#00ffcc] hover:underline font-mono">
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisonList.map(item => (
              <div key={item.id} className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-3 relative">
                <button
                  onClick={() => toggleComparison(item)}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
                <div>
                  <h4 className="text-xs font-bold text-white pr-6">{item.name}</h4>
                  <p className="text-[8px] text-gray-500 font-mono mt-0.5">{item.brand} • {item.category}</p>
                </div>
                <div className="text-[9px] text-gray-400 font-mono space-y-1.5 bg-black/30 p-3 rounded-lg border border-white/5">
                  {[
                    ['Price', formatPrice(item.price, item.purpose)],
                    ['Area', item.carpetArea || 'N/A'],
                    ['BHK', item.bhk ? `${item.bhk} BHK` : 'N/A'],
                    ['City', item.city || 'N/A'],
                    ['Locality', item.locality || 'N/A'],
                    ['Facing', item.facing || 'N/A'],
                    ['Floor', item.floor ? `${item.floor}/${item.totalFloors}` : 'N/A'],
                    ['Furnishing', item.furnishing || 'N/A'],
                    ['Status', item.completionStatus || 'N/A'],
                    ['₹/sq.ft', item.pricePerSqFt ? `₹${item.pricePerSqFt.toLocaleString('en-IN')}` : 'N/A'],
                    ['RERA', item.reraId || 'N/A']
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-600">{k}:</span>
                      <span className="text-white font-bold text-right max-w-[60%]">{v}</span>
                    </div>
                  ))}
                </div>
                {item.amenities && item.amenities.length > 0 && (
                  <div>
                    <span className="text-[8px] text-gray-600 font-mono uppercase">Amenities</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.amenities.slice(0, 5).map(a => (
                        <span key={a} className="text-[7px] font-mono bg-[#00ffcc]/5 border border-[#00ffcc]/15 text-[#00ffcc] px-1.5 py-0.5 rounded-full">{a}</span>
                      ))}
                      {item.amenities.length > 5 && (
                        <span className="text-[7px] font-mono text-gray-600">+{item.amenities.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => onAddToCart(item)}
                  className="w-full py-1.5 rounded-lg bg-[#00ffcc]/10 hover:bg-[#00ffcc] text-[#00ffcc] hover:text-black font-bold text-[9px] transition-all flex items-center justify-center gap-1"
                >
                  <Bookmark className="w-3 h-3" /> Shortlist
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
