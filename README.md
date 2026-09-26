# PO Open Monthly Report

Aplikasi operasional internal berbasis web (Enterprise Utilitarian Dashboard) untuk memantau, memperbarui status (Feedback), membatalkan (Cancel), serta melaporkan daftar **Purchase Order (PO) Open bulanan** per site. Terintegrasi penuh dengan **Google Sheets**, **Gmail**, dan **Google Drive** menggunakan **Google Apps Script** sebagai backend.

Dirancang sesuai spesifikasi PRD v1.2 dan Design System `Terminal` (high-density data grid, cool-neutral paper, monospace figures).

---

## 🚀 Fitur Utama (Berdasarkan PRD v1.2)

1. **Email-Only Authentication & Site Filtering Otomatis (FR-01, FR-02)**
   - Login hanya menggunakan email yang terdaftar di whitelist tab `UserMapping` Google Sheets.
   - Hak akses otomatis terkunci ke `site_name` terkait (contoh: `staffprocurement45@gmail.com` langsung diarahkan ke **Site Balikpapan**). Tidak ada kebocoran data antar-site.
   - Sesi berlaku selama 8 jam atau sampai logout.

2. **Dashboard Enterprise Utilitarian (FR-05, FR-06, FR-07, FR-08, FR-09)**
   - **Header Info Site & Topbar (48px)**: Nama site, status sinkronisasi, user profile, dan toggle konfigurasi Apps Script.
   - **Stat Bar (56px)**: Ringkasan instan `PO Open: [N]`, `Total Nilai: Rp [AMOUNT]`, dan `Aging > 30d: [N]` (termasuk deteksi > 60d).
   - **Toolbar (44px)**: Filter pencarian No. PO / Vendor, filter status Feedback, toggle `[ ] Tampilkan PO Cancelled`.
   - **Tabel PO High-Density Grid**: Monospace alignment untuk angka dan kode PO, aging warning indicator (kuning > 30 hari, merah > 60 hari).
   - **Pagination**: 25 baris per halaman untuk performa mulus.

3. **Modul Aksi & Audit Trail (FR-10, FR-11, FR-12)**
   - **Update Feedback & Catatan**: Pilihan dropdown status (`Belum Datang`, `Proses Pengiriman`, `Proses Retur`, `Menunggu Konfirmasi Vendor`) dengan indikator 8 status visual (`Menyimpan...`, `Tersimpan ✓`, `✗ Gagal`).
   - **Cancel PO**: Tombol pembatalan baris dengan dialog konfirmasi modal. PO yang dibatalkan tidak dihapus melainkan ditandai `Cancelled` dan tercatat di riwayat audit.
   - **Audit Trail**: Setiap perubahan status atau catatan otomatis dicatat ke tab `AuditLog` di Google Sheets.

4. **Modul Pelaporan & Ekspor (FR-13, FR-14, FR-15, FR-16)**
   - **Kirim Laporan via Email (Gmail / MailApp)**: Membaca daftar penerima per site dari tab `EmailRecipients`, menampilkan dialog pra-kirim, dan mengirim email rekap berformat HTML enterprise beserta lampiran file PDF.
   - **Otomatis Arsip ke Google Drive**: Salinan laporan PDF bulanan otomatis disimpan ke Google Drive pada folder `PO_Monthly_Reports`.
   - **Download PDF**: Ekspor langsung laporan berformat tabel landscape resmi.
   - **Download Excel**: Ekspor file `.xlsx` dengan format kolom lengkap dan timestamp `Export Date`.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, jsPDF, jspdf-autotable, SheetJS (xlsx).
- **Backend**: Google Apps Script (Web App REST API), SpreadsheetApp (Google Sheets), GmailApp / MailApp (Gmail), DriveApp (Google Drive).
- **Design System**: `Terminal` genre Modern-Minimal enterprise (Geist Mono & Inter, OKLCH palette).

---

## 📁 Struktur Repositori

```text
├── apps-script/
│   ├── Code.gs            # Backend lengkap Google Apps Script (Sheets, Gmail, Drive)
│   ├── appsscript.json    # Manifest Apps Script (OAuth scopes & TimeZone Asia/Jakarta)
│   └── README.md          # Panduan rinci setup Google Apps Script
├── src/
│   ├── components/
│   │   ├── AppsScriptGuideModal.tsx # Dialog instruksi & pengujian Apps Script Web App
│   │   ├── CancelModal.tsx          # Dialog konfirmasi pembatalan PO
│   │   ├── DataTable.tsx            # Tabel grid data PO enterprise
│   │   ├── LoginPage.tsx            # Halaman login email-only
│   │   ├── SendReportModal.tsx      # Dialog kirim laporan email
│   │   ├── StatBar.tsx              # Ringkasan statistik PO Open, Amount, Aging
│   │   ├── Toast.tsx                # Toast notifikasi
│   │   ├── Toolbar.tsx              # Bar pencarian, filter, dan ekspor
│   │   └── Topbar.tsx               # Header navigasi & status sinkronisasi
│   ├── services/
│   │   ├── api.ts                   # Layer API Apps Script & Local Storage fallback
│   │   └── exportService.ts         # Layanan ekspor PDF dan Excel (.xlsx)
│   ├── types/
│   │   └── index.ts                 # Definisi antarmuka TypeScript
│   ├── App.tsx                      # Root application state & logic
│   ├── index.css                    # Definisi locked design tokens & Tailwind
│   └── main.tsx                     # React entrypoint
├── index.html                       # Entry HTML dengan Google Fonts
├── metadata.json                    # Metadata aplikasi
├── package.json                     # Dependencies & build scripts
└── README.md                        # Dokumentasi proyek
```

---

## ⚙️ Panduan Setup & Deployment

### 1. Menjalankan Frontend Secara Lokal
```bash
# Clone repositori
git clone <URL_REPO_GITHUB_ANDA>
cd <NAMA_FOLDER>

# Install dependencies
npm install

# Jalankan development server
npm run dev
```
Akses di browser pada `http://localhost:3000`.

### 2. Setup Backend di Google Apps Script (Google Sheets, Gmail & Drive)

1. Buka [Google Sheets](https://sheets.new) dan buat spreadsheet baru (misal: *Master PO Open Data*).
2. Di menu atas spreadsheet, buka **Extensions** (Ekstensi) > **Apps Script**.
3. Buka file [`apps-script/Code.gs`](./apps-script/Code.gs) di repositori ini, salin seluruh kodenya, lalu tempelkan ke editor Apps Script.
4. Pilih fungsi `setupInitialSheets` pada dropdown fungsi, lalu klik **Run** (Jalankan).
   - Otorisasi izin akses (Spreadsheet, Gmail, dan Google Drive).
   - Fungsi ini otomatis membuat 4 tab dengan skema kolom yang tepat dan mengisi data awal contoh:
     - `POData`: Master data PO.
     - `UserMapping`: Whitelist user login (`email`, `site_name`, `is_active`). Termasuk `staffprocurement45@gmail.com`.
     - `EmailRecipients`: Daftar penerima laporan bulanan per site.
     - `AuditLog`: Log riwayat perubahan.
5. Klik tombol **Deploy** di kanan atas > **New deployment**.
6. Pilih jenis **Web app**.
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: `Anyone`
7. Klik **Deploy** dan salin **Web app URL** yang dihasilkan.

### 3. Menghubungkan Frontend ke Google Apps Script

- Di aplikasi web frontend, buka tombol **Setup / Status Koneksi** di pojok kanan atas.
- Tempelkan URL Web App ke kolom **URL Google Apps Script Web App** dan klik **Simpan**.
- Klik **Uji Koneksi** untuk memastikan status online.
- Selesai! Seluruh data PO, update feedback, cancel status, pengiriman email ke tim site, dan arsip PDF ke Google Drive sudah tersinkronisasi secara real-time.
