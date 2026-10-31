/**
 * SimilarIncidents.jsx
 * Panel menampilkan insiden serupa berdasarkan algoritma kemiripan.
 * Digunakan di dalam form pelaporan (real-time) maupun di detail insiden.
 *
 * @param {object}   props
 * @param {object}   props.base         - Insiden referensi (bisa partial dari form)
 * @param {object[]} props.allIncidents - Semua insiden untuk dibandingkan
 * @param {Function} props.onSelect     - Callback saat hasil diklik (buka detail)
 */

import { useMemo } from 'react';
import { GitCompare, ExternalLink } from 'lucide-react';
import { findSimilarIncidents } from '../../utils/similarity.js';
import { getSeverityColor, getStatusColor } from '../../utils/severity.js';
import Badge from '../common/Badge.jsx';

function SimilarIncidents({ base, allIncidents, onSelect }) {
  const results = useMemo(() => {
    if (!base || !base.title) return [];
    return findSimilarIncidents(base, allIncidents, 3, 25);
  }, [base, allIncidents]);

  if (results.length === 0) return null;

  return (
    <aside
      className="border border-amber-200 bg-amber-50 rounded-xl p-4"
      aria-label="Insiden serupa"
    >
      <div className="flex items-center gap-2 mb-3">
        <GitCompare size={15} className="text-amber-600" aria-hidden="true" />
        <span className="text-sm font-semibold text-amber-700">
          {results.length} Insiden Serupa Ditemukan
        </span>
      </div>

      <ul className="space-y-2">
        {results.map(({ incident, percentage }) => (
          <li key={incident.id}>
            <button
              className="w-full text-left bg-white rounded-lg border border-amber-200 p-3 hover:border-amber-400 hover:shadow-sm transition-all"
              onClick={() => onSelect && onSelect(incident)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-slate-500 font-semibold">{incident.id}</span>
                <Badge className={getSeverityColor(incident.severity)} size="sm">{incident.severity}</Badge>
                <Badge className={getStatusColor(incident.status)} size="sm">{incident.status}</Badge>
                <span className="ml-auto text-xs font-semibold text-amber-700 tabular-nums">
                  {percentage}% mirip
                </span>
              </div>
              <p className="text-sm text-slate-700 font-medium text-left line-clamp-2 mb-1">
                {incident.title}
              </p>
              {/* Akar masalah / resolusi jika ada */}
              {incident.timeline && incident.timeline.length > 0 && (
                <p className="text-xs text-slate-500 line-clamp-1">
                  {([...incident.timeline].reverse().find(t => t.type === 'Resolved' || t.type === 'Finding') ??
                    incident.timeline[incident.timeline.length - 1])?.note}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1.5 text-xs text-brand-600">
                <ExternalLink size={11} aria-hidden="true" />
                Lihat Detail
              </div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default SimilarIncidents;
