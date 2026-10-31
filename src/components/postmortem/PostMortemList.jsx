/**
 * PostMortemList.jsx
 * Daftar post-mortem dalam bentuk kartu dengan status kelengkapan
 * dan progress action item. Aksi: Lihat, Edit, Hapus.
 *
 * @param {object}   props
 * @param {object[]} props.postMortems  - Array post-mortem
 * @param {object[]} props.incidents    - Array insiden
 * @param {Function} props.onView       - Callback lihat (pm) => void
 * @param {Function} props.onEdit       - Callback edit (pm) => void
 * @param {Function} props.onDelete     - Callback hapus (pmId) => void
 * @param {Function} props.onCreate     - Callback buat baru
 */

import { useMemo } from 'react';
import { Eye, Pencil, Trash2, FileText, Plus } from 'lucide-react';
import { isOverdue, formatDateTime } from '../../utils/date.js';
import { getSeverityColor } from '../../utils/severity.js';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';

function PMCard({ pm, incident, onView, onEdit, onDelete }) {
  const stats = useMemo(() => {
    const total = pm.actionItems?.length ?? 0;
    const done  = pm.actionItems?.filter(ai => ai.done).length ?? 0;
    const overdue = pm.actionItems?.filter(ai => !ai.done && isOverdue(ai.dueDate)).length ?? 0;
    return { total, done, overdue, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [pm.actionItems]);

  // Cek kelengkapan analisis
  const hasAnalysis = pm.rootCause && pm.impact && pm.wentWell && pm.needsImprovement;
  const completeness = [
    pm.summary,
    pm.timeline?.length > 0,
    hasAnalysis,
    pm.actionItems?.length > 0,
  ].filter(Boolean).length;

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-card p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-slate-400">{pm.id}</span>
            {incident && <Badge className={getSeverityColor(incident.severity)} size="sm">{incident.severity}</Badge>}
            {/* Kelengkapan badge */}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              completeness === 4 ? 'bg-emerald-100 text-emerald-700' :
              completeness >= 2  ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
            }`}>
              {completeness}/4 lengkap
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2">
            {incident?.title ?? pm.incidentId}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dibuat {formatDateTime(pm.createdAt, false)}
          </p>
        </div>
      </div>

      {/* Progress action items */}
      {stats.total > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Action Items</span>
            <span className="font-semibold">{stats.done}/{stats.total}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full"
              style={{ width: `${stats.pct}%` }}
              role="progressbar"
              aria-valuenow={stats.pct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          {stats.overdue > 0 && (
            <p className="text-xs text-red-500 font-medium mt-1">⚠ {stats.overdue} item terlambat</p>
          )}
        </div>
      )}

      {/* Aksi */}
      <div className="flex gap-2 mt-3 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" icon={<Eye size={13} />} onClick={() => onView(pm)} className="flex-1">Lihat</Button>
        <Button variant="ghost" size="sm" icon={<Pencil size={13} />} onClick={() => onEdit(pm)}>Edit</Button>
        <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} onClick={() => onDelete(pm.id)} className="text-red-400 hover:bg-red-50">Hapus</Button>
      </div>
    </article>
  );
}

function PostMortemList({ postMortems, incidents, onView, onEdit, onDelete, onCreate }) {
  if (postMortems.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Belum ada post-mortem"
        message="Post-mortem dapat dibuat dari detail insiden yang sudah Resolved."
        action={<Button variant="primary" icon={<Plus size={14} />} onClick={onCreate}>Buat Post-Mortem</Button>}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {postMortems.map(pm => {
        const incident = incidents.find(i => i.id === pm.incidentId);
        return (
          <PMCard
            key={pm.id}
            pm={pm}
            incident={incident}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
}

export default PostMortemList;
