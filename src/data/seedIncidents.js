/**
 * seedIncidents.js
 * Data demo insiden IT untuk ResolveIQ.
 * Tanggal dibuat relatif terhadap waktu saat ini agar dashboard selalu terlihat hidup.
 * 15 insiden dengan campuran severity, status, kategori, dan sistem.
 * 3 insiden (INC-007, INC-008, INC-009) memiliki tag saling mirip untuk demo "Insiden Serupa".
 */

import { daysAgoISO } from '../utils/date.js';

/** Menghasilkan ID insiden dengan format "INC-XXX" */
function incId(n) {
  return `INC-${String(n).padStart(3, '0')}`;
}

/** Menghasilkan ID entri timeline */
let tlCounter = 1;
function tlId() { return `TL-${String(tlCounter++).padStart(4, '0')}`; }

export const seedIncidents = [
  // ─── INC-001: SEV1 aktif - API Gateway Down ───────────────────────────────
  {
    id:          incId(1),
    title:       'API Gateway tidak merespons — semua layanan terdampak',
    description: 'API Gateway mengalami kegagalan total sehingga semua request masuk mendapat timeout. Semua microservice tidak dapat dikonsumsi dari frontend maupun mitra eksternal.',
    system:      'API Gateway',
    category:    'Infrastructure',
    severity:    'SEV1',
    status:      'Investigating',
    reporter:    'Budi Santoso',
    assignee:    'Rina Aditya',
    impact:      '100% pengguna tidak dapat mengakses platform. Estimasi kerugian Rp 15 juta/jam.',
    tags:        ['api-gateway', 'outage', 'critical', 'timeout'],
    createdAt:   daysAgoISO(0, 3),
    resolvedAt:  null,
    timeline: [
      { id: tlId(), time: daysAgoISO(0, 3),    type: 'Detected',   note: 'Alert monitoring Datadog terpicu — API Gateway response rate 0%.', author: 'Sistem Monitoring' },
      { id: tlId(), time: daysAgoISO(0, 2, 45),type: 'Action',     note: 'Tim on-call dihubungi. Eskalasi ke SRE lead.', author: 'Budi Santoso' },
      { id: tlId(), time: daysAgoISO(0, 2, 30),type: 'Finding',    note: 'Ditemukan memory leak di pod api-gateway-prod setelah deployment v2.4.1.', author: 'Rina Aditya' },
      { id: tlId(), time: daysAgoISO(0, 2, 10),type: 'Action',     note: 'Rollback deployment ke v2.4.0 dimulai.', author: 'Rina Aditya' },
    ],
    runbookProgress: { runbookId: 'RB-001', completedStepIds: ['step-1', 'step-2'] },
    postMortemId: null,
  },

  // ─── INC-002: SEV2 aktif - Database Cluster lambat ────────────────────────
  {
    id:          incId(2),
    title:       'Database Cluster mengalami latency tinggi — query lambat',
    description: 'Query ke Database Cluster utama membutuhkan waktu >10 detik. Diduga ada long-running query yang memblokir tabel utama.',
    system:      'Database Cluster',
    category:    'Database',
    severity:    'SEV2',
    status:      'Investigating',
    reporter:    'Citra Dewi',
    assignee:    'Ahmad Fauzi',
    impact:      'Transaksi pembayaran terlambat 10-30 detik. ~25% pengguna aktif terdampak.',
    tags:        ['database', 'latency', 'query-slow', 'postgres'],
    createdAt:   daysAgoISO(0, 5),
    resolvedAt:  null,
    timeline: [
      { id: tlId(), time: daysAgoISO(0, 5),    type: 'Detected',   note: 'Monitoring latency DB melonjak di atas threshold 5 detik.', author: 'Sistem Monitoring' },
      { id: tlId(), time: daysAgoISO(0, 4, 45),type: 'Action',     note: 'DBA dihubungi, mulai investigasi slow query log.', author: 'Citra Dewi' },
      { id: tlId(), time: daysAgoISO(0, 4, 20),type: 'Finding',    note: 'Query analitik tanpa index berjalan selama 45 menit memblokir tabel orders.', author: 'Ahmad Fauzi' },
    ],
    runbookProgress: { runbookId: 'RB-002', completedStepIds: ['step-1'] },
    postMortemId: null,
  },

  // ─── INC-003: SEV1 Resolved - Auth Service gagal login ────────────────────
  {
    id:          incId(3),
    title:       'Auth Service gagal — pengguna tidak bisa login',
    description: 'JWT validation service mengembalikan error 500 untuk semua request autentikasi. Diduga konfigurasi secret key expired.',
    system:      'Auth Service',
    category:    'Security',
    severity:    'SEV1',
    status:      'Resolved',
    reporter:    'Eka Prasetya',
    assignee:    'Rina Aditya',
    impact:      'Seluruh pengguna tidak dapat login. Platform tidak bisa digunakan selama 1j 20m.',
    tags:        ['auth', 'jwt', 'login-gagal', 'security', 'secret-key'],
    createdAt:   daysAgoISO(3, 9),
    resolvedAt:  daysAgoISO(3, 8),
    timeline: [
      { id: tlId(), time: daysAgoISO(3, 9),    type: 'Detected',   note: 'Banyak laporan pengguna tidak bisa login masuk via support ticket.', author: 'Eka Prasetya' },
      { id: tlId(), time: daysAgoISO(3, 8, 50),type: 'Escalation', note: 'Eskalasi ke tim Security dan Auth Service owner.', author: 'Eka Prasetya' },
      { id: tlId(), time: daysAgoISO(3, 8, 40),type: 'Finding',    note: 'JWT secret key di Vault sudah expired, tidak dirotasi otomatis.', author: 'Rina Aditya' },
      { id: tlId(), time: daysAgoISO(3, 8, 15),type: 'Action',     note: 'Secret key dirotasi manual dan service di-restart.', author: 'Rina Aditya' },
      { id: tlId(), time: daysAgoISO(3, 8),    type: 'Resolved',   note: 'Login berfungsi normal. Monitoring dipantau selama 30 menit.', author: 'Rina Aditya' },
    ],
    runbookProgress: { runbookId: 'RB-004', completedStepIds: ['step-1', 'step-2', 'step-3', 'step-4'] },
    postMortemId: 'PM-001',
  },

  // ─── INC-004: SEV2 Resolved - Payment Service error ───────────────────────
  {
    id:          incId(4),
    title:       'Payment Service menolak transaksi kartu kredit',
    description: 'Payment gateway mengembalikan error "INVALID_MERCHANT_CODE" untuk semua transaksi kartu kredit. Debit dan transfer masih berfungsi.',
    system:      'Payment Service',
    category:    'Application',
    severity:    'SEV2',
    status:      'Resolved',
    reporter:    'Fajar Nugroho',
    assignee:    'Citra Dewi',
    impact:      'Transaksi kartu kredit gagal (~30% dari total transaksi). Estimasi ~500 transaksi gagal.',
    tags:        ['payment', 'kartu-kredit', 'merchant-code', 'transaksi-gagal'],
    createdAt:   daysAgoISO(5, 14),
    resolvedAt:  daysAgoISO(5, 12),
    timeline: [
      { id: tlId(), time: daysAgoISO(5, 14),    type: 'Detected',   note: 'Alert error rate payment melonjak ke 35%.', author: 'Sistem Monitoring' },
      { id: tlId(), time: daysAgoISO(5, 13, 30),type: 'Action',     note: 'Tim payment dihubungi dan mulai investigasi.', author: 'Fajar Nugroho' },
      { id: tlId(), time: daysAgoISO(5, 13),    type: 'Finding',    note: 'Merchant code di konfigurasi payment gateway sudah expired — perlu pembaruan kontrak.', author: 'Citra Dewi' },
      { id: tlId(), time: daysAgoISO(5, 12, 30),type: 'Action',     note: 'Merchant code diperbarui sesuai kontrak terbaru dari bank.', author: 'Citra Dewi' },
      { id: tlId(), time: daysAgoISO(5, 12),    type: 'Resolved',   note: 'Transaksi kartu kredit kembali normal. Transaksi yang gagal di-retry otomatis.', author: 'Citra Dewi' },
    ],
    runbookProgress: { runbookId: 'RB-003', completedStepIds: ['step-1', 'step-2', 'step-3'] },
    postMortemId: 'PM-002',
  },

  // ─── INC-005: SEV3 Open - Web Portal lambat ──────────────────────────────
  {
    id:          incId(5),
    title:       'Web Portal loading halaman dashboard sangat lambat',
    description: 'Halaman utama Web Portal membutuhkan >8 detik untuk dimuat. Diduga ada request API yang tidak ter-cache dengan benar.',
    system:      'Web Portal',
    category:    'Application',
    severity:    'SEV3',
    status:      'Open',
    reporter:    'Gita Rahayu',
    assignee:    null,
    impact:      'UX terdampak untuk semua pengguna web. Tidak ada pengguna yang tidak bisa login, hanya lambat.',
    tags:        ['web-portal', 'performance', 'loading-lambat', 'cache'],
    createdAt:   daysAgoISO(1, 2),
    resolvedAt:  null,
    timeline: [
      { id: tlId(), time: daysAgoISO(1, 2), type: 'Detected', note: 'Laporan dari user bahwa halaman dashboard sangat lambat.', author: 'Gita Rahayu' },
    ],
    runbookProgress: { runbookId: null, completedStepIds: [] },
    postMortemId: null,
  },

  // ─── INC-006: SEV3 Mitigated - Network packet loss ───────────────────────
  {
    id:          incId(6),
    title:       'Packet loss 15% pada koneksi antar data center',
    description: 'Koneksi jaringan antara DC Jakarta dan DC Surabaya mengalami packet loss 15%. VPN site-to-site terdampak.',
    system:      'Network',
    category:    'Network',
    severity:    'SEV3',
    status:      'Mitigated',
    reporter:    'Hendra Wijaya',
    assignee:    'Hendra Wijaya',
    impact:      'Replikasi data antar DC terlambat. Beberapa layanan real-time sedikit tertunda.',
    tags:        ['network', 'packet-loss', 'vpn', 'datacenter', 'jaringan'],
    createdAt:   daysAgoISO(2, 6),
    resolvedAt:  null,
    timeline: [
      { id: tlId(), time: daysAgoISO(2, 6),    type: 'Detected',   note: 'Monitoring jaringan mendeteksi packet loss 15% pada link DC-Jakarta↔DC-Surabaya.', author: 'Sistem Monitoring' },
      { id: tlId(), time: daysAgoISO(2, 5, 30),type: 'Action',     note: 'Tim Network mulai troubleshooting. Traffic dialihkan ke backup link.', author: 'Hendra Wijaya' },
      { id: tlId(), time: daysAgoISO(2, 5),    type: 'Finding',    note: 'Kabel fiber optik pada link utama mengalami degradasi fisik.', author: 'Hendra Wijaya' },
      { id: tlId(), time: daysAgoISO(2, 4, 30),type: 'Action',     note: 'Traffic sepenuhnya dialihkan ke backup link. Packet loss turun ke 0%.', author: 'Hendra Wijaya' },
    ],
    runbookProgress: { runbookId: 'RB-006', completedStepIds: ['step-1', 'step-2', 'step-3'] },
    postMortemId: null,
  },

  // ─── INC-007: SEV2 Resolved - DB connection pool habis (mirip INC-008, INC-009)
  {
    id:          incId(7),
    title:       'Database connection pool habis — aplikasi tidak bisa konek',
    description: 'Semua connection pool ke Database Cluster habis. Aplikasi mengembalikan error "too many connections".',
    system:      'Database Cluster',
    category:    'Database',
    severity:    'SEV2',
    status:      'Closed',
    reporter:    'Ivan Surya',
    assignee:    'Ahmad Fauzi',
    impact:      '~40% pengguna mendapat error saat mencoba mengakses fitur yang butuh database.',
    tags:        ['database', 'connection-pool', 'postgres', 'max-connections'],
    createdAt:   daysAgoISO(8),
    resolvedAt:  daysAgoISO(7, 22),
    timeline: [
      { id: tlId(), time: daysAgoISO(8),       type: 'Detected',   note: 'Error "too many connections" muncul di log aplikasi.', author: 'Sistem Monitoring' },
      { id: tlId(), time: daysAgoISO(7, 23, 30),type: 'Action',    note: 'Koneksi idle diterminasi secara manual via pg_terminate_backend.', author: 'Ahmad Fauzi' },
      { id: tlId(), time: daysAgoISO(7, 23),    type: 'Finding',   note: 'Bug di aplikasi menyebabkan connection tidak dikembalikan ke pool setelah query selesai.', author: 'Ahmad Fauzi' },
      { id: tlId(), time: daysAgoISO(7, 22),    type: 'Resolved',  note: 'Hotfix connection leak di-deploy. Pool berjalan normal.', author: 'Ahmad Fauzi' },
    ],
    runbookProgress: { runbookId: 'RB-002', completedStepIds: ['step-1', 'step-2', 'step-3', 'step-4'] },
    postMortemId: 'PM-003',
  },

  // ─── INC-008: SEV3 Closed - DB replica lag (mirip INC-007, INC-009)
  {
    id:          incId(8),
    title:       'Database replica mengalami lag replikasi tinggi',
    description: 'Replica DB lag mencapai 45 detik. Read queries yang diarahkan ke replica mengembalikan data lama.',
    system:      'Database Cluster',
    category:    'Database',
    severity:    'SEV3',
    status:      'Closed',
    reporter:    'Joko Prabowo',
    assignee:    'Ahmad Fauzi',
    impact:      'Pengguna melihat data tidak konsisten (stale data). Fitur laporan real-time terdampak.',
    tags:        ['database', 'replica', 'replikasi', 'postgres', 'lag'],
    createdAt:   daysAgoISO(10, 3),
    resolvedAt:  daysAgoISO(10, 2),
    timeline: [
      { id: tlId(), time: daysAgoISO(10, 3),    type: 'Detected',  note: 'Replica lag alert terpicu. Lag = 45 detik.', author: 'Sistem Monitoring' },
      { id: tlId(), time: daysAgoISO(10, 2, 45),type: 'Finding',   note: 'Long transaction di primary memperlambat replikasi ke replica.', author: 'Ahmad Fauzi' },
      { id: tlId(), time: daysAgoISO(10, 2, 30),type: 'Action',    note: 'Long transaction diterminasi. Replikasi mulai catch-up.', author: 'Ahmad Fauzi' },
      { id: tlId(), time: daysAgoISO(10, 2),    type: 'Resolved',  note: 'Replica lag kembali ke normal (<1 detik).', author: 'Ahmad Fauzi' },
    ],
    runbookProgress: { runbookId: 'RB-002', completedStepIds: ['step-1', 'step-2', 'step-3', 'step-4'] },
    postMortemId: null,
  },

  // ─── INC-009: SEV2 Resolved - DB disk penuh (mirip INC-007, INC-008)
  {
    id:          incId(9),
    title:       'Database Cluster disk hampir penuh — write mulai gagal',
    description: 'Disk database mencapai 92% kapasitas. Write operations mulai gagal secara sporadis.',
    system:      'Database Cluster',
    category:    'Database',
    severity:    'SEV2',
    status:      'Resolved',
    reporter:    'Kartika Sari',
    assignee:    'Ahmad Fauzi',
    impact:      'Write operations gagal ~15%. Data loss berpotensi terjadi jika tidak segera ditangani.',
    tags:        ['database', 'disk-penuh', 'postgres', 'storage', 'write-error'],
    createdAt:   daysAgoISO(12, 8),
    resolvedAt:  daysAgoISO(12, 5),
    timeline: [
      { id: tlId(), time: daysAgoISO(12, 8),    type: 'Detected',  note: 'Alert disk usage DB di atas 90%.', author: 'Sistem Monitoring' },
      { id: tlId(), time: daysAgoISO(12, 7, 30),type: 'Action',    note: 'Identifikasi tabel dan index terbesar. WAL archive lama ditemukan memakan 50GB.', author: 'Ahmad Fauzi' },
      { id: tlId(), time: daysAgoISO(12, 6),    type: 'Action',    note: 'WAL archive lama dibersihkan. Disk turun ke 65%.', author: 'Ahmad Fauzi' },
      { id: tlId(), time: daysAgoISO(12, 5),    type: 'Resolved',  note: 'Write operations normal. Disk monitoring threshold diturunkan ke 80%.', author: 'Ahmad Fauzi' },
    ],
    runbookProgress: { runbookId: 'RB-002', completedStepIds: ['step-1', 'step-2', 'step-3', 'step-4'] },
    postMortemId: null,
  },

  // ─── INC-010: SEV1 Resolved - Deployment rollout gagal ───────────────────
  {
    id:          incId(10),
    title:       'Deployment v3.2.0 menyebabkan Web Portal tidak bisa diakses',
    description: 'Setelah deployment v3.2.0 ke production, Web Portal mengembalikan HTTP 502 untuk semua halaman. Rollback diperlukan.',
    system:      'Web Portal',
    category:    'Deployment',
    severity:    'SEV1',
    status:      'Closed',
    reporter:    'Lukman Hakim',
    assignee:    'Lukman Hakim',
    impact:      'Seluruh pengguna web tidak dapat mengakses platform selama 45 menit.',
    tags:        ['deployment', 'rollback', 'web-portal', 'http-502', 'production'],
    createdAt:   daysAgoISO(15, 10),
    resolvedAt:  daysAgoISO(15, 9, 15),
    timeline: [
      { id: tlId(), time: daysAgoISO(15, 10),    type: 'Detected',  note: 'Deployment selesai namun health check gagal. HTTP 502 dari semua endpoint.', author: 'Sistem CI/CD' },
      { id: tlId(), time: daysAgoISO(15, 9, 50), type: 'Escalation',note: 'Eskalasi ke release manager dan tim DevOps.', author: 'Lukman Hakim' },
      { id: tlId(), time: daysAgoISO(15, 9, 40), type: 'Finding',   note: 'Environment variable DATABASE_URL tidak ter-set di konfigurasi deployment baru.', author: 'Lukman Hakim' },
      { id: tlId(), time: daysAgoISO(15, 9, 20), type: 'Action',    note: 'Rollback ke v3.1.8 dimulai.', author: 'Lukman Hakim' },
      { id: tlId(), time: daysAgoISO(15, 9, 15), type: 'Resolved',  note: 'Rollback berhasil. Web Portal kembali online.', author: 'Lukman Hakim' },
    ],
    runbookProgress: { runbookId: 'RB-005', completedStepIds: ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'] },
    postMortemId: 'PM-004',
  },

  // ─── INC-011: SEV3 Open - Auth Service latency tinggi ────────────────────
  {
    id:          incId(11),
    title:       'Auth Service latency meningkat — login lambat',
    description: 'Waktu login rata-rata meningkat dari 200ms menjadi 2.5 detik. Tidak ada kegagalan total.',
    system:      'Auth Service',
    category:    'Application',
    severity:    'SEV3',
    status:      'Open',
    reporter:    'Maya Indri',
    assignee:    null,
    impact:      'Pengalaman login lebih lambat untuk semua pengguna.',
    tags:        ['auth', 'latency', 'login-lambat', 'performance'],
    createdAt:   daysAgoISO(1, 5),
    resolvedAt:  null,
    timeline: [
      { id: tlId(), time: daysAgoISO(1, 5), type: 'Detected', note: 'P99 latency login melonjak ke 2.5 detik.', author: 'Sistem Monitoring' },
    ],
    runbookProgress: { runbookId: null, completedStepIds: [] },
    postMortemId: null,
  },

  // ─── INC-012: SEV4 Closed - UI bug pada Web Portal ───────────────────────
  {
    id:          incId(12),
    title:       'Tombol "Ekspor CSV" tidak berfungsi di halaman laporan',
    description: 'Tombol Ekspor CSV di halaman laporan transaksi tidak merespons klik. Tidak ada error di console.',
    system:      'Web Portal',
    category:    'Application',
    severity:    'SEV4',
    status:      'Closed',
    reporter:    'Nina Wulandari',
    assignee:    'Gita Rahayu',
    impact:      'Pengguna tidak dapat mengunduh laporan CSV. Workaround: unduh via API langsung.',
    tags:        ['web-portal', 'ui-bug', 'ekspor-csv', 'laporan'],
    createdAt:   daysAgoISO(7, 1),
    resolvedAt:  daysAgoISO(6, 18),
    timeline: [
      { id: tlId(), time: daysAgoISO(7, 1),    type: 'Detected',  note: 'User report: tombol ekspor tidak berfungsi.', author: 'Nina Wulandari' },
      { id: tlId(), time: daysAgoISO(6, 20),   type: 'Finding',   note: 'Event listener hilang setelah refactor komponen v3.1.5.', author: 'Gita Rahayu' },
      { id: tlId(), time: daysAgoISO(6, 18),   type: 'Resolved',  note: 'Fix di-deploy via hotfix v3.1.6.', author: 'Gita Rahayu' },
    ],
    runbookProgress: { runbookId: null, completedStepIds: [] },
    postMortemId: null,
  },

  // ─── INC-013: SEV2 Resolved - Security breach attempt ────────────────────
  {
    id:          incId(13),
    title:       'Upaya serangan brute force pada endpoint login',
    description: 'Terdeteksi 50.000 request login dalam 5 menit dari IP 185.x.x.x. Rate limiting dan IP block diaktifkan.',
    system:      'Auth Service',
    category:    'Security',
    severity:    'SEV2',
    status:      'Resolved',
    reporter:    'Odi Prasetyo',
    assignee:    'Rina Aditya',
    impact:      'Beban CPU Auth Service naik ke 85%. Login lambat untuk semua pengguna selama 10 menit.',
    tags:        ['security', 'brute-force', 'auth', 'rate-limiting', 'ip-block'],
    createdAt:   daysAgoISO(18, 2),
    resolvedAt:  daysAgoISO(18, 1, 40),
    timeline: [
      { id: tlId(), time: daysAgoISO(18, 2),      type: 'Detected',   note: 'WAF alert: volume request login abnormal dari satu IP.', author: 'Sistem Keamanan' },
      { id: tlId(), time: daysAgoISO(18, 1, 50),  type: 'Action',     note: 'IP 185.x.x.x di-block di level WAF.', author: 'Rina Aditya' },
      { id: tlId(), time: daysAgoISO(18, 1, 45),  type: 'Action',     note: 'Rate limiting diperketat: max 10 request/menit per IP.', author: 'Rina Aditya' },
      { id: tlId(), time: daysAgoISO(18, 1, 40),  type: 'Resolved',   note: 'Serangan berhenti. CPU Auth Service kembali normal.', author: 'Rina Aditya' },
    ],
    runbookProgress: { runbookId: 'RB-004', completedStepIds: ['step-1', 'step-2', 'step-3'] },
    postMortemId: null,
  },

  // ─── INC-014: SEV3 Resolved - Payment Service lambat ─────────────────────
  {
    id:          incId(14),
    title:       'Payment Service merespons lambat saat jam puncak',
    description: 'Waktu respons Payment Service melonjak ke 4 detik pada jam 19.00-21.00. Diduga resource contention di peak hour.',
    system:      'Payment Service',
    category:    'Application',
    severity:    'SEV3',
    status:      'Resolved',
    reporter:    'Putri Lestari',
    assignee:    'Fajar Nugroho',
    impact:      'Checkout lebih lambat dari biasanya. Tidak ada kegagalan transaksi.',
    tags:        ['payment', 'performance', 'peak-hour', 'latency'],
    createdAt:   daysAgoISO(20, 20),
    resolvedAt:  daysAgoISO(20, 18),
    timeline: [
      { id: tlId(), time: daysAgoISO(20, 20),    type: 'Detected',  note: 'P95 latency payment melonjak ke 4 detik.', author: 'Sistem Monitoring' },
      { id: tlId(), time: daysAgoISO(20, 19, 30),type: 'Action',    note: 'Auto-scaling diaktifkan manual untuk menambah 3 pod payment service.', author: 'Fajar Nugroho' },
      { id: tlId(), time: daysAgoISO(20, 19),    type: 'Resolved',  note: 'Latency kembali ke normal (<500ms) setelah scaling.', author: 'Fajar Nugroho' },
    ],
    runbookProgress: { runbookId: 'RB-003', completedStepIds: ['step-1', 'step-2'] },
    postMortemId: null,
  },

  // ─── INC-015: SEV4 Open - Web Portal dark mode bug ────────────────────────
  {
    id:          incId(15),
    title:       'Dark mode Web Portal: teks tidak terbaca di halaman profil',
    description: 'Di mode gelap, teks hitam di halaman profil user menampilkan kontras rendah (teks gelap di background gelap).',
    system:      'Web Portal',
    category:    'Application',
    severity:    'SEV4',
    status:      'Open',
    reporter:    'Reza Firmansyah',
    assignee:    null,
    impact:      'Pengguna dark mode tidak bisa membaca informasi profil dengan nyaman.',
    tags:        ['web-portal', 'dark-mode', 'ui-bug', 'aksesibilitas'],
    createdAt:   daysAgoISO(0, 1),
    resolvedAt:  null,
    timeline: [
      { id: tlId(), time: daysAgoISO(0, 1), type: 'Detected', note: 'Bug dilaporkan oleh pengguna via feedback form.', author: 'Reza Firmansyah' },
    ],
    runbookProgress: { runbookId: null, completedStepIds: [] },
    postMortemId: null,
  },
];

/**
 * Menghasilkan ID insiden berikutnya berdasarkan data yang ada.
 * @param {object[]} incidents - Array insiden yang ada
 * @returns {string} ID berikutnya, contoh "INC-016"
 */
export function generateNextIncidentId(incidents) {
  const max = incidents.reduce((m, inc) => {
    const num = parseInt(inc.id.replace('INC-', ''), 10);
    return num > m ? num : m;
  }, 0);
  return incId(max + 1);
}
