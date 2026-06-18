'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';

interface KitchenOrder {
  id: string;
  items: string;
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  total_amount: number;
  soldierName: string;
  created_at: string;
}

export function KitchenMonitor() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await apiClient.get<KitchenOrder[]>('/orders/kitchen/live');
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ).filter(order => !['Completed', 'Cancelled'].includes(order.status)));
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const flow = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'];
    const idx = flow.indexOf(currentStatus);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'border-yellow-500/40';
      case 'Accepted': return 'border-blue-500/40';
      case 'Preparing': return 'border-orange-500/40';
      case 'Ready': return 'border-green-500/40';
      default: return 'border-[#464753]/20';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'Accepted': return 'bg-blue-500/20 text-blue-400';
      case 'Preparing': return 'bg-orange-500/20 text-orange-400';
      case 'Ready': return 'bg-green-500/20 text-green-400';
      default: return 'bg-[#464753]/20 text-[#aaaab7]';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e12] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-[#ffb690] animate-pulse mb-4">restaurant</span>
          <p className="text-[#aaaab7] font-bold uppercase tracking-widest text-sm">Loading Kitchen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0e0e12] text-[#e2e2e6] min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0e0e12]/80 backdrop-blur-xl border-b border-[#464753]/10">
        <div className="flex justify-between items-center w-full px-8 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#ffb690] flex items-center justify-center rounded-xl shadow-xl shadow-[#ffb690]/20">
              <span className="material-symbols-outlined text-[#1b1b1f] text-2xl">restaurant</span>
            </div>
            <div>
              <span className="font-headline font-black text-2xl tracking-tighter text-white">Kitchen Command</span>
              <p className="text-[9px] text-[#aaaab7] uppercase tracking-[0.25em] font-bold -mt-0.5">Live Order Monitor</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-[#131318] px-5 py-3 rounded-xl border border-[#464753]/10 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffb690] animate-pulse shadow-[0_0_10px_rgba(255,182,144,0.5)]"></div>
              <span className="text-sm font-bold text-white">{orders.length} Active</span>
            </div>
            <button onClick={logout} className="w-10 h-10 rounded-xl bg-[#464753]/20 flex items-center justify-center text-[#aaaab7] hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-95">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Orders Grid */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            const elapsed = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);

            return (
              <article key={order.id} className={`bg-[#131318] rounded-xl p-6 flex flex-col border-l-4 transition-all duration-300 ${getStatusColor(order.status)} hover:shadow-lg`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <h3 className="font-headline font-extrabold text-lg text-white">#{order.id.slice(-6)}</h3>
                    <p className="text-[#aaaab7] text-sm mt-0.5">{order.soldierName || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#ffb690]">₹{order.total_amount}</div>
                    <div className="flex items-center gap-1 text-xs text-[#aaaab7] mt-1">
                      <span className="material-symbols-outlined text-sm">timer</span>
                      <span>{elapsed}m ago</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 mb-4 bg-[#191920] p-3 rounded-lg">
                  <p className="text-sm text-[#e2e2e6] leading-relaxed">{order.items || 'N/A'}</p>
                </div>

                {nextStatus && (
                  <button
                    onClick={() => updateOrderStatus(order.id, nextStatus)}
                    className="w-full bg-[#ffb690] text-[#1b1b1f] py-3 rounded-lg font-bold uppercase tracking-widest text-sm hover:brightness-110 active:scale-95 transition-all"
                  >
                    Mark as {nextStatus}
                  </button>
                )}
              </article>
            );
          })}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-7xl text-[#464753] mb-4 block">check_circle</span>
            <h3 className="text-2xl font-black font-headline text-white mb-2">All Clear!</h3>
            <p className="text-[#aaaab7] text-sm">No active orders in the queue. Waiting for new orders...</p>
          </div>
        )}
      </main>
    </div>
  );
}
