'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Volume2, VolumeX, Mic, MicOff, Send, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Product, JarvisMessage as Message } from '../types';
import { productsDb } from '../types/properties';

export default function JarvisOrb({ onAddToCart }: { onAddToCart: (p: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceOut, setVoiceOut] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Namaste, welcome to Nexora Luxury Estates. I am Jarvis, your AI real estate assistant. Ask me about luxury properties, location details, or schedule site visits.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeProperties, setActiveProperties] = useState<Product[]>(productsDb);

  useEffect(() => {
    if (isOpen) {
      const savedProperties = localStorage.getItem('nexora_user_posted_properties');
      if (savedProperties) {
        try {
          const userProps = JSON.parse(savedProperties) as Product[];
          setActiveProperties([...productsDb, ...userProps]);
        } catch (e) {}
      }
    }
  }, [isOpen]);

  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setInput(text);
          setIsListening(false);
          submitMessage(text);
        };
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);

        recognitionRef.current = rec;
      }
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Voice Wave canvas animation when Jarvis is thinking or listening
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    let angle = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1.5;
      
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#00ffcc');
      gradient.addColorStop(0.5, '#cc00ff');
      gradient.addColorStop(1, '#0077ff');
      ctx.strokeStyle = gradient;

      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        // Render elegant sin waves representing frequencies
        const amplitude = isListening ? 15 : isTyping ? 10 : 3;
        const speed = isListening ? 0.15 : isTyping ? 0.08 : 0.02;
        const y = height / 2 + Math.sin(x * 0.05 + angle) * amplitude * Math.cos(x * 0.01 + angle * 0.5);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      angle += 0.08;
      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [isListening, isTyping]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('STT Voice Recognition is not supported by your browser version.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speak = (text: string) => {
    if (!voiceOut || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  };

  const submitMessage = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = { role: 'user', content: queryText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = 'Searching properties catalog...';
      let recommendations: Product[] = [];

      const q = queryText.toLowerCase();
      if (q.includes('sobha') || q.includes('windsor') || q.includes('bengaluru') || q.includes('bangalore')) {
        reply = 'Displaying Sobha Windsor Royal Estate in Bengaluru. A Victorian-themed premium villa with ready completion status and private home theatre.';
        recommendations = [activeProperties[3]];
      } else if (q.includes('lodha') || q.includes('worli') || q.includes('mumbai') || q.includes('penthouse')) {
        reply = 'Displaying Lodha World Tower Penthouse in Worli, Mumbai. This 5 BHK duplex offers an Arabian Sea facing view and private infinity pool.';
        recommendations = [activeProperties[0]];
      } else if (q.includes('dlf') || q.includes('camellias') || q.includes('gurugram') || q.includes('mansion')) {
        reply = 'Displaying DLF The Camellias Mansion in Gurugram. A super-luxury duplex overlooking the golf course, ready to move.';
        recommendations = [activeProperties[1]];
      } else if (q.includes('godrej') || q.includes('duplex') || q.includes('smart') || q.includes('township')) {
        reply = 'Displaying Godrej Horizon Duplex in Whitefield, Bengaluru. Under construction 4 BHK with integrated solar panels and private lawn.';
        recommendations = [activeProperties[2]];
      } else if (q.includes('compare') || q.includes('vs')) {
        reply = 'Comparing premium residences: Lodha World Tower offers ocean views in Mumbai, whereas DLF The Camellias offers luxury golf course views in Gurugram.';
        recommendations = [activeProperties[0], activeProperties[1]];
      } else {
        reply = 'I am looking up our developer listings. Let me know if you want information on Lodha Mumbai Penthouses, DLF Gurugram Mansions, Godrej Bengaluru Duplexes, or Sobha Windsor Estates.';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply, recommendations }]);
      setIsTyping(false);
      speak(reply);
    }, 1500);
  };

  return (
    <>
      {/* Floating pulsing Orb trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-black border border-[#00ffcc]/30 shadow-lg shadow-[#00ffcc]/10 hover:border-[#00ffcc]/60 hover:scale-105 active:scale-95 transition-all duration-300 group"
        >
          {/* Pulsing Orb center */}
          <div className="absolute w-8 h-8 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc] animate-pulse" />
          <div className="absolute w-4 h-4 rounded-full bg-gradient-to-tr from-[#00ffcc] to-[#cc00ff] blur-sm animate-ping" />
          <Sparkles className="w-5 h-5 text-[#00ffcc]" />
        </button>
      )}

      {/* Slide-in Jarvis interactive console */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[550px] z-50 rounded-2xl glassmorphism flex flex-col shadow-glow-cyan overflow-hidden"
          >
            {/* Header console */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00ffcc] animate-ping" />
                <span className="text-xs font-bold font-mono tracking-widest text-[#00ffcc] uppercase">
                  NEXORA AI ASSISTANT
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setVoiceOut(!voiceOut)}
                  className={`p-1 rounded transition-colors ${voiceOut ? 'text-[#00ffcc]' : 'text-gray-500'}`}
                >
                  {voiceOut ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#cc00ff]/10 text-white border border-[#cc00ff]/20'
                        : 'bg-white/3 border border-white/5 text-gray-200'
                    }`}
                  >
                    {m.content}

                    {m.recommendations && (
                      <div className="mt-3.5 space-y-2 border-t border-white/5 pt-3">
                        {m.recommendations.map(p => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 hover:border-[#00ffcc]/30 transition-all"
                          >
                            <div>
                              <p className="text-[10px] font-bold text-white truncate max-w-[150px]">{p.name}</p>
                              <p className="text-[9px] text-[#00ffcc] font-mono mt-0.5">₹{p.price.toLocaleString('en-IN')}</p>
                            </div>
                            <button
                              onClick={() => onAddToCart(p)}
                              className="px-2 py-1 rounded bg-[#00ffcc] text-black text-[9px] font-bold font-mono tracking-widest hover:scale-105 active:scale-95 transition-all"
                            >
                              SHORTLIST
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1 p-2 rounded-xl bg-white/2 border border-white/3 w-16 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Frequencies visualizer canvas */}
            <div className="h-10 border-t border-white/5 bg-black/60 relative overflow-hidden">
              <canvas ref={waveCanvasRef} className="w-full h-full" />
            </div>

            {/* Input console */}
            <div className="p-3 border-t border-white/5 bg-white/2 flex items-center gap-2">
              <button
                onClick={toggleListening}
                className={`p-2 rounded-lg border transition-all ${
                  isListening
                    ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse'
                    : 'bg-white/3 border-white/5 text-gray-400 hover:text-[#00ffcc]'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitMessage(input)}
                placeholder={isListening ? 'Listening...' : 'Ask about properties, locations, or builders...'}
                className="flex-1 p-2 bg-white/3 border border-white/5 focus:outline-none focus:border-[#00ffcc]/30 rounded-lg text-xs text-white placeholder-gray-600"
              />
              <button
                onClick={() => submitMessage(input)}
                className="p-2 rounded-lg bg-[#00ffcc] text-black hover:scale-105 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
