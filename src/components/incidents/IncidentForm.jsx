/**
 * IncidentForm.jsx
 * Form modal untuk melaporkan insiden baru.
 * Fitur:
 * - Validasi inline per field
 * - SeverityWizard terintegrasi (bisa override manual)
 * - Panel SimilarIncidents real-time di samping form
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen    - Apakah modal terbuka
 * @param {Function} props.onClose   - Callback tutup modal
 * @param {Function} props.addToast  - Callback toast notification
 * @param {Function} props.onCreated - Callback setelah insiden berhasil dibuat (incident) => void
 */

import { useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext.jsx';
import { SEVERITIES, CATEGORIES, SYSTEMS } from '../../utils/constants.js';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import SeverityWizard from './SeverityWizard.jsx';
import SimilarIncidents from './SimilarIncidents.jsx';

/** Sanitasi teks input sederhana */
function sanitize(str) {
  return (str ?? '').trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const EMPTY_FORM = {
  title:       '',
  description: '',
  system:      '',
  category:    '',
  reporter:    '',
  impact:      '',
  tags:        '',
  severity:    'SEV3',
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 mt-1" role="alert">{message}</p>;
}

function IncidentForm({ isOpen, onClose, addToast, onCreated }) {
  const { state, dispatch }  = useIncidents();
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = useCallback((key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  }, [errors]);

  /** Validasi semua field wajib */
  const validate = () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = 'Judul wajib diisi';
    if (!form.description.trim()) errs.description = 'Deskripsi wajib diisi';
    if (!form.system)             errs.system      = 'Sistem terdampak wajib dipilih';
    if (!form.category)           errs.category    = 'Kategori wajib dipilih';
    if (!form.reporter.trim())    errs.reporter    = 'Nama pelapor wajib diisi';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    const tagArray = form.tags
      .split(',')
      .map(t => sanitize(t.trim()))
      .filter(Boolean);

    const payload = {
      title:       sanitize(form.title),
      description: sanitize(form.description),
      system:      form.system,
      category:    form.category,
      reporter:    sanitize(form.reporter),
      impact:      sanitize(form.impact),
      tags:        tagArray,
      severity:    form.severity,
      status:      'Open',
      assignee:    null,
    };

    dispatch({ type: 'ADD_INCIDENT', payload });
    addToast(`Insiden berhasil dilaporkan dengan status Open.`, 'success');
    if (onCreated) onCreated(payload);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowWizard(false);
    setLoading(false);
    onClose();
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setShowWizard(false);
    onClose();
  };

  // Objek partial untuk SimilarIncidents
  const partialIncident = {
    id:       '__new__',
    title:    form.title,
    system:   form.system,
    category: form.category,
    tags:     form.tags.split(',').map(t => t.trim()).filter(Boolean),
  };

  const inputCls = (field) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
    }`;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Laporkan Insiden" size="xl">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Kolom kiri: form fields ── */}
          <div className="flex-1 space-y-4">
            {/* Judul */}
            <div>
              <label htmlFor="inc-title" className="block text-sm font-medium text-slate-700 mb-1">
                Judul <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="inc-title"
                type="text"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                placeholder="Deskripsi singkat masalah…"
                aria-required="true"
                aria-invalid={!!errors.title}
                className={inputCls('title')}
              />
              <FieldError message={errors.title} />
            </div>

            {/* Deskripsi */}
            <div>
              <label htmlFor="inc-desc" className="block text-sm font-medium text-slate-700 mb-1">
                Deskripsi <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="inc-desc"
                rows={3}
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Detail lengkap tentang apa yang terjadi…"
                aria-required="true"
                aria-invalid={!!errors.description}
                className={`${inputCls('description')} resize-none`}
              />
              <FieldError message={errors.description} />
            </div>

            {/* Sistem + Kategori (grid 2 kolom) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="inc-system" className="block text-sm font-medium text-slate-700 mb-1">
                  Sistem Terdampak <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <select
                  id="inc-system"
                  value={form.system}
                  onChange={e => update('system', e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.system}
                  className={inputCls('system')}
                >
                  <option value="">— Pilih sistem —</option>
                  {SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <FieldError message={errors.system} />
              </div>
              <div>
                <label htmlFor="inc-category" className="block text-sm font-medium text-slate-700 mb-1">
                  Kategori <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <select
                  id="inc-category"
                  value={form.category}
                  onChange={e => update('category', e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.category}
                  className={inputCls('category')}
                >
                  <option value="">— Pilih kategori —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <FieldError message={errors.category} />
              </div>
            </div>

            {/* Pelapor + Dampak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="inc-reporter" className="block text-sm font-medium text-slate-700 mb-1">
                  Pelapor <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="inc-reporter"
                  type="text"
                  value={form.reporter}
                  onChange={e => update('reporter', e.target.value)}
                  placeholder="Nama Anda"
                  aria-required="true"
                  aria-invalid={!!errors.reporter}
                  className={inputCls('reporter')}
                />
                <FieldError message={errors.reporter} />
              </div>
              <div>
                <label htmlFor="inc-impact" className="block text-sm font-medium text-slate-700 mb-1">
                  Dampak ke Pengguna
                </label>
                <input
                  id="inc-impact"
                  type="text"
                  value={form.impact}
                  onChange={e => update('impact', e.target.value)}
                  placeholder="Contoh: 30% pengguna tidak bisa login"
                  className={inputCls('impact')}
                />
              </div>
            </div>

            {/* Tag */}
            <div>
              <label htmlFor="inc-tags" className="block text-sm font-medium text-slate-700 mb-1">
                Tag <span className="text-xs text-slate-400">(pisahkan dengan koma)</span>
              </label>
              <input
                id="inc-tags"
                type="text"
                value={form.tags}
                onChange={e => update('tags', e.target.value)}
                placeholder="database, latency, postgres"
                className={inputCls('tags')}
              />
            </div>

            {/* Severity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Severity
                </label>
                <button
                  type="button"
                  onClick={() => setShowWizard(w => !w)}
                  className="flex items-center gap-1 text-xs text-brand-600 hover:text-blue-800 font-medium"
                >
                  <Sparkles size={12} aria-hidden="true" />
                  {showWizard ? 'Tutup Wizard' : 'Gunakan Wizard'}
                </button>
              </div>

              {showWizard ? (
                <SeverityWizard
                  onRecommend={({ severity }) => {
                    update('severity', severity);
                    setShowWizard(false);
                  }}
                  onClose={() => setShowWizard(false)}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {SEVERITIES.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => update('severity', s.value)}
                      aria-pressed={form.severity === s.value}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                        form.severity === s.value
                          ? s.color + ' shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {s.value}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer tombol */}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <Button variant="outline" className="flex-1" onClick={handleClose} type="button">
                Batal
              </Button>
              <Button variant="primary" className="flex-1" type="submit" loading={loading}>
                Laporkan Insiden
              </Button>
            </div>
          </div>

          {/* ── Kolom kanan: insiden serupa ── */}
          <div className="lg:w-72 shrink-0">
            <p className="text-sm font-medium text-slate-700 mb-2">Insiden Serupa</p>
            <SimilarIncidents
              base={partialIncident}
              allIncidents={state.incidents}
              onSelect={null}
            />
            {form.title.length < 2 && (
              <p className="text-xs text-slate-400 text-center py-4">
                Isi judul untuk melihat insiden serupa
              </p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default IncidentForm;
