/**
 * IncidentFilters.jsx
 * Toolbar filter dan pencarian untuk halaman Incidents.
 * Mendukung: search teks, filter Severity, Status, Kategori, Sistem,
 * sort, dan tombol reset semua filter.
 *
 * @param {object}   props
 * @param {object}   props.filters         - State filter saat ini
 * @param {Function} props.onFilterChange  - Callback saat filter berubah (key, value)
 * @param {Function} props.onReset         - Callback reset semua filter
 * @param {number}   props.resultCount     - Jumlah hasil setelah filter
 */

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { SEVERITIES, STATUSES, CATEGORIES, SYSTEMS } from '../../utils/constants.js';
import Button from '../common/Button.jsx';

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Terbaru'           },
  { value: 'oldest',   label: 'Terlama'            },
  { value: 'severity', label: 'Severity Tertinggi' },
];

/** Label singkat untuk select */
function FilterSelect({ label, value, options, onChange, id }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
      >
        <option value="">{label}: Semua</option>
        {options.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function IncidentFilters({ filters, onFilterChange, onReset, resultCount }) {
  const hasActiveFilters = filters.search || filters.severity || filters.status ||
    filters.category || filters.system || filters.sort !== 'newest';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4">
      {/* Baris atas: search + tombol reset */}
      <div className="flex gap-3 items-center mb-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Cari ID, judul, atau tag…"
            value={filters.search}
            onChange={e => onFilterChange('search', e.target.value)}
            aria-label="Cari insiden"
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Info hasil */}
        <span className="text-sm text-slate-500 shrink-0 hidden sm:inline">
          {resultCount} insiden
        </span>

        {/* Reset filter */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={<X size={14} />}
            className="shrink-0 text-slate-500"
          >
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </div>

      {/* Baris bawah: dropdown filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <SlidersHorizontal size={14} className="text-slate-400 shrink-0" aria-hidden="true" />

        <FilterSelect
          id="filter-severity"
          label="Severity"
          value={filters.severity}
          options={SEVERITIES.map(s => ({ value: s.value, label: s.value }))}
          onChange={v => onFilterChange('severity', v)}
        />
        <FilterSelect
          id="filter-status"
          label="Status"
          value={filters.status}
          options={STATUSES.map(s => ({ value: s.value, label: s.label }))}
          onChange={v => onFilterChange('status', v)}
        />
        <FilterSelect
          id="filter-category"
          label="Kategori"
          value={filters.category}
          options={CATEGORIES}
          onChange={v => onFilterChange('category', v)}
        />
        <FilterSelect
          id="filter-system"
          label="Sistem"
          value={filters.system}
          options={SYSTEMS}
          onChange={v => onFilterChange('system', v)}
        />

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 hidden sm:block" aria-hidden="true" />

        <FilterSelect
          id="filter-sort"
          label="Urutkan"
          value={filters.sort}
          options={SORT_OPTIONS}
          onChange={v => onFilterChange('sort', v)}
        />
      </div>
    </div>
  );
}

export default IncidentFilters;
