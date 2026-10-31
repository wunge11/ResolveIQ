/**
 * severity.js
 * Logika rekomendasi severity berdasarkan matriks aturan bisnis ResolveIQ.
 * Semua fungsi bersifat murni (pure function).
 */

/**
 * Matriks aturan severity berdasarkan 3 dimensi:
 * - userScope    : 'all' | 'major' | 'minor' | 'none'
 * - serviceLevel : 'down' | 'degraded' | 'minor'
 * - workaround   : 'none' | 'limited' | 'available'
 *
 * @param {object} answers
 * @param {string} answers.userScope     - Cakupan pengguna terdampak
 * @param {string} answers.serviceLevel  - Tingkat gangguan layanan
 * @param {string} answers.workaround    - Ketersediaan workaround
 * @returns {{ severity: string, reason: string }}
 */
export function recommendSeverity({ userScope, serviceLevel, workaround }) {
  // SEV1: layanan utama mati total ATAU risiko data; >50% pengguna; tanpa workaround
  if (serviceLevel === 'down' && userScope === 'all' && workaround === 'none') {
    return {
      severity: 'SEV1',
      reason:   'Layanan utama mati total, lebih dari 50% pengguna terdampak, dan tidak ada workaround.',
    };
  }
  if (serviceLevel === 'down' && userScope === 'major') {
    return {
      severity: 'SEV1',
      reason:   'Layanan utama mati total dengan dampak pengguna yang luas.',
    };
  }

  // SEV2: fungsi utama terdegradasi; 10-50% pengguna; workaround terbatas
  if (serviceLevel === 'degraded' && (userScope === 'all' || userScope === 'major') && workaround !== 'available') {
    return {
      severity: 'SEV2',
      reason:   'Fungsi utama terdegradasi signifikan dengan workaround terbatas.',
    };
  }
  if (serviceLevel === 'down' && workaround === 'limited') {
    return {
      severity: 'SEV2',
      reason:   'Layanan mati namun ada workaround terbatas.',
    };
  }

  // SEV3: fungsi minor terganggu; <10% pengguna; ada workaround
  if (serviceLevel === 'minor' || (serviceLevel === 'degraded' && workaround === 'available')) {
    return {
      severity: 'SEV3',
      reason:   'Fungsi minor terganggu atau ada workaround yang tersedia.',
    };
  }
  if (userScope === 'minor' && serviceLevel === 'degraded') {
    return {
      severity: 'SEV3',
      reason:   'Hanya sedikit pengguna terdampak dengan degradasi terbatas.',
    };
  }

  // SEV4: gangguan kosmetik atau dampak minimal
  if (userScope === 'none' || serviceLevel === 'cosmetic') {
    return {
      severity: 'SEV4',
      reason:   'Dampak sangat minimal, bersifat kosmetik atau informasional.',
    };
  }

  // Default fallback
  return {
    severity: 'SEV3',
    reason:   'Berdasarkan informasi yang tersedia, estimasi severity sedang.',
  };
}

/**
 * Mengembalikan kelas warna Tailwind untuk badge severity.
 * @param {string} severity - 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4'
 * @returns {string} Kelas Tailwind
 */
export function getSeverityColor(severity) {
  const map = {
    SEV1: 'bg-red-100 text-red-700 border-red-300',
    SEV2: 'bg-orange-100 text-orange-700 border-orange-300',
    SEV3: 'bg-amber-100 text-amber-700 border-amber-300',
    SEV4: 'bg-slate-100 text-slate-600 border-slate-300',
  };
  return map[severity] ?? 'bg-slate-100 text-slate-600 border-slate-300';
}

/**
 * Mengembalikan kelas warna Tailwind untuk badge status.
 * @param {string} status - 'Open' | 'Investigating' | 'Mitigated' | 'Resolved' | 'Closed'
 * @returns {string} Kelas Tailwind
 */
export function getStatusColor(status) {
  const map = {
    Open:          'bg-red-100 text-red-700 border-red-200',
    Investigating: 'bg-blue-100 text-blue-700 border-blue-200',
    Mitigated:     'bg-yellow-100 text-yellow-700 border-yellow-200',
    Resolved:      'bg-emerald-100 text-emerald-700 border-emerald-200',
    Closed:        'bg-slate-100 text-slate-600 border-slate-200',
  };
  return map[status] ?? 'bg-slate-100 text-slate-600 border-slate-200';
}

/**
 * Mengembalikan tingkat numerik severity (lebih kecil = lebih kritis).
 * @param {string} severity
 * @returns {number}
 */
export function severityRank(severity) {
  const map = { SEV1: 1, SEV2: 2, SEV3: 3, SEV4: 4 };
  return map[severity] ?? 99;
}
