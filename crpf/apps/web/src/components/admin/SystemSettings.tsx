'use client';

import React, { useState } from 'react';

export function SystemSettings() {
  const [settings, setSettings] = useState({
    canteenOpen: true,
    autoAcceptOrders: false,
    lowStockAlerts: true,
    maintenanceMode: false,
    orderLimitPerSoldier: 5000,
  });

  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key] }));
  };

  const saveSettings = () => {
    setSaving(true);
    // Mock save delay
    setTimeout(() => {
      setSaving(false);
      alert('System configuration saved successfully.');
    }, 800);
  };

  return (
    <div className="bg-[#0e0e12] text-[#e2e2e6] font-body min-h-screen">
      <header className="sticky top-0 z-40 bg-[#0e0e12]/80 backdrop-blur-xl border-b border-[#464753]/10">
        <div className="flex justify-between items-center w-full px-8 py-5 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <a href="/admin" className="material-symbols-outlined text-[#aaaab7] hover:text-[#ffb690] transition-colors mr-2">arrow_back</a>
            <div className="w-11 h-11 bg-[#ffb690] flex items-center justify-center rounded-xl shadow-xl shadow-[#ffb690]/20">
              <span className="material-symbols-outlined text-[#1b1b1f] text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <span className="font-headline font-black text-2xl tracking-tighter text-white">System Controls</span>
              <p className="text-[9px] text-[#aaaab7] uppercase tracking-[0.25em] font-bold -mt-0.5">Global Configuration</p>
            </div>
          </div>
          <button 
            onClick={saveSettings} 
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl font-bold font-headline transition-all flex items-center shadow-lg ${saving ? 'bg-[#464753]/50 text-[#aaaab7]' : 'bg-[#ffb690] text-[#1b1b1f] hover:bg-[#ffb690]/90 shadow-[#ffb690]/20'}`}>
            <span className="material-symbols-outlined mr-2">{saving ? 'sync' : 'save'}</span>
            {saving ? 'Applying...' : 'Save Configuration'}
          </button>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto space-y-8">
        
        {/* Operational Status */}
        <section className="bg-[#131318] border border-[#464753]/20 rounded-2xl p-6">
          <h3 className="font-headline text-lg font-black text-white mb-6 flex items-center">
            <span className="material-symbols-outlined text-[#ffb690] mr-2">storefront</span>
            Operational Status
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#464753]/10 pb-6">
              <div>
                <h4 className="font-bold text-white mb-1">Canteen Operations</h4>
                <p className="text-sm text-[#aaaab7]">Master switch to open or forcefully close the digital canteen platform for all soldiers.</p>
              </div>
              <button 
                onClick={() => toggle('canteenOpen')}
                className={`w-14 h-8 rounded-full relative transition-colors ${settings.canteenOpen ? 'bg-green-500' : 'bg-[#464753]'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.canteenOpen ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white mb-1">System Maintenance Mode</h4>
                <p className="text-sm text-[#aaaab7]">Locks out all non-admin personnel. Only turn this on during critical migrations.</p>
              </div>
              <button 
                onClick={() => toggle('maintenanceMode')}
                className={`w-14 h-8 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-[#464753]'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* Order Settings */}
        <section className="bg-[#131318] border border-[#464753]/20 rounded-2xl p-6">
          <h3 className="font-headline text-lg font-black text-white mb-6 flex items-center">
            <span className="material-symbols-outlined text-[#ffb690] mr-2">receipt_long</span>
            Order & Inventory Rules
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#464753]/10 pb-6">
              <div>
                <h4 className="font-bold text-white mb-1">Auto-Accept Orders</h4>
                <p className="text-sm text-[#aaaab7]">Automatically queue orders to the kitchen bypassing manual Admin approval steps.</p>
              </div>
              <button 
                onClick={() => toggle('autoAcceptOrders')}
                className={`w-14 h-8 rounded-full relative transition-colors ${settings.autoAcceptOrders ? 'bg-[#ffb690]' : 'bg-[#464753]'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full ${settings.autoAcceptOrders ? 'bg-[#1b1b1f]' : 'bg-white'} transition-all ${settings.autoAcceptOrders ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between border-b border-[#464753]/10 pb-6">
              <div>
                <h4 className="font-bold text-white mb-1">Low Stock Push Notifications</h4>
                <p className="text-sm text-[#aaaab7]">Emit global WebSocket events to admins when raw tracking drops below 20% max capacity.</p>
              </div>
              <button 
                onClick={() => toggle('lowStockAlerts')}
                className={`w-14 h-8 rounded-full relative transition-colors ${settings.lowStockAlerts ? 'bg-[#ffb690]' : 'bg-[#464753]'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full ${settings.lowStockAlerts ? 'bg-[#1b1b1f]' : 'bg-white'} transition-all ${settings.lowStockAlerts ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white mb-1">Daily Wallet Limit (₹)</h4>
                <p className="text-sm text-[#aaaab7]">Maximum transaction cap per soldier/period.</p>
              </div>
              <input 
                 type="number" 
                 value={settings.orderLimitPerSoldier}
                 onChange={e => setSettings({...settings, orderLimitPerSoldier: Number(e.target.value)})}
                 className="bg-[#0e0e12] border border-[#464753]/30 rounded-xl px-4 py-2 text-white font-bold text-right w-32 focus:border-[#ffb690] focus:outline-none"
              />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
