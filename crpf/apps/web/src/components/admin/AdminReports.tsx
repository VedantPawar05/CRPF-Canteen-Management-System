'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  ordersByStatus: Record<string, number>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  inventoryAlerts: Array<{
    item: string;
    currentStock: number;
    threshold: number;
  }>;
}

export function AdminReports() {
  const [isDark, setIsDark] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, this would call actual report endpoints
      // For now, we'll simulate with mock data
      const mockData: ReportData = {
        totalRevenue: 12482.50,
        totalOrders: 156,
        averageOrderValue: 80.02,
        topSellingItems: [
          { name: 'Chicken Biryani', quantity: 45, revenue: 3375.00 },
          { name: 'Paneer Butter Masala', quantity: 32, revenue: 2240.00 },
          { name: 'Dal Tadka', quantity: 28, revenue: 1540.00 },
          { name: 'Roti', quantity: 67, revenue: 1005.00 },
          { name: 'Jeera Rice', quantity: 23, revenue: 1035.00 }
        ],
        ordersByStatus: {
          Pending: 12,
          Accepted: 8,
          Preparing: 15,
          Ready: 22,
          Completed: 89,
          Cancelled: 10
        },
        dailyRevenue: [
          { date: '2024-01-15', revenue: 2450.00, orders: 28 },
          { date: '2024-01-16', revenue: 3200.00, orders: 35 },
          { date: '2024-01-17', revenue: 2890.00, orders: 31 },
          { date: '2024-01-18', revenue: 3942.50, orders: 42 },
          { date: '2024-01-19', revenue: 12482.50, orders: 156 }
        ],
        inventoryAlerts: [
          { item: 'Chicken', currentStock: 5, threshold: 10 },
          { item: 'Rice', currentStock: 8, threshold: 15 },
          { item: 'Onions', currentStock: 3, threshold: 20 }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReportData(mockData);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    // In a real implementation, this would generate and download a PDF/Excel report
    alert('Report export functionality would be implemented here');
  };

  if (isLoading) {
    return (
      <div className={`${isDark ? 'dark' : ''} bg-background text-on-background min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#ffb690] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#aaaab7] font-medium">Generating reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'dark' : ''} bg-background text-on-background min-h-screen flex selection:bg-primary/30`}>
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#131318] flex flex-col p-4 z-50 transition-all duration-300">
        <div className="px-4 py-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-xl font-bold">analytics</span>
            </div>
            <h1 className="text-lg font-black text-[#ffb690] font-headline tracking-tighter">Reports</h1>
          </div>
          <p className="text-[10px] text-[#aaaab7] font-medium mt-1 ml-11 uppercase tracking-widest">Analytics Center</p>
        </div>

        <nav className="flex-1 space-y-1">
          <a className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 text-[#aaaab7] hover:bg-[#2a2b38] font-headline" href="/admin">
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span>Dashboard</span>
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
          <a className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 bg-[#191920] border-r-2 border-[#ffb690] text-[#ffb690] font-headline" href="/admin/reports">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            <span>Reports</span>
          </a>
        </nav>

        <div className="mt-auto space-y-4">
          <button
            onClick={exportReport}
            className="w-full bg-[#ffb690] text-[#131318] py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
          >
            Export Report
          </button>
          <div className="pt-4 border-t border-[#464753]/20 flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-600"></div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-[#e5e1e6] truncate">Admin User</p>
              <button className="text-[9px] text-[#ffb4ab] font-bold hover:underline">Logout</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-w-0 bg-[#1b1b1f] min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-40 bg-[#131318]/80 backdrop-blur-xl border-b border-[#464753]/10">
          <div className="flex justify-between items-center w-full px-8 py-4">
            <h2 className="font-headline font-bold text-sm tracking-tight text-[#aaaab7]">Reports / <span className="text-[#ffb690]">Analytics</span></h2>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-[#191920] border border-[#464753]/20 rounded-lg px-3 py-2 text-sm text-white focus:border-[#ffb690] focus:ring-1 focus:ring-[#ffb690]"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="bg-[#191920] border border-[#464753]/20 rounded-lg px-3 py-2 text-sm text-white focus:border-[#ffb690] focus:ring-1 focus:ring-[#ffb690]"
              >
                <option value="overview">Overview</option>
                <option value="sales">Sales</option>
                <option value="inventory">Inventory</option>
                <option value="performance">Performance</option>
              </select>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] w-full mx-auto space-y-8">
          {/* Key Metrics */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#191920] border border-white/5 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#aaaab7] text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-black text-white font-headline">₹{reportData?.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-400">trending_up</span>
                </div>
              </div>
            </div>

            <div className="bg-[#191920] border border-white/5 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#aaaab7] text-sm font-medium">Total Orders</p>
                  <p className="text-2xl font-black text-white font-headline">{reportData?.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-400">receipt_long</span>
                </div>
              </div>
            </div>

            <div className="bg-[#191920] border border-white/5 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#aaaab7] text-sm font-medium">Avg Order Value</p>
                  <p className="text-2xl font-black text-white font-headline">₹{reportData?.averageOrderValue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-400">analytics</span>
                </div>
              </div>
            </div>

            <div className="bg-[#191920] border border-white/5 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#aaaab7] text-sm font-medium">Active Orders</p>
                  <p className="text-2xl font-black text-white font-headline">{reportData?.ordersByStatus.Pending + reportData?.ordersByStatus.Accepted + reportData?.ordersByStatus.Preparing + reportData?.ordersByStatus.Ready}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-400">schedule</span>
                </div>
              </div>
            </div>
          </section>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Selling Items */}
            <div className="bg-[#191920] border border-white/5 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6 font-headline">Top Selling Items</h3>
              <div className="space-y-4">
                {reportData?.topSellingItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#ffb690]/10 rounded-lg flex items-center justify-center">
                        <span className="text-[#ffb690] font-bold text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-[#aaaab7] text-sm">{item.quantity} sold</p>
                      </div>
                    </div>
                    <p className="text-[#ffb690] font-bold">₹{item.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-[#191920] border border-white/5 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6 font-headline">Order Status</h3>
              <div className="space-y-4">
                {Object.entries(reportData?.ordersByStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'Pending' ? 'bg-yellow-400' :
                        status === 'Accepted' ? 'bg-blue-400' :
                        status === 'Preparing' ? 'bg-orange-400' :
                        status === 'Ready' ? 'bg-green-400' :
                        status === 'Completed' ? 'bg-gray-400' : 'bg-red-400'
                      }`}></div>
                      <p className="text-white font-medium">{status}</p>
                    </div>
                    <p className="text-[#aaaab7] font-bold">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inventory Alerts */}
          {reportData?.inventoryAlerts.length > 0 && (
            <div className="bg-[#191920] border border-red-500/20 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6 font-headline flex items-center">
                <span className="material-symbols-outlined text-red-400 mr-2">warning</span>
                Inventory Alerts
              </h3>
              <div className="space-y-4">
                {reportData.inventoryAlerts.map((alert) => (
                  <div key={alert.item} className="flex items-center justify-between bg-red-500/5 p-4 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{alert.item}</p>
                      <p className="text-red-400 text-sm">Low stock: {alert.currentStock} remaining</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#aaaab7] text-sm">Threshold: {alert.threshold}</p>
                      <button className="text-[#ffb690] text-sm font-medium hover:underline">Restock</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Revenue Chart Placeholder */}
          <div className="bg-[#191920] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6 font-headline">Revenue Trend</h3>
            <div className="h-64 flex items-center justify-center bg-[#131318] rounded-lg">
              <div className="text-center">
                <span className="material-symbols-outlined text-[#aaaab7] text-6xl mb-4">show_chart</span>
                <p className="text-[#aaaab7] font-medium">Revenue chart visualization</p>
                <p className="text-[#666] text-sm mt-2">Chart library integration pending</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}