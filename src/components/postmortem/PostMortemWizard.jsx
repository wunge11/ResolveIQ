/**
 * PostMortemWizard.jsx
 * Stepper 4 langkah untuk membuat / mengedit post-mortem.
 * Langkah 1: Ringkasan (auto-fill dari insiden)
 * Langkah 2: Kronologi (dari timeline insiden)
 * Langkah 3: Analisis (akar masalah, dampak, went well, needs improvement)
 * Langkah 4: Action Items (deskripsi, owner, due date, status)
 *
 * @param {object}   props
 * @param {object}   props.incident    - Insiden terkait
 * @param {object}   [props.existing]  - Post-mortem yang sudah ada (saat edit)
 * @param {Function} props.onSave      - Callback (postMortemData) => void
 * @param {Function} props.onCancel    - Callback batal/tutup
 */

import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { generateSummary, buildPMTimeline } from '../../utils/postmortem.js';
import { TIMELINE_TYPES } from '../../utils/constants.js';
import Button from '../common/Button.jsx';

const STEPS = ['Ringkasan', 'Kronologi', 'Analisis', 'Action Items'];

function StepIndicator({ current }) {
  return (
    <nav aria-label="Langkah wizard post-mortem" className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((step, idx) => {
        const done    = idx < current;
        const active  = idx === current;
        return (
          <div key={step} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              active ? 'bg-brand-600 text-white' : done ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400'
            }`}>
              {done ? <Check size={12} aria-hidden="true" /> : <span>{idx + 1}</span>}
              <span className="hidden sm:inline">{step}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-6 h-px ${done ? 'bg-brand-400' : 'bg-slate-200'}`} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ── Langkah 1: Ringkasan ────────────────────────────────────────────────────
function StepSummary({ data, onChange }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Data terisi otomatis dari insiden. Anda dapat mengedit.</p>
      <textarea
        value={data.summary}
        onChange={e => onChange('summary', e.target.value)}
        rows={5}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-600"
        aria-label="Ringkasan post-mortem"
      />
    </div>
  );
}

// ── Langkah 2: Kronologi ────────────────────────────────────────────────────
function StepTimeline({ data, onChange }) {
  const addEntry = () => {
    onChange('timeline', [
      ...data.timeline,
      { id: `pm-tl-${Date.now()}`, time: new Date().toISOString(), type: 'Action', note: '' },
    ]);
  };

  const updateEntry = (id, field, value) => {
    onChange('timeline', data.timeline.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEntry = (id) => {
    onChange('timeline', data.timeline.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Kronologi diisi dari timeline insiden. Edit atau hapus entri sesuai kebutuhan.</p>
      <ul className="space-y-2">
        {data.timeline.map(entry => (
          <li key={entry.id} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="datetime-local"
                value={entry.time?.slice(0, 16) ?? ''}
                onChange={e => updateEntry(entry.id, 'time', new Date(e.target.value).toISOString())}
                className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600"
                aria-label="Waktu entri"
              />
              <select
                value={entry.type}
                onChange={e => updateEntry(entry.id, 'type', e.target.value)}
                className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600"
                aria-label="Tipe entri"
              >
                {TIMELINE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input
                type="text"
                value={entry.note}
                onChange={e => updateEntry(entry.id, 'note', e.target.value)}
                placeholder="Catatan…"
                className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600"
                aria-label="Catatan entri"
              />
            </div>
            <button onClick={() => removeEntry(entry.id)} aria-label="Hapus entri" className="shrink-0 p-1.5 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={13} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" size="sm" icon={<Plus size={12} />} onClick={addEntry}>
        Tambah Entri
      </Button>
    </div>
  );
}

// ── Langkah 3: Analisis ─────────────────────────────────────────────────────
function StepAnalysis({ data, onChange }) {
  const fields = [
    { key: 'rootCause',        label: 'Akar Masalah',            placeholder: 'Jelaskan mengapa masalah ini terjadi…' },
    { key: 'impact',           label: 'Dampak',                  placeholder: 'Kuantifikasi dampak ke pengguna dan bisnis…' },
    { key: 'wentWell',         label: 'Yang Berjalan Baik',       placeholder: 'Apa yang efektif selama penanganan insiden…' },
    { key: 'needsImprovement', label: 'Yang Perlu Diperbaiki',    placeholder: 'Celah proses atau teknis yang harus diperbaiki…' },
  ];
  return (
    <div className="space-y-4">
      {fields.map(f => (
        <div key={f.key}>
          <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
          <textarea
            value={data[f.key] ?? ''}
            onChange={e => onChange(f.key, e.target.value)}
            rows={3}
            placeholder={f.placeholder}
            aria-label={f.label}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>
      ))}
    </div>
  );
}

// ── Langkah 4: Action Items ─────────────────────────────────────────────────
function StepActionItems({ data, onChange }) {
  const addItem = () => {
    onChange('actionItems', [
      ...data.actionItems,
      { id: `ai-${Date.now()}`, text: '', owner: '', dueDate: '', done: false },
    ]);
  };

  const updateItem = (id, field, value) => {
    onChange('actionItems', data.actionItems.map(ai => ai.id === id ? { ...ai, [field]: value } : ai));
  };

  const removeItem = (id) => {
    onChange('actionItems', data.actionItems.filter(ai => ai.id !== id));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Tambahkan tindak lanjut konkret dengan penanggung jawab dan tenggat.</p>
      {data.actionItems.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">Belum ada action item. Klik "Tambah" untuk memulai.</p>
      )}
      <ul className="space-y-2">
        {data.actionItems.map(ai => (
          <li key={ai.id} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={ai.text}
                onChange={e => updateItem(ai.id, 'text', e.target.value)}
                placeholder="Deskripsi tindakan…"
                className="sm:col-span-3 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 bg-white"
                aria-label="Deskripsi action item"
              />
              <input
                type="text"
                value={ai.owner}
                onChange={e => updateItem(ai.id, 'owner', e.target.value)}
                placeholder="Penanggung jawab"
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 bg-white"
                aria-label="Penanggung jawab"
              />
              <input
                type="date"
                value={ai.dueDate}
                onChange={e => updateItem(ai.id, 'dueDate', e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 bg-white"
                aria-label="Tenggat"
              />
              <select
                value={ai.done ? 'done' : 'todo'}
                onChange={e => updateItem(ai.id, 'done', e.target.value === 'done')}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-600 bg-white"
                aria-label="Status action item"
              >
                <option value="todo">Belum Mulai</option>
                <option value="done">Selesai</option>
              </select>
            </div>
            <button onClick={() => removeItem(ai.id)} aria-label="Hapus action item" className="shrink-0 p-1.5 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={13} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" size="sm" icon={<Plus size={12} />} onClick={addItem}>
        Tambah Action Item
      </Button>
    </div>
  );
}

// ── Wizard utama ────────────────────────────────────────────────────────────
function PostMortemWizard({ incident, existing, onSave, onCancel }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(() => existing ?? {
    summary:          generateSummary(incident),
    timeline:         buildPMTimeline(incident.timeline ?? []),
    rootCause:        '',
    impact:           incident.impact ?? '',
    wentWell:         '',
    needsImprovement: '',
    actionItems:      [],
  });

  const updateField = (key, value) => setData(d => ({ ...d, [key]: value }));

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleSave = () => {
    onSave({ ...data, incidentId: incident.id });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-slate-800">
          {existing ? 'Edit Post-Mortem' : 'Buat Post-Mortem'}
        </h2>
        <span className="text-xs text-slate-500">{incident.id} · {incident.severity}</span>
      </div>
      <p className="text-sm text-slate-600 mb-4 truncate">{incident.title}</p>

      <StepIndicator current={step} />

      {/* Konten per langkah */}
      <div className="min-h-[280px]">
        {step === 0 && <StepSummary   data={data} onChange={updateField} />}
        {step === 1 && <StepTimeline  data={data} onChange={updateField} />}
        {step === 2 && <StepAnalysis  data={data} onChange={updateField} />}
        {step === 3 && <StepActionItems data={data} onChange={updateField} />}
      </div>

      {/* Navigasi */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
        <Button variant="outline" onClick={step === 0 ? onCancel : handleBack} icon={step > 0 ? <ChevronLeft size={14} /> : undefined}>
          {step === 0 ? 'Batal' : 'Kembali'}
        </Button>
        <span className="text-xs text-slate-400">{step + 1} / {STEPS.length}</span>
        {step < STEPS.length - 1 ? (
          <Button variant="primary" onClick={handleNext} icon={<ChevronRight size={14} />}>
            Selanjutnya
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSave} icon={<Check size={14} />}>
            {existing ? 'Simpan Perubahan' : 'Buat Post-Mortem'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default PostMortemWizard;
