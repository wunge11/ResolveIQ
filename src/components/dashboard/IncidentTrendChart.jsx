/**
 * IncidentTrendChart.jsx
 * Grafik batang stacked untuk menampilkan tren insiden per hari.
 * Menggunakan Chart.js via react-chartjs-2.
 * Toggle rentang 7 / 14 hari, tooltip saat hover.
 *
 * @param {object}   props
 * @param {object[]} props.incidents - Array semua insiden
 */

import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { calcIncidentTrend } from '../../utils/stats.js';
import { lastNDays } from '../../utils/date.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/** Format tanggal ISO ke label pendek "Okt 31" */
function formatDateLabel(isoDate) {
  return new Date(isoDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

function IncidentTrendChart({ incidents }) {
  const [days, setDays] = useState(14);

  const trendData = useMemo(() => calcIncidentTrend(incidents, days), [incidents, days]);

  const labels = useMemo(() => trendData.dates.map(formatDateLabel), [trendData.dates]);

  const chartData = {
    labels,
    datasets: [
      {
        label:           'SEV1',
        data:            trendData.sev1,
        backgroundColor: '#DC2626',
        borderRadius:    2,
        stack:           'severity',
      },
      {
        label:           'SEV2',
        data:            trendData.sev2,
        backgroundColor: '#F97316',
        borderRadius:    2,
        stack:           'severity',
      },
      {
        label:           'SEV3',
        data:            trendData.sev3,
        backgroundColor: '#F59E0B',
        borderRadius:    2,
        stack:           'severity',
      },
      {
        label:           'SEV4',
        data:            trendData.sev4,
        backgroundColor: '#94A3B8',
        borderRadius:    2,
        stack:           'severity',
      },
    ],
  };

  const options = {
    responsive:          true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth:  12,
          boxHeight: 12,
          padding:   16,
          font:      { size: 11 },
          color:     '#475569',
        },
      },
      tooltip: {
        callbacks: {
          title: (items) => items[0]?.label ?? '',
          label: (item) => ` ${item.dataset.label}: ${item.raw} insiden`,
          footer: (items) => {
            const total = items.reduce((s, i) => s + i.raw, 0);
            return `Total: ${total} insiden`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid:    { display: false },
        ticks:   {
          font:  { size: 11 },
          color: '#94A3B8',
          maxRotation: 0,
        },
      },
      y: {
        stacked:   true,
        beginAtZero: true,
        grid:      { color: '#F1F5F9' },
        ticks: {
          stepSize: 1,
          font:     { size: 11 },
          color:    '#94A3B8',
        },
      },
    },
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-card p-5" aria-label="Tren insiden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800">Tren Insiden</h3>
        {/* Toggle rentang waktu */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {[7, 14].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              aria-pressed={days === d}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                days === d
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {d} Hari
            </button>
          ))}
        </div>
      </div>
      <div className="h-52">
        <Bar data={chartData} options={options} aria-label={`Grafik tren insiden ${days} hari terakhir`} />
      </div>
    </section>
  );
}

export default IncidentTrendChart;
