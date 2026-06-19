'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Phone, Lock, Mail, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import UniverseCanvas from '../../components/UniverseCanvas';
import confetti from 'canvas-confetti';
import { loginUser, registerUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'OTP' | 'PASSWORD'>('OTP');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [step, setStep] = useState<'INPUT' | 'VERIFYING' | 'SUCCESS'>('INPUT');
  const [errorMsg, setErrorMsg] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg('');
    setStep('VERIFYING');
    
    // Simulate sending OTP
    setTimeout(() => {
      setStep('INPUT');
      setOtpSent(true);
      alert('Mock OTP code sent to mobile: 123456');
    }, 1200);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456') {
      setErrorMsg('Invalid OTP. Use mock code: 123456');
      return;
    }
    
    setErrorMsg('');
    setStep('VERIFYING');

    try {
      // Log in with seeded test user
      const data = await loginUser('test@nexora.ai', 'user@123');
      setStep('SUCCESS');
      
      localStorage.setItem('nexora_user_session', JSON.stringify({
        isLoggedIn: true,
        name: data.user.name,
        phone: phoneNumber || data.user.phone || '9876543210',
        email: data.user.email,
        budget: data.user.budget || '₹5 Cr - ₹15 Cr',
        city: data.user.city || 'Mumbai',
        shortlistedIds: [] // Will fetch dynamically
      }));

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00ffcc', '#cc00ff', '#ffffff']
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
      setStep('INPUT');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setStep('VERIFYING');

    try {
      const data = await loginUser(email, password);
      setStep('SUCCESS');
      
      localStorage.setItem('nexora_user_session', JSON.stringify({
        isLoggedIn: true,
        name: data.user.name,
        phone: data.user.phone || '9876543210',
        email: data.user.email,
        budget: data.user.budget || '₹5 Cr - ₹15 Cr',
        city: data.user.city || 'Mumbai',
        shortlistedIds: [] // Will fetch dynamically
      }));

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00ffcc', '#cc00ff', '#ffffff']
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      // Auto-register convenience feature
      if (err.message.includes('Invalid email or password')) {
        try {
          const regData = await registerUser({
            name: email.split('@')[0].toUpperCase(),
            email,
            password,
            phone: '9876543210',
            city: 'Mumbai'
          });
          setStep('SUCCESS');
          localStorage.setItem('nexora_user_session', JSON.stringify({
            isLoggedIn: true,
            name: regData.user.name,
            phone: regData.user.phone || '9876543210',
            email: regData.user.email,
            budget: '₹5 Cr - ₹15 Cr',
            city: 'Mumbai',
            shortlistedIds: []
          }));
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#00ffcc', '#cc00ff', '#ffffff']
          });
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
          return;
        } catch (regErr: any) {
          setErrorMsg(regErr.message || 'Authentication failed.');
        }
      } else {
        setErrorMsg(err.message || 'Authentication failed.');
      }
      setStep('INPUT');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative flex items-center justify-center p-4">
      {/* 3D background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <UniverseCanvas />
        <div className="absolute bottom-0 left-0 w-full h-full bg-black/40 backdrop-blur-[2px]" />
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl glassmorphism border border-white/10 relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-nexora-gradient flex items-center justify-center font-black text-black text-xs tracking-tighter shadow-glow-cyan">
              N
            </div>
            <span className="font-bold text-xs tracking-widest text-glow-cyan bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent uppercase">
              Nexora Estates
            </span>
          </Link>
          <h2 className="text-lg md:text-2xl font-black tracking-tight text-white pt-2">
            Welcome to Premium Living
          </h2>
          <p className="text-[10px] md:text-xs text-gray-500 font-mono tracking-wider uppercase">
            Login or Register to track shortlists and site tours
          </p>
        </div>

        {/* Tabs */}
        {step === 'INPUT' && (
          <div className="flex border-b border-white/5 pb-1">
            <button
              onClick={() => {
                setLoginMethod('OTP');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-widest transition-all relative ${
                loginMethod === 'OTP' ? 'text-[#00ffcc]' : 'text-gray-500 hover:text-white'
              }`}
            >
              MOBILE & OTP
              {loginMethod === 'OTP' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#00ffcc] shadow-glow-cyan" />
              )}
            </button>
            <button
              onClick={() => {
                setLoginMethod('PASSWORD');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-widest transition-all relative ${
                loginMethod === 'PASSWORD' ? 'text-[#cc00ff]' : 'text-gray-500 hover:text-white'
              }`}
            >
              EMAIL & PASSWORD
              {loginMethod === 'PASSWORD' && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#cc00ff] shadow-glow-pink" />
              )}
            </button>
          </div>
        )}

        {/* Error messaging */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 flex gap-2 items-start text-red-400 text-[10px] font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dynamic Forms */}
        {step === 'INPUT' && (
          <>
            {loginMethod === 'OTP' ? (
              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-gray-500 font-bold uppercase tracking-wider">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      disabled={otpSent}
                      onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit mobile number..."
                      className="w-full pl-11 pr-4 py-3.5 bg-white/3 border border-white/5 focus:outline-none focus:border-[#00ffcc]/30 rounded-xl text-xs text-white placeholder-gray-600 disabled:opacity-50"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-1 animate-in fade-in duration-300">
                    <label className="text-[8px] font-mono text-gray-500 font-bold uppercase tracking-wider">Enter OTP Code</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value.trim().slice(0, 6))}
                        placeholder="Enter 6-digit OTP (123456)..."
                        className="w-full pl-11 pr-4 py-3.5 bg-white/3 border border-white/5 focus:outline-none focus:border-[#00ffcc]/30 rounded-xl text-xs text-white placeholder-gray-600 font-mono tracking-widest text-center"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#00ffcc] text-black font-black text-[10px] tracking-widest uppercase hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  {otpSent ? 'Verify OTP Code' : 'Send OTP verification'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-gray-500 font-bold uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter email address..."
                      className="w-full pl-11 pr-4 py-3.5 bg-white/3 border border-white/5 focus:outline-none focus:border-[#cc00ff]/30 rounded-xl text-xs text-white placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-gray-500 font-bold uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter account password..."
                      className="w-full pl-11 pr-4 py-3.5 bg-white/3 border border-white/5 focus:outline-none focus:border-[#cc00ff]/30 rounded-xl text-xs text-white placeholder-gray-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#cc00ff] text-white font-black text-[10px] tracking-widest uppercase hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-glow-pink"
                >
                  Verify Credentials <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        )}

        {/* Processing State */}
        {step === 'VERIFYING' && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-t-[#00ffcc] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#00ffcc] uppercase animate-pulse">
              Authenticating session...
            </span>
          </div>
        )}

        {/* Success State */}
        {step === 'SUCCESS' && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center animate-in scale-in duration-300">
            <CheckCircle className="w-10 h-10 text-green-400 animate-bounce" />
            <span className="text-xs font-mono font-bold tracking-widest text-green-400 uppercase">
              Authentication Success!
            </span>
            <p className="text-[9px] text-gray-500 font-mono">Redirecting to Dashboard...</p>
          </div>
        )}

        {/* RERA footer warning */}
        <div className="text-[8px] text-center text-gray-600 font-mono tracking-wider pt-2 border-t border-white/5 uppercase">
          Nexora SafeGuard Shield • RERA Verified Access Port
        </div>
      </div>
    </main>
  );
}
