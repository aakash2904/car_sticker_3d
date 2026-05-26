'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart3, Download, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function ReportsPage() {
  const [monthly, setMonthly] = useState<any[]>([]);
  const [stats,   setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = () => {
    setLoading(true);
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    Promise.all([api.monthlyReport(params), api.stats()])
      .then(([m, s]) => { setMonthly(m); setStats(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const data = await api.exportReport(params);
      
      // Convert to worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Stickers");
      
      // Save file
      XLSX.writeFile(wb, `Stickers_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data.");
    } finally {
      setExporting(false);
    }
  };

  const pieData = stats ? [
    { name: 'Active',        value: stats.active_stickers },
    { name: 'Expired',       value: stats.expired_stickers },
    { name: 'Expiring Soon', value: stats.expiring_soon },
  ] : [];

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" /> Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Overview of sticker operations</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              className="text-sm border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded-md shadow-sm p-2" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
            />
            <span className="text-gray-500">to</span>
            <input 
              type="date" 
              className="text-sm border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded-md shadow-sm p-2" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
            />
            <button 
              onClick={fetchData}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
          
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> 
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Stickers', value: stats.total_stickers, color: 'text-blue-600',  bg: 'bg-blue-50'  },
            { label: 'Total Vehicles', value: stats.total_vehicles, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Total Owners',   value: stats.total_owners,   color: 'text-pink-600',   bg: 'bg-pink-50'   },
            { label: 'Expiring Soon',  value: stats.expiring_soon,  color: 'text-amber-600',  bg: 'bg-amber-50'  },
          ].map(c => (
            <div key={c.label} className={`${c.bg} dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-center transition-colors`}>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{c.label}</p>
              <p className={`text-3xl font-bold ${c.color}`}>{c.value?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 transition-colors duration-200">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Monthly Issuance (Last 12 Months)</h2>
          {loading ? <div className="h-56 shimmer-load rounded-lg" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}
                  background={{ fill: '#f8fafc', radius: 4 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 transition-colors duration-200">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Sticker Status</h2>
          {loading ? <div className="h-56 shimmer-load rounded-lg" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
                <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
