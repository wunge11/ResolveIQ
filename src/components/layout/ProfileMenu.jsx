/**
 * ProfileMenu.jsx
 * Dropdown profil admin di pojok kanan TopNav.
 * Menampilkan: avatar inisial, nama, peran, dan menu aksi.
 * Menu: "Lihat Profil", "Reset Data Demo", "Keluar"
 *
 * @param {object}   props
 * @param {Function} props.addToast  - Callback untuk menampilkan toast notification
 * @param {Function} props.onReset   - Callback untuk reset data demo
 */

import { useState, useRef, useEffect } from 'react';
import { User, RefreshCw, LogOut, ChevronDown } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';

const ADMIN = {
  name:    'Prita Isworo Wunge',
  role:    'IT Manager',
  initials:'PIW',
};

function ProfileMenu({ addToast, onReset }) {
  const { dispatch }   = useIncidents();
  const [isOpen, setIsOpen]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef(null);

  // Tutup menu saat klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Tutup dengan Esc
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    addToast('Anda telah keluar dari sesi. (Demo — tidak ada autentikasi nyata)', 'info');
  };

  const handleResetConfirm = () => {
    dispatch({ type: 'RESET_DATA' });
    setShowConfirm(false);
    if (onReset) onReset();
    addToast('Data demo berhasil direset ke kondisi awal.', 'success');
  };

  const menuItems = [
    {
      label:   'Lihat Profil',
      icon:    User,
      onClick: () => {
        setIsOpen(false);
        addToast('Fitur profil akan hadir di versi berikutnya.', 'info');
      },
    },
    {
      label:   'Reset Data Demo',
      icon:    RefreshCw,
      onClick: () => { setIsOpen(false); setShowConfirm(true); },
      danger:  false,
    },
    {
      label:   'Keluar',
      icon:    LogOut,
      onClick: handleLogout,
      danger:  true,
    },
  ];

  return (
    <>
      <div ref={menuRef} className="relative">
        {/* Tombol trigger */}
        <button
          onClick={() => setIsOpen(o => !o)}
          aria-label={`Menu profil ${ADMIN.name}`}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {/* Avatar inisial */}
          <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
            {ADMIN.initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{ADMIN.name}</p>
            <p className="text-xs text-slate-500 leading-tight">{ADMIN.role}</p>
          </div>
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            role="menu"
            aria-label="Menu profil"
            className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 animate-fade-in"
          >
            {/* Header profil */}
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">{ADMIN.name}</p>
              <p className="text-xs text-slate-500">{ADMIN.role}</p>
            </div>

            {/* Menu items */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  role="menuitem"
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 ${
                    item.danger ? 'text-red-600 hover:text-red-700' : 'text-slate-700'
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Konfirmasi reset data */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleResetConfirm}
        title="Reset Data Demo"
        message="Semua perubahan akan dihapus dan data akan kembali ke kondisi awal. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Reset Sekarang"
        variant="danger"
      />
    </>
  );
}

export default ProfileMenu;
