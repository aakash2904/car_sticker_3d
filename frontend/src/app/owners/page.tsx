'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Plus, Users, Phone, Mail, MapPin, X, Save, Loader2 } from 'lucide-react';

interface Owner { id: number; name: string; contact: string; email: string; address: string; }
const EMPTY = { name: '', contact: '', email: '', address: '' };

export default function OwnersPage() {
  const [rows,    setRows]    = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ ...EMPTY });
  const [saving,  setSaving]  = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setRows(await api.getOwners()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async () => {
    if (!form.name) { alert('Name is required'); return; }
    setSaving(true);
    try { await api.createOwner(form); setModal(false); setForm({ ...EMPTY }); fetch(); }
    catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Users className="w-5 h-5 text-pink-600" />Owners</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{rows.length} registered owners</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Owner
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-36 shimmer-load rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map(o => (
            <div key={o.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-sm flex-shrink-0">
                  {o.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{o.name}</h3>
              </div>
              <div className="space-y-1.5">
                {o.contact && <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400"><Phone className="w-3 h-3" />{o.contact}</div>}
                {o.email   && <div className="flex items-center gap-2 text-xs text-gray-500"><Mail className="w-3 h-3" />{o.email}</div>}
                {o.address && <div className="flex items-center gap-2 text-xs text-gray-500"><MapPin className="w-3 h-3" /><span className="truncate">{o.address}</span></div>}
              </div>
            </div>
          ))}
          {rows.length === 0 && <div className="col-span-3 py-12 text-center text-gray-400"><Users className="w-8 h-8 mx-auto mb-2 opacity-30" />No owners found</div>}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Add Owner</h2>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              {[['name','Full Name *','John Doe'],['contact','Phone','09123456789'],['email','Email','john@example.com'],['address','Address','123 Main St']].map(([k,l,p]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">{l}</label>
                  <input value={(form as any)[k]} onChange={e => setForm({...form, [k]: e.target.value})} placeholder={p}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-gray-100 dark:border-slate-700">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
