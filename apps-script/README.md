# Panduan Integrasi Google Apps Script, Google Sheets, Gmail, dan Google Drive

Aplikasi ini menggunakan arsitektur enterprise utilitarian:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS (mengikuti `design.md` bertema Terminal).
- **Backend**: Google Apps Script (Web App) terhubung langsung ke:
  1. **Google Sheets** (Master Data `POData`, Whitelist `UserMapping`, `EmailRecipients`, dan `AuditLog`).
  2. **Gmail / MailApp** (Kirim laporan ringkasan berkala dan attachment PDF otomatis ke daftar email penerima per site).
  3. **Google Drive** (Arsip otomatis laporan bulanan ke folder `PO_Monthly_Reports`).

---

## Langkah 1: Buat Google Sheet Master Data

1. Buka [Google Sheets](https://sheets.new) dan buat Spreadsheet baru (misal dinamai: `Master PO Open Data`).
2. Di menu atas, pilih **Extensions** (Ekstensi) > **Apps Script**.

---

## Langkah 2: Salin Kode Apps Script

1. Hapus isi file default `Code.gs` di editor Apps Script.
2. Salin seluruh isi dari file [`apps-script/Code.gs`](./Code.gs) ke editor Apps Script.
3. Di menu dropdown fungsi Apps Script, pilih fungsi `setupInitialSheets` dan klik **Run** (Jalankan).
   - Berikan izin otorisasi saat diminta (Spreadsheet, Mail, Drive).
   - Fungsi ini otomatis membuat 4 tab dengan struktur kolom resmi dan data contoh:
     - `POData`: Kolom `site_name | po_number | po_date | vendor | item_description | total_amount | feedback | notes | last_updated | status`
     - `UserMapping`: Kolom `email | site_name | is_active` (Termasuk email awal `staffprocurement45@gmail.com` -> `Site Balikpapan`)
     - `EmailRecipients`: Kolom `site_name | email | name | role`
     - `AuditLog`: Kolom `timestamp | po_number | site | user_email | field_changed | old_value | new_value`

---

## Langkah 3: Deploy sebagai Web App

1. Di pojok kanan atas Apps Script, klik tombol biru **Deploy** > **New deployment**.
2. Klik ikon gerigi (Select type) > pilih **Web app**.
3. Isi konfigurasi:
   - **Description**: `PO Open Monthly Report v1`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone` (Siapa saja, agar frontend dapat memanggil API)
4. Klik **Deploy**.
5. Salin **Web app URL** yang muncul (format: `https://script.google.com/macros/s/.../exec`).

---

## Langkah 4: Hubungkan Frontend

1. Buka aplikasi web frontend.
2. Klik tombol **Status Koneksi / Panduan Google Apps Script** di bagian pojok kanan atas dashboard atau saat login.
3. Tempelkan URL Web App yang Anda salin tadi ke input **Google Apps Script Web App URL**.
4. Selesai! Data PO, update feedback, cancel status, kirim email, dan arsip Google Drive langsung live tersinkronisasi.
