/**
 * similarity.js
 * Algoritma perhitungan kemiripan antar insiden.
 * Semua fungsi bersifat murni (pure function).
 *
 * Formula skor:
 *   skor = (jumlah tag sama × 3) + (sistem sama ? 2 : 0) + (kategori sama ? 1 : 0)
 *          + (jumlah kata kunci judul yang sama × 1)
 *
 * Persentase = skor / skor_maks × 100
 * Skor maks teoritis = (tags.length × 3) + 2 + 1 + (jumlah_kata_judul × 1)
 * Hanya tampilkan hasil di atas 25%.
 */

/**
 * Memecah judul menjadi array kata kunci unik (lowercase, tanpa stop word).
 * @param {string} title
 * @returns {string[]}
 */
function extractTitleKeywords(title) {
  const stopWords = new Set([
    'dan','atau','yang','di','ke','dari','dengan','untuk','pada','adalah',
    'tidak','ada','ini','itu','juga','sudah','telah','akan','sedang',
    'the','a','an','in','on','at','of','for','and','or','to','is','was',
  ]);
  return (title ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

/**
 * Menghitung skor kemiripan antara dua insiden.
 * @param {object} base    - Insiden yang dijadikan referensi
 * @param {object} compare - Insiden yang dibandingkan
 * @returns {{ score: number, maxScore: number, percentage: number }}
 */
export function calcSimilarityScore(base, compare) {
  const baseTags  = (base.tags    ?? []).map(t => t.toLowerCase());
  const cmpTags   = (compare.tags ?? []).map(t => t.toLowerCase());
  const baseKw    = extractTitleKeywords(base.title);
  const cmpKw     = extractTitleKeywords(compare.title);

  // Tag yang sama
  const sharedTags = baseTags.filter(t => cmpTags.includes(t));
  // Kata kunci judul yang sama
  const sharedKw   = baseKw.filter(w => cmpKw.includes(w));

  const score =
    sharedTags.length * 3 +
    (base.system   === compare.system   ? 2 : 0) +
    (base.category === compare.category ? 1 : 0) +
    sharedKw.length;

  // Skor maksimum teoritis berdasarkan insiden referensi
  const maxScore = baseTags.length * 3 + 2 + 1 + baseKw.length;
  const safeMax  = maxScore > 0 ? maxScore : 1;
  const percentage = Math.round((score / safeMax) * 100);

  return { score, maxScore: safeMax, percentage };
}

/**
 * Mencari insiden yang mirip dengan insiden tertentu dari daftar.
 * @param {object}   base       - Insiden referensi (harus memiliki id, title, system, category, tags)
 * @param {object[]} allIncidents - Semua insiden
 * @param {number}   [limit=3]  - Jumlah maksimal hasil
 * @param {number}   [threshold=25] - Persentase minimum untuk ditampilkan
 * @returns {Array<{ incident: object, percentage: number }>}
 */
export function findSimilarIncidents(base, allIncidents, limit = 3, threshold = 25) {
  return allIncidents
    .filter(inc => inc.id !== base.id) // abaikan diri sendiri
    .map(inc => ({
      incident:   inc,
      percentage: calcSimilarityScore(base, inc).percentage,
    }))
    .filter(item => item.percentage >= threshold)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, limit);
}
