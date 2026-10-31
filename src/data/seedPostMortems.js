/**
 * seedPostMortems.js
 * Data demo post-mortem untuk ResolveIQ.
 * 4 post-mortem lengkap dengan action item (sebagian terlambat/selesai).
 */

import { daysAgoISO } from '../utils/date.js';

export const seedPostMortems = [
  // ─── PM-001: Post-Mortem INC-003 (Auth Service gagal login) ──────────────
  {
    id:          'PM-001',
    incidentId:  'INC-003',
    summary:
      'Insiden INC-003 (SEV1) pada sistem Auth Service menyebabkan seluruh pengguna tidak dapat login selama 1 jam 20 menit. ' +
      'Dipicu oleh JWT secret key yang expired dan tidak dirotasi secara otomatis.',
    timeline: [
      { id: 'pm1-tl-1', time: daysAgoISO(3, 9),    type: 'Detected',   note: 'Banyak laporan pengguna tidak bisa login masuk via support ticket.' },
      { id: 'pm1-tl-2', time: daysAgoISO(3, 8, 50),type: 'Escalation', note: 'Eskalasi ke tim Security dan Auth Service owner.' },
      { id: 'pm1-tl-3', time: daysAgoISO(3, 8, 40),type: 'Finding',    note: 'JWT secret key di Vault sudah expired, tidak dirotasi otomatis.' },
      { id: 'pm1-tl-4', time: daysAgoISO(3, 8, 15),type: 'Action',     note: 'Secret key dirotasi manual dan service di-restart.' },
      { id: 'pm1-tl-5', time: daysAgoISO(3, 8),    type: 'Resolved',   note: 'Login berfungsi normal.' },
    ],
    rootCause:
      'JWT secret key yang digunakan Auth Service untuk menandatangani dan memverifikasi token memiliki masa berlaku. ' +
      'Sistem Vault yang menyimpan secret tidak memiliki mekanisme auto-rotation yang aktif, dan tidak ada alert yang ' +
      'dikonfigurasi untuk memperingatkan tim sebelum secret expired. Akibatnya, ketika secret expired, ' +
      'seluruh operasi login gagal tanpa peringatan.',
    impact:
      'Seluruh pengguna platform tidak dapat login selama 1 jam 20 menit (19.600 pengguna aktif terdampak). ' +
      'Estimasi kerugian bisnis: Rp 8 juta dari transaksi yang tertunda.',
    wentWell:
      'Tim on-call merespons dalam 5 menit setelah insiden dilaporkan. ' +
      'Runbook auth service tersedia dan mempercepat identifikasi masalah. ' +
      'Koordinasi antara tim security dan ops berjalan lancar.',
    needsImprovement:
      'Tidak ada monitoring untuk expiry date JWT secret. ' +
      'Proses rotasi secret masih manual dan tidak terdokumentasi dalam runbook. ' +
      'Alert threshold terlalu lambat (hanya alert setelah 100% login gagal, bukan saat error rate naik).',
    actionItems: [
      {
        id:      'ai-pm1-1',
        text:    'Setup alert Vault untuk JWT secret yang akan expired dalam 7 hari',
        owner:   'Rina Aditya',
        dueDate: daysAgoISO(-7).slice(0, 10), // 7 hari ke depan
        done:    false,
      },
      {
        id:      'ai-pm1-2',
        text:    'Implementasi auto-rotation JWT secret di Vault dengan periode 90 hari',
        owner:   'Eka Prasetya',
        dueDate: daysAgoISO(-14).slice(0, 10), // 14 hari ke depan
        done:    false,
      },
      {
        id:      'ai-pm1-3',
        text:    'Update runbook Auth Service dengan langkah rotasi secret key',
        owner:   'Rina Aditya',
        dueDate: daysAgoISO(1).slice(0, 10), // sudah lewat (overdue)
        done:    true,
      },
      {
        id:      'ai-pm1-4',
        text:    'Turunkan threshold alert login error rate dari 100% menjadi 10%',
        owner:   'Budi Santoso',
        dueDate: daysAgoISO(2).slice(0, 10), // sudah lewat (overdue)
        done:    false,
      },
    ],
    createdAt:  daysAgoISO(3, 6),
    updatedAt:  daysAgoISO(2),
  },

  // ─── PM-002: Post-Mortem INC-004 (Payment Service merchant code) ──────────
  {
    id:          'PM-002',
    incidentId:  'INC-004',
    summary:
      'Insiden INC-004 (SEV2) pada Payment Service menyebabkan semua transaksi kartu kredit gagal selama 2 jam. ' +
      'Root cause: merchant code di konfigurasi payment gateway sudah expired setelah pembaruan kontrak dengan bank.',
    timeline: [
      { id: 'pm2-tl-1', time: daysAgoISO(5, 14),    type: 'Detected',  note: 'Alert error rate payment melonjak ke 35%.' },
      { id: 'pm2-tl-2', time: daysAgoISO(5, 13, 30),type: 'Action',    note: 'Tim payment dihubungi dan mulai investigasi.' },
      { id: 'pm2-tl-3', time: daysAgoISO(5, 13),    type: 'Finding',   note: 'Merchant code expired setelah pembaruan kontrak.' },
      { id: 'pm2-tl-4', time: daysAgoISO(5, 12, 30),type: 'Action',    note: 'Merchant code diperbarui sesuai kontrak terbaru.' },
      { id: 'pm2-tl-5', time: daysAgoISO(5, 12),    type: 'Resolved',  note: 'Transaksi kartu kredit kembali normal.' },
    ],
    rootCause:
      'Proses pembaruan kontrak dengan bank tidak terintegrasi dengan proses update konfigurasi sistem. ' +
      'Tim bisnis memperbarui kontrak namun tidak menginformasikan tim teknis bahwa merchant code berubah. ' +
      'Tidak ada proses checklist untuk perubahan kontrak payment provider.',
    impact:
      'Estimasi ~500 transaksi kartu kredit gagal selama 2 jam. ' +
      'Pendapatan yang tertunda: Rp 125 juta. Semua transaksi berhasil di-retry setelah pemulihan.',
    wentWell:
      'Monitoring error rate langsung mendeteksi masalah. ' +
      'Tim payment merespons cepat dan berhasil mengidentifikasi root cause dalam 1 jam. ' +
      'Proses retry otomatis berhasil memproses kembali transaksi yang gagal.',
    needsImprovement:
      'Tidak ada proses handoff antara tim bisnis dan tim teknis untuk perubahan kontrak vendor. ' +
      'Konfigurasi merchant code tidak pernah di-review secara periodik. ' +
      'Tidak ada notifikasi dari bank ketika merchant code akan berubah.',
    actionItems: [
      {
        id:      'ai-pm2-1',
        text:    'Buat SOP handoff perubahan kontrak payment provider antara tim bisnis dan teknis',
        owner:   'Fajar Nugroho',
        dueDate: daysAgoISO(-10).slice(0, 10),
        done:    true,
      },
      {
        id:      'ai-pm2-2',
        text:    'Setup monitoring periodik untuk validasi merchant code dan API key payment gateway',
        owner:   'Citra Dewi',
        dueDate: daysAgoISO(3).slice(0, 10), // sudah lewat
        done:    false,
      },
      {
        id:      'ai-pm2-3',
        text:    'Koordinasi dengan bank untuk mendapatkan notifikasi email sebelum merchant code berubah',
        owner:   'Fajar Nugroho',
        dueDate: daysAgoISO(-5).slice(0, 10),
        done:    true,
      },
    ],
    createdAt:  daysAgoISO(5, 10),
    updatedAt:  daysAgoISO(4),
  },

  // ─── PM-003: Post-Mortem INC-007 (DB connection pool habis) ──────────────
  {
    id:          'PM-003',
    incidentId:  'INC-007',
    summary:
      'Insiden INC-007 (SEV2) pada Database Cluster menyebabkan ~40% pengguna mendapat error karena connection pool habis. ' +
      'Durasi insiden: sekitar 2 jam. Diperbaiki dengan hotfix connection leak di aplikasi.',
    timeline: [
      { id: 'pm3-tl-1', time: daysAgoISO(8),        type: 'Detected',  note: 'Error "too many connections" muncul di log aplikasi.' },
      { id: 'pm3-tl-2', time: daysAgoISO(7, 23, 30),type: 'Action',    note: 'Koneksi idle diterminasi secara manual.' },
      { id: 'pm3-tl-3', time: daysAgoISO(7, 23),    type: 'Finding',   note: 'Bug di aplikasi: connection tidak dikembalikan ke pool setelah query.' },
      { id: 'pm3-tl-4', time: daysAgoISO(7, 22),    type: 'Resolved',  note: 'Hotfix connection leak di-deploy.' },
    ],
    rootCause:
      'Refactoring kode repository layer pada sprint terakhir secara tidak sengaja menghilangkan pemanggilan connection.close() ' +
      'di dalam blok finally. Akibatnya, setiap request yang membuat koneksi ke database tidak mengembalikan koneksi ke pool, ' +
      'sehingga pool habis dalam beberapa jam.',
    impact:
      '~40% pengguna mendapat error 500 selama 2 jam. ' +
      'Tidak ada data loss. Semua request yang gagal dapat di-retry oleh pengguna.',
    wentWell:
      'Runbook Database Cluster mempercepat identifikasi long connection yang idle. ' +
      'Tim DBA berhasil memitigasi sementara dengan terminasi koneksi manual sambil menunggu hotfix.',
    needsImprovement:
      'Code review tidak menangkap bug resource leak pada repository layer. ' +
      'Tidak ada unit test untuk memverifikasi connection dikembalikan ke pool setelah setiap query. ' +
      'Load test tidak dilakukan sebelum deployment ke production.',
    actionItems: [
      {
        id:      'ai-pm3-1',
        text:    'Tambahkan linting rule untuk mendeteksi unclosed database connection',
        owner:   'Ivan Surya',
        dueDate: daysAgoISO(-5).slice(0, 10),
        done:    true,
      },
      {
        id:      'ai-pm3-2',
        text:    'Buat unit test untuk memverifikasi connection pool behavior di semua repository',
        owner:   'Ahmad Fauzi',
        dueDate: daysAgoISO(5).slice(0, 10), // sudah lewat
        done:    false,
      },
      {
        id:      'ai-pm3-3',
        text:    'Setup alert untuk connection pool utilization >80%',
        owner:   'Budi Santoso',
        dueDate: daysAgoISO(-3).slice(0, 10),
        done:    true,
      },
      {
        id:      'ai-pm3-4',
        text:    'Wajibkan load test di staging sebelum deployment major ke production',
        owner:   'Rina Aditya',
        dueDate: daysAgoISO(6).slice(0, 10), // sudah lewat
        done:    false,
      },
    ],
    createdAt:  daysAgoISO(7, 20),
    updatedAt:  daysAgoISO(6),
  },

  // ─── PM-004: Post-Mortem INC-010 (Deployment gagal) ─────────────────────
  {
    id:          'PM-004',
    incidentId:  'INC-010',
    summary:
      'Insiden INC-010 (SEV1) terjadi setelah deployment v3.2.0 ke production Web Portal. ' +
      'HTTP 502 selama 45 menit karena environment variable DATABASE_URL tidak ter-set di konfigurasi deployment baru.',
    timeline: [
      { id: 'pm4-tl-1', time: daysAgoISO(15, 10),    type: 'Detected',   note: 'Health check gagal setelah deployment. HTTP 502 dari semua endpoint.' },
      { id: 'pm4-tl-2', time: daysAgoISO(15, 9, 50), type: 'Escalation', note: 'Eskalasi ke release manager dan tim DevOps.' },
      { id: 'pm4-tl-3', time: daysAgoISO(15, 9, 40), type: 'Finding',    note: 'Environment variable DATABASE_URL hilang di konfigurasi deployment baru.' },
      { id: 'pm4-tl-4', time: daysAgoISO(15, 9, 20), type: 'Action',     note: 'Rollback ke v3.1.8 dimulai.' },
      { id: 'pm4-tl-5', time: daysAgoISO(15, 9, 15), type: 'Resolved',   note: 'Rollback berhasil. Web Portal kembali online.' },
    ],
    rootCause:
      'Migrasi konfigurasi deployment dari format lama (Helm values) ke format baru (Kustomize) ' +
      'dilakukan tanpa checklist yang lengkap. Variable DATABASE_URL ada di format lama tapi tidak ' +
      'dimigrasikan ke format baru. Proses smoke test setelah deployment tidak mencakup verifikasi ' +
      'koneksi database.',
    impact:
      'Seluruh pengguna web tidak dapat mengakses platform selama 45 menit. ' +
      'Estimasi ~8.000 pengguna terdampak. Tidak ada data loss.',
    wentWell:
      'Runbook Emergency Deployment Rollback diikuti dengan tepat dan rollback selesai dalam 25 menit. ' +
      'Tim on-call merespons dalam 3 menit setelah alert terpicu.',
    needsImprovement:
      'Proses migrasi konfigurasi tidak memiliki checklist dan peer review yang memadai. ' +
      'Smoke test post-deployment tidak mencakup verifikasi semua environment variable kritis. ' +
      'Tidak ada staging environment yang identik dengan production untuk validasi sebelum deploy.',
    actionItems: [
      {
        id:      'ai-pm4-1',
        text:    'Buat checklist migrasi konfigurasi deployment yang wajib di-review oleh 2 orang',
        owner:   'Lukman Hakim',
        dueDate: daysAgoISO(-7).slice(0, 10),
        done:    true,
      },
      {
        id:      'ai-pm4-2',
        text:    'Update smoke test suite untuk memverifikasi koneksi database dan semua env var kritis',
        owner:   'Lukman Hakim',
        dueDate: daysAgoISO(-3).slice(0, 10),
        done:    true,
      },
      {
        id:      'ai-pm4-3',
        text:    'Setup staging environment yang identik dengan production menggunakan IaC',
        owner:   'Rina Aditya',
        dueDate: daysAgoISO(-20).slice(0, 10),
        done:    false,
      },
      {
        id:      'ai-pm4-4',
        text:    'Implementasi deployment verification gate: deployment otomatis rollback jika health check gagal dalam 5 menit',
        owner:   'Budi Santoso',
        dueDate: daysAgoISO(10).slice(0, 10), // sudah lewat
        done:    false,
      },
    ],
    createdAt:  daysAgoISO(15, 7),
    updatedAt:  daysAgoISO(14),
  },
];
