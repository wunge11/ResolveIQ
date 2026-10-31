/**
 * RunbookChecklist.jsx
 * Menampilkan langkah-langkah runbook yang cocok sebagai checklist.
 * Setiap langkah yang dicentang menambah entri timeline otomatis.
 * Progres disimpan ke insiden.
 *
 * @param {object}   props
 * @param {object}   props.incident         - Data insiden lengkap
 * @param {object[]} props.runbooks         - Array semua runbook
 * @param {Function} props.onProgressUpdate - Callback (runbookId, completedStepIds) => void
 * @param {Function} props.onAddTimeline    - Callback untuk menambah entri timeline
 */

import { useState, useMemo } from 'react';
import { CheckSquare, Square, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';

/**
 * Mencari runbook yang paling cocok berdasarkan kategori dan sistem insiden.
 * @param {object}   incident
 * @param {object[]} runbooks
 * @returns {object|null}
 */
function findMatchingRunbook(incident, runbooks) {
  // Prioritas: cocok kategori DAN sistem
  const exact = runbooks.find(rb =>
    rb.category === incident.category &&
    (rb.systems ?? []).includes(incident.system),
  );
  if (exact) return exact;

  // Fallback: cocok kategori saja
  const byCategory = runbooks.find(rb => rb.category === incident.category);
  if (byCategory) return byCategory;

  // Fallback: cocok sistem saja
  return runbooks.find(rb => (rb.systems ?? []).includes(incident.system)) ?? null;
}

function RunbookChecklist({ incident, runbooks, onProgressUpdate, onAddTimeline }) {
  const [expanded, setExpanded] = useState(true);
  const [localRunbookId, setLocalRunbookId] = useState(
    incident.runbookProgress?.runbookId ?? null,
  );

  const matchedRunbook = useMemo(() => {
    if (localRunbookId) return runbooks.find(rb => rb.id === localRunbookId) ?? null;
    return findMatchingRunbook(incident, runbooks);
  }, [incident, runbooks, localRunbookId]);

  const completedStepIds = incident.runbookProgress?.completedStepIds ?? [];

  const handleToggleStep = (step) => {
    const rbId = matchedRunbook?.id;
    if (!rbId) return;

    const isCompleted = completedStepIds.includes(step.id);
    const newCompleted = isCompleted
      ? completedStepIds.filter(id => id !== step.id)
      : [...completedStepIds, step.id];

    onProgressUpdate(rbId, newCompleted);

    // Tambah entri timeline otomatis
    if (!isCompleted) {
      onAddTimeline({
        type:   'Action',
        note:   `[Runbook] Langkah selesai: ${step.text.substring(0, 80)}${step.text.length > 80 ? '…' : ''}`,
        author: 'Rina Aditya',
        time:   new Date().toISOString(),
      });
    }
  };

  const handleSelectRunbook = (rbId) => {
    setLocalRunbookId(rbId);
    onProgressUpdate(rbId, []);
  };

  const doneCount  = (matchedRunbook?.steps ?? []).filter(s => completedStepIds.includes(s.id)).length;
  const totalCount = matchedRunbook?.steps?.length ?? 0;
  const progress   = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <section aria-label="Runbook checklist">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <BookOpen size={15} className="text-brand-600" aria-hidden="true" />
          Runbook Rekomendasi
        </h3>
        <button
          onClick={() => setExpanded(e => !e)}
          aria-label={expanded ? 'Tutup runbook' : 'Buka runbook'}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <>
          {/* Selector runbook */}
          <div className="mb-3">
            <label htmlFor="rb-select" className="sr-only">Pilih runbook</label>
            <select
              id="rb-select"
              value={matchedRunbook?.id ?? ''}
              onChange={e => handleSelectRunbook(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="">— Pilih runbook —</option>
              {runbooks.map(rb => (
                <option key={rb.id} value={rb.id}>
                  {rb.title} (v{rb.version})
                </option>
              ))}
            </select>
          </div>

          {!matchedRunbook ? (
            <EmptyState
              icon={BookOpen}
              title="Tidak ada runbook yang cocok"
              message="Pilih runbook secara manual dari dropdown di atas."
              className="py-6"
            />
          ) : (
            <>
              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{matchedRunbook.title}</span>
                  <span className="font-semibold">{doneCount}/{totalCount} ({progress}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progress runbook ${progress}%`}
                  />
                </div>
              </div>

              {/* Langkah-langkah */}
              <ol className="space-y-2">
                {(matchedRunbook.steps ?? []).map((step, idx) => {
                  const done = completedStepIds.includes(step.id);
                  return (
                    <li key={step.id} className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleStep(step)}
                        aria-label={done ? `Batalkan: ${step.text}` : `Tandai selesai: ${step.text}`}
                        className={`shrink-0 mt-0.5 transition-colors ${
                          done ? 'text-brand-600' : 'text-slate-300 hover:text-slate-500'
                        }`}
                      >
                        {done
                          ? <CheckSquare size={16} aria-hidden="true" />
                          : <Square size={16} aria-hidden="true" />
                        }
                      </button>
                      <p className={`text-sm leading-snug ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        <span className="font-semibold text-slate-400 mr-1">{idx + 1}.</span>
                        {step.text}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </>
      )}
    </section>
  );
}

export default RunbookChecklist;
