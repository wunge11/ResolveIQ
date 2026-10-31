/**
 * IncidentTable.jsx
 * Tabel insiden (desktop) dan card list (mobile) dengan paginasi.
 * Klik baris/card membuka detail insiden.
 *
 * @param {object}   props
 * @param {object[]} props.incidents    - Array insiden (sudah difilter/sort)
 * @param {Function} props.onOpenDetail - Callback buka detail insiden
 * @param {Function} props.onNavigate   - Callback navigasi (untuk post-mortem link)
 */

import { useEffect, useState } from 'react';
import { ChevronRight, FileText, FileX } from 'lucide-react';
import { getSeverityColor, getStatusColor } from '../../utils/severity.js';
import { timeAgo, calcDurationMinutes, formatDuration } from '../../utils/date.js';
import Badge from '../common/Badge.jsx';
import Pagination from '../common/Pagination.jsx';
import EmptyState from '../common/EmptyState.jsx';

const ITEMS_PER_PAGE = 10;

function IncidentTable({ incidents, onOpenDetail, onNavigate }) {
  const [page, setPage] = useState(1);

  // Reset halaman ke 1 setiap kali daftar insiden berubah (filter diterapkan).
  // Menggunakan useEffect — bukan useMemo — karena ini adalah efek samping (setPage).
  useEffect(() => { setPage(1); }, [incidents]);

  const totalPages = Math.ceil(incidents.length / ITEMS_PER_PAGE);
  const paginated  = incidents.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (incidents.length === 0) {
    return (
      <EmptyState
        icon={FileX}
        title="Tidak ada insiden ditemukan"
        message="Coba ubah filter atau tambahkan insiden baru."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabel desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <table className="w-full text-sm" aria-label="Daftar insiden">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Judul</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Sistem</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Severity</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Durasi</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Waktu</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">PM</th>
              <th scope="col" className="w-8 px-2"><span className="sr-only">Detail</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.map(inc => {
              const duration = formatDuration(calcDurationMinutes(inc.createdAt, inc.resolvedAt));
              return (
                <tr
                  key={inc.id}
                  onClick={() => onOpenDetail(inc)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-500 whitespace-nowrap">{inc.id}</td>
                  <td className="px-5 py-3 text-slate-800 max-w-xs">
                    <span className="block truncate font-medium">{inc.title}</span>
                    {inc.tags?.length > 0 && (
                      <span className="text-xs text-slate-400 truncate block">
                        {inc.tags.slice(0, 3).join(' · ')}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-xs whitespace-nowrap">{inc.system}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <Badge className={getSeverityColor(inc.severity)}>{inc.severity}</Badge>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <Badge className={getStatusColor(inc.status)}>{inc.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap tabular-nums">{duration}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">{timeAgo(inc.createdAt)}</td>
                  <td className="px-5 py-3">
                    {inc.postMortemId && (
                      <button
                        onClick={e => { e.stopPropagation(); onNavigate('Post-Mortems'); }}
                        aria-label="Lihat post-mortem"
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        <FileText size={14} aria-hidden="true" />
                      </button>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <ChevronRight size={16} className="text-slate-300" aria-hidden="true" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Card list mobile */}
      <ul className="md:hidden space-y-3">
        {paginated.map(inc => (
          <li key={inc.id}>
            <button
              className="w-full text-left bg-white rounded-xl border border-slate-200 shadow-card p-4 hover:shadow-md transition-shadow"
              onClick={() => onOpenDetail(inc)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-semibold text-slate-500">{inc.id}</span>
                <div className="flex gap-1.5 shrink-0">
                  <Badge className={getSeverityColor(inc.severity)} size="sm">{inc.severity}</Badge>
                  <Badge className={getStatusColor(inc.status)} size="sm">{inc.status}</Badge>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-800 mb-1 text-left line-clamp-2">{inc.title}</p>
              <p className="text-xs text-slate-500">{inc.system} · {timeAgo(inc.createdAt)}</p>
            </button>
          </li>
        ))}
      </ul>

      {/* Paginasi */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={incidents.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default IncidentTable;
