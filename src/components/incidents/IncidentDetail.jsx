/**
 * IncidentDetail.jsx
 * Panel detail insiden lengkap.
 * Menampilkan: header (ID, badge, durasi), ubah status, info lengkap,
 * Timeline, RunbookChecklist, SimilarIncidents, dan tombol aksi.
 *
 * @param {object}   props
 * @param {object}   props.incident          - Data insiden yang ditampilkan
 * @param {Function} props.onClose           - Callback tutup panel detail
 * @param {Function} props.onNavigate        - Callback navigasi halaman
 * @param {Function} props.addToast          - Callback toast notification
 * @param {Function} props.onCreatePM        - Callback buka wizard post-mortem
 */

import { useState, useMemo } from 'react';
import {
  X, Clock, ChevronDown, Edit2, Trash2, FileText,
  Tag, User, Server, Layers, AlertTriangle,
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext.jsx';
import { getSeverityColor, getStatusColor } from '../../utils/severity.js';
import { calcDurationMinutes, formatDuration, formatDateTime } from '../../utils/date.js';
import { STATUS_TRANSITIONS } from '../../utils/constants.js';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import Timeline from './Timeline.jsx';
import RunbookChecklist from './RunbookChecklist.jsx';
import SimilarIncidents from './SimilarIncidents.jsx';

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <span className="text-xs text-slate-400">{label}: </span>
        <span className="text-sm text-slate-700">{value}</span>
      </div>
    </div>
  );
}

function IncidentDetail({ incident: initialIncident, onClose, onNavigate, addToast, onCreatePM }) {
  const { state, dispatch } = useIncidents();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusMenu,    setShowStatusMenu]    = useState(false);

  // Selalu gunakan data terbaru dari state (bukan prop stale)
  const incident = useMemo(
    () => state.incidents.find(i => i.id === initialIncident.id) ?? initialIncident,
    [state.incidents, initialIncident.id, initialIncident],
  );

  const nextStatuses = STATUS_TRANSITIONS[incident.status] ?? [];
  const duration     = formatDuration(calcDurationMinutes(incident.createdAt, incident.resolvedAt));
  const canCreatePM  = (incident.status === 'Resolved' || incident.status === 'Closed') && !incident.postMortemId;

  const handleStatusChange = (newStatus) => {
    dispatch({ type: 'CHANGE_STATUS', payload: { id: incident.id, newStatus } });
    setShowStatusMenu(false);
    addToast(`Status berubah menjadi ${newStatus}`, 'success');
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_INCIDENT', payload: { id: incident.id } });
    addToast(`Insiden ${incident.id} dihapus`, 'info');
    onClose();
  };

  const handleAddTimeline = (entry) => {
    dispatch({ type: 'ADD_TIMELINE_ENTRY', payload: { incidentId: incident.id, entry } });
  };

  const handleRunbookProgress = (runbookId, completedStepIds) => {
    dispatch({ type: 'UPDATE_RUNBOOK_PROGRESS', payload: { incidentId: incident.id, runbookId, completedStepIds } });
  };

  return (
    <>
      <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        {/* ── Header ── */}
        <header className="flex items-start gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold text-slate-500">{incident.id}</span>
              <Badge className={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
              <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
              {incident.postMortemId && (
                <span className="text-xs font-medium text-purple-600 flex items-center gap-1">
                  <FileText size={11} aria-hidden="true" /> PM tersedia
                </span>
              )}
            </div>
            <h2 className="text-base font-semibold text-slate-800 leading-tight">{incident.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Clock size={11} aria-hidden="true" />
              Berjalan selama {duration} · dibuat {formatDateTime(incident.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup detail insiden"
            className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {/* ── Scroll area ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-0 xl:gap-0">

            {/* ── Kolom kiri (info + timeline) ── */}
            <div className="xl:col-span-2 p-5 space-y-5 border-r border-slate-100">

              {/* Ubah status */}
              {nextStatuses.length > 0 && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<ChevronDown size={14} />}
                    onClick={() => setShowStatusMenu(s => !s)}
                    className="w-full sm:w-auto"
                  >
                    Ubah Status
                  </Button>
                  {showStatusMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-40 py-1 animate-fade-in">
                      {nextStatuses.map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Info insiden */}
              <section aria-label="Informasi insiden">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Detail</h3>
                <div className="space-y-2">
                  <InfoRow icon={Server}      label="Sistem"     value={incident.system}   />
                  <InfoRow icon={Layers}      label="Kategori"   value={incident.category} />
                  <InfoRow icon={User}        label="Pelapor"    value={incident.reporter} />
                  <InfoRow icon={User}        label="Assignee"   value={incident.assignee} />
                  <InfoRow icon={AlertTriangle} label="Dampak"   value={incident.impact}   />
                  {incident.resolvedAt && (
                    <InfoRow icon={Clock} label="Resolved" value={formatDateTime(incident.resolvedAt)} />
                  )}
                </div>
                {/* Deskripsi */}
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{incident.description}</p>
                </div>
                {/* Tags */}
                {incident.tags?.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Tag size={12} className="text-slate-400" aria-hidden="true" />
                    {incident.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* Timeline */}
              <div className="border-t border-slate-100 pt-5">
                <Timeline incident={incident} onAddEntry={handleAddTimeline} />
              </div>
            </div>

            {/* ── Kolom kanan (runbook + insiden serupa) ── */}
            <div className="p-5 space-y-5 bg-slate-50/50">
              {/* Runbook checklist */}
              <RunbookChecklist
                incident={incident}
                runbooks={state.runbooks}
                onProgressUpdate={handleRunbookProgress}
                onAddTimeline={handleAddTimeline}
              />

              {/* Insiden serupa */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Insiden Serupa</h3>
                <SimilarIncidents
                  base={incident}
                  allIncidents={state.incidents}
                  onSelect={(inc) => {
                    // Buka insiden serupa: update incident di parent
                    const freshInc = state.incidents.find(i => i.id === inc.id);
                    if (freshInc) onClose(); // tutup dulu, biarkan parent handle
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer aksi ── */}
        <footer className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white gap-3 flex-wrap">
          <div className="flex gap-2">
            {canCreatePM && (
              <Button
                variant="primary"
                size="sm"
                icon={<FileText size={14} />}
                onClick={() => onCreatePM && onCreatePM(incident)}
              >
                Buat Post-Mortem
              </Button>
            )}
            {incident.postMortemId && (
              <Button
                variant="outline"
                size="sm"
                icon={<FileText size={14} />}
                onClick={() => onNavigate('Post-Mortems')}
              >
                Lihat Post-Mortem
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit2 size={14} />}
              onClick={() => addToast('Edit insiden akan hadir di versi berikutnya.', 'info')}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-500 hover:bg-red-50"
            >
              Hapus
            </Button>
          </div>
        </footer>
      </div>

      {/* Dialog konfirmasi hapus */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={`Hapus Insiden ${incident.id}?`}
        message="Insiden ini beserta seluruh timeline akan dihapus permanen."
        confirmLabel="Hapus Insiden"
        variant="danger"
      />
    </>
  );
}

export default IncidentDetail;
