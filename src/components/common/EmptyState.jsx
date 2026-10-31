/**
 * EmptyState.jsx
 * Komponen untuk menampilkan state kosong (tidak ada data) dengan pesan dan aksi.
 *
 * @param {object}          props
 * @param {React.ReactNode} [props.icon]      - Ikon (lucide-react component)
 * @param {string}          props.title       - Judul pesan kosong
 * @param {string}          [props.message]   - Deskripsi tambahan
 * @param {React.ReactNode} [props.action]    - Tombol atau elemen aksi
 * @param {string}          [props.className] - Kelas tambahan untuk container
 */

import { Inbox } from 'lucide-react';

/**
 * Selalu render icon sebagai komponen (bukan JSX element).
 * Semua pemanggil memberikan komponen lucide-react (typeof === 'function'),
 * sehingga kita cukup panggil sebagai <Icon />.
 */
function EmptyState({ icon: Icon = Inbox, title, message, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="p-4 rounded-full bg-slate-100 mb-4">
        <Icon size={28} className="text-slate-400" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {message && <p className="text-sm text-slate-500 max-w-sm mb-4">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
