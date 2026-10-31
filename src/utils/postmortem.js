/**
 * postmortem.js
 * Fungsi pembantu untuk menghasilkan konten post-mortem secara otomatis
 * dari data insiden dan meng-export ke format Markdown.
 * Semua fungsi bersifat murni (pure function).
 */

import { formatDateTime, calcDurationMinutes, formatDuration } from './date.js';

/**
 * Membangkitkan ringkasan post-mortem otomatis dari data insiden.
 * @param {object} incident - Data insiden lengkap
 * @returns {string} Teks ringkasan
 */
export function generateSummary(incident) {
  const duration = formatDuration(calcDurationMinutes(incident.createdAt, incident.resolvedAt));
  return (
    `Insiden ${incident.id} (${incident.severity}) pada sistem ${incident.system} ` +
    `menyebabkan ${incident.impact ?? 'gangguan layanan'} selama ${duration}. ` +
    `Dilaporkan oleh ${incident.reporter} pada ${formatDateTime(incident.createdAt)}.`
  );
}

/**
 * Membangkitkan timeline post-mortem dari entri timeline insiden.
 * @param {object[]} timelineEntries - Array entri timeline insiden
 * @returns {object[]} Array entri untuk post-mortem timeline
 */
export function buildPMTimeline(timelineEntries) {
  return timelineEntries.map((entry, idx) => ({
    id:   `pm-tl-${idx}`,
    time: entry.time,
    type: entry.type,
    note: entry.note,
  }));
}

/**
 * Mengekspor post-mortem ke format Markdown.
 * @param {object} postMortem  - Data post-mortem lengkap
 * @param {object} incident    - Data insiden terkait
 * @returns {string} Konten Markdown
 */
export function exportToMarkdown(postMortem, incident) {
  const duration = formatDuration(
    calcDurationMinutes(incident?.createdAt, incident?.resolvedAt),
  );

  const timelineRows = (postMortem.timeline ?? [])
    .map(t => `| ${formatDateTime(t.time)} | ${t.type} | ${t.note} |`)
    .join('\n');

  const actionRows = (postMortem.actionItems ?? [])
    .map(a => `| ${a.text} | ${a.owner} | ${a.dueDate ?? '-'} | ${a.done ? '✅' : '⏳'} |`)
    .join('\n');

  return `# Post-Mortem: ${incident?.title ?? postMortem.id}

## Ringkasan

| Field              | Value                                      |
|--------------------|--------------------------------------------|
| **ID Insiden**     | ${incident?.id ?? '-'}                     |
| **Severity**       | ${incident?.severity ?? '-'}               |
| **Sistem**         | ${incident?.system ?? '-'}                 |
| **Durasi**         | ${duration}                                |
| **Waktu Deteksi**  | ${formatDateTime(incident?.createdAt)}     |
| **Waktu Resolusi** | ${formatDateTime(incident?.resolvedAt)}    |
| **Pelapor**        | ${incident?.reporter ?? '-'}               |

${postMortem.summary}

## Kronologi

| Waktu | Tipe | Keterangan |
|-------|------|------------|
${timelineRows}

## Analisis

### Akar Masalah
${postMortem.rootCause ?? '_Belum diisi_'}

### Dampak
${postMortem.impact ?? '_Belum diisi_'}

### Yang Berjalan Baik
${postMortem.wentWell ?? '_Belum diisi_'}

### Yang Perlu Diperbaiki
${postMortem.needsImprovement ?? '_Belum diisi_'}

## Action Items

| Deskripsi | Penanggung Jawab | Tenggat | Status |
|-----------|-----------------|---------|--------|
${actionRows}

---
_Dokumen ini dibuat otomatis oleh ResolveIQ pada ${formatDateTime(new Date().toISOString())}_
`;
}
