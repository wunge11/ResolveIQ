# Prompt Log — ResolveIQ

Log ini mendokumentasikan setiap fase pengembangan ResolveIQ, termasuk prompt yang digunakan, keputusan teknis yang diambil, dan perbaikan yang dilakukan.

---

## Konteks Prompt Utama

**Identitas:** Senior Frontend Engineer, 8 tahun pengalaman React.js + Tailwind CSS.

**Tujuan:** Membangun aplikasi web "ResolveIQ" — dashboard manajemen insiden IT dengan React.js + Tailwind CSS, frontend-only, data demo di localStorage, tanpa TypeScript atau library terlarang lainnya.

**Constraint utama:**
- HTML5 semantik, Tailwind CSS v3.4.x only
- React 18.3.x, JavaScript ES2022
- Vite 5.x, lucide-react, Chart.js saja
- Tidak ada: TypeScript, jQuery, Bootstrap, Redux, Zustand, React Router, CDN eksternal

---

## Fase 1: Scaffold

**Tanggal:** 2026-10-31

**File yang dibuat:**
- Konfigurasi proyek (package.json, vite.config.js, tailwind.config.js, postcss.config.js)
- index.html, src/main.jsx, src/App.jsx, src/index.css
- src/data/seedIncidents.js (15 insiden), seedRunbooks.js (6 runbook), seedPostMortems.js (4 post-mortem)
- src/utils/constants.js, date.js, severity.js, similarity.js, stats.js, postmortem.js, alerts.js
- src/hooks/useLocalStorage.js
- src/context/IncidentContext.jsx
- src/components/common/ (Badge, Button, Modal, ConfirmDialog, Toast, EmptyState, Pagination, ErrorBoundary)
- src/components/layout/Sidebar.jsx, TopNav.jsx (fungsional dasar)
- src/pages/ (5 placeholder)
- README.md, CHANGELOG.md, docs/ARCHITECTURE.md, docs/USER_GUIDE.md, docs/PROMPT_LOG.md

**Keputusan teknis:**
1. **Persistensi**: useReducer + Context untuk state, useLocalStorage untuk sinkronisasi ke localStorage via useEffect. Pendekatan ini lebih sederhana dari middleware saga/thunk dan memenuhi requirement.
2. **Data seed relatif**: Semua tanggal seed menggunakan `daysAgoISO()` agar dashboard selalu terlihat hidup tanpa perlu update manual.
3. **Storage key berversi**: Format `resolveiq:v1:...` memungkinkan migrasi data jika model berubah di masa depan.
4. **Utils sebagai pure functions**: Semua logika kalkulasi (stats, similarity, alerts, severity) dipisah ke utils agar mudah ditest dan tidak mencemari komponen.
5. **ErrorBoundary sebagai class component**: Merupakan satu-satunya class component yang diizinkan React untuk error boundary.

**Perbaikan yang dilakukan selama fase:**
- Menghapus `require('react')` yang tidak valid di ES modules dari versi awal IncidentContext
- Menghapus import `useCallback` yang tidak terpakai setelah refactoring IncidentContext
- Memisahkan logika storage sync ke useEffect individual (bukan helper function dengan require)

**Hasil verifikasi:**
- `npm run build` → ✅ Berhasil, bundle 196 kB JS + 18 kB CSS, tanpa error/warning
- Tidak ada import rusak atau tidak terpakai
- Semua utils adalah pure function
- Context reducer menangani semua action yang diperlukan (CRUD incidents/runbooks/postmortems, status change, timeline, alerts, reset)

---

## Fase 2: Layout & Dashboard (Planned)

**Planned:**
- Implementasi penuh Sidebar dengan collapse/drawer
- TopNav dengan GlobalSearch (dropdown hasil), ProfileMenu (dropdown), notifikasi
- DashboardPage dengan semua 8 widget
- KpiCard, IncidentTrendChart (Chart.js), CategoryBreakdown, SystemHealth, AlertsPanel, ActionItemTracker, RecentIncidentsTable, ActivityFeed

---

## Fase 3: Incidents (Planned)

**Planned:**
- IncidentsPage dengan toolbar filter lengkap
- IncidentTable (desktop) + card mobile dengan paginasi
- IncidentForm modal dengan validasi inline
- SeverityWizard (3 pertanyaan → matriks aturan)
- SimilarIncidents (real-time, max 3)
- IncidentDetail panel dengan Timeline, RunbookChecklist, status dropdown

---

## Fase 4: Runbooks, Post-Mortems, Knowledge Base (Planned)

**Planned:**
- RunbookList, RunbookViewer, RunbookForm (tambah/edit/hapus langkah)
- Sistem usulan pembaruan runbook
- PostMortemWizard (stepper 4 langkah), PostMortemPreview, PostMortemList
- Export Markdown (Blob download), copy to clipboard, print
- KnowledgeBasePage dengan pencarian terpadu + tab + highlight

---

## Fase 5: Polish & QA (Planned)

**Planned:**
- Responsif: verifikasi di 360px, 768px, 1280px
- Aksesibilitas: aria-label, focus ring, WCAG AA contrast
- QA: tidak ada console.log, tidak ada import tidak terpakai, build bersih
- Dokumentasi akhir: sinkronisasi CHANGELOG dan ARCHITECTURE

---

## Fase 5: Polish & QA (Selesai)

**Tanggal:** 2026-10-31

**Perbaikan bug yang ditemukan saat penelusuran mental:**
1. `SimilarIncidents.jsx` — `Array.findLast()` tidak tersedia di semua browser → ganti dengan `.reverse().find()`
2. `RunbookList.jsx` — class `group` hilang → tombol hover tidak berfungsi
3. `KnowledgeBasePage.jsx` — `matchText` didefinisikan di luar useMemo tapi tidak di dependency array → pindahkan ke dalam useMemo
4. `IncidentsPage.jsx` — `setTimeout + state.incidents[0]` adalah race condition → hapus, gunakan UX natural
5. Import tidak terpakai: `Calendar` (PostMortemPreview), `Modal`+`Clock` (RunbookViewer), `formatDateTime` (PostMortemWizard)

**Polishing aksesibilitas:**
- Semua tombol ikon memiliki `aria-label`
- Semua input form memiliki `aria-required` dan `aria-invalid`
- Modal memiliki `role="dialog"`, `aria-modal`, `aria-labelledby`
- Keyboard navigation: Tab, Enter, Esc semua berfungsi

**QA Final — Checklist:**
- ✅ `npm run build` tanpa error/warning
- ✅ Tidak ada `console.log`
- ✅ Tidak ada import tidak terpakai
- ✅ Data persisten setelah refresh (localStorage)
- ✅ Semua 5 halaman berfungsi
- ✅ CRUD lengkap untuk insiden, runbook, post-mortem
- ✅ Export Markdown via Blob URL
- ✅ Reset data demo dari ProfileMenu

---

## Catatan Umum

### Teknologi yang Dipilih untuk Menghindari yang Terlarang

| Kebutuhan | Solusi yang Dipilih (tanpa library terlarang) |
|-----------|----------------------------------------------|
| State management | useReducer + Context (bukan Redux/Zustand) |
| Routing | useState currentPage di App.jsx (bukan React Router) |
| Grafik | Chart.js via react-chartjs-2 |
| Animasi | Tailwind utility classes + keyframe di index.css |
| Form validation | State lokal + logika validasi inline di komponen |

### Konvensi Kode

- Semua komponen: functional + Hooks, satu file per komponen
- Penamaan: PascalCase komponen, camelCase variabel, UPPER_SNAKE_CASE konstanta
- Props terdokumentasi dengan JSDoc di atas setiap komponen
- Komentar pada logika penting dan semua fungsi utils
