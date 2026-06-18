'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

export interface AdminOrder {
  id: string;
  soldierName: string;
  pno: string;
  items: string;
  total: number;
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  date: string;
  time: string;
  payment: string;
}

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-[#ffb690]/10 text-[#ffb690]',
  Accepted: 'bg-blue-500/10 text-blue-400',
  Preparing: 'bg-yellow-500/10 text-yellow-400',
  Ready: 'bg-green-500/10 text-green-400',
  Completed: 'bg-[#464753]/20 text-[#aaaab7]',
  Cancelled: 'bg-red-500/10 text-red-400',
};

export function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await apiClient.get<AdminOrder[]>('/orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load admin orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.put(`/orders/${id}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const statuses = ['All', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
  const filtered = orders.filter(o => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesSearch = (o.soldierName || '').toLowerCase().includes(searchQuery.toLowerCase()) || String(o.id).includes(searchQuery) || (o.pno || '').includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const todayRevenue = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0);
  const activeCount = orders.filter(o => ['Pending', 'Accepted', 'Preparing', 'Ready'].includes(o.status)).length;

  return (
    <div className="min-h-screen bg-[#0e0e12] text-[#aaaab7]">
      <main className="min-h-screen flex flex-col">
        <header className="flex justify-between items-center w-full px-8 h-20 bg-[#131318] tonal-shift sticky top-0 z-40 shadow-[0_32px_64px_rgba(0,0,0,0.1)] border-b border-[#464753]/10">
          <div className="flex items-center gap-4">
            <a href="/admin" className="material-symbols-outlined text-[#aaaab7] hover:text-[#ffb690] transition-colors">arrow_back</a>
            <h1 className="text-xl font-black font-headline text-[#ffb690] tracking-tighter">Order Management</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-[#191920] px-4 py-2 rounded-lg border border-[#464753]/20 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs font-bold text-white">{activeCount} Active</span>
            </div>
            <div className="bg-[#191920] px-4 py-2 rounded-lg border border-[#464753]/20">
              <span className="text-xs font-bold text-[#ffb690]">₹{todayRevenue.toLocaleString()} Today</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#aaaab7]/50">search</span>
              <input className="w-full bg-[#131318] border border-[#464753]/20 rounded-lg py-3 pl-12 pr-4 focus:ring-1 focus:ring-[#ffb690] text-sm text-white placeholder-[#aaaab7]/30" placeholder="Search by name, ID, or PNO..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {statuses.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 ${
                  statusFilter === s ? 'bg-[#ffb690] text-[#131318]' : 'bg-[#131318] text-[#aaaab7] border border-[#464753]/20 hover:bg-[#191920]'
                }`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-[#131318] rounded-xl border border-[#464753]/15 overflow-hidden tonal-shift">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#464753]/15">
                    {['Order ID', 'Soldier', 'Items', 'Total', 'Status', 'Payment', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-[9px] font-black text-[#aaaab7] uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => (
                    <tr key={order.id} className="border-b border-[#464753]/5 hover:bg-[#191920] transition-colors">
                      <td className="px-5 py-4 text-sm font-black text-[#ffb690] font-headline">{order.id}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-white">{order.soldierName}</p>
                        <p className="text-[10px] text-[#aaaab7] mt-0.5">{order.pno}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-[#aaaab7] max-w-[200px] truncate">{order.items}</td>
                      <td className="px-5 py-4 text-sm font-bold text-white">₹{order.total}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>{order.status}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-[#aaaab7]">{order.payment}</td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-[#aaaab7]">{order.date}</p>
                        <p className="text-[10px] text-[#464753]">{order.time}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          {order.status === 'Pending' && <button onClick={() => updateStatus(order.id, 'Accepted')} className="px-3 py-1.5 bg-[#ffb690] text-[#131318] text-[9px] font-black uppercase rounded hover:brightness-110 active:scale-95">Accept</button>}
                          {order.status === 'Preparing' && <button onClick={() => updateStatus(order.id, 'Ready')} className="px-3 py-1.5 bg-green-500/20 text-green-400 text-[9px] font-black uppercase rounded hover:bg-green-500/30 active:scale-95">Ready</button>}
                          <button className="p-1.5 hover:bg-[#2a2b38] rounded transition-colors"><span className="material-symbols-outlined text-[#aaaab7] text-lg">more_vert</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
