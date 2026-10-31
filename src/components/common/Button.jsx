/**
 * Button.jsx
 * Komponen tombol yang konsisten dengan berbagai variant dan ukuran.
 * Mendukung state loading, disabled, dan ikon.
 *
 * @param {object}           props
 * @param {React.ReactNode}  props.children      - Konten tombol
 * @param {'primary'|'secondary'|'danger'|'ghost'|'outline'} [props.variant='primary'] - Variant visual
 * @param {'sm'|'md'|'lg'}   [props.size='md']   - Ukuran tombol
 * @param {boolean}          [props.loading]     - State loading (menonaktifkan tombol)
 * @param {boolean}          [props.disabled]    - State disabled
 * @param {React.ReactNode}  [props.icon]        - Ikon di sebelah kiri teks
 * @param {string}           [props.className]   - Kelas tambahan
 * @param {Function}         [props.onClick]     - Handler klik
 * @param {'button'|'submit'|'reset'} [props.type='button'] - Tipe HTML button
 */
function Button({
  children,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  disabled  = false,
  icon      = null,
  className = '',
  onClick,
  type      = 'button',
  ...rest
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-brand-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    ghost:     'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
    outline:   'border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100',
  };

  const sizes = {
    sm:  'px-3 py-1.5 text-xs',
    md:  'px-4 py-2 text-sm',
    lg:  'px-5 py-2.5 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
}

export default Button;
