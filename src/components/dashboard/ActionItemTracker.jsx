/**
 * ActionItemTracker.jsx
 * Progress tracker untuk action item dari semua post-mortem.
 * Menampilkan progress bar global dan daftar per post-mortem.
 * Action item dapat dicentang langsung dari panel ini.
 *
 * @param {object}   props
 * @param {object[]} props.postMortems - Array semua post-mortem
 * @param {object[]} props.incidents   - Array semua insiden (untuk lookup judul)
 * @param {Function} props.onNavigate  - Callback navigasi ke Post-Mortems
 */

import { useMemo } from 'react';
import { CheckSquare, Square, ChevronRight, ClipboardList } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext.jsx';
import { calcActionItemProgress } from '../../utils/stats.js';
import { isOverdue } from '../../utils/date.js';
import EmptyState from '../common/EmptyState.jsx';

function ActionItemTracker({ postMortems, incidents, onNavigate }) {
  const { dispatch } = useIncidents();

  const overall = useMemo(() => calcActionItemProgress(postMortems), [postMortems]);

  const handleToggle = (postMortemId, actionItemId) => {
    dispatch({ type: 'TOGGLE_ACTION_ITEM', payload: { postMortemId, actionItemId } });
  };

  // Ambil max 3 post-mortem yang memiliki action item belum selesai
  const activePMs = useMemo(() =>
    postMortems
      .filter(pm => (pm.actionItems ?? []).some(ai => !ai.done))
      .slice(0, 3),
    [postMortems],
  );

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-card p-5" aria-label="Action item tracker">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800">Action Items</h3>
        <button
          onClick={() => onNavigate('Post-Mortems')}
          className="text-xs text-brand-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          Lihat Semua <ChevronRight size={12} aria-hidden="true" />
        </button>
      </div>

      {postMortems.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Belum ada action item" className="py-6" />
      ) : (
        <>
          {/* Progress bar keseluruhan */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Progress keseluruhan</span>
              <span className="font-semibold text-slate-700">
                {overall.done}/{overall.total} selesai ({overall.percentage}%)
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={overall.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress action item keseluruhan"
              className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-500"
                style={{ width: `${overall.percentage}%` }}
              />
            </div>
          </div>

          {/* Daftar per post-mortem */}
          <div className="space-y-4">
            {activePMs.length === 0 ? (
              <p className="text-sm text-emerald-600 font-medium text-center py-2">
                🎉 Semua action item selesai!
              </p>
            ) : (
              activePMs.map(pm => {
                const incident = incidents.find(i => i.id === pm.incidentId);
                const pendingItems = pm.actionItems.filter(ai => !ai.done);
                return (
                  <article key={pm.id} className="border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-600 truncate">
                        {pm.id} — {incident?.title ?? pm.incidentId}
                      </p>
                      <span className="text-xs text-slate-400 shrink-0 ml-2">
                        {pm.actionItems.filter(ai => ai.done).length}/{pm.actionItems.length}
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {pendingItems.slice(0, 3).map(ai => {
                        const overdue = isOverdue(ai.dueDate);
                        return (
                          <li key={ai.id} className="flex items-start gap-2">
                            <button
                              onClick={() => handleToggle(pm.id, ai.id)}
                              aria-label={`Tandai selesai: ${ai.text}`}
                              className="shrink-0 mt-0.5 text-slate-400 hover:text-brand-600 transition-colors"
                            >
                              <Square size={14} aria-hidden="true" />
                            </button>
                            <div className="min-w-0">
                              <p className="text-xs text-slate-700 leading-tight truncate">{ai.text}</p>
                              <p className={`text-xs mt-0.5 ${overdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                                {ai.owner} · {overdue ? '⚠ Terlambat' : ai.dueDate}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                );
              })
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default ActionItemTracker;
