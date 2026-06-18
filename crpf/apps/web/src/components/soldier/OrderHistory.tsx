'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';

export interface Order {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  date: string;
  time: string;
  paymentMethod: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  Pending: { bg: 'bg-[#ffb690]/10', text: 'text-[#ffb690]', icon: 'schedule' },
  Accepted: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: 'check_circle' },
  Preparing: { bg: 'bg-[#ffb690]/10', text: 'text-[#ffb690]', icon: 'skillet' },
  Ready: { bg: 'bg-green-500/10', text: 'text-green-400', icon: 'notifications_active' },
  Completed: { bg: 'bg-[#464753]/20', text: 'text-[#aaaab7]', icon: 'task_alt' },
  Cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', icon: 'cancel' },
};

export function OrderHistory() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      try {
        const data = await apiClient.get<Order[]>('/orders');
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const filters = ['All', 'Active', 'Completed', 'Cancelled'];
  const filtered = orders.filter(o => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') return ['Pending', 'Accepted', 'Preparing', 'Ready'].includes(o.status);
    return o.status === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#0e0e12] text-[#f4f4f5] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0e0e12]/95 backdrop-blur-xl border-b border-[#464753]/10">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <a href="/soldier" className="material-symbols-outlined text-[#aaaab7] hover:text-[#ffb690] transition-colors">arrow_back</a>
            <h1 className="text-xl font-black font-headline text-[#ffb690] tracking-tighter">Order History</h1>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  activeFilter === f ? 'bg-[#ffb690] text-[#131318]' : 'bg-[#191920] text-[#aaaab7] border border-[#464753]/20'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6 space-y-4">
        {filtered.map(order => {
          const cfg = STATUS_CONFIG[order.status];
          const isExpanded = expandedOrder === order.id;
          return (
            <div key={order.id}
              className="bg-[#131318] rounded-2xl border border-[#464753]/15 overflow-hidden transition-all tonal-shift"
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
              <div className="p-5 cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-white font-headline">{order.id}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {order.status}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[#464753] text-lg transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : '' }}>expand_more</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#aaaab7]">
                    <span>{order.date}</span>
                    <span className="mx-2 opacity-40">•</span>
                    <span>{order.time}</span>
                  </div>
                  <span className="text-base font-black text-white font-headline">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-[#464753]/10 p-5 bg-[#0e0e12]/50 space-y-4 animate-in slide-in-from-top-2">
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-[#ffb690] bg-[#ffb690]/10 w-6 h-6 rounded flex items-center justify-center">{item.quantity}×</span>
                          <span className="text-sm font-medium text-white">{item.name}</span>
                        </div>
                        <span className="text-sm text-[#aaaab7]">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-[#464753]/15">
                    <div className="flex items-center gap-2 text-xs text-[#aaaab7]">
                      <span className="material-symbols-outlined text-base">payment</span>
                      <span>{order.paymentMethod}</span>
                    </div>
                    {['Pending', 'Accepted', 'Preparing', 'Ready'].includes(order.status) && (
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 ${cfg.text}`}>
                          <span className="material-symbols-outlined text-base">{cfg.icon}</span>
                          <span className="text-xs font-bold">{order.status}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {order.status === 'Completed' && (
                    <button className="w-full mt-2 py-3 rounded-xl bg-[#191920] text-[#ffb690] font-bold text-xs uppercase tracking-widest border border-[#464753]/20 hover:bg-[#2a2b38] active:scale-[0.98] transition-all">
                      Reorder
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-[#464753] mb-4">receipt_long</span>
            <p className="text-[#aaaab7] font-bold">No orders found</p>
          </div>
        )}
      </main>
    </div>
  );
}
