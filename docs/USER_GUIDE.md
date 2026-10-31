# Panduan Pengguna — ResolveIQ

## Selamat Datang di ResolveIQ

ResolveIQ adalah sistem manajemen insiden IT yang membantu Anda mencatat, menangani, dan belajar dari setiap gangguan layanan. Panduan ini mencakup 4 skenario penggunaan utama.

---

## Skenario 1: Melaporkan Insiden Baru

### Langkah-langkah:

1. **Klik tombol "Laporkan Insiden"** di pojok kanan atas (TopNav) — tersedia dari halaman manapun.

2. **Isi form pelaporan:**
   - **Judul** *(wajib)*: Deskripsi singkat masalah, contoh: "API Gateway tidak merespons"
   - **Deskripsi** *(wajib)*: Detail lebih lengkap tentang apa yang terjadi
   - **Sistem Terdampak** *(wajib)*: Pilih dari dropdown (API Gateway, Database Cluster, dll.)
   - **Kategori** *(wajib)*: Pilih kategori (Network, Database, Application, dll.)
   - **Pelapor** *(wajib)*: Nama Anda
   - **Dampak ke Pengguna**: Deskripsi dampak bisnis
   - **Tag**: Kata kunci dipisah koma (contoh: `database, latency, postgres`)
   
3. **Gunakan Severity Wizard** (opsional tapi direkomendasikan):
   - Klik "Gunakan Wizard" di bagian Severity
   - Jawab 3 pertanyaan: cakupan pengguna, tingkat gangguan, ketersediaan workaround
   - Wizard merekomendasikan severity secara otomatis
   - Anda boleh menimpa rekomendasi tersebut

4. **Perhatikan panel "Insiden Serupa"**: Saat Anda mengisi judul/sistem/tag, panel di sebelah kanan menampilkan insiden terdahulu yang mirip beserta solusinya — manfaatkan ini untuk mempercepat penanganan.

5. **Klik "Laporkan"** → Insiden dibuat dengan status **Open** dan ID otomatis (INC-XXX).

---

## Skenario 2: Menangani Insiden dengan Runbook

### Langkah-langkah:

1. **Buka detail insiden** — klik baris insiden di tabel atau klik dari Dashboard.

2. **Ubah status** ke **Investigating** via dropdown status di header detail:
   - Perubahan status otomatis menambah entri ke timeline kronologi

3. **Lihat Runbook Rekomendasi** di panel kanan detail insiden:
   - Sistem secara otomatis mencocokkan runbook berdasarkan kategori dan sistem insiden
   - Klik runbook yang sesuai untuk melihat langkah-langkahnya

4. **Ikuti langkah runbook sebagai checklist**:
   - Centang setiap langkah saat sudah dikerjakan
   - Setiap centang otomatis menambah entri timeline dengan catatan tindakan

5. **Tambah entri timeline manual** saat ada informasi baru:
   - Klik "Tambah Entri" di panel Timeline
   - Pilih tipe: Tindakan, Temuan, Eskalasi, dll.
   - Isi catatan dan waktu (default: sekarang)

6. **Ubah status sesuai kemajuan**:
   - `Investigating` → `Mitigated` (setelah workaround diterapkan)
   - `Mitigated` → `Resolved` (setelah masalah benar-benar teratasi)
   - Saat status berubah ke `Resolved`, sistem mengisi waktu resolusi otomatis

---

## Skenario 3: Membuat Post-Mortem

### Langkah-langkah:

1. **Pastikan insiden berstatus Resolved atau Closed** — tombol "Buat Post-Mortem" baru aktif saat status ini.

2. **Klik "Buat Post-Mortem"** di halaman detail insiden → Wizard 4 langkah terbuka.

3. **Langkah 1 — Ringkasan**:
   - Terisi otomatis dari data insiden (ID, severity, sistem, durasi, waktu deteksi/resolusi)
   - Edit jika perlu untuk menambah konteks

4. **Langkah 2 — Kronologi**:
   - Dibentuk otomatis dari timeline insiden
   - Edit, hapus, atau tambah entri untuk menyesuaikan narasi kronologi

5. **Langkah 3 — Analisis** *(bagian paling penting)*:
   - **Akar Masalah**: Jelaskan *mengapa* masalah terjadi (bukan hanya *apa* yang terjadi)
   - **Dampak**: Kuantifikasi dampak ke pengguna dan bisnis
   - **Yang Berjalan Baik**: Apresiasi proses yang efektif
   - **Yang Perlu Diperbaiki**: Identifikasi celah yang harus diperbaiki

6. **Langkah 4 — Action Items**:
   - Tambah item tindak lanjut konkret dengan penanggung jawab dan tenggat
   - Contoh: "Setup alert untuk JWT secret expired 7 hari sebelumnya — Rina Aditya, 2 minggu"

7. **Preview dan Export**:
   - Klik "Preview" untuk melihat tampilan final
   - **Export Markdown**: Unduh sebagai file `.md`
   - **Salin ke Clipboard**: Salin teks untuk ditempel ke wiki/Confluence
   - **Cetak**: Gunakan print dialog browser

---

## Skenario 4: Membaca dan Menginterpretasi Dashboard

### Widget dan Cara Membacanya:

#### KPI Cards (4 kartu di atas)
| Kartu | Cara Membaca |
|-------|-------------|
| **Insiden Aktif** | Jumlah insiden Open + Investigating + Mitigated. Idealnya < 5. Tren naik (↑) berarti beban meningkat. |
| **Rata-rata MTTR** | Mean Time To Resolve dari insiden Resolved/Closed. Semakin kecil semakin baik. |
| **Insiden Kritis Aktif** | SEV1 + SEV2 yang belum selesai. Nilai > 0 memerlukan perhatian segera. |
| **Kelengkapan Post-Mortem** | % insiden SEV1/SEV2 yang sudah punya post-mortem. Target: 100%. |

#### Trend Chart
- Grafik batang menampilkan jumlah insiden per hari (7 atau 14 hari terakhir)
- Warna menunjukkan severity (merah = SEV1, oranye = SEV2, kuning = SEV3, abu = SEV4)
- Hover pada batang untuk melihat detail per hari

#### System Health
- **Hijau (Operational)**: Tidak ada insiden aktif
- **Kuning (Degraded)**: Ada insiden SEV3/SEV4 aktif
- **Merah (Down)**: Ada insiden SEV1/SEV2 aktif

#### Alerts Panel
- Alert merah: Insiden SEV1 aktif — tangani segera
- Alert kuning: Insiden aktif >24 jam atau action item terlambat
- Alert biru: Post-mortem belum dibuat untuk insiden SEV1/SEV2
- Klik ikon X untuk dismiss alert setelah ditindaklanjuti

#### Action Item Tracker
- Progress bar menampilkan persentase action item yang selesai dari semua post-mortem
- Centang item langsung dari panel ini tanpa perlu membuka post-mortem
- Item berwarna merah = sudah melewati tenggat

---

## Tips Penggunaan

- **Gunakan tag secara konsisten** agar fitur "Insiden Serupa" bekerja lebih akurat
- **Isi timeline sesegera mungkin** saat menangani insiden — jangan mengandalkan ingatan
- **Buat post-mortem dalam 48 jam** setelah resolusi ketika detail masih segar
- **Reset data demo** dari menu profil jika ingin memulai dari awal

---

## Troubleshooting

**Data hilang setelah refresh?**
→ Periksa apakah browser memblokir localStorage (mode incognito terbatas). Coba mode normal.

**Grafik tidak tampil?**
→ Pastikan browser mendukung Canvas API (semua browser modern mendukung).

**Tombol "Buat Post-Mortem" abu-abu (nonaktif)?**
→ Status insiden harus Resolved atau Closed terlebih dahulu.
