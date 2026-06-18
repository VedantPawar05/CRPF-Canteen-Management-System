'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  maxStock: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image: string;
}

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await apiClient.get<InventoryItem[]>('/inventory');
      setInventory(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(inventory.map(item => item.category)))];

  const filteredInventory = selectedCategory === 'All' 
    ? inventory 
    : inventory.filter(item => item.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'text-green-400 bg-green-500/10';
      case 'Low Stock': return 'text-yellow-400 bg-yellow-500/10';
      case 'Out of Stock': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0e0e12] flex items-center justify-center text-white">Loading inventory...</div>;
  }

  return (
    <div className="bg-[#0e0e12] text-[#e2e2e6] font-body min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0e0e12]/80 backdrop-blur-xl border-b border-[#464753]/10">
        <div className="flex justify-between items-center w-full px-8 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#ffb690] flex items-center justify-center rounded-xl shadow-xl shadow-[#ffb690]/20">
              <span className="material-symbols-outlined text-[#1b1b1f] text-2xl">inventory_2</span>
            </div>
            <div>
              <span className="font-headline font-black text-2xl tracking-tighter text-white">Inventory Management</span>
              <p className="text-[9px] text-[#aaaab7] uppercase tracking-[0.25em] font-bold -mt-0.5">Stock Control</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8 max-w-7xl mx-auto">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#ffb690] text-[#1b1b1f]'
                    : 'bg-[#464753]/20 text-[#aaaab7] hover:bg-[#464753]/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((item) => (
            <div key={item.id} className="bg-[#131318] rounded-xl p-6 border border-[#464753]/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white mb-1">{item.name}</h3>
                  <p className="text-[#aaaab7] text-sm">{item.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#aaaab7]">Stock Level</span>
                  <span className="text-white font-bold">{item.stockLevel} / {item.maxStock}</span>
                </div>
                <div className="w-full bg-[#464753]/20 rounded-full h-2">
                  <div 
                    className={`${item.stockLevel < item.maxStock * 0.2 ? 'bg-red-500' : 'bg-[#ffb690]'} h-2 rounded-full transition-all`}
                    style={{ width: `${Math.min((item.stockLevel / item.maxStock) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-[#464753]/20">
                  <div className="flex flex-col">
                    <span className="text-[#aaaab7] text-xs">Price</span>
                    <span className="text-[#ffb690] font-bold">₹{item.price}</span>
                  </div>
                  <button 
                    onClick={async () => {
                      const qty = prompt(`How many units to restock for ${item.name}?`);
                      if (qty && !isNaN(Number(qty))) {
                         try {
                           await apiClient.request(`/inventory/${item.id}/restock`, { 
                             method: 'PATCH', 
                             body: JSON.stringify({ quantity: Number(qty) }) 
                           });
                           fetchInventory();
                         } catch (err) { alert('Failed to restock'); }
                      }
                    }}
                    className="px-4 py-2 bg-[#ffb690]/10 text-[#ffb690] text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#ffb690]/20 transition-all active:scale-95 flex items-center">
                    <span className="material-symbols-outlined text-[14px] mr-1">add_shopping_cart</span>
                    Restock
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-[#464753] mb-4">inventory_2</span>
            <h3 className="text-xl font-bold text-[#aaaab7] mb-2">No Items Found</h3>
            <p className="text-[#666] text-sm">Try selecting a different category</p>
          </div>
        )}
      </main>
    </div>
  );
}
