/**
 * Toast.jsx
 * Sistem notifikasi toast yang muncul sementara di pojok layar.
 * - Auto dismiss setelah durasi tertentu
 * - Dapat ditutup manual
 * - Mendukung type: success, error, warning, info
 *
 * Digunakan dengan ToastContainer yang me-render daftar toast aktif.
 *
 * @param {object}   props
 * @param {string}   props.id          - ID unik toast
 * @param {string}   props.message     - Pesan yang ditampilkan
 * @param {'success'|'error'|'warning'|'info'} [props.type='info'] - Tipe toast
 * @param {Function} props.onDismiss   - Callback saat toast ditutup
 */

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const TOAST_CONFIG = {
  success: { icon: CheckCircle, className: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  error:   { icon: XCircle,     className: 'bg-red-50 border-red-200 text-red-800'             },
  warning: { icon: AlertTriangle, className: 'bg-amber-50 border-amber-200 text-amber-800'     },
  info:    { icon: Info,        className: 'bg-blue-50 border-blue-200 text-blue-800'           },
};

function Toast({ id, message, type = 'info', onDismiss, duration = 4000 }) {
  const config = TOAST_CONFIG[type] ?? TOAST_CONFIG.info;
  const Icon   = config.icon;

  // Auto dismiss
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, onDismiss, duration]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-md text-sm w-80 animate-fade-in ${config.className}`}
    >
      <Icon size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
      <p className="flex-1">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        aria-label="Tutup notifikasi"
        className="shrink-0 p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/**
 * ToastContainer merender semua toast aktif di pojok kanan bawah.
 *
 * @param {object}   props
 * @param {object[]} props.toasts     - Array toast aktif
 * @param {Function} props.onDismiss  - Callback untuk dismiss berdasarkan id
 */
export function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-label="Notifikasi"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 no-print"
    >
      {toasts.map(t => (
        <Toast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default Toast;
