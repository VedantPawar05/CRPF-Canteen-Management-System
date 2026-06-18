'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
}

export function MenuManagement() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
    is_available: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuData, catData] = await Promise.all([
        apiClient.get<MenuItem[]>('/menu'),
        apiClient.get<Category[]>('/menu/categories')
      ]);
      setMenu(menuData);
      setCategories(catData);
    } catch (err) {
      console.error('Failed to load menu data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await apiClient.request(`/menu/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({
             ...formData,
             price: Number(formData.price)
          })
        });
      } else {
        await apiClient.post('/menu', {
          ...formData,
          price: Number(formData.price)
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Operation failed');
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if(window.confirm(`Are you sure you want to permanently delete ${name}?`)) {
      try {
        await apiClient.request(`/menu/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) { alert('Failed to delete item'); }
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      // Find category id
      const cat = categories.find(c => c.name === item.category);
      if(!cat) return;
      
      await apiClient.request(`/menu/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: item.name,
          description: item.description,
          price: item.price,
          category_id: cat.id,
          image_url: item.image,
          is_available: !item.isAvailable
        })
      });
      fetchData();
    } catch (err) { alert('Failed to toggle visibility'); }
  };

  const openEdit = (item: MenuItem) => {
    const cat = categories.find(c => c.name === item.category);
    setFormData({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category_id: cat?.id || '',
      image_url: item.image,
      is_available: item.isAvailable
    });
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: categories[0]?.id || '',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
      is_available: true
    });
    setEditingItem(null);
    setIsModalOpen(true);
  };

  if (loading) return <div className="min-h-screen bg-[#0e0e12] flex items-center justify-center text-white">Loading Menu Editor...</div>;

  return (
    <div className="bg-[#0e0e12] text-[#e2e2e6] font-body min-h-screen">
      <header className="sticky top-0 z-40 bg-[#0e0e12]/80 backdrop-blur-xl border-b border-[#464753]/10">
        <div className="flex justify-between items-center w-full px-8 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <a href="/admin" className="material-symbols-outlined text-[#aaaab7] hover:text-[#ffb690] transition-colors mr-2">arrow_back</a>
            <div className="w-11 h-11 bg-[#ffb690] flex items-center justify-center rounded-xl shadow-xl shadow-[#ffb690]/20">
              <span className="material-symbols-outlined text-[#1b1b1f] text-2xl">restaurant_menu</span>
            </div>
            <div>
              <span className="font-headline font-black text-2xl tracking-tighter text-white">Menu Editor</span>
              <p className="text-[9px] text-[#aaaab7] uppercase tracking-[0.25em] font-bold -mt-0.5">Catalog Control</p>
            </div>
          </div>
          <button onClick={openNew} className="bg-[#ffb690] text-[#1b1b1f] px-6 py-2.5 rounded-xl font-bold font-headline hover:bg-[#ffb690]/90 transition-all flex items-center shadow-lg shadow-[#ffb690]/20">
            <span className="material-symbols-outlined mr-2">add</span>
            Create Item
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="bg-[#131318] rounded-2xl border border-[#464753]/20 overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#464753]/20 bg-[#191920]">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-[#aaaab7]">Item</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-[#aaaab7]">Category</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-[#aaaab7]">Price</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-[#aaaab7]">Visibility</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-[#aaaab7] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#464753]/10">
              {menu.map((item) => (
                <tr key={item.id} className="hover:bg-[#191920] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-[#464753]/20"/>
                      <div>
                        <p className="font-bold text-white text-sm">{item.name}</p>
                        <p className="text-xs text-[#aaaab7] max-w-[200px] truncate">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#aaaab7] font-medium">{item.category}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[#ffb690]">₹{item.price}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleAvailability(item)} className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center w-min whitespace-nowrap transition-all ${item.isAvailable ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
                       <span className="material-symbols-outlined text-[14px] mr-1">{item.isAvailable ? 'visibility' : 'visibility_off'}</span>
                       {item.isAvailable ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => openEdit(item)} className="p-2 text-[#aaaab7] hover:text-white hover:bg-[#2a2b38] rounded-lg transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                       <button onClick={() => handleDelete(item.id, item.name)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#131318] rounded-2xl w-full max-w-md border border-[#464753]/20 shadow-2xl p-6">
            <h3 className="text-2xl font-black font-headline text-white mb-6 tracking-tight">
              {editingItem ? 'Edit Item' : 'New Menu Item'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#aaaab7] uppercase tracking-widest ml-1 block mb-2">Item Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0e0e12] border border-[#464753]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffb690] transition-colors" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#aaaab7] uppercase tracking-widest ml-1 block mb-2">Price (₹)</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-[#0e0e12] border border-[#464753]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffb690] transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#aaaab7] uppercase tracking-widest ml-1 block mb-2">Category</label>
                  <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full bg-[#0e0e12] border border-[#464753]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffb690] transition-colors appearance-none">
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#aaaab7] uppercase tracking-widest ml-1 block mb-2">Description</label>
                <textarea required rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0e0e12] border border-[#464753]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffb690] transition-colors" />
              </div>

              <div>
                <label className="text-xs font-bold text-[#aaaab7] uppercase tracking-widest ml-1 block mb-2">Image URL</label>
                <input required value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-[#0e0e12] border border-[#464753]/30 rounded-xl px-4 py-3 text-[#aaaab7] text-sm focus:outline-none focus:border-[#ffb690] transition-colors" />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#464753]/20 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 text-sm font-bold text-[#aaaab7] hover:bg-[#191920] rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 text-sm font-black text-[#1b1b1f] bg-[#ffb690] hover:bg-[#ffb690]/90 rounded-xl transition-colors">{editingItem ? 'Save Changes' : 'Create Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
