'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { io, Socket } from 'socket.io-client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function EnhancedAdminPanel() {
  const [isDark, setIsDark] = useState(true);
  const { logout } = useAuth();
  
  const [stats, setStats] = useState({
    todayRevenue: 0,
    activeOrders: 0,
    trend: [] as any[],
    popularItems: [] as { name: string; count: number }[]
  });
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<typeof stats>('/orders/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto refresh graph every few minutes just in case
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Setup Socket for live order count updates
    const newSocket = io('http://localhost:4003');
    setSocket(newSocket);
    newSocket.emit('join_kitchen'); // Admins can join kitchen channel to hear order updates
    
    newSocket.on('new_order', () => fetchStats());
    newSocket.on('order_updated', () => fetchStats());

    return () => { newSocket.disconnect(); }
  }, []);

  return (
    <div className={`${isDark ? 'dark' : ''} bg-[#0e0e12] text-[#e2e2e6] min-h-screen flex selection:bg-[#ffb690]/30 font-body`}>
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#131318] flex flex-col p-4 z-50 border-r border-[#464753]/10">
        <div className="px-4 py-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#ffb690] rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-[#1b1b1f] text-xl font-bold">dashboard_customize</span>
            </div>
            <h1 className="text-lg font-black text-[#ffffff] font-headline tracking-tighter">Admin Portal</h1>
          </div>
          <p className="text-[10px] text-[#aaaab7] font-medium mt-1 ml-11 uppercase tracking-widest">Central Command</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <a className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 bg-[#191920] border-r-2 border-[#ffb690] text-[#ffb690] font-headline" href="/admin">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span>Dashboard</span>
          </a>
          <a className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 text-[#aaaab7] hover:bg-[#2a2b38] font-headline" href="/admin/menu">
            <span className="material-symbols-outlined text-xl">restaurant_menu</span>
            <span>Menu Manager</span>
          </a>
          <a className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 text-[#aaaab7] hover:bg-[#2a2b38] font-headline" href="/admin/inventory">
            <span className="material-symbols-outlined text-xl">inventory_2</span>
            <span>Inventory</span>
          </a>
          <a className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 text-[#aaaab7] hover:bg-[#2a2b38] font-headline" href="/admin/orders">
            <span className="material-symbols-outlined text-xl">receipt_long</span>
            <span>Orders</span>
          </a>
          <a className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 text-[#aaaab7] hover:bg-[#2a2b38] font-headline" href="/admin/personnel">
            <span className="material-symbols-outlined text-xl">group</span>
            <span>Personnel</span>
          </a>
          <a className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 text-[#aaaab7] hover:bg-[#2a2b38] font-headline mt-4 border-t border-[#464753]/20 pt-4" href="/admin/settings">
            <span className="material-symbols-outlined text-xl">settings</span>
            <span>Settings</span>
          </a>
        </nav>
        
        <div className="mt-auto space-y-4">
          <div className="pt-4 border-t border-[#464753]/20 flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#2a2b38] flex items-center justify-center text-[#ffb690]">
                <span className="material-symbols-outlined text-sm">shield_person</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-[#e5e1e6] truncate">Admin User</p>
              <button onClick={logout} className="text-[9px] text-[#ffb4ab] font-bold hover:underline">Logout</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 ml-64 flex flex-col min-w-0 bg-[#0e0e12] min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-40 bg-[#0e0e12]/80 backdrop-blur-xl border-b border-[#464753]/10">
          <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
            <h2 className="font-headline font-bold text-sm tracking-tight text-[#aaaab7]">System Dashboard / <span className="text-[#ffb690]">Overview</span></h2>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-3xl font-black tracking-tight text-white font-headline">Command Interface</h3>
              <p className="text-[#aaaab7] text-sm">Real-time performance metrics</p>
            </div>
          </section>

          {/* Metrics Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 bg-[#131318] border border-[#ffb690]/20 p-8 rounded-2xl relative overflow-hidden group shadow-lg">
              <span className="text-[#aaaab7] font-bold tracking-widest uppercase text-[10px]">Total Revenue Today</span>
              <div className="flex items-baseline space-x-4 mt-2">
                <h4 className="text-6xl font-black font-headline text-white">₹{stats.todayRevenue.toLocaleString()}</h4>
                <div className="flex items-center text-green-400 text-sm font-bold bg-green-400/10 px-2 py-1 rounded-lg animate-pulse">
                  <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                  Live Updated
                </div>
              </div>
            </div>

            <div className="bg-[#131318] border border-[#464753]/20 p-6 rounded-2xl flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffb690]/5 rounded-bl-[100px] pointer-events-none"></div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#ffb690]/10 flex items-center justify-center text-[#ffb690] mb-6">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <span className="text-[#aaaab7] font-bold text-[10px] uppercase tracking-wider">Active Processing Orders</span>
                <p className="text-5xl font-black font-headline text-white mt-2">{stats.activeOrders}</p>
              </div>
            </div>
          </section>
          
           {/* Analytics Grid */}
           <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Chart Section */}
             <div className="lg:col-span-2 bg-[#131318] border border-[#464753]/20 p-8 rounded-2xl">
                 <div className="mb-6 flex justify-between items-center">
                     <h4 className="text-lg font-bold font-headline text-white flex items-center tracking-tight">
                       <span className="w-1 h-5 bg-[#ffb690] rounded-full mr-3"></span>
                       7-Day Revenue Trend
                     </h4>
                 </div>
                 
                 <div className="h-[300px] w-full mt-4">
                    {stats.trend.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ffb690" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ffb690" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke="#464753" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#464753" fontSize={12} tickFormatter={(v) => `₹${v}`} axisLine={false} tickLine={false} />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#1b1b1f', border: '1px solid #464753', borderRadius: '8px' }}
                             itemStyle={{ color: '#ffb690', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#ffb690" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                          <p className="text-[#aaaab7] animate-pulse">Loading analytics...</p>
                      </div>
                    )}
                 </div>
             </div>

             {/* Popular Items Podium */}
             <div className="bg-[#131318] border border-[#464753]/20 p-8 rounded-2xl flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffb690]/5 rounded-bl-[200px] pointer-events-none"></div>
                <h4 className="text-lg font-bold font-headline text-white flex items-center tracking-tight mb-8">
                  <span className="w-1 h-5 bg-green-400 rounded-full mr-3"></span>
                  Top Trending Items
                </h4>
                
                <div className="flex-1 flex flex-col gap-4">
                  {stats.popularItems && stats.popularItems.length > 0 ? (
                    stats.popularItems.map((item, index) => (
                      <div key={item.name} className="flex items-center p-3 rounded-xl bg-[#0e0e12] border border-[#464753]/10 hover:border-[#ffb690]/30 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-[#191920] flex items-center justify-center text-[#ffb690] font-black mr-4 text-xs font-headline border border-[#464753]/20">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-white">{item.name}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black bg-green-500/10 text-green-400 px-2 py-1 rounded">
                            {item.count} sold
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-[#aaaab7] text-xs font-medium uppercase tracking-widest text-center">No sufficient data<br/>yet to build trends</p>
                    </div>
                  )}
                </div>
             </div>
           </section>

        </div>
      </main>
    </div>
  );
}
