/**
 * ConfirmDialog.jsx
 * Dialog konfirmasi sebelum aksi destruktif (hapus, reset, dll.).
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen      - Apakah dialog tampil
 * @param {Function} props.onClose     - Callback batal
 * @param {Function} props.onConfirm   - Callback konfirmasi
 * @param {string}   [props.title]     - Judul dialog
 * @param {string}   [props.message]   - Pesan konfirmasi
 * @param {string}   [props.confirmLabel='Hapus'] - Label tombol konfirmasi
 * @param {'danger'|'primary'} [props.variant='danger'] - Variant tombol konfirmasi
 */

import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { AlertTriangle } from 'lucide-react';

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title       = 'Konfirmasi',
  message     = 'Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan.',
  confirmLabel = 'Hapus',
  variant     = 'danger',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-3 rounded-full bg-red-50">
          <AlertTriangle size={24} className="text-red-600" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Batal
          </Button>
          <Button variant={variant} className="flex-1" onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
