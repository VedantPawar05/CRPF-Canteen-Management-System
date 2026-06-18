'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function RootPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={`min-h-screen bg-[#0e0e12] flex flex-col text-white font-body overflow-hidden transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e0e12]/80 backdrop-blur-xl border-b border-[#464753]/10">
        <div className="flex justify-between items-center w-full px-8 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#ffb690] flex items-center justify-center rounded-xl shadow-xl shadow-[#ffb690]/20">
              <span className="material-symbols-outlined text-[#1b1b1f] text-2xl">shield</span>
            </div>
            <div>
              <span className="font-headline font-black text-2xl tracking-tighter text-white">ServeSmart</span>
              <p className="text-[9px] text-[#aaaab7] uppercase tracking-[0.25em] font-bold -mt-0.5">CRPF Canteen System</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-[#aaaab7] hover:text-[#ffb690] transition-colors font-medium">Features</a>
            <a href="#portals" className="text-[#aaaab7] hover:text-[#ffb690] transition-colors font-medium">Portals</a>
            <a href="#stats" className="text-[#aaaab7] hover:text-[#ffb690] transition-colors font-medium">Statistics</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#ffb690]/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/3 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-5xl text-center space-y-10 relative z-10">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ffb690]/10 border border-[#ffb690]/20 text-[#ffb690] text-xs font-bold uppercase tracking-widest mx-auto">
            <span className="w-2 h-2 rounded-full bg-[#ffb690] animate-pulse"></span>
            System Online • v2.4
          </div>

          <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter leading-[0.95]">
            <span className="text-[#ffb690]">Smart</span> Canteen
            <br />
            <span className="text-white">Management</span>
          </h1>
          
          <p className="text-[#aaaab7] text-xl leading-relaxed max-w-2xl mx-auto font-medium">
            A secure, microservices-driven canteen management platform designed for CRPF personnel. 
            Real-time ordering, kitchen coordination, and inventory tracking in one unified system.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/soldier/login" className="w-full sm:w-auto px-10 py-5 bg-[#ffb690] text-[#1b1b1f] font-headline font-extrabold text-lg rounded-2xl shadow-[0_12px_24px_-4px_rgba(255,182,144,0.3)] hover:shadow-[0_20px_32px_-4px_rgba(255,182,144,0.4)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3">
              Get Started
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link href="#portals" className="w-full sm:w-auto px-10 py-5 bg-[#191920] text-white font-headline font-bold text-lg rounded-2xl border border-[#464753]/30 hover:border-[#ffb690]/40 transition-all flex items-center justify-center gap-3">
              View Portals
              <span className="material-symbols-outlined text-[#ffb690]">grid_view</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#ffb690] text-[10px] font-black uppercase tracking-[0.3em] mb-3">PLATFORM CAPABILITIES</p>
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter">Built for Efficiency</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'shopping_cart', title: 'Smart Orders', desc: 'QR-code enabled ordering with real-time status tracking and wallet payments.' },
              { icon: 'restaurant', title: 'Kitchen KDS', desc: 'Live kitchen display system with priority queuing and station management.' },
              { icon: 'inventory_2', title: 'Auto Inventory', desc: 'Automated stock deduction on orders with low-stock alerts and restock workflows.' },
              { icon: 'shield', title: 'Role Security', desc: 'JWT-authenticated portals with role-based access control for all personnel.' },
            ].map((f, i) => (
              <div key={i} className="bg-[#131318] p-8 rounded-2xl border border-[#464753]/15 hover:border-[#ffb690]/30 transition-all group hover:-translate-y-1 duration-300">
                <div className="w-14 h-14 bg-[#ffb690]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#ffb690]/20 transition-colors">
                  <span className="material-symbols-outlined text-[#ffb690] text-2xl">{f.icon}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-[#aaaab7] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Cards */}
      <section id="portals" className="py-24 px-6 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#ffb690] text-[10px] font-black uppercase tracking-[0.3em] mb-3">ACCESS CONTROL</p>
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter">Select Your Portal</h2>
            <p className="text-[#aaaab7] mt-4 max-w-lg mx-auto">Each portal is authenticated separately with role-based permissions to ensure operational security.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Soldier Portal */}
            <Link href="/soldier/login" className="group relative bg-[#131318] rounded-3xl border border-[#464753]/15 hover:border-[#ffb690]/50 transition-all duration-500 overflow-hidden hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffb690]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 p-10">
                <div className="w-16 h-16 bg-[#ffb690]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[#ffb690] text-3xl">badge</span>
                </div>
                <h3 className="font-headline font-black text-2xl text-white mb-3 tracking-tight">Soldier Portal</h3>
                <p className="text-[#aaaab7] text-sm leading-relaxed mb-8">Browse the menu, place orders, track delivery status, and manage your canteen wallet.</p>
                <div className="flex items-center gap-2 text-[#ffb690] text-sm font-bold group-hover:gap-4 transition-all">
                  <span>Enter Portal</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </div>
              </div>
            </Link>

            {/* Kitchen Portal */}
            <Link href="/kitchen/login" className="group relative bg-[#131318] rounded-3xl border border-[#464753]/15 hover:border-orange-400/50 transition-all duration-500 overflow-hidden hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 p-10">
                <div className="w-16 h-16 bg-orange-400/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-orange-400 text-3xl">restaurant</span>
                </div>
                <h3 className="font-headline font-black text-2xl text-white mb-3 tracking-tight">Kitchen Display</h3>
                <p className="text-[#aaaab7] text-sm leading-relaxed mb-8">Monitor incoming orders, update preparation status, and coordinate the kitchen team in real-time.</p>
                <div className="flex items-center gap-2 text-orange-400 text-sm font-bold group-hover:gap-4 transition-all">
                  <span>Enter Portal</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </div>
              </div>
            </Link>

            {/* Admin Portal */}
            <Link href="/admin/login" className="group relative bg-[#131318] rounded-3xl border border-[#464753]/15 hover:border-blue-400/50 transition-all duration-500 overflow-hidden hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 p-10">
                <div className="w-16 h-16 bg-blue-400/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-blue-400 text-3xl">shield_person</span>
                </div>
                <h3 className="font-headline font-black text-2xl text-white mb-3 tracking-tight">Admin Dashboard</h3>
                <p className="text-[#aaaab7] text-sm leading-relaxed mb-8">Full system oversight with inventory management, order tracking, revenue reports, and personnel control.</p>
                <div className="flex items-center gap-2 text-blue-400 text-sm font-bold group-hover:gap-4 transition-all">
                  <span>Enter Portal</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '7', label: 'Microservices', icon: 'api' },
              { value: '3', label: 'User Portals', icon: 'group' },
              { value: '24/7', label: 'System Uptime', icon: 'timer' },
              { value: 'Real-time', label: 'Order Tracking', icon: 'gps_fixed' },
            ].map((s, i) => (
              <div key={i} className="text-center py-8">
                <span className="material-symbols-outlined text-[#ffb690] text-3xl mb-4 block">{s.icon}</span>
                <h3 className="text-4xl font-black font-headline text-white tracking-tighter">{s.value}</h3>
                <p className="text-[#aaaab7] text-xs font-bold uppercase tracking-widest mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#464753]/15">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ffb690] flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined text-[#1b1b1f] text-lg">shield</span>
            </div>
            <span className="font-headline font-bold text-lg tracking-tighter">ServeSmart</span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#8e9199] font-bold opacity-60">
            Official CRPF Canteen Application • Microservices Architecture • Secure Portal v2.4
          </p>
        </div>
      </footer>
    </div>
  );
}
