# Changelog — ResolveIQ

Semua perubahan signifikan pada proyek ini didokumentasikan di sini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

## [1.0.0] — Fase 5: Polish, QA, dan Dokumentasi Final

### Fixed
- `SimilarIncidents.jsx` — Ganti `Array.findLast()` (ES2023) dengan `.reverse().find()` untuk kompatibilitas browser lama
- `RunbookList.jsx` — Tambahkan class `group` yang hilang pada container row agar hover state berfungsi
- `KnowledgeBasePage.jsx` — Pindahkan `matchText` ke dalam setiap `useMemo` untuk menghindari dependency array yang salah
- `IncidentsPage.jsx` — Hapus `setTimeout` race condition pada `onCreated` callback
- `PostMortemPreview.jsx` — Hapus import `Calendar` yang tidak terpakai
- `RunbookViewer.jsx` — Hapus import `Modal` dan `Clock` yang tidak terpakai
- `PostMortemWizard.jsx` — Hapus import `formatDateTime` yang tidak terpakai

### Added / Improved
- `index.css` — Tambahkan `overflow-x: hidden` pada body, line-clamp polyfill, print media query `overflow: visible`
- `vite.config.js` — `manualChunks` sudah ditambahkan di Fase 4 (vendor split)
- Semua aksesibilitas: `aria-label`, `aria-current`, `aria-pressed`, `aria-invalid`, `role`, keyboard navigation terpenuhi
- Responsive: grid berubah di sm/md/lg/xl; tabel → card di bawah md; tidak ada scroll horizontal di 360px
- Import cleanup menyeluruh di semua komponen

### Verified (QA Final)
- `npm run build` → ✅ **Zero errors, zero warnings** — 4 chunk, max 171 kB JS
- Tidak ada `console.log` tersisa di seluruh codebase
- Tidak ada import tidak terpakai
- Tidak ada variabel tidak terpakai yang diidentifikasi
- Build bersih dengan Vite 5.4.21
- Semua 5 halaman berfungsi: Dashboard, Incidents, Runbooks, Post-Mortems, Knowledge Base
- CRUD insiden, runbook, post-mortem → data persist setelah refresh
- Filter, search, paginasi, ubah status, timeline, runbook checklist, export Markdown ✅
- Reset data demo dari ProfileMenu ✅

---

### Planned
- (Tidak ada — semua fitur Fase 1-5 selesai)

---

## [0.4.0] — Fase 4: Runbooks, Post-Mortems, Knowledge Base

### Added
- **Runbooks:**
  - `RunbookList.jsx` — List card dengan search + filter kategori, aksi Tambah/Edit/Hapus
  - `RunbookViewer.jsx` — Viewer langkah bernomor + panel usulan pembaruan (terima/tolak)
  - `RunbookForm.jsx` — Modal form dengan langkah dinamis (tambah, hapus, naik, turun), sistem multi-select
  - `RunbooksPage.jsx` — Layout split list + viewer
- **Post-Mortems:**
  - `PostMortemWizard.jsx` — Stepper 4 langkah: Ringkasan (auto-fill), Kronologi, Analisis, Action Items
  - `PostMortemPreview.jsx` — Preview terformat + export Markdown (Blob download), salin clipboard, cetak
  - `PostMortemList.jsx` — Grid kartu dengan kelengkapan (x/4), progress action item, overdue warning
  - `PostMortemsPage.jsx` — Mode LIST/WIZARD/PREVIEW dengan navigasi
- **Knowledge Base:**
  - `KnowledgeBasePage.jsx` — Search box besar, tab (Semua/Insiden/Runbook/PM), highlight `<mark>`, filter kategori
- **vite.config.js** — manualChunks: vendor-react, vendor-charts, vendor-icons (bundle split)

### Verified
- `npm run build` → ✅ 4 chunk (max 171 kB), tanpa error/warning

---

## [0.3.0] — Fase 3: Halaman Incidents

### Added
- `IncidentFilters.jsx` — Toolbar search + 5 filter dropdown (Severity, Status, Kategori, Sistem, Sort) + tombol reset
- `IncidentTable.jsx` — Tabel desktop dengan 8 kolom + card list mobile, paginasi 10 item/halaman
- `SeverityWizard.jsx` — Wizard 3 pertanyaan dengan progress dots, rekomendasi berdasarkan matriks aturan
- `SimilarIncidents.jsx` — Panel real-time max 3 insiden serupa dengan persentase kemiripan dan solusi
- `IncidentForm.jsx` — Modal form laporkan insiden: validasi inline per field, SeverityWizard terintegrasi, SimilarIncidents di samping
- `Timeline.jsx` — Komponen kronologi dengan entri berwarna per tipe, form tambah entri (tipe + waktu + catatan)
- `RunbookChecklist.jsx` — Checklist langkah runbook yang cocok otomatis, progress bar, centang = tambah timeline otomatis
- `IncidentDetail.jsx` — Panel detail lengkap: header, dropdown ubah status, info grid, Timeline, RunbookChecklist, SimilarIncidents, tombol PM/Edit/Hapus
- `IncidentsPage.jsx` — Implementasi penuh: split view (tabel + detail) di desktop, filter+tabel di mobile

### Verified
- `npm run build` → ✅ 453 kB JS + 30 kB CSS, tanpa error/warning

---

## [0.2.0] — Fase 2: Layout & Dashboard

### Added
- **Layout penuh:**
  - `Sidebar.jsx` — collapse/expand desktop, drawer mobile dengan overlay dan tombol X
  - `TopNav.jsx` — hamburger, judul halaman, GlobalSearch, tombol laporkan, badge notifikasi alert, ProfileMenu
  - `GlobalSearch.jsx` — pencarian ID/judul/tag real-time dengan dropdown, keyboard navigation (Arrow/Enter/Esc), highlight hasil
  - `ProfileMenu.jsx` — dropdown profil (Rina Aditya / IT Manager), reset data demo dengan konfirmasi, logout dengan toast
- **Dashboard widgets (8 widget):**
  - `KpiCard.jsx` — 4 kartu KPI dengan ikon, nilai, indikator tren (naik/turun/tetap)
  - `IncidentTrendChart.jsx` — Bar chart stacked Chart.js, toggle 7/14 hari, tooltip
  - `CategoryBreakdown.jsx` — Doughnut chart Chart.js + legenda dengan persentase
  - `SystemHealth.jsx` — Grid 6 kartu per sistem, status warna (Operational/Degraded/Down), dot animasi
  - `AlertsPanel.jsx` — Daftar alert otomatis (SEV1 aktif, >24 jam, no PM, overdue action item), dismiss per alert
  - `ActionItemTracker.jsx` — Progress bar global + daftar per PM, centang langsung
  - `RecentIncidentsTable.jsx` — Tabel 6 insiden terbaru (desktop) + card (mobile), klik baris buka detail
  - `ActivityFeed.jsx` — Feed 8 aktivitas terbaru dengan ikon warna per tipe dan waktu relatif
- **DashboardPage.jsx** — Implementasi penuh merangkai semua widget dengan grid responsif

### Verified
- `npm run build` → ✅ 409 kB JS + 27 kB CSS, tanpa error/warning
- Dev server berjalan di `http://localhost:5173` tanpa runtime error

---

## [0.1.0] — Fase 1: Scaffold

### Added
- Konfigurasi proyek: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`
- Token warna custom di `tailwind.config.js` (brand, severity, status palette)
- Entry point `index.html` dan `src/main.jsx`
- Root komponen `src/App.jsx` dengan navigasi halaman berbasis state
- CSS global `src/index.css` dengan direktif Tailwind dan style tambahan
- **Data seed:**
  - `src/data/seedIncidents.js` — 15 insiden realistis (campuran severity, status, kategori, sistem, tersebar 30 hari)
  - `src/data/seedRunbooks.js` — 6 runbook untuk semua kategori
  - `src/data/seedPostMortems.js` — 4 post-mortem lengkap dengan action item
- **Utils (pure functions):**
  - `src/utils/constants.js` — Konstanta global
  - `src/utils/date.js` — Utilitas tanggal, durasi, format waktu relatif
  - `src/utils/severity.js` — Rekomendasi severity & kelas warna
  - `src/utils/similarity.js` — Algoritma skor kemiripan insiden
  - `src/utils/stats.js` — Kalkulasi KPI, tren, breakdown, system health
  - `src/utils/postmortem.js` — Generator konten & export Markdown
  - `src/utils/alerts.js` — Generator alert otomatis
- **Hooks:** `src/hooks/useLocalStorage.js` — localStorage dengan try/catch + fallback seed
- **Context:** `src/context/IncidentContext.jsx` — useReducer + Context untuk state global, persist ke localStorage
- **Komponen Common:**
  - `Badge` — Label pill dengan ukuran dan warna kustom
  - `Button` — Tombol multi-variant (primary, secondary, danger, ghost, outline) + loading state
  - `Modal` — Dialog overlay aksesibel (Esc, fokus, body scroll lock)
  - `ConfirmDialog` — Dialog konfirmasi untuk aksi destruktif
  - `Toast` + `ToastContainer` — Sistem notifikasi sementara
  - `EmptyState` — Tampilan state kosong dengan ikon, teks, dan aksi
  - `Pagination` — Kontrol paginasi dengan ellipsis
  - `ErrorBoundary` — Error boundary React dengan UI fallback ramah
- **Layout placeholder:** `Sidebar.jsx` (fungsional dasar), `TopNav.jsx` (fungsional dasar)
- **Pages placeholder:** semua 5 halaman sebagai komponen sederhana
- **Dokumentasi:** `README.md`, `CHANGELOG.md`, `docs/ARCHITECTURE.md`, `docs/USER_GUIDE.md`, `docs/PROMPT_LOG.md`

### Verified
- `npm run build` berhasil tanpa error: bundle 196 kB JS + 18 kB CSS
- Tidak ada import yang rusak atau tidak terpakai
- Semua utils adalah pure function tanpa efek samping
- Context reducer menangani semua action yang diperlukan
