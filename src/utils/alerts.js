/**
 * alerts.js
 * Logika pembangkitan alert otomatis untuk panel Alerts di Dashboard.
 * Semua fungsi bersifat murni (pure function).
 */

import { calcDurationMinutes } from './date.js';
import { isOverdue } from './date.js';

const ACTIVE_STATUSES = ['Open', 'Investigating', 'Mitigated'];

/**
 * Membangkitkan daftar alert otomatis berdasarkan kondisi insiden dan post-mortem.
 * @param {object[]} incidents    - Array semua insiden
 * @param {object[]} postMortems  - Array semua post-mortem
 * @param {string[]} dismissedIds - ID alert yang sudah di-dismiss
 * @returns {object[]} Array alert dengan { id, type, message, time, refId, severity }
 */
export function generateAlerts(incidents, postMortems, dismissedIds = []) {
  const alerts = [];

  // (i) Insiden SEV1 yang masih aktif
  incidents
    .filter(i => i.severity === 'SEV1' && ACTIVE_STATUSES.includes(i.status))
    .forEach(i => {
      alerts.push({
        id:       `sev1-active-${i.id}`,
        type:     'critical',
        message:  `Insiden kritis SEV1 masih aktif: ${i.title}`,
        time:     i.createdAt,
        refId:    i.id,
        refType:  'incident',
        severity: 'SEV1',
      });
    });

  // (ii) Insiden aktif lebih dari 24 jam
  incidents
    .filter(i => {
      if (!ACTIVE_STATUSES.includes(i.status)) return false;
      return calcDurationMinutes(i.createdAt) > 24 * 60;
    })
    .forEach(i => {
      const alertId = `long-running-${i.id}`;
      // Hindari duplikasi dengan alert SEV1
      if (!alerts.find(a => a.refId === i.id && a.type === 'critical')) {
        alerts.push({
          id:      alertId,
          type:    'warning',
          message: `Insiden aktif lebih dari 24 jam: ${i.title}`,
          time:    i.createdAt,
          refId:   i.id,
          refType: 'incident',
          severity: i.severity,
        });
      }
    });

  // (iii) Insiden Resolved yang belum punya post-mortem (hanya SEV1/SEV2)
  incidents
    .filter(i =>
      (i.severity === 'SEV1' || i.severity === 'SEV2') &&
      (i.status === 'Resolved' || i.status === 'Closed') &&
      !i.postMortemId,
    )
    .forEach(i => {
      alerts.push({
        id:      `no-pm-${i.id}`,
        type:    'info',
        message: `Post-mortem belum dibuat untuk ${i.severity} ${i.title}`,
        time:    i.resolvedAt ?? i.createdAt,
        refId:   i.id,
        refType: 'incident',
        severity: i.severity,
      });
    });

  // (iv) Action item yang melewati tenggat
  postMortems.forEach(pm => {
    (pm.actionItems ?? []).forEach(item => {
      if (!item.done && isOverdue(item.dueDate)) {
        alerts.push({
          id:      `overdue-${pm.id}-${item.id}`,
          type:    'warning',
          message: `Action item terlambat: "${item.text}" (${pm.id})`,
          time:    item.dueDate,
          refId:   pm.id,
          refType: 'postmortem',
          severity: null,
        });
      }
    });
  });

  // Filter yang sudah di-dismiss
  return alerts
    .filter(a => !dismissedIds.includes(a.id))
    .sort((a, b) => {
      // Urutkan: critical > warning > info
      const order = { critical: 0, warning: 1, info: 2 };
      return (order[a.type] ?? 3) - (order[b.type] ?? 3);
    });
}
