/**
 * Timeline.jsx
 * Komponen timeline kronologi insiden.
 * Menampilkan riwayat entri dan form tambah entri baru.
 *
 * @param {object}   props
 * @param {object}   props.incident    - Data insiden
 * @param {Function} props.onAddEntry  - Callback saat entri baru ditambahkan
 */

import { useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import { TIMELINE_TYPES } from '../../utils/constants.js';
import { formatDateTime } from '../../utils/date.js';
import Button from '../common/Button.jsx';

const TYPE_COLORS = {
  Detected:   'bg-red-100 text-red-700 border-red-200',
  Action:     'bg-blue-100 text-blue-700 border-blue-200',
  Finding:    'bg-amber-100 text-amber-700 border-amber-200',
  Escalation: 'bg-purple-100 text-purple-700 border-purple-200',
  Resolved:   'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const DOT_COLORS = {
  Detected:   'bg-red-500',
  Action:     'bg-blue-500',
  Finding:    'bg-amber-500',
  Escalation: 'bg-purple-500',
  Resolved:   'bg-emerald-500',
};

function TimelineEntry({ entry }) {
  const dotColor = DOT_COLORS[entry.type] ?? 'bg-slate-400';
  const tagColor = TYPE_COLORS[entry.type] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  const typeDef  = TIMELINE_TYPES.find(t => t.value === entry.type);

  return (
    <li className="flex gap-3">
      {/* Dot + line */}
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} aria-hidden="true" />
        <div className="w-px flex-1 bg-slate-100 mt-1" aria-hidden="true" />
      </div>
      {/* Konten */}
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tagColor}`}>
            {typeDef?.label ?? entry.type}
          </span>
          <span className="text-xs text-slate-400">
            <Clock size={10} className="inline mr-1" aria-hidden="true" />
            {formatDateTime(entry.time)}
          </span>
          {entry.author && (
            <span className="text-xs text-slate-400">· {entry.author}</span>
          )}
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{entry.note}</p>
      </div>
    </li>
  );
}

function AddEntryForm({ onAdd, onCancel }) {
  const [type,  setType]  = useState('Action');
  const [note,  setNote]  = useState('');
  const [time,  setTime]  = useState(() => new Date().toISOString().slice(0, 16));
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) { setError('Catatan wajib diisi'); return; }
    onAdd({ type, note: note.trim(), time: new Date(time).toISOString(), author: 'Rina Aditya' });
    setNote('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
      <p className="text-sm font-semibold text-slate-700">Tambah Entri Timeline</p>

      {/* Tipe */}
      <div>
        <label htmlFor="tl-type" className="sr-only">Tipe entri</label>
        <select
          id="tl-type"
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          {TIMELINE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Waktu */}
      <div>
        <label htmlFor="tl-time" className="sr-only">Waktu kejadian</label>
        <input
          id="tl-time"
          type="datetime-local"
          value={time}
          onChange={e => setTime(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
      </div>

      {/* Catatan */}
      <div>
        <label htmlFor="tl-note" className="sr-only">Catatan</label>
        <textarea
          id="tl-note"
          rows={2}
          value={note}
          onChange={e => { setNote(e.target.value); setError(''); }}
          placeholder="Jelaskan tindakan, temuan, atau kejadian…"
          aria-invalid={!!error}
          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-600 ${error ? 'border-red-400' : 'border-slate-200'}`}
        />
        {error && <p className="text-xs text-red-600 mt-1" role="alert">{error}</p>}
      </div>

      <div className="flex gap-2">
        <Button variant="primary" size="sm" type="submit" className="flex-1">Simpan</Button>
        <Button variant="outline" size="sm" type="button" onClick={onCancel}>Batal</Button>
      </div>
    </form>
  );
}

function Timeline({ incident, onAddEntry }) {
  const [showForm, setShowForm] = useState(false);
  const entries = [...(incident.timeline ?? [])].sort(
    (a, b) => new Date(a.time) - new Date(b.time),
  );

  const handleAdd = (entry) => {
    onAddEntry(entry);
    setShowForm(false);
  };

  return (
    <section aria-label="Timeline kronologi">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Timeline Kronologi</h3>
        <Button
          variant="outline"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => setShowForm(s => !s)}
        >
          {showForm ? 'Batal' : 'Tambah Entri'}
        </Button>
      </div>

      {showForm && (
        <div className="mb-4">
          <AddEntryForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">Belum ada entri timeline.</p>
      ) : (
        <ul className="space-y-0" aria-label="Daftar entri timeline">
          {entries.map(entry => (
            <TimelineEntry key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default Timeline;
