'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';

interface AuthPortalProps {
  portalType: 'Soldier' | 'Admin' | 'Kitchen';
  title: string;
  subtitle: string;
  heroImage: string;
}

export function AuthPortal({ portalType, title, subtitle, heroImage }: AuthPortalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // --- Admin Registration State ---
  const [isRegistering, setIsRegistering] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [regPhone, setRegPhone] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'kitchen') router.push('/kitchen');
      else router.push('/soldier');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorStatus('Please provide both credentials.');
      return;
    }

    setIsLoading(true);
    setErrorStatus(null);

    try {
      const data = await apiClient.post<{ accessToken: string, user: any }>('/auth/login', {
        username: username,
        password: password
      });
      if (portalType === 'Admin' && data.user.role !== 'admin') throw new Error("Unauthorized. Use Admin login.");
      if (portalType === 'Kitchen' && data.user.role !== 'kitchen') throw new Error("Unauthorized. Use Kitchen login.");
      
      login(data.accessToken, data.user);
    } catch (err: any) {
      setErrorStatus(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone) return;
    setIsLoading(true);
    setErrorStatus(null);
    try {
      await apiClient.post('/auth/admin/send-otp', { phone: regPhone });
      setRegStep(2);
    } catch (err: any) {
      setErrorStatus(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regStep === 2) {
       if (!regOtp) return;
       setRegStep(3); // Proceed to credential setup 
       return;
    }
    
    // Step 3 registration
    if (!regUsername || !regPassword) return;
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const data = await apiClient.post<{accessToken: string, user: any}>('/auth/admin/verify-signup', {
         phone: regPhone,
         otp: regOtp,
         username: regUsername,
         password: regPassword
      });
      login(data.accessToken, data.user);
    } catch (err: any) {
      setErrorStatus(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0e0e12] text-[#e2e2e6] font-body min-h-screen flex flex-col selection:bg-[#ffb690]/30">
      <main className="flex-grow flex flex-col md:grid md:grid-cols-2">
        {/* Hero Section */}
        <section className="relative h-[400px] md:h-screen w-full overflow-hidden">
          <img
            alt={`${portalType} portal interior`}
            className="absolute inset-0 w-full h-full object-cover"
            src={heroImage}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0e0e12] md:bg-gradient-to-r md:from-[#0e0e12]/20 md:to-[#0e0e12]"></div>

          <div className="absolute top-0 left-0 w-full px-8 py-8 z-20 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <a href="/" className="w-11 h-11 bg-[#ffb690] flex items-center justify-center rounded-xl shadow-xl shadow-[#ffb690]/20 hover:scale-105 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[#1b1b1f] text-2xl">arrow_back</span>
              </a>
              <span className="font-headline font-black text-2xl tracking-tighter text-white md:text-[#e2e2e6]">ServeSmart</span>
            </div>
          </div>

          <div className="hidden md:flex absolute bottom-16 left-12 flex-col max-w-md">
            <h1 className="font-headline font-black text-6xl text-white mb-6 leading-[1.1] tracking-tight">
              {title}
            </h1>
            <p className="text-white/80 font-medium text-lg leading-relaxed border-l-2 border-[#ffb690]/50 pl-6">
              {subtitle}
            </p>
          </div>
        </section>

        {/* Login Form Section */}
        <section className="flex flex-col items-center justify-center px-6 py-12 md:px-20 bg-[#0e0e12] relative z-10 -mt-16 md:mt-0 rounded-t-[3.5rem] md:rounded-none">
          <div className="w-full max-w-md">
            <header className="mb-12 text-center md:text-left relative">
              <h2 className="font-headline font-extrabold text-4xl text-[#e2e2e6] mb-3 tracking-tight">
                {isRegistering ? 'Admin Registration' : `${portalType} Login`}
              </h2>
              <p className="text-[#aaaab7] font-medium text-lg">
                {isRegistering ? 'Authorized securely via remote SMS token' : 'Enter your authorized credentials'}
              </p>
              {portalType === 'Admin' && !isRegistering && (
                  <button onClick={() => setIsRegistering(true)} className="mt-4 text-[#ffb690] text-sm font-bold uppercase tracking-widest hover:underline flex items-center gap-1 justify-center md:justify-start">
                    <span className="material-symbols-outlined text-sm">person_add</span> Enlist New Admin
                  </button>
              )}
              {isRegistering && (
                  <button onClick={() => setIsRegistering(false)} className="mt-4 text-[#aaaab7] text-sm font-bold uppercase tracking-widest hover:underline flex items-center gap-1 justify-center md:justify-start">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Login
                  </button>
              )}
            </header>

            {errorStatus && (
              <div className="flex items-center gap-2 text-[#ffb4ab] bg-[#ffb4ab]/10 p-4 rounded-xl border border-[#ffb4ab]/20 animate-in slide-in-from-bottom-2 mb-6">
                <span className="material-symbols-outlined text-sm">warning</span>
                <p className="text-xs font-bold">{errorStatus}</p>
              </div>
            )}

            {!isRegistering ? (
              <form className="space-y-7" onSubmit={handleLogin}>
                <div className="space-y-3">
                  <label className="block font-label text-sm font-bold text-[#aaaab7]/80 uppercase tracking-widest px-1" htmlFor="username">
                    {portalType === 'Soldier' ? 'Service ID / PNO' : 'Username'}
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#8e9199] group-focus-within:text-[#ffb690] transition-colors">person</span>
                    <input
                      className="w-full pl-14 pr-5 py-5 rounded-2xl border-none bg-[#131318] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] focus:ring-2 focus:ring-[#ffb690]/40 focus:bg-[#1b1b1f] transition-all text-[#e2e2e6] placeholder:text-[#44474e] font-medium text-base"
                      id="username"
                      placeholder={portalType === 'Soldier' ? '091234567' : 'admin_username'}
                      type="text"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setErrorStatus(null); }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="block font-label text-sm font-bold text-[#aaaab7]/80 uppercase tracking-widest" htmlFor="password">
                      Password
                    </label>
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#8e9199] group-focus-within:text-[#ffb690] transition-colors">lock</span>
                    <input
                      className="w-full pl-14 pr-14 py-5 rounded-2xl border-none bg-[#131318] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] focus:ring-2 focus:ring-[#ffb690]/40 focus:bg-[#1b1b1f] transition-all text-[#e2e2e6] placeholder:text-[#44474e] font-medium text-base"
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrorStatus(null); }}
                    />
                    <button
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8e9199] hover:text-[#ffb690] transition-colors"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <button
                  className="w-full py-5 rounded-2xl bg-[#ffb690] text-[#1b1b1f] font-headline font-extrabold text-lg shadow-[0_12px_24px_-4px_rgba(255,182,144,0.25)] hover:shadow-[0_20px_32px_-4px_rgba(255,182,144,0.3)] active:scale-[0.98] transition-all duration-300 mt-6 flex items-center justify-center gap-3 disabled:opacity-50"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Authenticating...' : 'Secure Entry'}
                  {!isLoading && <span className="material-symbols-outlined text-xl">login</span>}
                </button>
              </form>
            ) : (
                /* Registration Flow */
                <form className="space-y-7" onSubmit={regStep === 1 ? handleSendOtp : handleVerifyOtpAndRegister}>
                  {regStep === 1 && (
                     <div className="space-y-3 animate-in fade-in zoom-in">
                       <label className="block font-label text-sm font-bold text-[#aaaab7]/80 uppercase tracking-widest px-1">Registered Mobile Number</label>
                       <input className="w-full px-5 py-5 rounded-2xl border-none bg-[#131318] focus:ring-2 focus:ring-[#ffb690]/40 text-[#e2e2e6]" placeholder="+91 99999 99999" type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} required />
                     </div>
                  )}

                  {regStep === 2 && (
                     <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                       <label className="block font-label text-sm font-bold text-[#aaaab7]/80 uppercase tracking-widest px-1">6-Digit SMS Token</label>
                       <input className="w-full px-5 py-5 rounded-2xl border-none bg-[#131318] focus:ring-2 focus:ring-[#ffb690]/40 text-[#e2e2e6] text-center tracking-[1em] font-mono text-xl" placeholder="••••••" type="text" maxLength={6} value={regOtp} onChange={e => setRegOtp(e.target.value)} required />
                       <p className="text-xs text-center text-[#ffb690] mt-2">Token sent to {regPhone}</p>
                     </div>
                  )}

                  {regStep === 3 && (
                     <div className="space-y-5 animate-in slide-in-from-bottom-4">
                         <div className="space-y-2">
                           <label className="block font-label text-xs font-bold text-[#aaaab7]/80 uppercase tracking-widest px-1">New Admin Username</label>
                           <input className="w-full px-5 py-3 rounded-2xl border-none bg-[#131318] text-[#e2e2e6]" placeholder="admin_user_2" value={regUsername} onChange={e => setRegUsername(e.target.value)} required />
                         </div>
                         <div className="space-y-2">
                           <label className="block font-label text-xs font-bold text-[#aaaab7]/80 uppercase tracking-widest px-1">New Secure Password</label>
                           <input className="w-full px-5 py-3 rounded-2xl border-none bg-[#131318] text-[#e2e2e6]" placeholder="••••••••" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                         </div>
                     </div>
                  )}

                  <button className="w-full py-5 rounded-2xl bg-[#ffb690] text-[#1b1b1f] font-headline font-extrabold text-lg shadow-[0_12px_24px_-4px_rgba(255,182,144,0.25)] hover:shadow-[0_20px_32px_-4px_rgba(255,182,144,0.3)] active:scale-[0.98] transition-all duration-300 mt-6" type="submit" disabled={isLoading}>
                    {isLoading ? 'Processing...' : regStep === 1 ? 'Dispatch OTP Token' : regStep === 2 ? 'Verify Identity' : 'Finalize Registration'}
                  </button>
                </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
