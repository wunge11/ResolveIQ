/**
 * RunbookForm.jsx
 * Modal form untuk tambah/edit runbook.
 * Mendukung: langkah dinamis (tambah, hapus, naik, turun).
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen    - Apakah modal terbuka
 * @param {object}   [props.runbook] - Data runbook saat edit; null saat tambah baru
 * @param {Function} props.onClose   - Callback tutup
 * @param {Function} props.onSave    - Callback simpan (data) => void
 */

import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { CATEGORIES, SYSTEMS } from '../../utils/constants.js';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';

const EMPTY_FORM = {
  title:    '',
  category: '',
  systems:  [],
  steps:    [{ id: `step-${Date.now()}`, text: '' }],
};

function RunbookForm({ isOpen, runbook, onClose, onSave }) {
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Prefill saat edit
  useEffect(() => {
    if (isOpen) {
      setForm(runbook
        ? { title: runbook.title, category: runbook.category, systems: runbook.systems ?? [], steps: runbook.steps ?? [] }
        : EMPTY_FORM,
      );
      setErrors({});
    }
  }, [isOpen, runbook]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim())    errs.title    = 'Judul wajib diisi';
    if (!form.category)        errs.category = 'Kategori wajib dipilih';
    if (form.steps.every(s => !s.text.trim())) errs.steps = 'Minimal satu langkah harus diisi';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      ...form,
      steps: form.steps.filter(s => s.text.trim()),
      id:    runbook?.id,
    });
    onClose();
  };

  // ── Step management ──────────────────────────────────────────────────────

  const addStep = () => setForm(f => ({
    ...f,
    steps: [...f.steps, { id: `step-${Date.now()}`, text: '' }],
  }));

  const removeStep = (id) => setForm(f => ({
    ...f,
    steps: f.steps.filter(s => s.id !== id),
  }));

  const updateStep = (id, text) => setForm(f => ({
    ...f,
    steps: f.steps.map(s => s.id === id ? { ...s, text } : s),
  }));

  const moveStep = (idx, dir) => {
    const steps = [...form.steps];
    const target = idx + dir;
    if (target < 0 || target >= steps.length) return;
    [steps[idx], steps[target]] = [steps[target], steps[idx]];
    setForm(f => ({ ...f, steps }));
  };

  const toggleSystem = (sys) => setForm(f => ({
    ...f,
    systems: f.systems.includes(sys)
      ? f.systems.filter(s => s !== sys)
      : [...f.systems, sys],
  }));

  const inputCls = (field) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
    }`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={runbook ? 'Edit Runbook' : 'Tambah Runbook'} size="lg">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Judul */}
        <div>
          <label htmlFor="rb-title" className="block text-sm font-medium text-slate-700 mb-1">
            Judul <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="rb-title"
            type="text"
            value={form.title}
            onChange={e => { setForm(f => ({...f, title: e.target.value})); setErrors(e2 => ({...e2, title:''})); }}
            aria-required="true"
            aria-invalid={!!errors.title}
            className={inputCls('title')}
            placeholder="Nama prosedur…"
          />
          {errors.title && <p className="text-xs text-red-600 mt-1" role="alert">{errors.title}</p>}
        </div>

        {/* Kategori + Sistem */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rb-cat" className="block text-sm font-medium text-slate-700 mb-1">
              Kategori <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              id="rb-cat"
              value={form.category}
              onChange={e => { setForm(f => ({...f, category: e.target.value})); setErrors(e2 => ({...e2, category:''})); }}
              aria-required="true"
              className={inputCls('category')}
            >
              <option value="">— Pilih kategori —</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-red-600 mt-1" role="alert">{errors.category}</p>}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Sistem Terkait</p>
            <div className="flex flex-wrap gap-1.5">
              {SYSTEMS.map(sys => (
                <button
                  key={sys}
                  type="button"
                  onClick={() => toggleSystem(sys)}
                  aria-pressed={form.systems.includes(sys)}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    form.systems.includes(sys)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-brand-400'
                  }`}
                >
                  {sys}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Langkah-langkah */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">
              Langkah-langkah <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <Button type="button" variant="outline" size="sm" icon={<Plus size={12} />} onClick={addStep}>
              Tambah
            </Button>
          </div>
          {errors.steps && <p className="text-xs text-red-600 mb-2" role="alert">{errors.steps}</p>}
          <ol className="space-y-2">
            {form.steps.map((step, idx) => (
              <li key={step.id} className="flex items-start gap-2">
                <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center mt-2">
                  {idx + 1}
                </span>
                <textarea
                  value={step.text}
                  onChange={e => updateStep(step.id, e.target.value)}
                  rows={2}
                  placeholder={`Langkah ${idx + 1}…`}
                  aria-label={`Teks langkah ${idx + 1}`}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button type="button" onClick={() => moveStep(idx, -1)} disabled={idx === 0} aria-label="Pindah naik" className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30">
                    <ChevronUp size={14} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => moveStep(idx, 1)} disabled={idx === form.steps.length - 1} aria-label="Pindah turun" className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30">
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => removeStep(step.id)} disabled={form.steps.length <= 1} aria-label="Hapus langkah" className="p-1 rounded text-slate-400 hover:text-red-500 disabled:opacity-30">
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <Button variant="outline" className="flex-1" onClick={onClose} type="button">Batal</Button>
          <Button variant="primary" className="flex-1" type="submit">
            {runbook ? 'Simpan Perubahan' : 'Tambah Runbook'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default RunbookForm;
