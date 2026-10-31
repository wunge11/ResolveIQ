/**
 * DashboardPage.jsx
 * Halaman Dashboard ResolveIQ.
 * Merangkai semua 8 widget dashboard:
 * 1. KPI Cards (4 kartu)
 * 2. Incident Trend Chart
 * 3. Category Breakdown
 * 4. System Health
 * 5. Alerts Panel
 * 6. Action Item Tracker
 * 7. Recent Incidents Table
 * 8. Activity Feed
 *
 * @param {object}   props
 * @param {Function} props.onNavigate          - Callback navigasi halaman
 * @param {Function} props.onOpenIncidentForm  - Callback buka form laporkan insiden
 * @param {Function} props.onOpenDetail        - Callback buka detail insiden
 * @param {Function} props.addToast            - Tambah toast notification
 */

import { useMemo } from 'react';
import { AlertTriangle, Clock, ShieldAlert, ClipboardCheck } from 'lucide-react';
import { useIncidents } from '../context/IncidentContext.jsx';
import {
  countActiveIncidents,
  calcAvgMTTR,
  countCriticalActive,
  calcPostMortemCompleteness,
  calcTrend,
} from '../utils/stats.js';
import { formatDuration } from '../utils/date.js';

import KpiCard              from '../components/dashboard/KpiCard.jsx';
import IncidentTrendChart   from '../components/dashboard/IncidentTrendChart.jsx';
import CategoryBreakdown    from '../components/dashboard/CategoryBreakdown.jsx';
import SystemHealth         from '../components/dashboard/SystemHealth.jsx';
import AlertsPanel          from '../components/dashboard/AlertsPanel.jsx';
import ActionItemTracker    from '../components/dashboard/ActionItemTracker.jsx';
import RecentIncidentsTable from '../components/dashboard/RecentIncidentsTable.jsx';
import ActivityFeed         from '../components/dashboard/ActivityFeed.jsx';
import ErrorBoundary        from '../components/common/ErrorBoundary.jsx';

function DashboardPage({ onNavigate, onOpenIncidentForm, onOpenDetail }) {
  const { state } = useIncidents();
  const { incidents, postMortems, activities } = state;

  // ── KPI calculations ──────────────────────────────────────────────────────
  const kpiData = useMemo(() => {
    // Periode ini (semua data)
    const active    = countActiveIncidents(incidents);
    const mttr      = calcAvgMTTR(incidents);
    const critical  = countCriticalActive(incidents);
    const pmPct     = calcPostMortemCompleteness(incidents);

    // Periode sebelumnya: insiden yang dibuat lebih dari 14 hari lalu
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const prevIncidents = incidents.filter(i => new Date(i.createdAt).getTime() < cutoff);
    const prevActive    = countActiveIncidents(prevIncidents);
    const prevMttr      = calcAvgMTTR(prevIncidents);
    const prevCritical  = countCriticalActive(prevIncidents);
    const prevPmPct     = calcPostMortemCompleteness(prevIncidents.length ? prevIncidents : incidents);

    return {
      active:   { value: active,   trend: calcTrend(active,   prevActive)   },
      mttr:     { value: mttr,     trend: calcTrend(mttr,     prevMttr)     },
      critical: { value: critical, trend: calcTrend(critical, prevCritical) },
      pmPct:    { value: pmPct,    trend: calcTrend(pmPct,    prevPmPct)    },
    };
  }, [incidents]);

  const trendLabel = (t, suffix = '') => {
    if (t.direction === 'same') return 'Sama seperti sebelumnya';
    return `${t.direction === 'up' ? '+' : '-'}${t.diff}${suffix} dari sebelumnya`;
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pantau kondisi sistem dan insiden secara real-time</p>
        </div>
        <button
          onClick={onOpenIncidentForm}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Laporkan Insiden
        </button>
      </div>

      {/* 1. KPI Cards */}
      <section aria-label="Ringkasan KPI" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <ErrorBoundary>
          <KpiCard
            icon={AlertTriangle}
            title="Insiden Aktif"
            value={kpiData.active.value}
            subtitle="Open + Investigating + Mitigated"
            trend={kpiData.active.trend.direction}
            trendLabel={trendLabel(kpiData.active.trend)}
            trendGoodWhenDown={true}
            iconColor="text-red-500"
            iconBg="bg-red-50"
          />
          <KpiCard
            icon={Clock}
            title="Rata-rata MTTR"
            value={formatDuration(kpiData.mttr.value)}
            subtitle="Dari insiden Resolved/Closed"
            trend={kpiData.mttr.trend.direction}
            trendLabel={trendLabel(kpiData.mttr.trend, 'm')}
            trendGoodWhenDown={true}
            iconColor="text-brand-600"
            iconBg="bg-brand-50"
          />
          <KpiCard
            icon={ShieldAlert}
            title="Insiden Kritis Aktif"
            value={kpiData.critical.value}
            subtitle="SEV1 + SEV2 yang belum selesai"
            trend={kpiData.critical.trend.direction}
            trendLabel={trendLabel(kpiData.critical.trend)}
            trendGoodWhenDown={true}
            iconColor="text-orange-500"
            iconBg="bg-orange-50"
          />
          <KpiCard
            icon={ClipboardCheck}
            title="Kelengkapan Post-Mortem"
            value={`${kpiData.pmPct.value}%`}
            subtitle="Insiden SEV1/SEV2 yang sudah punya PM"
            trend={kpiData.pmPct.trend.direction}
            trendLabel={trendLabel(kpiData.pmPct.trend, '%')}
            trendGoodWhenDown={false}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
        </ErrorBoundary>
      </section>

      {/* 2+3. Trend Chart + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ErrorBoundary>
            <IncidentTrendChart incidents={incidents} />
          </ErrorBoundary>
        </div>
        <div>
          <ErrorBoundary>
            <CategoryBreakdown incidents={incidents} />
          </ErrorBoundary>
        </div>
      </div>

      {/* 4. System Health */}
      <ErrorBoundary>
        <SystemHealth incidents={incidents} onNavigate={onNavigate} />
      </ErrorBoundary>

      {/* 5+6. Alerts + Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ErrorBoundary>
          <AlertsPanel
            incidents={incidents}
            postMortems={postMortems}
            onNavigate={onNavigate}
            onOpenDetail={onOpenDetail}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <ActionItemTracker
            postMortems={postMortems}
            incidents={incidents}
            onNavigate={onNavigate}
          />
        </ErrorBoundary>
      </div>

      {/* 7+8. Recent Incidents + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ErrorBoundary>
            <RecentIncidentsTable
              incidents={incidents}
              onOpenDetail={onOpenDetail}
              onNavigate={onNavigate}
            />
          </ErrorBoundary>
        </div>
        <div>
          <ErrorBoundary>
            <ActivityFeed activities={activities} onNavigate={onNavigate} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
