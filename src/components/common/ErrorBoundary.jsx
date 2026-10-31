/**
 * ErrorBoundary.jsx
 * Error boundary React untuk menangkap error runtime di komponen child.
 * Menampilkan UI fallback yang ramah pengguna alih-alih crash total.
 *
 * Catatan: Error Boundary harus berupa class component (React requirement).
 */

import { Component } from 'react';
import { AlertOctagon } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Di produksi, ini bisa dikirim ke error tracking (Sentry, dll.)
    // Untuk sekarang, kita hanya log ke console dalam development
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <div className="p-3 rounded-full bg-red-50 mb-4">
            <AlertOctagon size={28} className="text-red-500" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-2">
            Terjadi Kesalahan
          </h3>
          <p className="text-sm text-slate-500 mb-4 max-w-sm">
            Komponen ini mengalami error yang tidak terduga.
            {import.meta.env.DEV && this.state.error && (
              <span className="block mt-2 font-mono text-xs text-red-600 bg-red-50 p-2 rounded text-left">
                {this.state.error.message}
              </span>
            )}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
