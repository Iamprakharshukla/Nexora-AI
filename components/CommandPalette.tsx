'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Image, Sparkles, Compass, Cpu, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Product } from '../types';
import { productsDb } from '../types/properties';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}

export default function CommandPalette({ isOpen, onClose, onAddToCart }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [isVisualSearch, setIsVisualSearch] = useState(false);
  const [insights, setInsights] = useState('Type your query to search for luxury properties across key Indian cities.');
  const [products, setProducts] = useState<Product[]>([]);
  const [vectorCoords, setVectorCoords] = useState<{ x: number; y: number; name: string }[]>([]);
  const [activeProperties, setActiveProperties] = useState<Product[]>(productsDb);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Perform semantic search
  const runSearch = (val: string, customDb?: Product[]) => {
    const dbToUse = customDb || activeProperties;
    const term = val.toLowerCase().trim();
    let matches = [...dbToUse];

    if (term) {
      matches = dbToUse.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term)
      );
    }

    setProducts(matches);

    // Dynamic mock vector embedding calculations
    const coords = dbToUse.map((p, idx) => {
      const isMatch = term ? (p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term) ? 0.95 : 0.15) : 0.5;
      return {
        x: Number((Math.cos(idx * 1.5) * (1 - isMatch) * 5).toFixed(3)),
        y: Number((Math.sin(idx * 1.5) * (1 - isMatch) * 5).toFixed(3)),
        name: p.name
      };
    });

    coords.push({
      x: 0,
      y: 0,
      name: `Search: "${val || 'default'}"`
    });

    setVectorCoords(coords);
    setInsights(term ? `Found ${matches.length} matching properties.` : 'Mapped based on location relevance.');
  };

  useEffect(() => {
    if (isOpen) {
      let activeProps = [...productsDb];
      const savedProperties = localStorage.getItem('nexora_user_posted_properties');
      if (savedProperties) {
        try {
          const userProps = JSON.parse(savedProperties) as Product[];
          activeProps = [...productsDb, ...userProps];
        } catch (e) {}
      }
      setActiveProperties(activeProps);
      runSearch('', activeProps);
    }
  }, [isOpen]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    runSearch(val);
  };

  // Simulating CLIP Visual Search on image upload
  const handleVisualUpload = () => {
    setIsVisualSearch(true);
    setInsights('Analyzing image parameters for matching property styles...');

    setTimeout(() => {
      setIsVisualSearch(false);
      setProducts([productsDb[3], productsDb[2]]); 
      const matchingCoords = [
        { x: -1.2, y: 1.5, name: productsDb[3].name },
        { x: 1.8, y: -2.1, name: productsDb[2].name },
        { x: 0, y: 0, name: 'Search: Visual Match' }
      ];
      setVectorCoords(matchingCoords);
      setInsights('Image match completed. Found matching profiles: [Villas, Smart Townships].');
    }, 2000);
  };

  // Render Vector Space Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);

    ctx.clearRect(0, 0, width, height);

    // Draw central grids
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Orbit lines
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 50, 0, Math.PI * 2);
    ctx.arc(width / 2, height / 2, 100, 0, Math.PI * 2);
    ctx.stroke();

    // Map each coordinate
    vectorCoords.forEach((node) => {
      // Map nodes coordinates x, y (expected to range between -6 and +6)
      const mappedX = width / 2 + (node.x * (width / 14));
      const mappedY = height / 2 + (node.y * (height / 14));

      const isQuery = node.name.startsWith('Search:');
      
      // Node glow
      ctx.shadowColor = isQuery ? '#cc00ff' : '#00ffcc';
      ctx.shadowBlur = 8;
      
      ctx.fillStyle = isQuery ? '#cc00ff' : '#00ffcc';
      ctx.beginPath();
      ctx.arc(mappedX, mappedY, isQuery ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0; // reset

      // Draw vector lines from Query center to nodes
      if (!isQuery && vectorCoords.some(c => c.name.startsWith('Search:'))) {
        const queryNode = vectorCoords.find(c => c.name.startsWith('Search:'))!;
        const qX = width / 2 + (queryNode.x * (width / 14));
        const qY = height / 2 + (queryNode.y * (height / 14));
        
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.12)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(qX, qY);
        ctx.lineTo(mappedX, mappedY);
        ctx.stroke();
      }

      // Draw label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '8px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(node.name.length > 20 ? node.name.substring(0,18)+'...' : node.name, mappedX, mappedY - 8);
    });
  }, [vectorCoords]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl h-[500px] glassmorphism rounded-3xl overflow-hidden shadow-2xl border border-white/10 grid grid-cols-1 lg:grid-cols-3"
          >
            {/* Left Col: Search Operations */}
            <div className="lg:col-span-2 p-6 flex flex-col space-y-4 border-r border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#00ffcc]" />
                  <span className="text-xs font-bold tracking-widest text-[#00ffcc] font-mono">AI PROPERTY SEARCH</span>
                </div>
                <button onClick={onClose} className="p-1 text-gray-500 hover:text-white">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Input */}
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={query}
                    onChange={handleTextChange}
                    placeholder="Search locations or configurations (e.g. 5 BHK Worli Mumbai, Camellias Gurugram)..."
                    className="w-full pl-11 pr-4 py-3 bg-white/3 border border-white/5 focus:outline-none focus:border-[#00ffcc]/30 rounded-xl text-xs text-white placeholder-gray-600"
                  />
                </div>
                <button
                  onClick={handleVisualUpload}
                  className="p-3.5 bg-white/3 border border-white/5 hover:border-[#00ffcc]/30 hover:bg-[#00ffcc]/10 rounded-xl text-gray-500 hover:text-[#00ffcc] transition-colors shrink-0"
                  title="CLIP Visual Search"
                >
                  <Image className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Insights */}
              <div className="p-3 rounded-xl bg-white/2 border border-white/3 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#00ffcc] shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 font-mono leading-relaxed">{insights}</p>
              </div>

              {/* Result listing */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {products.map(p => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-white/3 border border-white/3 flex items-center justify-between hover:border-[#00ffcc]/20 transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{p.name}</p>
                      <p className="text-[10px] text-gray-500 truncate max-w-[350px]">{p.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold font-mono text-[#00ffcc]">₹{p.price.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => {
                          onAddToCart(p);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-[#00ffcc] text-[10px] font-bold transition-all"
                      >
                        Shortlist
                      </button>
                    </div>
                  </div>
                ))}

                {products.length === 0 && (
                  <div className="text-center py-10 text-[11px] text-gray-600 font-mono">No matching records found.</div>
                )}
              </div>
            </div>

            {/* Right Col: Embeddings visualization */}
            <div className="p-6 flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold font-mono tracking-widest text-[#cc00ff]">PROPERTY LOCATIONS</span>
                <Cpu className="w-3.5 h-3.5 text-gray-500" />
              </div>

              <div className="flex-1 rounded-2xl bg-black/40 border border-white/5 overflow-hidden relative flex items-center justify-center">
                {isVisualSearch && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-t-[#00ffcc] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <span className="text-[9px] font-mono text-gray-400 tracking-wider">SCANNING IMAGES...</span>
                  </div>
                )}
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
