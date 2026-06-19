'use client';

import { useState, useMemo } from 'react';
import { Calculator, IndianRupee, TrendingUp, PieChart } from 'lucide-react';

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(5000000); // 50L default
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const calc = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    const n = tenure * 12;

    if (monthlyRate === 0) {
      const emi = principal / n;
      return {
        emi,
        totalPayment: emi * n,
        totalInterest: 0,
        principalPct: 100,
        interestPct: 0
      };
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - principal;
    const principalPct = Math.round((principal / totalPayment) * 100);
    const interestPct = 100 - principalPct;

    return { emi, totalPayment, totalInterest, principalPct, interestPct };
  }, [loanAmount, interestRate, tenure]);

  const formatCrore = (v: number) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
    return `₹${v.toLocaleString('en-IN')}`;
  };

  const formatEMI = (v: number) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L/mo`;
    return `₹${Math.round(v).toLocaleString('en-IN')}/mo`;
  };

  // SVG Donut chart
  const radius = 70;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * radius;
  const principalStroke = (calc.principalPct / 100) * circumference;
  const interestStroke = (calc.interestPct / 100) * circumference;

  return (
    <section id="emi-calculator" className="w-full max-w-7xl mx-auto px-4 py-16 relative z-10">
      {/* Heading */}
      <div className="text-center mb-12">
        <span className="text-[10px] font-mono tracking-widest text-[#00ffcc] uppercase border border-[#00ffcc]/20 px-4 py-1 rounded-full">
          Financial Intelligence
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-white mt-4">
          Home Loan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-[#cc00ff]">EMI Calculator</span>
        </h2>
        <p className="text-gray-400 text-sm mt-2">Plan your luxury home purchase with precision financial modelling</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — sliders */}
        <div className="glassmorphism rounded-3xl p-8 border border-white/5 space-y-8">
          <div className="flex items-center gap-2 text-gray-300 mb-2">
            <Calculator className="w-5 h-5 text-[#00ffcc]" />
            <span className="text-sm font-bold tracking-wider">Loan Parameters</span>
          </div>

          {/* Loan Amount */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-mono">Loan Amount</span>
              <span className="text-[#00ffcc] font-bold font-mono">{formatCrore(loanAmount)}</span>
            </div>
            <input
              type="range"
              min={500000}
              max={100000000}
              step={500000}
              value={loanAmount}
              onChange={e => setLoanAmount(+e.target.value)}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00ffcc] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,255,204,0.6)] [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-600 font-mono">
              <span>₹5L</span><span>₹10 Cr</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-mono">Annual Interest Rate</span>
              <span className="text-[#cc00ff] font-bold font-mono">{interestRate.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={15}
              step={0.1}
              value={interestRate}
              onChange={e => setInterestRate(+e.target.value)}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#cc00ff] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(204,0,255,0.6)] [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-600 font-mono">
              <span>5%</span><span>15%</span>
            </div>
          </div>

          {/* Tenure */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-mono">Loan Tenure</span>
              <span className="text-yellow-400 font-bold font-mono">{tenure} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={tenure}
              onChange={e => setTenure(+e.target.value)}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(250,204,21,0.6)] [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-600 font-mono">
              <span>1 yr</span><span>30 yrs</span>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
            {[
              { label: 'Monthly EMI', value: formatEMI(calc.emi), color: '#00ffcc' },
              { label: 'Total Interest', value: formatCrore(calc.totalInterest), color: '#cc00ff' },
              { label: 'Total Payment', value: formatCrore(calc.totalPayment), color: '#facc15' }
            ].map(s => (
              <div key={s.label} className="bg-white/3 rounded-2xl p-3 border border-white/5 text-center">
                <span className="text-[8px] text-gray-500 font-mono uppercase block mb-1">{s.label}</span>
                <span className="text-xs font-bold font-mono" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Donut + breakdown */}
        <div className="glassmorphism rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-gray-300 self-start">
            <PieChart className="w-5 h-5 text-[#cc00ff]" />
            <span className="text-sm font-bold tracking-wider">Loan Composition</span>
          </div>

          {/* SVG Donut */}
          <div className="relative">
            <svg width="180" height="180" viewBox="0 0 180 180">
              {/* Background ring */}
              <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="22" />
              {/* Interest arc (bottom layer) */}
              <circle
                cx={cx} cy={cy} r={radius} fill="none"
                stroke="rgba(204,0,255,0.7)"
                strokeWidth="22"
                strokeDasharray={`${interestStroke} ${circumference - interestStroke}`}
                strokeDashoffset={-principalStroke}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(204,0,255,0.5))', transition: 'all 0.5s ease' }}
              />
              {/* Principal arc (top layer) */}
              <circle
                cx={cx} cy={cy} r={radius} fill="none"
                stroke="rgba(0,255,204,0.8)"
                strokeWidth="22"
                strokeDasharray={`${principalStroke} ${circumference - principalStroke}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,204,0.6))', transition: 'all 0.5s ease' }}
              />
              {/* Center text */}
              <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="monospace">
                {formatEMI(calc.emi).replace('/mo', '')}
              </text>
              <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">
                /month
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="w-full space-y-3">
            {[
              { label: 'Principal', pct: calc.principalPct, color: '#00ffcc', value: formatCrore(loanAmount) },
              { label: 'Interest', pct: calc.interestPct, color: '#cc00ff', value: formatCrore(calc.totalInterest) }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 font-mono">{item.label}</span>
                    <span className="font-bold font-mono" style={{ color: item.color }}>{item.pct}% • {item.value}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%`, background: item.color, boxShadow: `0 0 6px ${item.color}` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="w-full p-3 rounded-xl bg-[#00ffcc]/5 border border-[#00ffcc]/10 flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-[#00ffcc] mt-0.5 shrink-0" />
            <p className="text-[10px] text-gray-400 leading-relaxed">
              A <span className="text-[#00ffcc] font-bold">1% prepayment</span> annually can reduce your tenure by up to <span className="text-[#00ffcc] font-bold">4 years</span> and save substantial interest on luxury properties.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
