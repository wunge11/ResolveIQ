/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          900: '#0F172A',
          600: '#2563EB',
          50:  '#EFF6FF',
        },
        // Severity colors
        severity: {
          sev1: '#DC2626', // red-600
          sev2: '#F97316', // orange-500
          sev3: '#F59E0B', // amber-500
          sev4: '#94A3B8', // slate-400
        },
        // Status colors
        status: {
          open:         '#FCA5A5', // red-300
          investigating:'#93C5FD', // blue-300
          mitigated:    '#FCD34D', // yellow-300
          resolved:     '#34D399', // emerald-400
          closed:       '#94A3B8', // slate-400
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};
