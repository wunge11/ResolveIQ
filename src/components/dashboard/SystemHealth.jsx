/**
 * SystemHealth.jsx
 * Grid kartu status kesehatan per sistem yang dimonitor.
 * Status diturunkan otomatis dari insiden aktif:
 * - Down       = ada SEV1/SEV2 aktif
 * - Degraded   = ada SEV3/SEV4 aktif
 * - Operational= tidak ada insiden aktif
 *
 * @param {object}   props
 * @param {object[]} props.incidents  - Array semua insiden
 * @param {Function} props.onNavigate - Callback navigasi ke Incidents
 */

import { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Server } from 'lucide-react';
import { SYSTEMS } from '../../utils/constants.js';
import { calcSystemHealth } from '../../utils/stats.js';

const STATUS_CONFIG = {
  Operational: {
    label:     'Operational',
    icon:      CheckCircle2,
    dotColor:  'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor:   'bg-emerald-50',
    border:    'border-emerald-100',
  },
  Degraded: {
    label:     'Degraded',
    icon:      AlertTriangle,
    dotColor:  'bg-amber-500',
    textColor: 'text-amber-700',
    bgColor:   'bg-amber-50',
    border:    'border-amber-100',
  },
  Down: {
    label:     'Down',
    icon:      XCircle,
    dotColor:  'bg-red-500',
    textColor: 'text-red-700',
    bgColor:   'bg-red-50',
    border:    'border-red-100',
  },
};

function SystemHealthCard({ system, health, onClick }) {
  const config = STATUS_CONFIG[health.status];
  const Icon   = config.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex flex-col gap-2 p-4 rounded-xl border ${config.border} ${config.bgColor} hover:shadow-sm transition-all duration-200`}
      aria-label={`${system}: ${config.label}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server size={14} className="text-slate-500" aria-hidden="true" />
          <span className="text-xs font-semibold text-slate-700 truncate">{system}</span>
        </div>
        {/* Dot animasi untuk status non-operational */}
        <div className="relative flex items-center justify-center w-4 h-4">
          <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} aria-hidden="true" />
          {health.status !== 'Operational' && (
            <span
              className={`absolute w-2.5 h-2.5 rounded-full ${config.dotColor} animate-ping opacity-75`}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Status label */}
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${config.textColor}`}>
        <Icon size={13} aria-hidden="true" />
        {config.label}
      </div>

      {/* Statistik */}
      <p className="text-xs text-slate-500">
        {health.activeCount > 0
          ? `${health.activeCount} insiden aktif`
          : 'Tidak ada insiden aktif'
        }
        {' · '}
        <span>{health.last30Count} insiden (30 hari)</span>
      </p>
    </button>
  );
}

function SystemHealth({ incidents, onNavigate }) {
  const systems = useMemo(() =>
    SYSTEMS.map(sys => ({
      system: sys,
      health: calcSystemHealth(sys, incidents),
    })),
    [incidents],
  );

  const downCount    = systems.filter(s => s.health.status === 'Down').length;
  const degradedCount = systems.filter(s => s.health.status === 'Degraded').length;

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-card p-5" aria-label="System health overview">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800">System Health</h3>
          {(downCount > 0 || degradedCount > 0) && (
            <p className="text-xs text-slate-500 mt-0.5">
              {downCount > 0 && <span className="text-red-600 font-medium">{downCount} sistem down</span>}
              {downCount > 0 && degradedCount > 0 && ' · '}
              {degradedCount > 0 && <span className="text-amber-600 font-medium">{degradedCount} degraded</span>}
            </p>
          )}
        </div>
        <button
          onClick={() => onNavigate('Incidents')}
          className="text-xs text-brand-600 hover:text-blue-800 font-medium"
        >
          Lihat Semua →
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3">
        {systems.map(({ system, health }) => (
          <SystemHealthCard
            key={system}
            system={system}
            health={health}
            onClick={() => onNavigate('Incidents')}
          />
        ))}
      </div>
    </section>
  );
}

export default SystemHealth;
