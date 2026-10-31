# Arsitektur ResolveIQ

## Diagram Alur Data (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────────┐    ┌───────────────────────────────────┐  │
│  │ localStorage │◄───│         IncidentContext            │  │
│  │              │    │  (useReducer + Context API)        │  │
│  │ incidents    │───►│                                    │  │
│  │ runbooks     │    │  state: { incidents, runbooks,     │  │
│  │ postmortems  │    │          postMortems, activities,  │  │
│  │ activities   │    │          dismissedAlerts }         │  │
│  └──────────────┘    └────────────┬──────────────────────┘  │
│                                   │ useIncidents()           │
│                      ┌────────────▼──────────────────────┐  │
│                      │           App.jsx                  │  │
│                      │  - currentPage (useState)          │  │
│                      │  - sidebarCollapsed                │  │
│                      │  - toasts                          │  │
│                      └──┬─────────────────────┬──────────┘  │
│                         │                     │              │
│               ┌─────────▼──────┐    ┌─────────▼──────────┐  │
│               │   Layout       │    │     Pages          │  │
│               │  - Sidebar     │    │  - DashboardPage   │  │
│               │  - TopNav      │    │  - IncidentsPage   │  │
│               │  - GlobalSearch│    │  - RunbooksPage    │  │
│               │  - ProfileMenu │    │  - PostMortemsPage │  │
│               └────────────────┘    │  - KnowledgeBase   │  │
│                                     └────────┬───────────┘  │
│                                              │               │
│                               ┌──────────────▼────────────┐ │
│                               │        Components          │ │
│                               │  dashboard/ incidents/     │ │
│                               │  runbooks/  postmortem/    │ │
│                               │  common/                   │ │
│                               └───────────────────────────┘ │
│                                                             │
│                    ┌────────────────────────────┐           │
│                    │     Utils (pure functions) │           │
│                    │  stats.js  similarity.js   │           │
│                    │  severity.js  alerts.js    │           │
│                    │  date.js  postmortem.js    │           │
│                    └────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## Peran Tiap Folder

### `src/context/`
State global aplikasi. Satu context (`IncidentContext`) yang menyimpan semua data: incidents, runbooks, postMortems, activities, dismissedAlerts. Menggunakan `useReducer` agar logika mutasi terpusat dan mudah di-debug.

### `src/hooks/`
Custom hooks yang dapat digunakan ulang. `useLocalStorage` membungkus `useState` dengan persistensi ke localStorage, dengan fallback ke data seed jika kunci belum ada.

### `src/data/`
Data seed (demo) yang digunakan sebagai nilai awal localStorage. Semua tanggal dibuat relatif terhadap waktu saat ini menggunakan `daysAgoISO()` agar dashboard selalu terlihat hidup.

### `src/utils/`
Logika bisnis sebagai pure functions, tidak bergantung pada React. Semua kalkulasi (KPI, similarity, alert, severity recommendation) ada di sini. Ini memudahkan testing dan mencegah logika berserakan di komponen.

### `src/components/common/`
Komponen UI generik yang digunakan di seluruh aplikasi: Badge, Button, Modal, ConfirmDialog, Toast, EmptyState, Pagination, ErrorBoundary.

### `src/components/layout/`
Komponen kerangka layout: Sidebar (navigasi kiri), TopNav (header atas), GlobalSearch (pencarian global), ProfileMenu (dropdown profil).

### `src/components/dashboard/`, `incidents/`, `runbooks/`, `postmortem/`
Komponen yang spesifik untuk setiap domain fungsional. Setiap komponen fokus pada satu tanggung jawab (max ~150 baris).

### `src/pages/`
Komponen halaman yang merangkai komponen domain menjadi tampilan lengkap. Menerima callback navigasi dari App.jsx.

---

## Model Data

### Incident
```js
{
  id:              'INC-001',           // Format INC-XXX
  title:           string,
  description:     string,
  system:          string,              // Dari SYSTEMS constant
  category:        string,              // Dari CATEGORIES constant
  severity:        'SEV1'|'SEV2'|'SEV3'|'SEV4',
  status:          'Open'|'Investigating'|'Mitigated'|'Resolved'|'Closed',
  reporter:        string,
  assignee:        string|null,
  impact:          string,
  tags:            string[],
  createdAt:       ISO string,
  resolvedAt:      ISO string|null,
  timeline: [{
    id:     string,
    time:   ISO string,
    type:   'Detected'|'Action'|'Finding'|'Escalation'|'Resolved',
    note:   string,
    author: string,
  }],
  runbookProgress: { runbookId: string|null, completedStepIds: string[] },
  postMortemId:    string|null,
}
```

### Runbook
```js
{
  id:          'RB-001',
  title:       string,
  category:    string,
  systems:     string[],
  version:     string,              // '1.0', '1.1', dst.
  updatedAt:   ISO string,
  steps: [{ id: string, text: string }],
  suggestions: [{
    id:             string,
    text:           string,
    fromIncidentId: string,
    status:         'pending'|'accepted'|'rejected',
  }],
}
```

### PostMortem
```js
{
  id:              'PM-001',
  incidentId:      string,
  summary:         string,
  timeline: [{ id, time, type, note }],
  rootCause:       string,
  impact:          string,
  wentWell:        string,
  needsImprovement: string,
  actionItems: [{
    id:      string,
    text:    string,
    owner:   string,
    dueDate: ISO date string,
    done:    boolean,
  }],
  createdAt: ISO string,
  updatedAt: ISO string,
}
```

### Activity
```js
{
  id:      string,
  type:    'incident_created'|'status_changed'|'incident_resolved'|'incident_closed'|'postmortem_created',
  message: string,
  time:    ISO string,
  refId:   string,     // ID insiden atau post-mortem terkait
}
```

---

## Alur State (Context + Reducer)

```
User Action
    │
    ▼
Component (e.g., IncidentForm)
    │ dispatch({ type: 'ADD_INCIDENT', payload: {...} })
    ▼
appReducer (src/context/IncidentContext.jsx)
    │ Menghasilkan state baru (immutable)
    ▼
useReducer → state baru
    │
    ├──► useEffect → localStorage.setItem(...)
    │
    └──► Re-render komponen yang subscribe via useIncidents()
```

Alur ini murni unidirectional. Tidak ada mutasi langsung — setiap perubahan melewati reducer.

---

## Algoritma Kemiripan Insiden

File: `src/utils/similarity.js`

```
skor = (jumlah tag sama × 3)
     + (sistem sama ? 2 : 0)
     + (kategori sama ? 1 : 0)
     + (jumlah kata kunci judul yang sama × 1)

skor_maks = (jumlah tag base × 3) + 2 + 1 + (jumlah kata kunci judul base × 1)

persentase = Math.round((skor / skor_maks) × 100)
```

Hanya insiden dengan persentase ≥ 25% yang ditampilkan, maksimal 3, diurutkan dari yang paling mirip.

Stop words (kata umum) difilter dari judul sebelum dihitung.

---

## Matriks Severity

| Scope Pengguna | Tingkat Gangguan | Workaround | → Severity |
|----------------|-----------------|------------|------------|
| Semua (>50%)   | Mati total       | Tidak ada  | SEV1       |
| Besar (10-50%) | Mati total       | Apapun     | SEV1       |
| Semua/Besar    | Terdegradasi     | Tidak/Terbatas | SEV2  |
| Apapun         | Mati total       | Terbatas   | SEV2       |
| Minor (<10%)   | Minor/Terdegradasi | Ada      | SEV3       |
| Tidak ada      | Kosmetik         | Ada        | SEV4       |

---

## Persistensi Data

Semua data disimpan di localStorage dengan kunci berversi:
- `resolveiq:v1:incidents`
- `resolveiq:v1:runbooks`
- `resolveiq:v1:postmortems`
- `resolveiq:v1:activities`
- `resolveiq:v1:dismissed-alerts`

Versi pada kunci (`v1`) memungkinkan migrasi data di masa depan tanpa konflik.
