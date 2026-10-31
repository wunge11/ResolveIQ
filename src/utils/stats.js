/**
 * stats.js
 * Fungsi statistik dan kalkulasi KPI untuk halaman Dashboard.
 * Semua fungsi bersifat murni (pure function).
 */

import { calcDurationMinutes, lastNDays } from './date.js';
import { severityRank } from './severity.js';

/** Status yang dianggap "aktif" */
const ACTIVE_STATUSES = ['Open', 'Investigating', 'Mitigated'];

/**
 * Menghitung jumlah insiden aktif (Open + Investigating + Mitigated).
 * @param {object[]} incidents
 * @returns {number}
 */
export function countActiveIncidents(incidents) {
  return incidents.filter(i => ACTIVE_STATUSES.includes(i.status)).length;
}

/**
 * Menghitung rata-rata MTTR (Mean Time To Resolve) dari insiden Resolved/Closed.
 * @param {object[]} incidents
 * @returns {number} Rata-rata dalam menit
 */
export function calcAvgMTTR(incidents) {
  const resolved = incidents.filter(
    i => (i.status === 'Resolved' || i.status === 'Closed') && i.resolvedAt,
  );
  if (resolved.length === 0) return 0;
  const total = resolved.reduce(
    (sum, i) => sum + calcDurationMinutes(i.createdAt, i.resolvedAt),
    0,
  );
  return Math.floor(total / resolved.length);
}

/**
 * Menghitung jumlah insiden kritis aktif (SEV1 + SEV2 yang masih aktif).
 * @param {object[]} incidents
 * @returns {number}
 */
export function countCriticalActive(incidents) {
  return incidents.filter(
    i => ACTIVE_STATUSES.includes(i.status) && (i.severity === 'SEV1' || i.severity === 'SEV2'),
  ).length;
}

/**
 * Menghitung persentase kelengkapan post-mortem untuk insiden SEV1/SEV2.
 * @param {object[]} incidents
 * @returns {number} Persentase (0-100)
 */
export function calcPostMortemCompleteness(incidents) {
  const critical = incidents.filter(
    i => (i.severity === 'SEV1' || i.severity === 'SEV2') &&
         (i.status === 'Resolved' || i.status === 'Closed'),
  );
  if (critical.length === 0) return 100;
  const withPM = critical.filter(i => i.postMortemId).length;
  return Math.round((withPM / critical.length) * 100);
}

/**
 * Menghitung jumlah insiden per hari selama N hari terakhir, dipecah per severity.
 * @param {object[]} incidents
 * @param {number} days - 7 atau 14
 * @returns {{ dates: string[], sev1: number[], sev2: number[], sev3: number[], sev4: number[] }}
 */
export function calcIncidentTrend(incidents, days = 14) {
  const dates = lastNDays(days);
  const result = {
    dates,
    sev1: new Array(days).fill(0),
    sev2: new Array(days).fill(0),
    sev3: new Array(days).fill(0),
    sev4: new Array(days).fill(0),
  };

  incidents.forEach(inc => {
    const day = new Date(inc.createdAt).toISOString().slice(0, 10);
    const idx = dates.indexOf(day);
    if (idx === -1) return;
    const key = inc.severity?.toLowerCase().replace('-', '');
    if (key in result) result[key][idx]++;
  });

  return result;
}

/**
 * Menghitung distribusi insiden per kategori.
 * @param {object[]} incidents
 * @returns {Array<{ category: string, count: number, percentage: number }>}
 */
export function calcCategoryBreakdown(incidents) {
  const counts = {};
  incidents.forEach(inc => {
    counts[inc.category] = (counts[inc.category] ?? 0) + 1;
  });
  const total = incidents.length || 1;
  return Object.entries(counts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Menentukan status kesehatan sistem berdasarkan insiden aktif.
 * @param {string}   system    - Nama sistem
 * @param {object[]} incidents - Semua insiden
 * @returns {{ status: 'Operational'|'Degraded'|'Down', activeCount: number, last30Count: number }}
 */
export function calcSystemHealth(system, incidents) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const relevant = incidents.filter(i => i.system === system);
  const active   = relevant.filter(i => ACTIVE_STATUSES.includes(i.status));
  const last30   = relevant.filter(i => new Date(i.createdAt).getTime() > thirtyDaysAgo);

  const hasCritical = active.some(i => i.severity === 'SEV1' || i.severity === 'SEV2');
  const hasDegraded = active.some(i => i.severity === 'SEV3' || i.severity === 'SEV4');

  let status = 'Operational';
  if (hasCritical) status = 'Down';
  else if (hasDegraded) status = 'Degraded';

  return {
    status,
    activeCount: active.length,
    last30Count: last30.length,
  };
}

/**
 * Menghitung tren perbandingan dengan periode sebelumnya.
 * @param {number} current  - Nilai periode ini
 * @param {number} previous - Nilai periode sebelumnya
 * @returns {{ direction: 'up'|'down'|'same', diff: number, pct: number }}
 */
export function calcTrend(current, previous) {
  if (previous === 0) return { direction: 'same', diff: 0, pct: 0 };
  const diff = current - previous;
  const pct  = Math.round(Math.abs((diff / previous) * 100));
  return {
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
    diff: Math.abs(diff),
    pct,
  };
}

/**
 * Mengambil N insiden terbaru.
 * @param {object[]} incidents
 * @param {number}   [n=6]
 * @returns {object[]}
 */
export function getRecentIncidents(incidents, n = 6) {
  return [...incidents]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, n);
}

/**
 * Menghitung progress action item keseluruhan dari semua post-mortem.
 * @param {object[]} postMortems
 * @returns {{ done: number, total: number, percentage: number }}
 */
export function calcActionItemProgress(postMortems) {
  let done = 0, total = 0;
  postMortems.forEach(pm => {
    (pm.actionItems ?? []).forEach(item => {
      total++;
      if (item.done) done++;
    });
  });
  return { done, total, percentage: total ? Math.round((done / total) * 100) : 0 };
}

/**
 * Mengurutkan insiden berdasarkan opsi sort.
 * @param {object[]} incidents
 * @param {string}   sortBy - 'newest' | 'oldest' | 'severity'
 * @returns {object[]}
 */
export function sortIncidents(incidents, sortBy) {
  const arr = [...incidents];
  if (sortBy === 'newest') return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sortBy === 'oldest') return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sortBy === 'severity') return arr.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
  return arr;
}
