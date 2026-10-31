# ResolveIQ

**Sistem Manajemen Insiden IT dan Pembuatan Post-Mortem Terstruktur**

ResolveIQ adalah aplikasi dashboard enterprise yang membantu tim IT mencatat insiden, menentukan severity, mencari kasus serupa, mengikuti runbook, mencatat kronologi, membuat post-mortem, dan melihat tren insiden — semuanya dalam satu antarmuka yang modern dan responsif.

---

## ✨ Fitur Utama

- **Dashboard** — KPI card, tren insiden, distribusi kategori, system health, alerts panel, action item tracker, dan feed aktivitas
- **Manajemen Insiden** — CRUD lengkap, filter/search/sort, ubah status dengan timeline otomatis, runbook checklist
- **Severity Wizard** — Rekomendasi severity berbasis matriks aturan bisnis (3 pertanyaan)
- **Insiden Serupa** — Algoritma skor kemiripan real-time berdasarkan tag, sistem, kategori, dan kata kunci judul
- **Runbook** — Library runbook dengan langkah bernomor, sistem usulan pembaruan dari post-mortem
- **Post-Mortem Generator** — Stepper 4 langkah yang mengisi otomatis dari data insiden
- **Export** — Unduh post-mortem sebagai file Markdown, salin ke clipboard, atau cetak
- **Knowledge Base** — Pencarian terpadu atas insiden, runbook, dan post-mortem dengan tab dan highlight

---

## 🛠 Tech Stack

| Layer       | Teknologi                                      |
|-------------|------------------------------------------------|
| UI          | React 18.3.x (functional components + Hooks)  |
| Styling     | Tailwind CSS 3.4.x                             |
| Build       | Vite 5.4.x + @vitejs/plugin-react              |
| Grafik      | Chart.js 4.x via react-chartjs-2               |
| Ikon        | lucide-react                                   |
| Penyimpanan | localStorage (tidak ada backend)               |
| Bahasa      | JavaScript ES2022 (.jsx / .js)                 |

---

## 📋 Prasyarat

- Node.js >= 18.x
- npm >= 9.x

---

## 🚀 Instalasi & Menjalankan

```bash
# 1. Clone repository
git clone <repo-url>
cd resolveiq

# 2. Install dependensi
npm install

# 3. Jalankan development server
npm run dev
# → http://localhost:5173

# 4. Build untuk production
npm run build

# 5. Preview hasil build
npm run preview
```

Tidak diperlukan konfigurasi tambahan. Tidak diperlukan koneksi internet setelah `npm install`.

---

## 📁 Struktur Folder

```
resolveiq/
├── index.html                  # Entry HTML
├── package.json
├── vite.config.js
├── tailwind.config.js          # Token warna & konfigurasi Tailwind
├── postcss.config.js
├── README.md
├── CHANGELOG.md
├── docs/
│   ├── ARCHITECTURE.md         # Diagram alur data & penjelasan teknis
│   ├── USER_GUIDE.md           # Panduan pengguna
│   └── PROMPT_LOG.md           # Log prompt pengembangan
└── src/
    ├── main.jsx                # Entry React
    ├── App.jsx                 # Root komponen + navigasi
    ├── index.css               # Direktif Tailwind + style global
    ├── context/
    │   └── IncidentContext.jsx # useReducer + Context (state global)
    ├── hooks/
    │   └── useLocalStorage.js  # Custom hook localStorage dengan fallback seed
    ├── data/
    │   ├── seedIncidents.js    # 15 insiden demo
    │   ├── seedRunbooks.js     # 6 runbook demo
    │   └── seedPostMortems.js  # 4 post-mortem demo
    ├── utils/
    │   ├── constants.js        # Konstanta global (severity, status, dll.)
    │   ├── date.js             # Utilitas tanggal & durasi
    │   ├── severity.js         # Rekomendasi severity & kelas warna
    │   ├── similarity.js       # Algoritma kemiripan insiden
    │   ├── stats.js            # Kalkulasi KPI & statistik dashboard
    │   ├── postmortem.js       # Generator konten & export Markdown
    │   └── alerts.js           # Generator alert otomatis
    ├── components/
    │   ├── common/             # Badge, Button, Modal, ConfirmDialog, Toast,
    │   │                       # EmptyState, Pagination, ErrorBoundary
    │   ├── layout/             # Sidebar, TopNav, GlobalSearch, ProfileMenu
    │   ├── dashboard/          # KpiCard, IncidentTrendChart, CategoryBreakdown,
    │   │                       # SystemHealth, AlertsPanel, ActionItemTracker,
    │   │                       # RecentIncidentsTable, ActivityFeed
    │   ├── incidents/          # IncidentFilters, IncidentTable, IncidentForm,
    │   │                       # SeverityWizard, SimilarIncidents, IncidentDetail,
    │   │                       # Timeline, RunbookChecklist
    │   ├── runbooks/           # RunbookList, RunbookViewer, RunbookForm
    │   └── postmortem/         # PostMortemWizard, PostMortemPreview, PostMortemList
    └── pages/
        ├── DashboardPage.jsx
        ├── IncidentsPage.jsx
        ├── RunbooksPage.jsx
        ├── PostMortemsPage.jsx
        └── KnowledgeBasePage.jsx
```

---

## 📜 Skrip npm

| Skrip            | Deskripsi                              |
|------------------|----------------------------------------|
| `npm run dev`    | Jalankan dev server (port 5173)        |
| `npm run build`  | Build untuk production ke `dist/`      |
| `npm run preview`| Preview hasil build secara lokal       |

---

## 🔄 Reset Data Demo

1. Klik **avatar profil** di pojok kanan atas TopNav
2. Pilih **"Reset Data Demo"**
3. Konfirmasi → semua data kembali ke seed awal

Atau hapus manual dari DevTools: `Application → Local Storage → hapus semua kunci resolveiq:v1:*`

---

## ⚠️ Batasan

- **Frontend only** — tidak ada backend, database server, atau API eksternal
- Data disimpan di `localStorage` browser; data hilang jika localStorage dibersihkan
- Dioptimalkan untuk Chrome/Edge/Firefox versi terbaru
- Ukuran storage localStorage per domain biasanya 5–10 MB; data demo tidak akan melewati batas ini

---

## 🗺 Rencana Pengembangan

- [ ] Integrasi backend (Node.js/Express atau Supabase)
- [ ] Autentikasi nyata (JWT/OAuth)
- [ ] Notifikasi real-time via WebSocket
- [ ] Integrasi Slack/Teams untuk alert
- [ ] Export PDF post-mortem
- [ ] Dark mode
- [ ] Multi-tenant support
