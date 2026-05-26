'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Clock, TrendingUp, Car, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const PREVIEW_STATS = [
  { label: 'Total Stickers', value: '1,284', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800', badge: '+12% this month', badgeBg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', icon: TrendingUp },
  { label: 'Active',         value: '986',   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800', badge: '76.8% valid', badgeBg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', icon: ShieldCheck },
  { label: 'Expiring Soon',  value: '80',    color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-800', badge: 'Next 30 days', badgeBg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', icon: AlertTriangle },
  { label: 'Vehicles',       value: '742',   color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-100 dark:border-violet-800', badge: '+8 this week', badgeBg: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400', icon: Car },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const [userid,   setUserid]   = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (localStorage.getItem('token')) router.replace('/dashboard');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await api.login(userid, password);
      setAuth(data.token, data.user);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-200">

      {/* LEFT panel — stats showcase */}
      <div className="flex-1 flex flex-col justify-center px-10 py-12 bg-gray-50 dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 transition-colors duration-200">

        {/* Hero card */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Vehicle Sticker Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
            Issue, track and renew vehicle stickers from one dashboard. Full audit trail, expiry alerts and role-based access control.
          </p>
        </div>

        {/* Mini stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {PREVIEW_STATS.map(({ label, value, color, bg, border, badge, badgeBg, icon: Icon }) => (
            <div key={label} className={`${bg} border ${border} rounded-xl p-4 transition-colors duration-200`}>
              <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">{label}</p>
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeBg}`}>
                <Icon className="w-2.5 h-2.5" />{badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT panel — login form */}
      <div className="w-96 flex-shrink-0 flex flex-col justify-center px-10 bg-white dark:bg-slate-950 transition-colors duration-200">

        {/* Top: brand + theme toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">CarSticker Pro</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Management Suite</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-7">Sign in to your workspace</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              User ID
            </label>
            <input type="text" value={userid} onChange={e => setUserid(e.target.value)}
              placeholder="Enter your user ID" required autoFocus
              className="w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none transition-all
                bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white
                dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500
                dark:focus:border-blue-500 dark:focus:ring-blue-900/30 dark:focus:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password" required
                className="w-full px-3.5 py-2.5 pr-10 border rounded-lg text-sm outline-none transition-all
                  bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white
                  dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500
                  dark:focus:border-blue-500 dark:focus:ring-blue-900/30 dark:focus:bg-slate-800"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm
              bg-red-50 border border-red-200 text-red-700
              dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
              bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300
              dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-slate-700
              hover:shadow-md hover:-translate-y-px active:translate-y-0">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</>
              : <><ArrowRight className="w-4 h-4" />Sign in</>
            }
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 space-y-3">
          {[
            { icon: ShieldCheck, text: 'Enterprise-grade encryption' },
            { icon: Clock,       text: 'Real-time data sync' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-sm text-gray-400 dark:text-slate-500">
              <div className="w-6 h-6 rounded-md bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
