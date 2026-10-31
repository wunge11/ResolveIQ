/**
 * Sidebar.jsx
 * Navigasi utama sisi kiri aplikasi ResolveIQ.
 * - Desktop: bisa di-collapse menjadi icon-only
 * - Mobile: muncul sebagai drawer dengan overlay
 * - Badge jumlah insiden aktif pada menu Incidents
 *
 * @param {object}   props
 * @param {string}   props.currentPage        - Halaman aktif
 * @param {Function} props.onNavigate         - Callback navigasi(page)
 * @param {boolean}  props.collapsed          - State collapse (desktop)
 * @param {Function} props.onToggleCollapse   - Toggle collapse
 * @param {boolean}  props.mobileOpen         - State drawer (mobile)
 * @param {Function} props.onMobileClose      - Tutup drawer mobile
 */

import { useIncidents } from '../../context/IncidentContext.jsx';
import { PAGES } from '../../utils/constants.js';
import {
  LayoutDashboard, AlertTriangle, BookOpen, FileText, Database,
  ChevronLeft, ChevronRight, Shield, X,
} from 'lucide-react';

const NAV_ITEMS = [
  { page: PAGES.DASHBOARD,      label: 'Dashboard',      icon: LayoutDashboard },
  { page: PAGES.INCIDENTS,      label: 'Incidents',      icon: AlertTriangle   },
  { page: PAGES.RUNBOOKS,       label: 'Runbooks',       icon: BookOpen        },
  { page: PAGES.POST_MORTEMS,   label: 'Post-Mortems',   icon: FileText        },
  { page: PAGES.KNOWLEDGE_BASE, label: 'Knowledge Base', icon: Database        },
];

const ACTIVE_STATUSES = ['Open', 'Investigating', 'Mitigated'];

function SidebarContent({ currentPage, onNavigate, collapsed, onToggleCollapse, onMobileClose, isMobile }) {
  const { state } = useIncidents();
  const activeCount = state.incidents.filter(i => ACTIVE_STATUSES.includes(i.status)).length;

  return (
    <aside
      className={`flex flex-col h-full bg-brand-900 text-white transition-[width] duration-300 ease-in-out ${
        collapsed && !isMobile ? 'w-16' : 'w-64'
      }`}
      aria-label="Navigasi samping"
    >
      {/* Header logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${
        collapsed && !isMobile ? 'justify-center' : ''
      }`}>
        <div className="shrink-0 p-1.5 bg-brand-600 rounded-lg">
          <Shield size={20} className="text-white" aria-hidden="true" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold tracking-tight leading-tight">ResolveIQ</h1>
            <p className="text-xs text-slate-400 leading-tight">Incident Management</p>
          </div>
        )}
        {/* Tombol tutup di mobile */}
        {isMobile && (
          <button
            onClick={onMobileClose}
            aria-label="Tutup menu navigasi"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto" aria-label="Menu utama">
        {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
          const isActive    = currentPage === page;
          const showBadge   = page === PAGES.INCIDENTS && activeCount > 0;
          const isCollapsed = collapsed && !isMobile;

          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              aria-current={isActive ? 'page' : undefined}
              title={isCollapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-transform duration-150 ${
                  !isActive ? 'group-hover:scale-110' : ''
                }`}
                aria-hidden="true"
              />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left truncate">{label}</span>
                  {showBadge && (
                    <span
                      aria-label={`${activeCount} insiden aktif`}
                      className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center"
                    >
                      {activeCount > 99 ? '99+' : activeCount}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Tombol collapse — desktop only */}
      {!isMobile && (
        <div className="p-2 border-t border-white/10">
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors text-xs ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            {collapsed
              ? <ChevronRight size={16} aria-hidden="true" />
              : (
                <>
                  <ChevronLeft size={16} aria-hidden="true" />
                  <span>Perkecil</span>
                </>
              )
            }
          </button>
        </div>
      )}
    </aside>
  );
}

function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full shrink-0">
        <SidebarContent
          currentPage={currentPage}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          onMobileClose={onMobileClose}
          isMobile={false}
        />
      </div>

      {/* Mobile drawer + overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="presentation"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden="true"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div
            className="relative h-full animate-slide-in-left"
            style={{ width: 'fit-content' }}
          >
            <SidebarContent
              currentPage={currentPage}
              onNavigate={onNavigate}
              collapsed={false}
              onToggleCollapse={onToggleCollapse}
              onMobileClose={onMobileClose}
              isMobile={true}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
