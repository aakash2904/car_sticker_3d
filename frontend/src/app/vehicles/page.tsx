'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Car, X, Save, Loader2 } from 'lucide-react';

interface Vehicle { id: number; plate_number: string; make: string; model: string; color: string; year: number; owner_name: string; contact: string; }
interface Owner { id: number; name: string; }
const EMPTY = { plate_number: '', make: '', model: '', color: '', year: '', owner_id: '' };

export default function VehiclesPage() {
  const [rows,    setRows]    = useState<Vehicle[]>([]);
  const [owners,  setOwners]  = useState<Owner[]>([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ ...EMPTY });
  const [saving,  setSaving]  = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string, string> = {};
      if (search) p.search = search;
      setRows(await api.getVehicles(p));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { api.getOwners().then(setOwners).catch(() => {}); }, []);

  const handleSave = async () => {
    if (!form.plate_number || !form.make) { alert('Plate number and make are required'); return; }
    setSaving(true);
    try {
      await api.createVehicle({ ...form, year: Number(form.year), owner_id: Number(form.owner_id) });
      setModal(false); setForm({ ...EMPTY }); fetch();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Car className="w-5 h-5 text-violet-600" />Vehicles</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{rows.length} registered</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="relative max-w-xs mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plate or owner…"
          className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden transition-colors duration-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
              {['Plate Number','Make','Model','Year','Color','Owner','Contact'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(6)].map((_, i) => <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 shimmer-load rounded w-3/4" /></td>)}</tr>)
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400"><Car className="w-8 h-8 mx-auto mb-2 opacity-30" />No vehicles found</td></tr>
            ) : rows.map(v => (
              <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-bold text-violet-700">{v.plate_number}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{v.make}</td>
                <td className="px-4 py-3 text-gray-600">{v.model}</td>
                <td className="px-4 py-3 text-gray-600">{v.year}</td>
                <td className="px-4 py-3 text-gray-600">{v.color}</td>
                <td className="px-4 py-3 text-gray-800">{v.owner_name}</td>
                <td className="px-4 py-3 text-gray-500">{v.contact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Add Vehicle</h2>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[['plate_number','Plate Number *','ABC-1234'],['make','Make *','Toyota'],['model','Model','Corolla'],['color','Color','White'],['year','Year','2022']].map(([k,l,p]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">{l}</label>
                  <input value={(form as any)[k]} onChange={e => setForm({...form, [k]: e.target.value})} placeholder={p}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Owner</label>
                <select value={form.owner_id} onChange={e => setForm({...form, owner_id: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                  <option value="">— Select owner —</option>
                  {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-gray-100 dark:border-slate-700">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
