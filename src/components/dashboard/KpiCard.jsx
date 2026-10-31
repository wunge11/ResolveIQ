/**
 * KpiCard.jsx
 * Kartu KPI untuk Dashboard — menampilkan ikon, judul, nilai besar,
 * dan indikator tren (naik/turun/tetap) dibanding periode sebelumnya.
 *
 * @param {object}          props
 * @param {React.ElementType} props.icon      - Komponen ikon lucide-react
 * @param {string}          props.title       - Judul KPI
 * @param {string|number}   props.value       - Nilai utama yang ditampilkan
 * @param {string}          [props.subtitle]  - Teks kecil di bawah nilai
 * @param {'up'|'down'|'same'} [props.trend]  - Arah tren
 * @param {string}          [props.trendLabel]- Label tren (contoh: "+2 dari minggu lalu")
 * @param {boolean}         [props.trendGoodWhenDown=false] - Jika true, tren turun = hijau (MTTR, dll.)
 * @param {string}          [props.iconColor] - Kelas warna ikon
 * @param {string}          [props.iconBg]    - Kelas warna latar ikon
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function KpiCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend        = 'same',
  trendLabel,
  trendGoodWhenDown = false,
  iconColor    = 'text-brand-600',
  iconBg       = 'bg-brand-50',
}) {
  // Tentukan warna tren
  const trendColor = () => {
    if (trend === 'same') return 'text-slate-400';
    const isPositive = trendGoodWhenDown ? trend === 'down' : trend === 'up';
    return isPositive ? 'text-emerald-600' : 'text-red-500';
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
      {/* Header: ikon + judul */}
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon size={20} className={iconColor} aria-hidden="true" />
        </div>
        {/* Indikator tren */}
        {trendLabel && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor()}`}>
            <TrendIcon size={14} aria-hidden="true" />
            <span>{trendLabel}</span>
          </div>
        )}
      </div>

      {/* Nilai utama */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </article>
  );
}

export default KpiCard;
