/**
 * Badge.jsx
 * Komponen badge / label pill yang dapat dikustomisasi.
 * Digunakan untuk menampilkan severity, status, kategori, dll.
 *
 * @param {object}  props
 * @param {string}  props.children    - Teks badge
 * @param {string}  [props.className] - Kelas Tailwind tambahan
 * @param {'sm'|'md'} [props.size='sm'] - Ukuran badge
 */
function Badge({ children, className = '', size = 'sm' }) {
  const sizeClass = size === 'md'
    ? 'px-3 py-1 text-sm'
    : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
