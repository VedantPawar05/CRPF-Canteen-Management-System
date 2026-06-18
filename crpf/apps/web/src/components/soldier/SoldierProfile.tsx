'use client';

import React, { useState } from 'react';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  time: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'debit', amount: 160, description: 'Butter Chicken Thali + Chai', date: '14 Apr', time: '15:30' },
  { id: '2', type: 'credit', amount: 500, description: 'Wallet Top-Up (UPI)', date: '14 Apr', time: '10:00' },
  { id: '3', type: 'debit', amount: 150, description: 'Chicken Biryani', date: '13 Apr', time: '14:15' },
  { id: '4', type: 'debit', amount: 210, description: 'Paneer Roll + Cold Coffee', date: '13 Apr', time: '19:45' },
  { id: '5', type: 'credit', amount: 1000, description: 'Monthly Allowance Credit', date: '10 Apr', time: '09:00' },
  { id: '6', type: 'debit', amount: 180, description: 'Thali Combo Special', date: '10 Apr', time: '13:20' },
];

export function SoldierProfile() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'profile' | 'settings'>('wallet');

  const balance = 1340;
  const monthSpent = 700;
  const monthBudget = 3000;

  return (
    <div className="min-h-screen bg-[#0e0e12] text-[#f4f4f5] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#783200]/30 to-[#0e0e12] pb-8">
        <header className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-8">
            <a href="/soldier" className="material-symbols-outlined text-[#aaaab7] hover:text-[#ffb690] transition-colors">arrow_back</a>
            <button className="p-2 hover:bg-[#2a2b38] rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[#aaaab7]">settings</span>
            </button>
          </div>
          {/* Profile Card */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#191920] border-2 border-[#ffb690]/30 mx-auto flex items-center justify-center mb-4 shadow-xl shadow-[#ffb690]/10">
              <span className="material-symbols-outlined text-[#ffb690] text-4xl">person</span>
            </div>
            <h1 className="text-xl font-black font-headline text-white tracking-tight">Havildar Rajesh Kumar</h1>
            <p className="text-xs text-[#aaaab7] mt-1 uppercase tracking-widest">PNO: 091234567 • 42nd Battalion</p>
          </div>
        </header>

        {/* Wallet Balance Card */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-[#131318] rounded-2xl p-6 border border-[#464753]/20 tonal-shift">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb690]">account_balance_wallet</span>
                <span className="text-xs font-bold text-[#aaaab7] uppercase tracking-widest">Wallet Balance</span>
              </div>
              <button className="px-4 py-2 bg-[#ffb690] text-[#131318] text-[10px] font-black uppercase tracking-widest rounded-lg shadow-[0_4px_12px_rgba(255,182,144,0.2)] hover:brightness-110 active:scale-95 transition-all">
                Top Up
              </button>
            </div>
            <h2 className="text-4xl font-black font-headline text-white tracking-tighter mb-4">₹{balance.toLocaleString()}<span className="text-lg text-[#aaaab7]">.00</span></h2>
            
            {/* Monthly Spending Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-[#aaaab7] uppercase tracking-widest">Monthly Spend</span>
                <span className="text-white">₹{monthSpent} / ₹{monthBudget}</span>
              </div>
              <div className="h-2 bg-[#191920] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#ffb690]/60 to-[#ffb690] rounded-full transition-all duration-500" style={{ width: `${(monthSpent / monthBudget) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto px-6 mt-6">
        <div className="flex gap-1 bg-[#131318] p-1 rounded-xl border border-[#464753]/10">
          {(['wallet', 'profile', 'settings'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-[#191920] text-[#ffb690] shadow-md' : 'text-[#aaaab7] hover:text-white'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-6">
        {activeTab === 'wallet' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Recent Transactions</h3>
              <span className="text-[10px] text-[#aaaab7] font-bold uppercase tracking-widest">This Month</span>
            </div>
            {MOCK_TRANSACTIONS.map(tx => (
              <div key={tx.id} className="bg-[#131318] rounded-xl p-4 border border-[#464753]/10 flex items-center gap-4 tonal-shift">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/10 text-green-400' : 'bg-[#ffb690]/10 text-[#ffb690]'}`}>
                  <span className="material-symbols-outlined text-lg">{tx.type === 'credit' ? 'south_west' : 'north_east'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{tx.description}</p>
                  <p className="text-[10px] text-[#aaaab7] mt-0.5">{tx.date} • {tx.time}</p>
                </div>
                <span className={`text-sm font-black font-headline ${tx.type === 'credit' ? 'text-green-400' : 'text-white'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-[#131318] rounded-2xl p-6 border border-[#464753]/15 space-y-5 tonal-shift">
              <h3 className="text-sm font-bold text-[#ffb690] uppercase tracking-widest mb-4">Personal Details</h3>
              {[
                { label: 'Full Name', value: 'Rajesh Kumar', icon: 'person' },
                { label: 'PNO', value: '091234567', icon: 'badge' },
                { label: 'Rank', value: 'Havildar', icon: 'military_tech' },
                { label: 'Battalion', value: '42nd Battalion, CRPF', icon: 'groups' },
                { label: 'Unit Location', value: 'Sector 14, New Delhi', icon: 'location_on' },
                { label: 'Contact', value: '+91 98765 43210', icon: 'phone' },
              ].map(field => (
                <div key={field.label} className="flex items-center gap-4 py-3 border-b border-[#464753]/10 last:border-none">
                  <span className="material-symbols-outlined text-[#464753] text-lg">{field.icon}</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-[#aaaab7] font-bold uppercase tracking-widest">{field.label}</p>
                    <p className="text-sm font-medium text-white mt-0.5">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-[#131318] rounded-2xl border border-[#464753]/15 overflow-hidden tonal-shift">
              {[
                { icon: 'notifications', label: 'Push Notifications', desc: 'Order status & alerts', toggle: true },
                { icon: 'wifi_off', label: 'Offline Mode', desc: 'Enable offline ordering', toggle: true },
                { icon: 'dark_mode', label: 'Dark Mode', desc: 'Always dark theme', toggle: false },
                { icon: 'language', label: 'Language', desc: 'Hindi / English', toggle: false },
              ].map((s, idx) => (
                <div key={s.label} className={`flex items-center gap-4 p-5 ${idx < 3 ? 'border-b border-[#464753]/10' : ''}`}>
                  <span className="material-symbols-outlined text-[#ffb690] text-xl">{s.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{s.label}</p>
                    <p className="text-[10px] text-[#aaaab7] mt-0.5">{s.desc}</p>
                  </div>
                  {s.toggle ? (
                    <div className="w-11 h-6 bg-[#ffb690] rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-[#131318] rounded-full absolute top-0.5 right-0.5 shadow-md"></div>
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-[#464753]">chevron_right</span>
                  )}
                </div>
              ))}
            </div>
            <button className="w-full py-4 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm border border-red-500/20 hover:bg-red-500/20 active:scale-[0.98] transition-all mt-6 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">logout</span> Logout
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
