'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { Shield, Plus, X, Save, Loader2, Crown, User } from 'lucide-react';

interface AppUser { id: number; userid: string; name: string; role: string; created_at: string; }
const EMPTY = { userid: '', name: '', password: '', role: 'user' };

export default function AdminPage() {
  const { user, hydrate } = useAuthStore();
  const router = useRouter();
  const [rows,    setRows]    = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ ...EMPTY });
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (user && user.role !== 'admin') router.replace('/dashboard');
  }, [user, router]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setRows(await api.getUsers()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async () => {
    if (!form.userid || !form.password || !form.name) { alert('All fields required'); return; }
    setSaving(true);
    try { await api.createUser(form); setModal(false); setForm({ ...EMPTY }); fetch(); }
    catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" /> Admin Panel
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Manage system users</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New User
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden transition-colors duration-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
              {['User','User ID','Role','Created'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(4)].map((_, i) => <tr key={i}>{[...Array(4)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 shimmer-load rounded w-3/4" /></td>)}</tr>)
            ) : rows.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold">{u.userid}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${u.role === 'admin' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role === 'admin' && <Crown className="w-3 h-3" />} {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.created_at?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Create User</h2>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              {[['userid','User ID','johndoe'],['name','Full Name','John Doe'],['password','Password','']].map(([k, l, p]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">{l}</label>
                  <input type={k === 'password' ? 'password' : 'text'} value={(form as any)[k]}
                    onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={p}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-gray-100 dark:border-slate-700">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? 'Saving…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
