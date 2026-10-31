/**
 * TopNav.jsx
 * Header navigasi atas aplikasi ResolveIQ.
 * Berisi: hamburger mobile, judul halaman, GlobalSearch, tombol laporkan insiden,
 * ikon notifikasi dengan badge, dan ProfileMenu.
 *
 * @param {object}   props
 * @param {string}   props.currentPage        - Nama halaman aktif
 * @param {Function} props.onMenuToggle        - Toggle sidebar mobile
 * @param {Function} props.onOpenIncidentForm  - Buka form laporkan insiden
 * @param {Function} props.onNavigate          - Navigasi halaman
 * @param {Function} props.onOpenDetail        - Buka detail insiden
 * @param {Function} props.addToast            - Tambah toast notification
 */

import { useMemo } from 'react';
import { Menu, Plus, Bell } from 'lucide-react';
import GlobalSearch from './GlobalSearch.jsx';
import ProfileMenu  from './ProfileMenu.jsx';
import { useIncidents } from '../../context/IncidentContext.jsx';
import { generateAlerts } from '../../utils/alerts.js';

function TopNav({ currentPage, onMenuToggle, onOpenIncidentForm, onNavigate, onOpenDetail, addToast }) {
  const { state } = useIncidents();

  // Hitung jumlah alert aktif untuk badge notifikasi
  const alertCount = useMemo(() =>
    generateAlerts(state.incidents, state.postMortems, state.dismissedAlerts).length,
    [state.incidents, state.postMortems, state.dismissedAlerts],
  );

  return (
    <header className="shrink-0 h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 z-30 no-print">
      {/* Hamburger — hanya di mobile */}
      <button
        onClick={onMenuToggle}
        aria-label="Buka menu navigasi"
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {/* Judul halaman aktif */}
      <h2 className="text-sm font-semibold text-slate-800 hidden sm:block shrink-0">
        {currentPage}
      </h2>

      {/* Separator */}
      <div className="hidden sm:block w-px h-5 bg-slate-200 shrink-0" aria-hidden="true" />

      {/* GlobalSearch — mengisi sisa ruang di tengah */}
      <div className="flex-1 min-w-0">
        <GlobalSearch onOpenDetail={onOpenDetail} onNavigate={onNavigate} />
      </div>

      {/* Tombol Laporkan Insiden */}
      <button
        onClick={onOpenIncidentForm}
        aria-label="Laporkan insiden baru"
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shrink-0"
      >
        <Plus size={16} aria-hidden="true" />
        <span className="hidden md:inline">Laporkan Insiden</span>
        <span className="md:hidden">Laporkan</span>
      </button>

      {/* Tombol laporkan untuk mobile (hanya ikon) */}
      <button
        onClick={onOpenIncidentForm}
        aria-label="Laporkan insiden baru"
        className="sm:hidden p-2 rounded-lg bg-brand-600 text-white hover:bg-blue-700 transition-colors shrink-0"
      >
        <Plus size={18} aria-hidden="true" />
      </button>

      {/* Ikon notifikasi dengan badge */}
      <button
        aria-label={`${alertCount} notifikasi aktif`}
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
        onClick={() => onNavigate && onNavigate('Dashboard')}
      >
        <Bell size={20} aria-hidden="true" />
        {alertCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full"
          >
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </button>

      {/* Profile menu */}
      <ProfileMenu addToast={addToast} />
    </header>
  );
}

export default TopNav;
