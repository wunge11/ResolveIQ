/**
 * ActivityFeed.jsx
 * Feed 8 aktivitas terakhir (insiden dibuat, status berubah, post-mortem dibuat, dst.)
 * dengan waktu relatif.
 *
 * @param {object}   props
 * @param {object[]} props.activities   - Array aktivitas
 * @param {Function} props.onNavigate   - Callback navigasi
 */

import { useMemo } from 'react';
import {
  AlertCircle, RefreshCw, CheckCircle, FileText, Activity,
} from 'lucide-react';
import { timeAgo } from '../../utils/date.js';
import EmptyState from '../common/EmptyState.jsx';

const ACTIVITY_CONFIG = {
  incident_created:  { icon: AlertCircle, color: 'text-red-500',     bg: 'bg-red-50'     },
  status_changed:    { icon: RefreshCw,   color: 'text-blue-500',    bg: 'bg-blue-50'    },
  incident_resolved: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  incident_closed:   { icon: CheckCircle, color: 'text-slate-500',   bg: 'bg-slate-100'  },
  postmortem_created:{ icon: FileText,    color: 'text-purple-500',  bg: 'bg-purple-50'  },
};

function ActivityFeed({ activities, onNavigate }) {
  const recent = useMemo(() =>
    [...activities]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8),
    [activities],
  );

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-card p-5" aria-label="Feed aktivitas terbaru">
      <h3 className="text-base font-semibold text-slate-800 mb-4">Aktivitas Terbaru</h3>

      {recent.length === 0 ? (
        <EmptyState icon={Activity} title="Belum ada aktivitas" className="py-6" />
      ) : (
        <ol className="relative" aria-label="Daftar aktivitas terbaru">
          {/* Garis vertikal penghubung */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100" aria-hidden="true" />

          {recent.map((activity, idx) => {
            const config = ACTIVITY_CONFIG[activity.type] ?? ACTIVITY_CONFIG.status_changed;
            const Icon   = config.icon;

            return (
              <li key={activity.id} className={`flex items-start gap-3 ${idx < recent.length - 1 ? 'mb-4' : ''}`}>
                {/* Ikon */}
                <div className={`shrink-0 z-10 w-8 h-8 rounded-full flex items-center justify-center ${config.bg}`}>
                  <Icon size={14} className={config.color} aria-hidden="true" />
                </div>

                {/* Konten */}
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm text-slate-700 leading-snug">{activity.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{timeAgo(activity.time)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default ActivityFeed;
