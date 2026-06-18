'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface PersonnelMember {
  id: string;
  name: string;
  pno: string;
  role: 'soldier' | 'kitchen' | 'admin';
  created_at: string;
}

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  soldier: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  kitchen: { bg: 'bg-[#ffb690]/10', text: 'text-[#ffb690]' },
  admin: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
};

export function PersonnelManagement() {
  const [personnel, setPersonnel] = useState<PersonnelMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  // Add personnel modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPerson, setNewPerson] = useState({ username: '', password: '', role: 'soldier' });
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<PersonnelMember[]>('/auth/users');
      setPersonnel(data);
    } catch (err) {
      console.error('Failed to fetch personnel:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!newPerson.username || !newPerson.password) {
        setSubmitError('Username and password are required');
        return;
    }
    // Only allow specific roles
    if (!['soldier', 'kitchen'].includes(newPerson.role)) {
       setSubmitError('Invalid role selection. Only soldiers and kitchen staff can be added.');
       return;
    }
    
    try {
      await apiClient.post('/auth/signup', {
        ...newPerson,
        email: `${newPerson.username.toLowerCase().replace(/[^a-z0-9]/g, '')}@crpf.gov.in`
      });
      setIsModalOpen(false);
      setNewPerson({ username: '', password: '', role: 'soldier' });
      fetchPersonnel(); // Refresh list
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create personnel');
    }
  };

  const filtered = personnel.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.pno?.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-[#0e0e12] text-[#aaaab7] font-body relative">
      <main className="min-h-screen flex flex-col">
        <header className="flex justify-between items-center w-full px-8 py-6 bg-[#0e0e12]/80 backdrop-blur-xl sticky top-0 z-40 border-b border-[#464753]/10">
          <div className="flex items-center gap-4">
            <a href="/admin" className="w-10 h-10 rounded-xl bg-[#2a2b38]/50 flex items-center justify-center text-[#aaaab7] hover:bg-[#2a2b38] transition-colors"><span className="material-symbols-outlined">arrow_back</span></a>
            <div>
              <h1 className="text-xl font-black font-headline text-white tracking-tighter">Personnel Management</h1>
              <p className="text-[10px] uppercase font-bold text-[#aaaab7] tracking-widest mt-1">Directory</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsModalOpen(true)} className="bg-[#ffb690] text-[#1b1b1f] px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-base">person_add</span>Add Personnel
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Personnel', value: personnel.length, icon: 'group', color: 'text-white' },
              { label: 'Kitchen Staff', value: personnel.filter(p => p.role === 'kitchen').length, icon: 'restaurant', color: 'text-[#ffb690]' },
              { label: 'Admin Users', value: personnel.filter(p => p.role === 'admin').length, icon: 'admin_panel_settings', color: 'text-purple-400' },
              { label: 'Soldiers', value: personnel.filter(p => p.role === 'soldier').length, icon: 'military_tech', color: 'text-blue-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#131318] p-5 rounded-xl border border-[#464753]/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`material-symbols-outlined text-lg ${stat.color}`}>{stat.icon}</span>
                  <span className="text-[10px] font-bold text-[#aaaab7] uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="text-3xl font-black text-white font-headline">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#aaaab7]/50">search</span>
              <input className="w-full bg-[#131318] border border-[#464753]/20 rounded-xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-[#ffb690] text-sm font-bold text-white placeholder-[#aaaab7]/30" placeholder="Search by name or PNO..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-2 shrink-0">
              {['all', 'soldier', 'kitchen', 'admin'].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)} className={`px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  roleFilter === r ? 'bg-[#ffb690] text-[#1b1b1f]' : 'bg-[#131318] text-[#aaaab7] border border-[#464753]/20 hover:bg-[#191920]'
                }`}>{r}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#131318] rounded-2xl border border-[#464753]/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#464753]/20 bg-[#191920]">
                    {['Personnel', 'PNO', 'Role', 'Status', 'Joined Date', ''].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-[10px] font-bold text-[#aaaab7] uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                  ) : filtered.map(person => {
                    const rc = ROLE_COLORS[person.role] || ROLE_COLORS.soldier;
                    return (
                      <tr key={person.id} className="border-b border-[#464753]/10 hover:bg-[#191920]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#2a2b38] flex items-center justify-center">
                              <span className="material-symbols-outlined text-white text-lg">person</span>
                            </div>
                            <span className="text-sm font-bold text-white">{person.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono font-bold text-[#ffb690]">{person.pno}</td>
                        <td className="px-6 py-4"><span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${rc.bg} ${rc.text}`}>{person.role}</span></td>
                        <td className="px-6 py-4">
                            <span className="w-2 h-2 rounded-full inline-block mr-2 bg-green-400"></span>
                            <span className="text-xs font-bold text-[#aaaab7]">Active</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#aaaab7] font-medium">{new Date(person.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={async () => {
                              if(window.confirm(`Are you sure you want to remove ${person.name}?`)) {
                                try {
                                  await apiClient.request(`/auth/users/${person.id}`, { method: 'DELETE' });
                                  fetchPersonnel();
                                } catch (err) { alert('Failed to delete user'); }
                              }
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg hover:bg-red-400/20 transition-all"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add Personnel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131318] border border-[#464753]/30 rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-[#aaaab7] hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-black font-headline text-white mb-2">Register User</h2>
            <p className="text-[#aaaab7] text-sm mb-6">Create new credentials to grant access.</p>
            
            {submitError && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm mb-6 font-bold">{submitError}</div>}
            
            <form onSubmit={handleAddPersonnel} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-[#aaaab7] uppercase tracking-widest mb-2">Username / PNO</label>
                <input required type="text" className="w-full bg-[#191920] border border-[#464753]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffb690]" placeholder="Enter uniform number" value={newPerson.username} onChange={e => setNewPerson({...newPerson, username: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-[#aaaab7] uppercase tracking-widest mb-2">Initial Password</label>
                <input required type="password" className="w-full bg-[#191920] border border-[#464753]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffb690]" placeholder="Create a password" value={newPerson.password} onChange={e => setNewPerson({...newPerson, password: e.target.value})} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#aaaab7] uppercase tracking-widest mb-2">Assign Role</label>
                <select className="w-full bg-[#191920] border border-[#464753]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffb690] appearance-none" value={newPerson.role} onChange={e => setNewPerson({...newPerson, role: e.target.value})}>
                   <option value="soldier">Soldier</option>
                   <option value="kitchen">Kitchen Staff</option>
                </select>
                <p className="mt-2 text-xs text-[#aaaab7]/70 italic">Note: Only soldiers and kitchen staff can be created here.</p>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-[#ffb690] text-[#1b1b1f] py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">person_add</span> Enlist User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
