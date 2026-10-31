/**
 * date.js
 * Utilitas tanggal dan waktu untuk ResolveIQ.
 * Semua fungsi bersifat murni (pure function) tanpa efek samping.
 */

/**
 * Membuat timestamp relatif terhadap waktu sekarang.
 * @param {number} daysAgo - Berapa hari yang lalu
 * @param {number} [hoursAgo=0] - Berapa jam yang lalu (tambahan)
 * @param {number} [minutesAgo=0] - Berapa menit yang lalu (tambahan)
 * @returns {string} ISO string timestamp
 */
export function daysAgoISO(daysAgo, hoursAgo = 0, minutesAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
}

/**
 * Memformat durasi dalam menit menjadi string yang mudah dibaca.
 * @param {number} minutes - Durasi dalam menit
 * @returns {string} Contoh: "2j 15m" atau "3h 2j" jika > 24 jam
 */
export function formatDuration(minutes) {
  if (!minutes || minutes < 0) return '-';
  const totalMinutes = Math.floor(minutes);
  if (totalMinutes < 60) return `${totalMinutes}m`;

  const hours = Math.floor(totalMinutes / 60);
  const mins  = totalMinutes % 60;

  if (hours < 24) {
    return mins > 0 ? `${hours}j ${mins}m` : `${hours}j`;
  }

  const days  = Math.floor(hours / 24);
  const remH  = hours % 24;
  return remH > 0 ? `${days}h ${remH}j` : `${days}h`;
}

/**
 * Menghitung durasi insiden dalam menit dari createdAt sampai resolvedAt.
 * @param {string} createdAt  - ISO string waktu dibuat
 * @param {string} [resolvedAt] - ISO string waktu diselesaikan (opsional)
 * @returns {number} Durasi dalam menit, atau durasi berjalan jika belum resolved
 */
export function calcDurationMinutes(createdAt, resolvedAt) {
  const start = new Date(createdAt).getTime();
  const end   = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  return Math.floor((end - start) / 60000);
}

/**
 * Memformat ISO string menjadi string tanggal/waktu lokal.
 * @param {string} isoString - ISO timestamp
 * @param {boolean} [includeTime=true] - Apakah menyertakan waktu
 * @returns {string} Contoh: "31 Okt 2024, 14:30"
 */
export function formatDateTime(isoString, includeTime = true) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  const dateStr = d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  if (!includeTime) return dateStr;
  const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr}, ${timeStr}`;
}

/**
 * Mengembalikan waktu relatif ("5 menit lalu", "2 jam lalu", dst.).
 * @param {string} isoString - ISO timestamp
 * @returns {string} Waktu relatif
 */
export function timeAgo(isoString) {
  if (!isoString) return '-';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return 'Baru saja';
  if (mins < 60)  return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days  = Math.floor(hours / 24);
  if (days < 30)  return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  return `${months} bulan lalu`;
}

/**
 * Memeriksa apakah sebuah tanggal sudah melewati deadline.
 * @param {string} dueDateISO - ISO string deadline
 * @returns {boolean}
 */
export function isOverdue(dueDateISO) {
  if (!dueDateISO) return false;
  return new Date(dueDateISO).getTime() < Date.now();
}

/**
 * Mengembalikan array tanggal ISO selama N hari terakhir (dari hari ini ke belakang).
 * @param {number} days - Jumlah hari
 * @returns {string[]} Array ISO string (hanya tanggal, tanpa waktu)
 */
export function lastNDays(days) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}
