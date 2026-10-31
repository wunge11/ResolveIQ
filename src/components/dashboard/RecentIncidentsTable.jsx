/**
 * RecentIncidentsTable.jsx
 * Tabel 6 insiden terbaru di Dashboard.
 * Klik baris membuka detail insiden.
 * Pada layar kecil berubah menjadi tampilan card.
 *
 * @param {object}   props
 * @param {object[]} props.incidents    - Array semua insiden
 * @param {Function} props.onOpenDetail - Callback buka detail insiden
 * @param {Function} props.onNavigate   - Callback navigasi ke halaman Incidents
 */

import { useMemo } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { getRecentIncidents } from '../../utils/stats.js';
import { getSeverityColor, getStatusColor } from '../../utils/severity.js';
import { timeAgo } from '../../utils/date.js';
import Badge from '../common/Badge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { FileX } from 'lucide-react';

function RecentIncidentsTable({ incidents, onOpenDetail, onNavigate }) {
  const recent = useMemo(() => getRecentIncidents(incidents, 6), [incidents]);

  if (recent.length === 0) {
    return (
      <section className="bg-white rounded-xl border border-slate-200 shadow-card p-5" aria-label="Insiden terbaru">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Insiden Terbaru</h3>
        <EmptyState icon={FileX} title="Belum ada insiden" message="Laporan insiden pertama Anda akan muncul di sini." />
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden" aria-label="Insiden terbaru">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">Insiden Terbaru</h3>
        <button
          onClick={() => onNavigate('Incidents')}
          className="text-xs text-brand-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          Lihat Semua <ArrowRight size={12} aria-hidden="true" />
        </button>
      </div>

      {/* Tabel — desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm" aria-label="Tabel insiden terbaru">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th scope="col" className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
              <th scope="col" className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Judul</th>
              <th scope="col" className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sistem</th>
              <th scope="col" className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Severity</th>
              <th scope="col" className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th scope="col" className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Waktu</th>
              <th scope="col" className="px-5 py-3 w-8"><span className="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recent.map(inc => (
              <tr
                key={inc.id}
                onClick={() => onOpenDetail(inc)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3 font-mono text-xs text-slate-500 font-semibold whitespace-nowrap">{inc.id}</td>
                <td className="px-5 py-3 text-slate-800 max-w-xs">
                  <span className="block truncate">{inc.title}</span>
                </td>
                <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{inc.system}</td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <Badge className={getSeverityColor(inc.severity)}>{inc.severity}</Badge>
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <Badge className={getStatusColor(inc.status)}>{inc.status}</Badge>
                </td>
                <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">{timeAgo(inc.createdAt)}</td>
                <td className="px-5 py-3">
                  <ChevronRight size={16} className="text-slate-300" aria-hidden="true" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card — mobile */}
      <ul className="md:hidden divide-y divide-slate-100">
        {recent.map(inc => (
          <li key={inc.id}>
            <button
              className="w-full text-left px-4 py-4 hover:bg-slate-50 transition-colors"
              onClick={() => onOpenDetail(inc)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-slate-500 font-semibold">{inc.id}</span>
                    <Badge className={getSeverityColor(inc.severity)} size="sm">{inc.severity}</Badge>
                  </div>
                  <p className="text-sm text-slate-800 font-medium truncate">{inc.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{inc.system} · {timeAgo(inc.createdAt)}</p>
                </div>
                <Badge className={getStatusColor(inc.status)} size="sm">{inc.status}</Badge>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecentIncidentsTable;
