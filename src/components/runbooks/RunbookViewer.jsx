/**
 * RunbookViewer.jsx
 * Menampilkan isi runbook secara lengkap:
 * judul, kategori, sistem, versi, langkah bernomor, dan usulan pembaruan.
 *
 * @param {object}   props
 * @param {object}   props.runbook         - Data runbook yang ditampilkan
 * @param {object[]} props.incidents        - Semua insiden (untuk lookup judul)
 * @param {Function} props.onEdit           - Callback buka form edit
 * @param {Function} props.onAcceptSuggestion - Callback terima usulan
 * @param {Function} props.onRejectSuggestion - Callback tolak usulan
 */

import { useState } from 'react';
import {
  BookOpen, Server, Tag, Calendar, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Pencil,
} from 'lucide-react';
import { formatDateTime } from '../../utils/date.js';
import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';

/** Komponen untuk menampilkan satu usulan pembaruan */
function SuggestionItem({ suggestion, incident, onAccept, onReject }) {
  const [newStep, setNewStep] = useState(suggestion.text);
  const [showForm, setShowForm] = useState(false);

  const statusConfig = {
    pending:  { label: 'Menunggu',  cls: 'bg-amber-100 text-amber-700' },
    accepted: { label: 'Diterima',  cls: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'Ditolak',   cls: 'bg-red-100 text-red-700' },
  };
  const cfg = statusConfig[suggestion.status] ?? statusConfig.pending;

  return (
    <li className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm text-slate-700">{suggestion.text}</p>
          {incident && (
            <p className="text-xs text-slate-400 mt-0.5">
              Dari insiden: <span className="font-medium">{incident.id}</span> — {incident.title}
            </p>
          )}
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.cls}`}>
          {cfg.label}
        </span>
      </div>

      {suggestion.status === 'pending' && (
        <>
          {showForm ? (
            <div className="space-y-2">
              <label className="text-xs text-slate-600 font-medium">Teks langkah baru:</label>
              <textarea
                value={newStep}
                onChange={e => setNewStep(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={() => { onAccept(suggestion.id, newStep); setShowForm(false); }}>
                  Konfirmasi Terima
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Batal</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<CheckCircle2 size={13} />}
                className="text-emerald-600 border-emerald-300"
                onClick={() => setShowForm(true)}
              >
                Terima
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<XCircle size={13} />}
                className="text-red-500 border-red-300"
                onClick={() => onReject(suggestion.id)}
              >
                Tolak
              </Button>
            </div>
          )}
        </>
      )}
    </li>
  );
}

function RunbookViewer({ runbook, incidents, onEdit, onAcceptSuggestion, onRejectSuggestion }) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const pendingCount = (runbook.suggestions ?? []).filter(s => s.status === 'pending').length;

  if (!runbook) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-card h-full flex items-center justify-center">
        <EmptyState icon={BookOpen} title="Pilih runbook" message="Klik runbook di sebelah kiri untuk melihat detailnya." />
      </div>
    );
  }

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden" aria-label={`Runbook: ${runbook.title}`}>
      {/* Header */}
      <header className="flex items-start gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full font-semibold">{runbook.category}</span>
            <span className="text-xs text-slate-400">v{runbook.version}</span>
            {pendingCount > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {pendingCount} usulan menunggu
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-800">{runbook.title}</h2>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            {runbook.systems?.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Server size={12} aria-hidden="true" />
                {runbook.systems.join(', ')}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={12} aria-hidden="true" />
              Diperbarui {formatDateTime(runbook.updatedAt, false)}
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" icon={<Pencil size={14} />} onClick={onEdit}>
          Edit
        </Button>
      </header>

      {/* Konten */}
      <div className="p-6 space-y-6">
        {/* Langkah-langkah */}
        <section aria-label="Langkah-langkah runbook">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Langkah-langkah ({runbook.steps?.length ?? 0})
          </h3>
          {(runbook.steps ?? []).length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada langkah terdefinisi.</p>
          ) : (
            <ol className="space-y-3">
              {(runbook.steps ?? []).map((step, idx) => (
                <li key={step.id} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed pt-0.5">{step.text}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Usulan Pembaruan */}
        {(runbook.suggestions ?? []).length > 0 && (
          <section className="border-t border-slate-100 pt-6">
            <button
              onClick={() => setShowSuggestions(s => !s)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 w-full text-left"
            >
              <Tag size={14} className="text-brand-600" aria-hidden="true" />
              Usulan Pembaruan ({runbook.suggestions.length})
              {showSuggestions ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
            </button>

            {showSuggestions && (
              <ul className="mt-3 space-y-2">
                {runbook.suggestions.map(sug => {
                  const inc = incidents.find(i => i.id === sug.fromIncidentId);
                  return (
                    <SuggestionItem
                      key={sug.id}
                      suggestion={sug}
                      incident={inc}
                      onAccept={(sugId, stepText) => onAcceptSuggestion(runbook.id, sugId, stepText)}
                      onReject={(sugId) => onRejectSuggestion(runbook.id, sugId)}
                    />
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </div>
    </article>
  );
}

export default RunbookViewer;
