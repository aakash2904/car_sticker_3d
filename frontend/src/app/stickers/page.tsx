'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Edit2, Trash2, X, Save, ChevronLeft, ChevronRight, Loader2, Sticker } from 'lucide-react';

interface StickerRow {
  id: number; sticker_number: string; vehicle_id: number;
  issue_date: string; expiry_date: string; status: string; notes: string;
  plate_number: string; make: string; model: string; owner_name: string;
}

const STATUS_BADGE: Record<string, string> = {
  active:    'bg-green-50 text-green-700 border border-green-200',
  expired:   'bg-red-50 text-red-700 border border-red-200',
  suspended: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const EMPTY_FORM = { 
  member_code: '', owner_id: '', owner_name: '',
  plate_number: '', make: '', model: '', color: '', year: '',
  sticker_number: '', issue_date: '', expiry_date: '', status: 'active', notes: '' 
};

export default function StickersPage() {
  const [rows,     setRows]     = useState<StickerRow[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState<StickerRow | null>(null);
  const [form,     setForm]     = useState({ ...EMPTY_FORM });
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const LIMIT = 15;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search) p.search = search;
      if (status) p.status = status;
      const r = await api.getStickers(p);
      setRows(r.stickers ?? []); setTotal(r.total ?? 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd  = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setModal(true); };
  const openEdit = (r: StickerRow) => {
    setEditing(r);
    setForm({ 
      member_code: '', owner_id: '', owner_name: r.owner_name,
      plate_number: r.plate_number || '', make: r.make || '', model: r.model || '', color: '', year: '',
      sticker_number: r.sticker_number,
      issue_date: r.issue_date?.slice(0,10) || '', expiry_date: r.expiry_date?.slice(0,10) || '',
      status: r.status, notes: r.notes || '' 
    });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const verifyMember = async () => {
    if (!form.member_code) return;
    try {
      const data = await api.lookupMember(form.member_code);
      setForm({ ...form, owner_id: data.id, owner_name: data.name });
    } catch (e: any) {
      alert(e.message || 'Member not found');
      setForm({ ...form, owner_id: '', owner_name: '' });
    }
  };

  const handleSave = async () => {
    if (!form.sticker_number || (!editing && !form.plate_number)) { 
      alert('Plate Number and Sticker Number are required'); 
      return; 
    }
    setSaving(true);
    try {
      editing ? await api.updateSticker(editing.id, form) : await api.createSticker(form);
      closeModal(); fetch();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this sticker?')) return;
    setDeleting(id);
    try { await api.deleteSticker(id); fetch(); }
    catch (e: any) { alert(e.message); }
    finally { setDeleting(null); }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sticker className="w-5 h-5 text-blue-600" /> Stickers
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{total.toLocaleString()} records</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Sticker
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search plate, owner, sticker no…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                {['Sticker No', 'Plate', 'Vehicle', 'Owner', 'Issued', 'Expires', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 shimmer-load rounded w-3/4" /></td>
                  ))}</tr>
                ))
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  <Sticker className="w-8 h-8 mx-auto mb-2 opacity-30" />No stickers found
                </td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{r.sticker_number}</td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-gray-900 dark:text-white">{r.plate_number}</td>
                  <td className="px-4 py-3 text-gray-600">{r.make} {r.model}</td>
                  <td className="px-4 py-3 text-gray-800">{r.owner_name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.issue_date?.slice(0,10)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.expiry_date?.slice(0,10)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id}
                        className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition-colors">
                        {deleting === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
            <span className="text-xs text-gray-500 dark:text-slate-400">
              {(page-1)*LIMIT+1}–{Math.min(page*LIMIT, total)} of {total}
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const p = Math.max(1, Math.min(pages-4, page-2)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded border text-xs font-medium transition-colors ${p === page ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col border border-gray-100 dark:border-slate-700">
            <div className="flex flex-shrink-0 items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Sticker' : 'New Sticker'}</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              
              {!editing && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
                  <label className="block text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2">Verify Member</label>
                  <div className="flex gap-2">
                    <input value={form.member_code} onChange={e => setForm({...form, member_code: e.target.value})}
                      placeholder="Enter Member Code..."
                      className="flex-1 px-3 py-2 border border-blue-200 dark:border-blue-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-800" />
                    <button onClick={verifyMember} type="button"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Verify
                    </button>
                  </div>
                  {form.owner_name && (
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400 flex items-center gap-1.5">
                      ✓ Verified: <span className="font-semibold">{form.owner_name}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                {!editing && (
                  <>
                    <div className="col-span-3">
                      <h3 className="text-sm font-semibold border-b pb-1 mb-1 mt-1">Vehicle Details</h3>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Plate Number *</label>
                      <input value={form.plate_number} onChange={e => setForm({...form, plate_number: e.target.value})}
                        placeholder="ABC-1234"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Make</label>
                      <input value={form.make} onChange={e => setForm({...form, make: e.target.value})} placeholder="Toyota"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Model</label>
                      <input value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="Corolla"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Color</label>
                      <input value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="Silver"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Year</label>
                      <input value={form.year} onChange={e => setForm({...form, year: e.target.value})} placeholder="2023" type="number"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div></div> {/* Spacer */}
                  </>
                )}

                <div className="col-span-3">
                  <h3 className="text-sm font-semibold border-b pb-1 mb-1 mt-2">Sticker Details</h3>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Sticker No *</label>
                  <input value={form.sticker_number} onChange={e => setForm({...form, sticker_number: e.target.value})}
                    placeholder="STK-001"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Issue Date</label>
                  <input type="date" value={form.issue_date} onChange={e => setForm({...form, issue_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Expiry Date</label>
                  <input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={1}
                    placeholder="Optional notes…"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none" />
                </div>
              </div>
            </div>
            <div className="flex flex-shrink-0 gap-2 px-5 py-4 border-t border-gray-100 dark:border-slate-700">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
