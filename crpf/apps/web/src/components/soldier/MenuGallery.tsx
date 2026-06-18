'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';

export interface MenuItem {
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



interface CartItem extends MenuItem {
  quantity: number;
}

export function MenuGallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, logout } = useAuth();

  useEffect(() => {
    async function loadMenu() {
      try {
        const [menuData, catData] = await Promise.all([
          apiClient.get<MenuItem[]>('/menu'),
          apiClient.get<{name: string}[]>('/menu/categories')
        ]);
        setMenuItems(menuData);
        setCategories(['All', ...catData.map(c => c.name)]);
      } catch (err) {
        console.error('Failed to load menu:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMenu();
  }, []);

  const filtered = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing && existing.quantity > 1) return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
      return prev.filter(c => c.id !== id);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const submitOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await apiClient.post('/orders', {
        items: cart.map(c => ({ menuItemId: c.id, quantity: c.quantity }))
      });
      setCart([]);
      setShowCart(false);
      alert('Order placed successfully!');
    } catch (err) {
      console.error('Checkout failed', err);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e12] text-[#f4f4f5] pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0e0e12]/95 backdrop-blur-xl border-b border-[#464753]/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <a href="/soldier" className="material-symbols-outlined text-[#aaaab7] hover:text-[#ffb690] transition-colors">arrow_back</a>
              <h1 className="text-xl font-black font-headline text-[#ffb690] tracking-tighter">Menu</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowCart(!showCart)} className="relative p-2 bg-[#191920] rounded-xl border border-[#464753]/20 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[#ffb690]">shopping_cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ffb690] text-[#131318] rounded-full text-[10px] font-black flex items-center justify-center">{cartCount}</span>
                )}
              </button>
              <button onClick={logout} className="p-2 border border-[#464753]/20 bg-[#191920] rounded-xl hover:bg-[#ffb4ab]/10 hover:text-[#ffb4ab] hover:border-[#ffb4ab]/30 transition-all text-[#aaaab7]">
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          </div>
          {/* Search */}
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#aaaab7]/50">search</span>
            <input
              className="w-full bg-[#131318] border-none rounded-xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-[#ffb690]/40 text-sm text-white placeholder-[#aaaab7]/40"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  activeCategory === cat
                    ? 'bg-[#ffb690] text-[#131318] shadow-[0_4px_12px_rgba(255,182,144,0.25)]'
                    : 'bg-[#191920] text-[#aaaab7] border border-[#464753]/20 hover:bg-[#2a2b38]'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(item => {
            const inCart = cart.find(c => c.id === item.id);
            return (
              <div key={item.id} className={`bg-[#131318] rounded-2xl overflow-hidden border transition-all group tonal-shift ${
                !item.isAvailable ? 'opacity-50 border-[#464753]/10' : 'border-[#464753]/20 hover:border-[#ffb690]/30'
              }`}>
                <div className="h-48 w-full relative bg-[#0e0e12] overflow-hidden">
                  <img className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" src={item.image} alt={item.name} />
                  {/* Veg/Non-veg badge */}
                  <div className={`absolute top-3 left-3 w-5 h-5 rounded border-2 flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-[#0e0e12]/60 flex items-center justify-center">
                      <span className="text-xs font-black text-[#ffb4ab] uppercase tracking-widest bg-[#0e0e12]/80 px-4 py-2 rounded-lg">Unavailable</span>
                    </div>
                  )}
                  {/* Prep time */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#0e0e12]/80 backdrop-blur-md px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-[#ffb690] text-xs">schedule</span>
                    <span className="text-[10px] font-bold text-white">{item.prepTime}</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-black text-[#ffb690] uppercase tracking-[0.15em] opacity-80">{item.category}</p>
                      <div className="flex items-center gap-0.5 ml-auto">
                        <span className="material-symbols-outlined text-[#ffb690] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-[10px] font-bold text-white">{item.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                    <p className="text-[11px] text-[#aaaab7] mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#464753]/15">
                    <span className="text-lg font-black text-white font-headline">₹{item.price}</span>
                    {item.isAvailable && (
                      inCart ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-lg bg-[#191920] text-[#aaaab7] flex items-center justify-center hover:bg-[#2a2b38] active:scale-95 transition-all border border-[#464753]/20">
                            <span className="material-symbols-outlined text-lg">remove</span>
                          </button>
                          <span className="text-sm font-black text-[#ffb690] w-6 text-center">{inCart.quantity}</span>
                          <button onClick={() => addToCart(item)} className="w-8 h-8 rounded-lg bg-[#ffb690] text-[#131318] flex items-center justify-center hover:brightness-110 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-lg">add</span>
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(item)} className="px-4 py-2 rounded-lg bg-[#ffb690] text-[#131318] text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_12px_rgba(255,182,144,0.2)]">
                          Add
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#0e0e12]/90 backdrop-blur-xl border-t border-[#464753]/20">
          <div className="max-w-7xl mx-auto">
            <button onClick={() => setShowCart(true)} className="w-full bg-[#ffb690] text-[#131318] py-4 rounded-2xl font-headline font-extrabold text-base flex items-center justify-between px-6 shadow-[0_-8px_32px_rgba(255,182,144,0.2)] hover:brightness-110 active:scale-[0.99] transition-all">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">shopping_cart</span>
                <span>{cartCount} item{cartCount > 1 ? 's' : ''}</span>
              </div>
              <span>₹{cartTotal.toFixed(2)} →</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-[#0e0e12]/90 backdrop-blur-xl flex items-end md:items-center justify-center" onClick={() => setShowCart(false)}>
          <div className="bg-[#131318] w-full max-w-lg rounded-t-3xl md:rounded-2xl border border-[#464753]/20 p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black font-headline text-white tracking-tight">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-[#2a2b38] rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[#aaaab7]">close</span>
              </button>
            </div>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-[#464753] mb-3">shopping_cart</span>
                <p className="text-[#aaaab7] text-sm">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-[#191920] p-4 rounded-xl border border-[#464753]/10">
                      <img className="w-14 h-14 rounded-lg object-cover" src={item.image} alt={item.name} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                        <p className="text-xs text-[#aaaab7]">₹{item.price} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded bg-[#0e0e12] text-[#aaaab7] flex items-center justify-center active:scale-95 transition-all">
                          <span className="material-symbols-outlined text-base">remove</span>
                        </button>
                        <span className="text-sm font-black text-[#ffb690] w-5 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="w-7 h-7 rounded bg-[#ffb690] text-[#131318] flex items-center justify-center active:scale-95 transition-all">
                          <span className="material-symbols-outlined text-base">add</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#464753]/20 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#aaaab7]">Subtotal</span>
                    <span className="font-bold text-white">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#aaaab7]">Service Charge</span>
                    <span className="font-bold text-white">₹0.00</span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-[#464753]/20">
                    <span className="font-bold text-white">Total</span>
                    <span className="font-black text-[#ffb690] font-headline">₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={submitOrder}
                  disabled={isSubmitting}
                  className="w-full mt-6 py-4 rounded-2xl bg-[#ffb690] text-[#131318] font-headline font-extrabold text-base shadow-[0_8px_24px_rgba(255,182,144,0.25)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {isSubmitting ? 'Processing...' : 'Place Order'} <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
