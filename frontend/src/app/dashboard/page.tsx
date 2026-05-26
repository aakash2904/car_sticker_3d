'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Sticker, Car, Users, AlertTriangle, CheckCircle, XCircle, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  total_stickers: number; active_stickers: number; expired_stickers: number;
  expiring_soon: number; total_vehicles: number; total_owners: number;
}

const CARDS = [
  { key: 'total_stickers',   label: 'Total Stickers', icon: Sticker,       accent: '#3b82f6', lightBg: 'bg-blue-50',   darkBg: 'dark:bg-blue-900/20',   lightText: 'text-blue-600',   darkText: 'dark:text-blue-400',   trend: '+12% this month', trendUp: true },
  { key: 'active_stickers',  label: 'Active',         icon: CheckCircle,   accent: '#10b981', lightBg: 'bg-emerald-50', darkBg: 'dark:bg-emerald-900/20', lightText: 'text-emerald-600',darkText: 'dark:text-emerald-400',trend: '76.8% of total',   trendUp: false },
  { key: 'expired_stickers', label: 'Expired',        icon: XCircle,       accent: '#ef4444', lightBg: 'bg-red-50',    darkBg: 'dark:bg-red-900/20',    lightText: 'text-red-600',    darkText: 'dark:text-red-400',    trend: 'Needs attention',  trendUp: false },
  { key: 'expiring_soon',    label: 'Expiring Soon',  icon: AlertTriangle, accent: '#f59e0b', lightBg: 'bg-amber-50',  darkBg: 'dark:bg-amber-900/20',  lightText: 'text-amber-600',  darkText: 'dark:text-amber-400',  trend: 'Next 30 days',     trendUp: false },
  { key: 'total_vehicles',   label: 'Vehicles',       icon: Car,           accent: '#8b5cf6', lightBg: 'bg-violet-50', darkBg: 'dark:bg-violet-900/20', lightText: 'text-violet-600', darkText: 'dark:text-violet-400', trend: '+8 this week',     trendUp: true },
  { key: 'total_owners',     label: 'Owners',         icon: Users,         accent: '#ec4899', lightBg: 'bg-pink-50',   darkBg: 'dark:bg-pink-900/20',   lightText: 'text-pink-600',   darkText: 'dark:text-pink-400',   trend: '+5 this week',     trendUp: true },
];

export default function DashboardPage() {
  const { user, hydrate } = useAuthStore();
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    Promise.all([api.stats(), api.monthlyReport()])
      .then(([s, m]) => { setStats(s); setMonthly(m); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good morning, {user?.name || user?.userid} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-xl shimmer-load" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {CARDS.map(c => {
            const Icon = c.icon;
            const val = (stats as any)[c.key] ?? 0;
            return (
              <div key={c.key}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all duration-200 relative overflow-hidden group">
                {/* Accent top bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: c.accent }} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{c.label}</p>
                    <p className={`text-3xl font-bold ${c.lightText} ${c.darkText}`}>{val.toLocaleString()}</p>
                    <div className={`flex items-center gap-1 mt-1.5 text-xs ${c.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>
                      {c.trendUp && <TrendingUp className="w-3 h-3" />}
                      {c.trend}
                    </div>
                  </div>
                  <div className={`w-10 h-10 ${c.lightBg} ${c.darkBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${c.lightText} ${c.darkText}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Monthly Sticker Issuance</h2>
          <span className="ml-auto text-xs text-gray-400 dark:text-slate-500">Last 12 months</span>
        </div>
        {loading ? <div className="h-56 shimmer-load rounded-lg" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--tw-prose-captions, #f1f5f9)" className="dark:[&>line]:stroke-slate-700" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--tooltip-bg, #fff)', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, color: '#0f172a' }}
              />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2}
                fill="url(#grad)" dot={{ fill: '#3b82f6', r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
