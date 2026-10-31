/**
 * AlertsPanel.jsx
 * Panel peringatan otomatis hasil perhitungan dari kondisi insiden dan post-mortem.
 * Alert dapat di-dismiss. Setiap alert memiliki tombol aksi yang membuka item terkait.
 *
 * @param {object}   props
 * @param {object[]} props.incidents    - Array semua insiden
 * @param {object[]} props.postMortems  - Array semua post-mortem
 * @param {Function} props.onNavigate   - Callback navigasi halaman
 * @param {Function} props.onOpenDetail - Callback buka detail insiden
 */

import { useMemo } from 'react';
import { AlertCircle, AlertTriangle, Info, X, ExternalLink } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext.jsx';
import { generateAlerts } from '../../utils/alerts.js';
import { timeAgo } from '../../utils/date.js';
import EmptyState from '../common/EmptyState.jsx';
import { Bell } from 'lucide-react';

const ALERT_CONFIG = {
  critical: {
    icon:    AlertCircle,
    border:  'border-red-200',
    bg:      'bg-red-50',
    iconCls: 'text-red-500',
    dot:     'bg-red-500',
    label:   'Kritis',
  },
  warning: {
    icon:    AlertTriangle,
    border:  'border-amber-200',
    bg:      'bg-amber-50',
    iconCls: 'text-amber-500',
    dot:     'bg-amber-500',
    label:   'Peringatan',
  },
  info: {
    icon:    Info,
    border:  'border-blue-200',
    bg:      'bg-blue-50',
    iconCls: 'text-blue-500',
    dot:     'bg-blue-500',
    label:   'Informasi',
  },
};

function AlertsPanel({ incidents, postMortems, onNavigate, onOpenDetail }) {
  const { state, dispatch } = useIncidents();

  const alerts = useMemo(
    () => generateAlerts(incidents, postMortems, state.dismissedAlerts),
    [incidents, postMortems, state.dismissedAlerts],
  );

  const handleDismiss = (alertId) => {
    dispatch({ type: 'DISMISS_ALERT', payload: { alertId } });
  };

  const handleAction = (alert) => {
    if (alert.refType === 'incident') {
      const inc = incidents.find(i => i.id === alert.refId);
      if (inc) onOpenDetail(inc);
    } else if (alert.refType === 'postmortem') {
      onNavigate('Post-Mortems');
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-card p-5" aria-label="Panel alert">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800">
          Alerts
          {alerts.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full">
              {alerts.length > 9 ? '9+' : alerts.length}
            </span>
          )}
        </h3>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Tidak ada alert aktif"
          message="Semua sistem berjalan normal."
          className="py-8"
        />
      ) : (
        <ul className="space-y-2" role="list">
          {alerts.map(alert => {
            const config = ALERT_CONFIG[alert.type] ?? ALERT_CONFIG.info;
            const Icon   = config.icon;

            return (
              <li
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${config.border} ${config.bg}`}
                role="listitem"
              >
                <Icon size={16} className={`shrink-0 mt-0.5 ${config.iconCls}`} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 leading-snug">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{timeAgo(alert.time)}</p>
                </div>
                {/* Tombol aksi */}
                <button
                  onClick={() => handleAction(alert)}
                  aria-label={`Buka item terkait alert: ${alert.message}`}
                  className="shrink-0 p-1 rounded text-slate-500 hover:text-brand-600 transition-colors"
                >
                  <ExternalLink size={13} aria-hidden="true" />
                </button>
                {/* Dismiss */}
                <button
                  onClick={() => handleDismiss(alert.id)}
                  aria-label="Dismiss alert"
                  className="shrink-0 p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default AlertsPanel;
