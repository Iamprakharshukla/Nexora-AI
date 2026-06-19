'use client';

import { useState } from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus, Home, Zap, Star } from 'lucide-react';
import { localitiesDb } from '../types/properties';

const cityColors: Record<string, string> = {
  Mumbai: '#00ffcc',
  Gurugram: '#cc00ff',
  Bengaluru: '#facc15'
};

export default function LocalityInsights() {
  const [activeCity, setActiveCity] = useState('All');
  const cities = ['All', 'Mumbai', 'Gurugram', 'Bengaluru'];

  const filtered = activeCity === 'All' ? localitiesDb : localitiesDb.filter(l => l.city === activeCity);

  const trendIcon = (t: string) => {
    if (t === 'RISING') return <TrendingUp className="w-3.5 h-3.5 text-green-400" />;
    if (t === 'COOLING') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
    return <Minus className="w-3.5 h-3.5 text-yellow-400" />;
  };

  const trendLabel = (t: string) => {
    if (t === 'RISING') return { label: 'Rising', cls: 'text-green-400 bg-green-400/10 border-green-400/20' };
    if (t === 'COOLING') return { label: 'Cooling', cls: 'text-red-400 bg-red-400/10 border-red-400/20' };
    return { label: 'Stable', cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
  };

  return (
    <section id="locality-insights" className="w-full max-w-7xl mx-auto px-4 py-16 relative z-10">
      {/* Heading */}
      <div className="text-center mb-12">
        <span className="text-[10px] font-mono tracking-widest text-[#cc00ff] uppercase border border-[#cc00ff]/20 px-4 py-1 rounded-full">
          Market Intelligence
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-white mt-4">
          Locality <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#cc00ff] to-[#00ffcc]">Insights</span>
        </h2>
        <p className="text-gray-400 text-sm mt-2">Real-time price trends and lifestyle scores for India's premium micro-markets</p>
      </div>

      {/* City Tabs */}
      <div className="flex justify-center gap-2 mb-10 flex-wrap">
        {cities.map(city => (
          <button
            key={city}
            onClick={() => setActiveCity(city)}
            className={`px-5 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all border ${
              activeCity === city
                ? 'bg-[#00ffcc]/10 border-[#00ffcc]/40 text-[#00ffcc]'
                : 'bg-white/3 border-white/5 text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Locality Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(loc => {
          const color = cityColors[loc.city] || '#00ffcc';
          const { label, cls } = trendLabel(loc.trend);
          return (
            <div
              key={loc.name}
              className="glassmorphism rounded-3xl p-6 border border-white/5 hover:border-white/15 transition-all duration-300 group space-y-5"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color }} />
                    <h3 className="text-sm font-bold text-white">{loc.name}</h3>
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 ml-6">{loc.city}</span>
                </div>
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${cls}`}>
                  {trendIcon(loc.trend)} {label}
                </span>
              </div>

              {/* Price highlight */}
              <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <span className="text-[8px] font-mono text-gray-500 uppercase block">Avg. Price / Sq.Ft</span>
                <span className="text-xl font-black font-mono mt-1 block" style={{ color }}>
                  ₹{loc.avgPricePerSqFt.toLocaleString('en-IN')}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-[9px] text-green-400 font-mono">+{loc.yoyGrowth}% YoY</span>
                </div>
              </div>

              {/* Score bars */}
              <div className="space-y-3">
                {[
                  { icon: <Star className="w-3 h-3" />, label: 'Lifestyle Score', score: loc.lifestyleScore },
                  { icon: <Zap className="w-3 h-3" />, label: 'Connectivity', score: loc.connectivityScore }
                ].map(s => (
                  <div key={s.label} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-gray-400 flex items-center gap-1" style={{ color }}>{s.icon} {s.label}</span>
                      <span className="text-white font-bold">{s.score}/10</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${s.score * 10}%`, background: `linear-gradient(to right, ${color}, ${color}80)` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Home className="w-3 h-3" />
                  <span className="text-[9px] font-mono">{loc.totalListings} Active Listings</span>
                </div>
                <button className="text-[9px] font-bold font-mono hover:underline transition-all" style={{ color }}>
                  Explore →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
