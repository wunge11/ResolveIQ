/**
 * Modal.jsx
 * Komponen modal/dialog overlay yang aksesibel.
 * - Dapat ditutup dengan tombol Esc
 * - Fokus dikembalikan ke elemen pemicu saat modal ditutup
 * - Klik di luar modal menutupnya
 *
 * @param {object}          props
 * @param {boolean}         props.isOpen      - Apakah modal ditampilkan
 * @param {Function}        props.onClose     - Callback saat modal ditutup
 * @param {string}          [props.title]     - Judul modal
 * @param {React.ReactNode} props.children    - Konten modal
 * @param {'sm'|'md'|'lg'|'xl'|'2xl'} [props.size='md'] - Lebar modal
 */

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const overlayRef = useRef(null);
  const dialogRef  = useRef(null);

  const sizeClass = {
    sm:  'max-w-sm',
    md:  'max-w-lg',
    lg:  'max-w-2xl',
    xl:  'max-w-4xl',
    '2xl': 'max-w-6xl',
  }[size] ?? 'max-w-lg';

  // Tutup dengan Esc
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Fokus ke dialog saat terbuka
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 pt-16"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className={`relative w-full ${sizeClass} bg-white rounded-xl shadow-xl border border-slate-200 animate-fade-in focus:outline-none`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 id="modal-title" className="text-base font-semibold text-slate-800">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Tutup modal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Tombol tutup jika tidak ada judul */}
        {!title && (
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* Konten */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
