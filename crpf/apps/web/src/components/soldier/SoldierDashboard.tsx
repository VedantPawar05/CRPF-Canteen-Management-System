'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { io, Socket } from 'socket.io-client';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  rating: number;
  prepTime: string;
  isAvailable: boolean;
}

export function SoldierDashboard() {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [ordersRes, menuRes] = await Promise.all([
          apiClient.get<Order[]>('/orders', { params: { userId: user?.id, status: 'Pending,Accepted,Preparing,Ready' } }),
          apiClient.get<MenuItem[]>('/menu')
        ]);
        setActiveOrders(ordersRes);
        setMenuItems(menuRes.slice(0, 6)); // Show first 6 items
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        console.error('Failed to fetch data:', err);
        
        if (errorMessage.includes('Invalid or expired token')) {
          logout();
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, logout]);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const newSocket = io('http://localhost:4003'); // Order service WebSocket
    setSocket(newSocket);

    if (user) {
      newSocket.emit('join_user', user.id);
    }

    newSocket.on('order_updated', (updatedOrder: Order) => {
      setActiveOrders(prev => {
        const existing = prev.find(o => o.id === updatedOrder.id);
        if (existing) {
          return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        } else if (['Pending', 'Accepted', 'Preparing', 'Ready'].includes(updatedOrder.status)) {
          return [updatedOrder, ...prev];
        }
        return prev;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const fetchQR = async (orderId: string) => {
    try {
      const data = await apiClient.get(`/orders/${orderId}/qr`);
      setQrData(data);
      setShowQR(true);
    } catch (err) {
      console.error('Failed to fetch QR:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'Accepted': return 'bg-blue-500/20 text-blue-400';
      case 'Preparing': return 'bg-orange-500/20 text-orange-400';
      case 'Ready': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0e0e12] flex items-center justify-center text-white">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0e0e12] flex items-center justify-center text-white p-6">
        <div className="bg-[#191920] rounded-2xl p-8 border border-red-500/20 max-w-md">
          <span className="material-symbols-outlined text-red-400 text-5xl block mx-auto mb-4">error</span>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-[#aaaab7] text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-lg bg-[#ffb690] text-[#131318] font-bold hover:brightness-110 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`font-body text-on-surface antialiased pb-32 transition-colors duration-300 ${isDark ? 'dark bg-brand-dark text-gray-200' : 'bg-background'}`}>
      <header className="sticky top-0 z-50 bg-surface/80 dark:bg-brand-dark/80 backdrop-blur-md border-b border-surface-container-highest dark:border-white/5">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex flex-col">
            <span className="text-on-surface-variant dark:text-gray-400 font-label text-[10px] uppercase tracking-[0.2em] font-bold">Base Alpha-1</span>
            <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-brand-gold font-headline">Tactile Curator</h1>
          </div>
          <div className="flex gap-3">
            <button 
              className="w-10 h-10 rounded-xl bg-surface-container-low dark:bg-white/5 flex items-center justify-center text-on-surface-variant dark:text-gray-300 hover:opacity-80 transition-all active:scale-95" 
              onClick={() => setIsDark(!isDark)}
            >
              <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button className="w-10 h-10 rounded-xl bg-surface-container-low dark:bg-white/5 flex items-center justify-center text-on-surface-variant dark:text-gray-300 hover:opacity-80 transition-all active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button onClick={logout} className="w-10 h-10 rounded-xl bg-surface-container-low dark:bg-white/5 flex items-center justify-center text-on-surface-variant dark:text-gray-300 hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-95">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 space-y-8 mt-6">
        {activeOrders.length > 0 && (
          <section id="active-order">
            <div className="tactile-outset bg-surface-container-lowest dark:bg-brand-surface rounded-2xl p-6 relative overflow-hidden border border-white/50 dark:border-white/5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 dark:bg-brand-gold/5 rounded-full -mr-20 -mt-20"></div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full ${getStatusColor(activeOrders[0].status)} font-label text-[10px] font-extrabold uppercase tracking-widest mb-3`}>
                    {activeOrders[0].status}
                  </span>
                  <h2 className="font-headline font-extrabold text-2xl text-on-surface dark:text-white">
                    {activeOrders[0].items.split(', ')[0] || 'Your Order'}
                  </h2>
                  <p className="text-on-surface-variant dark:text-gray-400 text-sm mt-1">
                    Order #{activeOrders[0].id.slice(-4)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block font-headline font-bold text-lg text-slate-700 dark:text-brand-gold">
                    ₹{activeOrders[0].total_amount}
                  </span>
                  <span className="text-[10px] text-outline dark:text-gray-500 font-bold uppercase tracking-widest">
                    {new Date(activeOrders[0].created_at).toLocaleTimeString()}
                  </span>
                  {activeOrders[0].status === 'Ready' && (
                    <button 
                      onClick={() => fetchQR(activeOrders[0].id)}
                      className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-xs font-bold"
                    >
                      Show QR
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="relative" id="categories">
          <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar border-none">
            <Link href="/soldier/menu" className="shrink-0 bg-primary dark:bg-brand-gold px-8 py-3 rounded-2xl text-on-primary dark:text-brand-dark font-headline font-bold text-sm shadow-xl shadow-primary/20 dark:shadow-brand-gold/10 active:scale-95 transition-all">
              Browse Menu
            </Link>
          </div>
        </section>

        <section id="menu-grid">
          <h3 className="text-xl font-bold mb-4 text-on-surface dark:text-white">Popular Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {menuItems.map((item) => (
              <div key={item.id} className="group bg-surface-container-lowest dark:bg-brand-surface rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-brand-gold/5 hover:-translate-y-1 border border-transparent dark:border-white/5">
                <div className="relative h-64 overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.image || 'https://via.placeholder.com/300'} alt={item.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 left-4 bg-white/95 dark:bg-brand-dark/95 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg">
                    <span className="text-on-surface dark:text-brand-gold font-headline font-black text-sm">₹{item.price}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-headline font-extrabold text-xl leading-tight dark:text-white">{item.name}</h3>
                  </div>
                  <p className="text-on-surface-variant dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-6">{item.description}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <Link href="/soldier/menu" className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dim dark:from-brand-gold dark:to-orange-400 text-on-primary dark:text-brand-dark flex items-center justify-center shadow-lg shadow-primary/20 dark:shadow-brand-gold/20 active:scale-90 transition-all">
                      <span className="material-symbols-outlined font-bold">add</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#131318]/80 dark:bg-brand-dark/90 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.3)] rounded-t-2xl border-t border-[#464753]/15">
        <Link href="/soldier" className="flex flex-col items-center justify-center text-[#ffb690] dark:text-brand-dark rounded-xl px-4 py-1.5 transition-transform scale-90 active:scale-100">
          <span className="material-symbols-outlined fill-1">storefront</span>
          <span className="font-headline text-[10px] uppercase tracking-widest font-bold mt-0.5">Canteen</span>
        </Link>
        <Link href="/soldier/orders" className="flex flex-col items-center justify-center text-[#aaaab7] px-4 py-1.5 transition-transform scale-90 active:scale-100 hover:text-brand-gold">
          <span className="material-symbols-outlined">shopping_bag</span>
          <span className="font-headline text-[10px] uppercase tracking-widest font-bold mt-0.5">My Orders</span>
        </Link>
      </nav>

      {/* QR Modal */}
      {showQR && qrData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#131318] p-8 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-center">Payment QR Code</h3>
            <div className="text-center mb-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                {/* Placeholder for QR code - in production, use a QR library */}
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                  UPI QR Code<br/>
                  Scan to Pay<br/>
                  Amount: ₹{qrData.amount}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <p>Order ID: {qrData.orderId}</p>
              <p>Amount: ₹{qrData.amount}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowQR(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded"
              >
                Close
              </button>
              <button className="flex-1 bg-green-500 text-white py-2 rounded">
                Mark as Paid & Collected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
