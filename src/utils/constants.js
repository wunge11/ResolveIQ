/**
 * constants.js
 * Konstanta global aplikasi ResolveIQ.
 * Semua nilai tetap yang digunakan di lebih dari satu tempat
 * didefinisikan di sini agar mudah diubah secara terpusat.
 */

/** Kunci localStorage yang digunakan dengan versi untuk menghindari konflik */
export const STORAGE_KEYS = {
  INCIDENTS:    'resolveiq:v1:incidents',
  RUNBOOKS:     'resolveiq:v1:runbooks',
  POST_MORTEMS: 'resolveiq:v1:postmortems',
  ACTIVITIES:   'resolveiq:v1:activities',
};

/** Daftar severity yang tersedia beserta label dan warna Tailwind */
export const SEVERITIES = [
  { value: 'SEV1', label: 'SEV1 - Kritis',  color: 'bg-red-100 text-red-700 border-red-300',    dot: 'bg-red-600'    },
  { value: 'SEV2', label: 'SEV2 - Tinggi',  color: 'bg-orange-100 text-orange-700 border-orange-300', dot: 'bg-orange-500' },
  { value: 'SEV3', label: 'SEV3 - Sedang',  color: 'bg-amber-100 text-amber-700 border-amber-300',  dot: 'bg-amber-500'  },
  { value: 'SEV4', label: 'SEV4 - Rendah',  color: 'bg-slate-100 text-slate-600 border-slate-300',  dot: 'bg-slate-400'  },
];

/** Daftar status insiden dengan urutan alur kerja */
export const STATUSES = [
  { value: 'Open',          label: 'Open',          color: 'bg-red-100 text-red-700 border-red-200'         },
  { value: 'Investigating', label: 'Investigating',  color: 'bg-blue-100 text-blue-700 border-blue-200'      },
  { value: 'Mitigated',     label: 'Mitigated',      color: 'bg-yellow-100 text-yellow-700 border-yellow-200'},
  { value: 'Resolved',      label: 'Resolved',       color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'Closed',        label: 'Closed',         color: 'bg-slate-100 text-slate-600 border-slate-200'   },
];

/** Urutan transisi status yang diizinkan */
export const STATUS_TRANSITIONS = {
  Open:          ['Investigating'],
  Investigating: ['Mitigated', 'Resolved'],
  Mitigated:     ['Resolved'],
  Resolved:      ['Closed'],
  Closed:        [],
};

/** Daftar kategori insiden */
export const CATEGORIES = [
  'Network',
  'Database',
  'Application',
  'Infrastructure',
  'Security',
  'Deployment',
];

/** Daftar sistem yang dimonitor */
export const SYSTEMS = [
  'API Gateway',
  'Database Cluster',
  'Auth Service',
  'Payment Service',
  'Web Portal',
  'Network',
];

/** Tipe entri timeline */
export const TIMELINE_TYPES = [
  { value: 'Detected',    label: 'Terdeteksi',    color: 'text-red-600'    },
  { value: 'Action',      label: 'Tindakan',       color: 'text-blue-600'   },
  { value: 'Finding',     label: 'Temuan',         color: 'text-amber-600'  },
  { value: 'Escalation',  label: 'Eskalasi',       color: 'text-purple-600' },
  { value: 'Resolved',    label: 'Terselesaikan',  color: 'text-emerald-600'},
];

/** Status action item post-mortem */
export const ACTION_ITEM_STATUSES = [
  { value: 'todo',        label: 'Belum Mulai'  },
  { value: 'in_progress', label: 'Sedang Berjalan' },
  { value: 'done',        label: 'Selesai'      },
];

/** Nama halaman untuk navigasi */
export const PAGES = {
  DASHBOARD:     'Dashboard',
  INCIDENTS:     'Incidents',
  RUNBOOKS:      'Runbooks',
  POST_MORTEMS:  'Post-Mortems',
  KNOWLEDGE_BASE:'Knowledge Base',
};
