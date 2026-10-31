/**
 * CategoryBreakdown.jsx
 * Grafik donat + legenda untuk distribusi insiden per kategori.
 * Menggunakan Chart.js Doughnut via react-chartjs-2.
 *
 * @param {object}   props
 * @param {object[]} props.incidents - Array semua insiden
 */

import { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { calcCategoryBreakdown } from '../../utils/stats.js';
import EmptyState from '../common/EmptyState.jsx';
import { PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

// Palet warna per kategori
const CATEGORY_COLORS = {
  Network:        '#3B82F6',
  Database:       '#8B5CF6',
  Application:    '#10B981',
  Infrastructure: '#F97316',
  Security:       '#EF4444',
  Deployment:     '#F59E0B',
};

function CategoryBreakdown({ incidents }) {
  const breakdown = useMemo(() => calcCategoryBreakdown(incidents), [incidents]);

  if (breakdown.length === 0) {
    return (
      <section className="bg-white rounded-xl border border-slate-200 shadow-card p-5" aria-label="Distribusi kategori">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Distribusi Kategori</h3>
        <EmptyState icon={PieChart} title="Belum ada data kategori" />
      </section>
    );
  }

  const chartData = {
    labels:   breakdown.map(b => b.category),
    datasets: [{
      data:            breakdown.map(b => b.count),
      backgroundColor: breakdown.map(b => CATEGORY_COLORS[b.category] ?? '#94A3B8'),
      borderWidth:     2,
      borderColor:     '#ffffff',
      hoverOffset:     4,
    }],
  };

  const options = {
    responsive:          true,
    maintainAspectRatio: false,
    cutout:              '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item) => ` ${item.label}: ${item.raw} insiden (${breakdown[item.dataIndex]?.percentage}%)`,
        },
      },
    },
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-card p-5" aria-label="Distribusi kategori insiden">
      <h3 className="text-base font-semibold text-slate-800 mb-4">Distribusi Kategori</h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donat chart */}
        <div className="shrink-0 w-36 h-36">
          <Doughnut data={chartData} options={options} aria-label="Grafik donat distribusi kategori" />
        </div>

        {/* Legenda */}
        <ul className="flex-1 space-y-2 w-full">
          {breakdown.map(item => (
            <li key={item.category} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[item.category] ?? '#94A3B8' }}
                aria-hidden="true"
              />
              <span className="text-sm text-slate-700 flex-1">{item.category}</span>
              <span className="text-sm font-semibold text-slate-800 tabular-nums">{item.count}</span>
              <span className="text-xs text-slate-400 w-10 text-right tabular-nums">{item.percentage}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default CategoryBreakdown;
