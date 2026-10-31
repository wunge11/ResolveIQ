/**
 * Pagination.jsx
 * Komponen paginasi yang menampilkan kontrol navigasi halaman.
 *
 * @param {object}   props
 * @param {number}   props.currentPage  - Halaman aktif (1-based)
 * @param {number}   props.totalPages   - Total halaman
 * @param {number}   props.totalItems   - Total item (untuk label informatif)
 * @param {number}   props.itemsPerPage - Item per halaman
 * @param {Function} props.onPageChange - Callback (pageNumber: number) => void
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end   = Math.min(currentPage * itemsPerPage, totalItems);

  // Membuat array halaman yang ditampilkan (tampilkan max 5 halaman di sekitar halaman aktif)
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...');
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const btnBase = 'inline-flex items-center justify-center w-8 h-8 text-sm rounded-lg transition-colors';

  return (
    <nav aria-label="Paginasi" className="flex items-center justify-between gap-4 flex-wrap">
      {/* Info range */}
      <p className="text-xs text-slate-500">
        Menampilkan {start}–{end} dari {totalItems} item
      </p>

      {/* Kontrol halaman */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Halaman sebelumnya"
          className={`${btnBase} text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="w-8 text-center text-slate-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-label={`Halaman ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`${btnBase} ${
                page === currentPage
                  ? 'bg-brand-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Halaman berikutnya"
          className={`${btnBase} text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
