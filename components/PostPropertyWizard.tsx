'use client';

import { useState } from 'react';
import { Upload, Check, Home, IndianRupee, MapPin, ChevronRight, ChevronLeft, Sparkles, BadgeCheck } from 'lucide-react';
import { postProperty } from '@/lib/api';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  purpose: 'SELL' | 'RENT' | '';
  propertyType: string;
  bhk: string;
  city: string;
  locality: string;
  address: string;
  carpetArea: string;
  floor: string;
  totalFloors: string;
  furnishing: string;
  price: string;
  facing: string;
  amenities: string[];
  name: string;
  phone: string;
  email: string;
}

const AMENITIES_LIST = [
  'Swimming Pool', 'Gym', 'Clubhouse', 'Smart Security', 'Power Backup',
  'Lift', 'Parking', 'Garden', 'Home Theatre', 'Concierge',
  'EV Charging', 'Jacuzzi', 'Private Pool', 'Helipad', 'Wine Cellar'
];

const CITIES = ['Mumbai', 'Gurugram', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata'];

export default function PostPropertyWizard({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({
    purpose: '',
    propertyType: '',
    bhk: '',
    city: '',
    locality: '',
    address: '',
    carpetArea: '',
    floor: '',
    totalFloors: '',
    furnishing: '',
    price: '',
    facing: '',
    amenities: [],
    name: '',
    phone: '',
    email: ''
  });

  const set = (key: keyof FormData, val: any) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.email) {
      alert('Please fill in contact name, phone, and email.');
      return;
    }
    try {
      await postProperty({
        name: `${form.bhk} BHK ${form.propertyType} in ${form.locality || 'Elite Area'}`,
        price: form.price ? parseFloat(form.price) : 0,
        brand: form.name || 'Owner',
        description: `Luxurious ${form.bhk} BHK ${form.propertyType} in ${form.locality || 'Premium Locality'}, ${form.city || 'Mumbai'}. Floor: ${form.floor || '1'}/${form.totalFloors || '4'}. Facing: ${form.facing || 'East'}. Furnishing: ${form.furnishing || 'Unfurnished'}.`,
        category: form.propertyType + 's',
        purpose: (form.purpose || 'SELL') === 'SELL' ? 'BUY' : 'RENT',
        bhk: parseInt(form.bhk) || 3,
        locality: form.locality || 'Worli',
        city: form.city || 'Mumbai',
        furnishing: (form.furnishing === 'Furnished' ? 'FURNISHED' : form.furnishing === 'Semi-Furnished' ? 'SEMI_FURNISHED' : 'UNFURNISHED'),
        facing: form.facing || 'East',
        carpetArea: `${form.carpetArea || '1,500'} sq. ft.`,
        carpetAreaSqFt: parseFloat(form.carpetArea) || 1500,
        amenities: form.amenities,
        images: [
          '/lodha_ext.png',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
        ]
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Authentication error: Please login first to post properties.');
    }
  }; 

  const toggleAmenity = (a: string) => {
    const curr = form.amenities;
    set('amenities', curr.includes(a) ? curr.filter(x => x !== a) : [...curr, a]);
  };

  const stepLabels = ['Property Type', 'Location & Details', 'Pricing & Amenities', 'Contact Info'];
  const progress = (step / 4) * 100;

  const inputCls = "w-full border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ffcc]/40 transition-all font-mono";
  const selectCls = `${inputCls} appearance-none cursor-pointer`;
  const labelCls = "text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 block";

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc]/30 flex items-center justify-center">
          <BadgeCheck className="w-10 h-10 text-[#00ffcc]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Property Listed Successfully!</h3>
          <p className="text-gray-400 text-sm mt-2">Your property is under review. Our team will reach out to <span className="text-[#00ffcc]">{form.phone}</span> within 24 hours.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setSubmitted(false); setStep(1); setForm(f => ({ ...f, purpose: '', propertyType: '' })); }}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-mono transition-all"
          >
            List Another
          </button>
          {onClose && (
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-[#00ffcc] text-black font-bold text-xs hover:bg-white transition-all">
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] font-mono text-gray-500">
          {stepLabels.map((l, i) => (
            <span key={l} className={`${i + 1 === step ? 'text-[#00ffcc]' : i + 1 < step ? 'text-gray-400' : ''}`}>
              {i + 1 < step ? <Check className="w-3 h-3 inline" /> : null} {l}
            </span>
          ))}
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(to right, #00ffcc, #cc00ff)' }}
          />
        </div>
      </div>

      {/* Step 1: Property Type */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className={labelCls}>I want to</label>
            <div className="grid grid-cols-2 gap-3">
              {(['SELL', 'RENT'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => set('purpose', p)}
                  className={`py-4 rounded-2xl border text-sm font-bold transition-all ${
                    form.purpose === p
                      ? 'bg-[#00ffcc]/10 border-[#00ffcc]/40 text-[#00ffcc]'
                      : 'bg-white/3 border-white/8 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {p === 'SELL' ? '🏷️ Sell Property' : '🔑 Rent Property'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Property Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['Apartment', 'Villa', 'Penthouse', 'Plot', 'Studio', 'Duplex'].map(t => (
                <button
                  key={t}
                  onClick={() => set('propertyType', t)}
                  className={`py-2.5 rounded-xl border text-xs font-mono transition-all ${
                    form.propertyType === t
                      ? 'bg-[#cc00ff]/10 border-[#cc00ff]/40 text-[#cc00ff]'
                      : 'bg-white/3 border-white/8 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>BHK Configuration</label>
            <div className="flex gap-2 flex-wrap">
              {['1', '2', '3', '4', '5', '6+'].map(b => (
                <button
                  key={b}
                  onClick={() => set('bhk', b)}
                  className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                    form.bhk === b
                      ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400'
                      : 'bg-white/3 border-white/8 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {b} BHK
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Location & Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>City</label>
              <select className={selectCls} style={{ colorScheme: 'dark', backgroundColor: '#0d0d0d' }} value={form.city} onChange={e => set('city', e.target.value)}>
                <option value="" style={{ background: '#0d0d0d' }}>Select City</option>
                {CITIES.map(c => <option key={c} value={c} style={{ background: '#0d0d0d' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Locality</label>
              <input className={inputCls} placeholder="e.g. Worli, DLF Phase 5" value={form.locality} onChange={e => set('locality', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Full Address</label>
            <input className={inputCls} placeholder="Building name, street, area" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Carpet Area (sq.ft)</label>
              <input type="number" className={inputCls} placeholder="e.g. 2500" value={form.carpetArea} onChange={e => set('carpetArea', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Floor No.</label>
              <input type="number" className={inputCls} placeholder="e.g. 12" value={form.floor} onChange={e => set('floor', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Total Floors</label>
              <input type="number" className={inputCls} placeholder="e.g. 32" value={form.totalFloors} onChange={e => set('totalFloors', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Furnishing Status</label>
              <select className={selectCls} style={{ colorScheme: 'dark', backgroundColor: '#0d0d0d' }} value={form.furnishing} onChange={e => set('furnishing', e.target.value)}>
                <option value="" style={{ background: '#0d0d0d' }}>Select</option>
                <option style={{ background: '#0d0d0d' }}>Furnished</option>
                <option style={{ background: '#0d0d0d' }}>Semi-Furnished</option>
                <option style={{ background: '#0d0d0d' }}>Unfurnished</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Facing Direction</label>
              <select className={selectCls} style={{ colorScheme: 'dark', backgroundColor: '#0d0d0d' }} value={form.facing} onChange={e => set('facing', e.target.value)}>
                <option value="" style={{ background: '#0d0d0d' }}>Select</option>
                {['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map(d => (
                  <option key={d} style={{ background: '#0d0d0d' }}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Pricing & Amenities */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className={labelCls}>{form.purpose === 'RENT' ? 'Expected Monthly Rent (₹)' : 'Expected Sale Price (₹)'}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">₹</span>
              <input
                type="number"
                className={`${inputCls} pl-8`}
                placeholder={form.purpose === 'RENT' ? 'e.g. 150000' : 'e.g. 35000000'}
                value={form.price}
                onChange={e => set('price', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Available Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map(a => (
                <button
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold transition-all ${
                    form.amenities.includes(a)
                      ? 'bg-[#00ffcc]/10 border-[#00ffcc]/40 text-[#00ffcc]'
                      : 'bg-white/3 border-white/8 text-gray-500 hover:border-white/20 hover:text-gray-300'
                  }`}
                >
                  {form.amenities.includes(a) ? '✓ ' : ''}{a}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#cc00ff]/5 border border-[#cc00ff]/15">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-[#cc00ff]" />
              <span className="text-xs text-gray-300 font-bold">Upload Property Photos</span>
            </div>
            <p className="text-[10px] text-gray-500">Drag & drop or click to upload. Supports JPG, PNG, WebP. Max 10 photos.</p>
            <div className="mt-3 border-2 border-dashed border-white/10 rounded-xl h-16 flex items-center justify-center text-gray-600 text-xs font-mono hover:border-[#cc00ff]/30 transition-all cursor-pointer">
              + Drop files here
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Contact */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#00ffcc]/5 border border-[#00ffcc]/15 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00ffcc]" />
              <span className="text-xs text-[#00ffcc] font-bold">AI-Powered Listing Boost</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Our Nexora AI will auto-generate a premium property description and suggest the optimal listing price based on current market data.</p>
          </div>
          <div>
            <label className={labelCls}>Your Full Name</label>
            <input className={inputCls} placeholder="e.g. Rajesh Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="tel" className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input type="email" className={inputCls} placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-gray-300">Summary</h4>
            {[
              ['Purpose', form.purpose],
              ['Type', `${form.bhk} BHK ${form.propertyType}`],
              ['Location', `${form.locality}, ${form.city}`],
              ['Area', `${form.carpetArea} sq.ft`],
              ['Price', form.price ? `₹${parseInt(form.price).toLocaleString('en-IN')}` : '—']
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-[9px] font-mono">
                <span className="text-gray-500">{k}</span>
                <span className="text-white">{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        {step > 1 ? (
          <button
            onClick={() => setStep(prev => (prev - 1) as Step)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-mono transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : <div />}

        {step < 4 ? (
          <button
            onClick={() => setStep(prev => (prev + 1) as Step)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00ffcc] to-[#00ccaa] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(0,255,204,0.3)] transition-all"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00ffcc] to-[#cc00ff] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(0,255,204,0.3)] transition-all"
          >
            <BadgeCheck className="w-4 h-4" /> Submit Listing
          </button>
        )}
      </div>
    </div>
  );
}
