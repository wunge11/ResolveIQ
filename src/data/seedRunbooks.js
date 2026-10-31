/**
 * seedRunbooks.js
 * Data demo runbook untuk ResolveIQ.
 * 6 runbook mencakup semua kategori utama sistem.
 */

import { daysAgoISO } from '../utils/date.js';

export const seedRunbooks = [
  // ─── RB-001: API Gateway Recovery ──────────────────────────────────────
  {
    id:         'RB-001',
    title:      'API Gateway Recovery Procedure',
    category:   'Infrastructure',
    systems:    ['API Gateway'],
    version:    '1.3',
    updatedAt:  daysAgoISO(20),
    steps: [
      { id: 'step-1', text: 'Periksa health endpoint API Gateway: GET /health. Catat response code dan waktu respons.' },
      { id: 'step-2', text: 'Cek log pod api-gateway-prod: kubectl logs -l app=api-gateway --tail=200 -n production. Identifikasi error utama.' },
      { id: 'step-3', text: 'Verifikasi resource usage pod: kubectl top pods -l app=api-gateway -n production. Bandingkan dengan baseline normal.' },
      { id: 'step-4', text: 'Jika memory usage >85%, restart pod secara rolling: kubectl rollout restart deployment/api-gateway -n production.' },
      { id: 'step-5', text: 'Jika restart tidak membantu, pertimbangkan rollback ke versi sebelumnya: kubectl rollout undo deployment/api-gateway -n production.' },
      { id: 'step-6', text: 'Monitor health endpoint selama 5 menit setelah pemulihan. Konfirmasi error rate kembali ke <0.1%.' },
      { id: 'step-7', text: 'Notifikasikan tim terkait bahwa API Gateway sudah pulih dan mulai dokumentasi post-mortem.' },
    ],
    suggestions: [
      {
        id: 'sug-rb001-1',
        text: 'Tambahkan langkah untuk memeriksa konfigurasi rate limiting sebelum restart — berdasarkan INC-001 ditemukan memory leak dari traffic spike yang tidak dibatasi.',
        fromIncidentId: 'INC-001',
        status: 'pending',
      },
    ],
  },

  // ─── RB-002: Database Cluster Troubleshooting ────────────────────────────
  {
    id:         'RB-002',
    title:      'Database Cluster Troubleshooting Guide',
    category:   'Database',
    systems:    ['Database Cluster'],
    version:    '2.1',
    updatedAt:  daysAgoISO(10),
    steps: [
      { id: 'step-1', text: 'Cek koneksi aktif: SELECT count(*), state, wait_event_type FROM pg_stat_activity GROUP BY state, wait_event_type;' },
      { id: 'step-2', text: 'Identifikasi long-running query: SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state FROM pg_stat_activity WHERE (now() - pg_stat_activity.query_start) > interval \'5 minutes\';' },
      { id: 'step-3', text: 'Terminasi query yang memblokir: SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND state = \'idle in transaction\' AND query_start < now() - interval \'10 minutes\';' },
      { id: 'step-4', text: 'Periksa disk usage: SELECT pg_size_pretty(pg_database_size(current_database())); dan cek space OS dengan df -h /var/lib/postgresql.' },
      { id: 'step-5', text: 'Jika replica lag > 30 detik, periksa primary untuk long transactions yang memblokir WAL streaming.' },
      { id: 'step-6', text: 'Monitor pg_stat_replication untuk memastikan replica catch-up setelah penanganan.' },
    ],
    suggestions: [],
  },

  // ─── RB-003: Payment Service Recovery ───────────────────────────────────
  {
    id:         'RB-003',
    title:      'Payment Service Incident Response',
    category:   'Application',
    systems:    ['Payment Service'],
    version:    '1.5',
    updatedAt:  daysAgoISO(5),
    steps: [
      { id: 'step-1', text: 'Cek dashboard payment gateway (Midtrans/Xendit) untuk status real-time layanan payment provider.' },
      { id: 'step-2', text: 'Periksa log error Payment Service: kubectl logs -l app=payment-service --tail=500 -n production | grep ERROR.' },
      { id: 'step-3', text: 'Verifikasi konfigurasi merchant code dan API key payment provider belum expired di secret manager.' },
      { id: 'step-4', text: 'Jika ada perubahan konfigurasi, update secret dan trigger rolling restart: kubectl rollout restart deployment/payment-service -n production.' },
      { id: 'step-5', text: 'Jalankan transaksi uji coba dengan kartu test untuk verifikasi pemulihan.' },
      { id: 'step-6', text: 'Identifikasi transaksi yang gagal selama insiden dan koordinasikan retry/refund dengan tim bisnis.' },
    ],
    suggestions: [],
  },

  // ─── RB-004: Auth Service Security Incident ─────────────────────────────
  {
    id:         'RB-004',
    title:      'Auth Service Security Incident Playbook',
    category:   'Security',
    systems:    ['Auth Service'],
    version:    '2.0',
    updatedAt:  daysAgoISO(15),
    steps: [
      { id: 'step-1', text: 'Segera eskalasi ke Security Lead dan informasikan management jika ada indikasi security breach.' },
      { id: 'step-2', text: 'Periksa log akses Auth Service untuk pola anomali: frekuensi login gagal, source IP tidak biasa, atau waktu akses aneh.' },
      { id: 'step-3', text: 'Jika brute force: aktifkan enhanced rate limiting dan block IP mencurigakan di WAF. Notifikasikan NOC.' },
      { id: 'step-4', text: 'Periksa JWT secret di Vault: vault kv get secret/auth-service/jwt-secret. Verifikasi expiry date.' },
      { id: 'step-5', text: 'Jika secret expired atau ter-compromise: rotasi segera via vault kv put dan restart Auth Service.' },
      { id: 'step-6', text: 'Verifikasi semua session aktif valid. Pertimbangkan invalidasi semua session jika ada indikasi breach.' },
      { id: 'step-7', text: 'Buat laporan incident security ke CISO dalam 2 jam setelah insiden teridentifikasi.' },
    ],
    suggestions: [
      {
        id: 'sug-rb004-1',
        text: 'Tambahkan langkah setup alert otomatis untuk rotasi JWT secret 7 hari sebelum expired — dari temuan INC-003.',
        fromIncidentId: 'INC-003',
        status: 'accepted',
      },
    ],
  },

  // ─── RB-005: Deployment Rollback Procedure ───────────────────────────────
  {
    id:         'RB-005',
    title:      'Emergency Deployment Rollback Procedure',
    category:   'Deployment',
    systems:    ['API Gateway', 'Web Portal', 'Payment Service', 'Auth Service'],
    version:    '1.2',
    updatedAt:  daysAgoISO(8),
    steps: [
      { id: 'step-1', text: 'Konfirmasi deployment baru menyebabkan masalah: bandingkan error rate sebelum dan sesudah deployment di Datadog.' },
      { id: 'step-2', text: 'Stop deployment jika masih berlangsung: kubectl rollout pause deployment/<service-name> -n production.' },
      { id: 'step-3', text: 'Lihat riwayat deployment: kubectl rollout history deployment/<service-name> -n production.' },
      { id: 'step-4', text: 'Rollback ke revisi sebelumnya: kubectl rollout undo deployment/<service-name> -n production.' },
      { id: 'step-5', text: 'Verifikasi rollback berhasil: kubectl rollout status deployment/<service-name> -n production.' },
      { id: 'step-6', text: 'Konfirmasi health check dan error rate kembali normal. Monitor selama minimal 15 menit.' },
      { id: 'step-7', text: 'Notifikasikan release manager dan tim terkait. Tahan deployment baru sampai root cause ditemukan.' },
    ],
    suggestions: [],
  },

  // ─── RB-006: Network Incident Response ──────────────────────────────────
  {
    id:         'RB-006',
    title:      'Network Incident Response Guide',
    category:   'Network',
    systems:    ['Network'],
    version:    '1.1',
    updatedAt:  daysAgoISO(25),
    steps: [
      { id: 'step-1', text: 'Identifikasi scope jaringan yang terdampak: jalankan ping dan traceroute ke endpoint kritis.' },
      { id: 'step-2', text: 'Cek dashboard monitoring jaringan (PRTG/Grafana) untuk visualisasi packet loss dan latency per segment.' },
      { id: 'step-3', text: 'Jika packet loss >5% pada link utama, aktifkan failover ke backup link: hubungi NOC untuk switch routing.' },
      { id: 'step-4', text: 'Koordinasikan dengan ISP jika masalah berasal dari upstream. Buka tiket ke account manager ISP.' },
      { id: 'step-5', text: 'Monitor link backup untuk memastikan kapasitas mencukupi beban traffic yang dipindahkan.' },
      { id: 'step-6', text: 'Jadwalkan pemeriksaan fisik kabel/perangkat setelah insiden teratasi untuk mencegah recurrence.' },
    ],
    suggestions: [],
  },
];
