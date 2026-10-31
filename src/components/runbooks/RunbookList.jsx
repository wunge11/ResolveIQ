/**
 * RunbookList.jsx
 * Daftar runbook dalam bentuk card dengan search dan filter kategori.
 *
 * @param {object}   props
 * @param {object[]} props.runbooks       - Array semua runbook
 * @param {string}   props.selectedId     - ID runbook yang sedang dipilih
 * @param {Function} props.onSelect       - Callback saat runbook dipilih
 * @param {Function} props.onAdd          - Callback buka form tambah runbook
 * @param {Function} props.onEdit         - Callback buka form edit runbook
 * @param {Function} props.onDelete       - Callback hapus runbook
 */

import { useState, useMemo } from 'react';
import { Search, Plus, BookOpen, Pencil, Trash2, X } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants.js';
import { formatDateTime } from '../../utils/date.js';
import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';

function RunbookList({ runbooks, selectedId, onSelect, onAdd, onEdit, onDelete }) {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');

  const filtered = useMemo(() => {
    let list = runbooks;
    const q = search.toLowerCase().trim();
    if (q) list = list.filter(rb => rb.title.toLowerCase().includes(q));
    if (category) list = list.filter(rb => rb.category === category);
    return list;
  }, [runbooks, search, category]);

  return (
    <aside className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden" aria-label="Daftar runbook">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-800">Runbooks</h2>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={onAdd}>
            Tambah
          </Button>
        </div>
        {/* Search */}
        <div className="relative mb-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari runbook…"
            aria-label="Cari runbook"
            className="w-full pl-8 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Hapus pencarian" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={12} />
            </button>
          )}
        </div>
        {/* Filter kategori */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          aria-label="Filter kategori runbook"
          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          <option value="">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <li><EmptyState icon={BookOpen} title="Tidak ada runbook" className="py-8" /></li>
        ) : (
          filtered.map(rb => (
            <li key={rb.id}>
              <div
                className={`group flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedId === rb.id ? 'bg-brand-50 border-l-2 border-brand-600' : ''}`}
                onClick={() => onSelect(rb.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onSelect(rb.id)}
                aria-pressed={selectedId === rb.id}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{rb.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">{rb.category}</span>
                    <span className="text-xs text-slate-400">v{rb.version}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{rb.steps?.length ?? 0} langkah · {formatDateTime(rb.updatedAt, false)}</p>
                </div>
                {/* Aksi — selalu tampil, tidak disembunyikan */}
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit(rb)}
                    aria-label={`Edit runbook ${rb.title}`}
                    className="p-1.5 rounded text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <Pencil size={13} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => onDelete(rb.id)}
                    aria-label={`Hapus runbook ${rb.title}`}
                    className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}

export default RunbookList;
