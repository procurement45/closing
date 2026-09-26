import { AuditLogEntry, EmailRecipient, FeedbackStatus, POItem, SendReportResult, UserSession } from '../types';

const STORAGE_KEYS = {
  SESSION: 'po_report_session',
  APPS_SCRIPT_URL: 'po_report_apps_script_url',
  PO_DATA: 'po_report_master_data',
  USERS: 'po_report_users',
  RECIPIENTS: 'po_report_recipients',
  AUDIT_LOGS: 'po_report_audit_logs',
};

// Initial Seed Data as per PRD & UserMapping
const INITIAL_USERS: UserSession[] = [
  {
    email: 'staffprocurement45@gmail.com',
    site_name: 'Site Balikpapan',
    is_active: true,
    login_time: '',
  },
  {
    email: 'site.samarinda@company.com',
    site_name: 'Site Samarinda',
    is_active: true,
    login_time: '',
  },
  {
    email: 'site.sorong@company.com',
    site_name: 'Site Sorong',
    is_active: true,
    login_time: '',
  },
  {
    email: 'inactive.user@company.com',
    site_name: 'Site Balikpapan',
    is_active: false,
    login_time: '',
  },
];

const INITIAL_RECIPIENTS: EmailRecipient[] = [
  {
    site_name: 'Site Balikpapan',
    email: 'staffprocurement45@gmail.com',
    name: 'Staff Procurement BPN',
    role: 'Site Officer',
  },
  {
    site_name: 'Site Balikpapan',
    email: 'purchasing.manager@company.com',
    name: 'Purchasing Manager',
    role: 'Manager Purchasing',
  },
  {
    site_name: 'Site Balikpapan',
    email: 'logistik.lead@company.com',
    name: 'Logistics Supervisor',
    role: 'Warehouse & Logistics',
  },
  {
    site_name: 'Site Samarinda',
    email: 'site.samarinda@company.com',
    name: 'Samarinda Lead Officer',
    role: 'Site Officer',
  },
  {
    site_name: 'Site Sorong',
    email: 'site.sorong@company.com',
    name: 'Sorong Procurement',
    role: 'Site Officer',
  },
];

const INITIAL_PO_DATA: POItem[] = [
  {
    id: 'po_1',
    site_name: 'Site Balikpapan',
    po_number: 'PO-2026-BPN-001',
    po_date: '2026-08-10', // > 30 days
    vendor: 'PT United Tractors Tbk',
    item_description: 'Sparepart Excavator PC200 Seal Kit & Filter Hidrolik',
    total_amount: 48500000,
    feedback: 'Proses Pengiriman',
    notes: 'Estimasi tiba tgl 28 September via Pelabuhan Kariangau',
    last_updated: '2026-09-24 14:15',
    status: 'Open',
  },
  {
    id: 'po_2',
    site_name: 'Site Balikpapan',
    po_number: 'PO-2026-BPN-002',
    po_date: '2026-07-15', // > 60 days
    vendor: 'CV Mitra Tehnik Abadi',
    item_description: 'Bearing SKF 6205 & Coupling Rubber Set 50 unit',
    total_amount: 12350000,
    feedback: 'Menunggu Konfirmasi Vendor',
    notes: 'Vendor konfirmasi stok indent 2 minggu dari prinsipal Singapura',
    last_updated: '2026-09-22 09:30',
    status: 'Open',
  },
  {
    id: 'po_3',
    site_name: 'Site Balikpapan',
    po_number: 'PO-2026-BPN-003',
    po_date: '2026-09-02',
    vendor: 'PT Trakindo Utama',
    item_description: 'Oil Filter & Fuel Filter CAT 320D Heavy Equipment',
    total_amount: 27600000,
    feedback: 'Belum Datang',
    notes: 'Telah PO, menunggu jadwal kirim ekspedisi darat',
    last_updated: '2026-09-23 11:20',
    status: 'Open',
  },
  {
    id: 'po_4',
    site_name: 'Site Balikpapan',
    po_number: 'PO-2026-BPN-004',
    po_date: '2026-06-20', // > 60 days
    vendor: 'PT Hexindo Adiperkasa',
    item_description: 'Track Roller & Idler Hitachi ZX210 High Spec',
    total_amount: 92400000,
    feedback: 'Proses Retur',
    notes: 'Barang datang salah tipe part number, menunggu unit pengganti',
    last_updated: '2026-09-20 16:45',
    status: 'Open',
  },
  {
    id: 'po_5',
    site_name: 'Site Balikpapan',
    po_number: 'PO-2026-BPN-005',
    po_date: '2026-09-18',
    vendor: 'PT Cipta Kridatama Parts',
    item_description: 'Hydraulic Hose Parker 1/2 inch x 20m Double Wire',
    total_amount: 15800000,
    feedback: 'Belum Datang',
    notes: '',
    last_updated: '2026-09-24 10:00',
    status: 'Open',
  },
  {
    id: 'po_6',
    site_name: 'Site Balikpapan',
    po_number: 'PO-2026-BPN-006',
    po_date: '2026-07-01', // > 60 days
    vendor: 'PT Altrak 1978',
    item_description: 'Gasket Kit & O-Ring Set Cummins QSM11 Marine',
    total_amount: 34200000,
    feedback: 'Proses Pengiriman',
    notes: 'Resi JNE Cargo: BPN88291039 posisi transit Surabaya',
    last_updated: '2026-09-24 13:00',
    status: 'Open',
  },
  {
    id: 'po_7',
    site_name: 'Site Balikpapan',
    po_number: 'PO-2026-BPN-007',
    po_date: '2026-08-25', // > 30 days
    vendor: 'CV Karya Mandiri Teknik',
    item_description: 'Steel Plate Hardox 400 12mm x 4x8 ft Fabricated',
    total_amount: 67000000,
    feedback: 'Menunggu Konfirmasi Vendor',
    notes: 'Cek kesiapan fabrikasi dan sertifikat material mill',
    last_updated: '2026-09-21 15:10',
    status: 'Open',
  },
  {
    id: 'po_8',
    site_name: 'Site Balikpapan',
    po_number: 'PO-2026-BPN-008',
    po_date: '2026-09-10',
    vendor: 'PT Surya Segara Logistik',
    item_description: 'Wire Rope Sling 28mm x 6 meter with Thimble Eye',
    total_amount: 21500000,
    feedback: 'Belum Datang',
    notes: 'Order confirmed, awaiting vessel schedule',
    last_updated: '2026-09-23 17:00',
    status: 'Open',
  },
  {
    id: 'po_9',
    site_name: 'Site Balikpapan',
    po_number: 'PO-2026-BPN-009',
    po_date: '2026-05-10',
    vendor: 'PT Sangatta Prima Baja',
    item_description: 'Anchor Bolt M36 x 800mm Grade 8.8 Galvanized',
    total_amount: 14700000,
    feedback: 'Belum Datang',
    notes: 'Dibatalkan karena revisi spesifikasi pondasi civil',
    last_updated: '2026-09-15 11:00',
    status: 'Cancelled',
  },
  {
    id: 'po_10',
    site_name: 'Site Samarinda',
    po_number: 'PO-2026-SMD-001',
    po_date: '2026-08-12',
    vendor: 'PT Borneo Jaya Spareparts',
    item_description: 'Brake Lining & Drum Isuzu Giga FVR Series',
    total_amount: 18400000,
    feedback: 'Belum Datang',
    notes: '',
    last_updated: '2026-09-22 08:00',
    status: 'Open',
  },
  {
    id: 'po_11',
    site_name: 'Site Sorong',
    po_number: 'PO-2026-SRG-001',
    po_date: '2026-07-28',
    vendor: 'PT Papua Sarana Teknik',
    item_description: 'Submersible Pump 3 Inch 5HP 380V Water Disposal',
    total_amount: 38700000,
    feedback: 'Proses Pengiriman',
    notes: 'Kapal kontainer tiba minggu depan di Pelabuhan Sorong',
    last_updated: '2026-09-20 10:00',
    status: 'Open',
  },
];

class ApiService {
  private getStoredAppScriptUrl(): string {
    return localStorage.getItem(STORAGE_KEYS.APPS_SCRIPT_URL) || (import.meta.env.VITE_APPS_SCRIPT_URL as string) || '';
  }

  public setAppsScriptUrl(url: string) {
    if (url) {
      localStorage.setItem(STORAGE_KEYS.APPS_SCRIPT_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.APPS_SCRIPT_URL);
    }
  }

  public getAppsScriptUrl(): string {
    return this.getStoredAppScriptUrl();
  }

  public isLiveMode(): boolean {
    const url = this.getStoredAppScriptUrl();
    return Boolean(url && url.startsWith('http'));
  }

  // --- Local Fallback Data Management ---
  private initLocalData() {
    if (!localStorage.getItem(STORAGE_KEYS.PO_DATA)) {
      localStorage.setItem(STORAGE_KEYS.PO_DATA, JSON.stringify(INITIAL_PO_DATA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECIPIENTS)) {
      localStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(INITIAL_RECIPIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
    }
  }

  public resetLocalData() {
    localStorage.setItem(STORAGE_KEYS.PO_DATA, JSON.stringify(INITIAL_PO_DATA));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(INITIAL_RECIPIENTS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
  }

  // --- Authentication (FR-01) ---
  public async login(email: string): Promise<UserSession> {
    const cleanEmail = email.trim().toLowerCase();
    const appScriptUrl = this.getStoredAppScriptUrl();

    if (this.isLiveMode()) {
      try {
        const response = await fetch(`${appScriptUrl}?action=checkAuth&email=${encodeURIComponent(cleanEmail)}`, {
          method: 'GET',
        });
        const json = await response.json();
        if (json.status === 'ok' && json.data) {
          if (!json.data.is_active) {
            throw new Error('Akun Anda non-aktif. Hubungi admin purchasing.');
          }
          const session: UserSession = {
            email: json.data.email,
            site_name: json.data.site_name,
            is_active: json.data.is_active,
            login_time: new Date().toISOString(),
          };
          this.setSession(session);
          return session;
        } else {
          throw new Error('Email tidak terdaftar. Hubungi admin purchasing.');
        }
      } catch (err: any) {
        if (err.message && err.message.includes('Hubungi admin')) {
          throw err;
        }
        console.warn('Apps Script login unreachable, using local fallback:', err);
      }
    }

    // Local fallback matching UserMapping
    this.initLocalData();
    const users: UserSession[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('Email tidak terdaftar. Hubungi admin purchasing.');
    }

    if (!user.is_active) {
      throw new Error('Akun Anda non-aktif. Hubungi admin purchasing.');
    }

    const session: UserSession = {
      ...user,
      login_time: new Date().toISOString(),
    };
    this.setSession(session);
    return session;
  }

  public getSession(): UserSession | null {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!data) return null;
    try {
      const session = JSON.parse(data) as UserSession;
      // 8-hour expiry rule from PRD Section 4.2
      if (session.login_time) {
        const loginDate = new Date(session.login_time).getTime();
        const now = new Date().getTime();
        const eightHoursMs = 8 * 60 * 60 * 1000;
        if (now - loginDate > eightHoursMs) {
          this.logout();
          return null;
        }
      }
      return session;
    } catch {
      return null;
    }
  }

  public setSession(session: UserSession) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }

  public logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  // --- PO Data (FR-02, FR-06, FR-07, FR-08) ---
  public async getPOData(siteName: string, includeCancelled: boolean = false): Promise<POItem[]> {
    const appScriptUrl = this.getStoredAppScriptUrl();

    if (this.isLiveMode()) {
      try {
        const response = await fetch(
          `${appScriptUrl}?action=getPOData&site=${encodeURIComponent(siteName)}&includeCancelled=${includeCancelled}`,
          { method: 'GET' }
        );
        const json = await response.json();
        if (json.status === 'ok' && Array.isArray(json.data)) {
          return json.data;
        }
      } catch (err) {
        console.warn('Apps Script getPOData failed, using local storage:', err);
      }
    }

    // Local fallback
    this.initLocalData();
    const allData: POItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PO_DATA) || '[]');
    return allData.filter((item) => {
      const matchSite = item.site_name.toLowerCase() === siteName.toLowerCase();
      if (!matchSite) return false;
      if (!includeCancelled && item.status === 'Cancelled') return false;
      return true;
    });
  }

  // --- Feedback Update (FR-10, FR-12) ---
  public async updateFeedback(
    poNumber: string,
    feedback: FeedbackStatus,
    notes: string,
    userEmail: string,
    siteName: string
  ): Promise<POItem> {
    const appScriptUrl = this.getStoredAppScriptUrl();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (this.isLiveMode()) {
      try {
        const response = await fetch(appScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'updateFeedback',
            po_number: poNumber,
            feedback,
            notes,
            user_email: userEmail,
            site_name: siteName,
          }),
        });
        const json = await response.json();
        if (json.status !== 'ok') {
          throw new Error(json.message || 'Gagal memperbarui feedback');
        }
      } catch (err: any) {
        console.warn('Apps Script update feedback failed:', err);
        // If live fails, fall through or re-throw
        throw new Error('Gagal disimpan. Coba lagi.');
      }
    }

    // Local update
    this.initLocalData();
    const allData: POItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PO_DATA) || '[]');
    const index = allData.findIndex((p) => p.po_number === poNumber);
    if (index === -1) {
      throw new Error(`PO #${poNumber} tidak ditemukan.`);
    }

    const oldItem = allData[index];
    const newStatus: 'Open' | 'Cancelled' = feedback === 'Cancel PO' ? 'Cancelled' : 'Open';
    const updated: POItem = {
      ...oldItem,
      feedback,
      notes,
      status: newStatus,
      last_updated: timestamp,
    };
    allData[index] = updated;
    localStorage.setItem(STORAGE_KEYS.PO_DATA, JSON.stringify(allData));

    // Log Audit
    this.logAudit(poNumber, siteName, userEmail, 'feedback', oldItem.feedback, feedback);
    if (oldItem.status !== newStatus) {
      this.logAudit(poNumber, siteName, userEmail, 'status', oldItem.status, newStatus);
    }
    if (oldItem.notes !== notes) {
      this.logAudit(poNumber, siteName, userEmail, 'notes', oldItem.notes, notes);
    }

    return updated;
  }

  // --- Cancel PO (FR-11, FR-12) ---
  public async cancelPO(poNumber: string, userEmail: string, siteName: string): Promise<POItem> {
    const appScriptUrl = this.getStoredAppScriptUrl();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (this.isLiveMode()) {
      try {
        const response = await fetch(appScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'cancelPO',
            po_number: poNumber,
            user_email: userEmail,
            site_name: siteName,
          }),
        });
        const json = await response.json();
        if (json.status !== 'ok') {
          throw new Error(json.message || 'Gagal membatalkan PO');
        }
      } catch (err: any) {
        console.warn('Apps Script cancel PO failed:', err);
        throw new Error('Gagal membatalkan PO. Coba lagi.');
      }
    }

    // Local update
    this.initLocalData();
    const allData: POItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PO_DATA) || '[]');
    const index = allData.findIndex((p) => p.po_number === poNumber);
    if (index === -1) {
      throw new Error(`PO #${poNumber} tidak ditemukan.`);
    }

    const oldItem = allData[index];
    const updated: POItem = {
      ...oldItem,
      status: 'Cancelled',
      feedback: 'Cancel PO',
      last_updated: timestamp,
    };
    allData[index] = updated;
    localStorage.setItem(STORAGE_KEYS.PO_DATA, JSON.stringify(allData));

    // Audit log
    this.logAudit(poNumber, siteName, userEmail, 'status', oldItem.status, 'Cancelled');

    return updated;
  }

  // --- Email Recipients (FR-13) ---
  public async getEmailRecipients(siteName: string): Promise<EmailRecipient[]> {
    const appScriptUrl = this.getStoredAppScriptUrl();

    if (this.isLiveMode()) {
      try {
        const response = await fetch(
          `${appScriptUrl}?action=getEmailRecipients&site=${encodeURIComponent(siteName)}`,
          { method: 'GET' }
        );
        const json = await response.json();
        if (json.status === 'ok' && Array.isArray(json.data)) {
          return json.data;
        }
      } catch (err) {
        console.warn('Apps Script getEmailRecipients failed:', err);
      }
    }

    this.initLocalData();
    const recipients: EmailRecipient[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECIPIENTS) || '[]');
    return recipients.filter((r) => r.site_name.toLowerCase() === siteName.toLowerCase());
  }

  // --- Send Report via Email & Save to Drive (FR-13, FR-16) ---
  public async sendReportEmail(
    siteName: string,
    userEmail: string,
    customNote: string = ''
  ): Promise<SendReportResult> {
    const appScriptUrl = this.getStoredAppScriptUrl();

    if (this.isLiveMode()) {
      try {
        const response = await fetch(appScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'sendReportEmail',
            site_name: siteName,
            user_email: userEmail,
            customNote,
          }),
        });
        const json = await response.json();
        if (json.status === 'ok') {
          return {
            success: true,
            message: `Laporan berhasil dikirim ke ${json.data?.recipients?.length || 'seluruh'} penerima email dan diarsipkan di Google Drive.`,
            recipients: json.data?.recipients,
            driveFileUrl: json.data?.driveFileUrl,
          };
        } else {
          throw new Error(json.message || 'Gagal mengirim email');
        }
      } catch (err: any) {
        console.warn('Apps Script sendReportEmail failed:', err);
        throw new Error(err.message || 'Gagal mengirim laporan.');
      }
    }

    // Local simulated send
    const recipients = await this.getEmailRecipients(siteName);
    const emails = recipients.map((r) => r.email);
    this.logAudit('BULK_REPORT', siteName, userEmail, 'send_email', '', `Sent to ${emails.join(', ')}`);

    return {
      success: true,
      message: `Laporan berhasil dikirim ke ${emails.join(', ')}`,
      recipients: emails,
    };
  }

  // --- Audit Trail (FR-12) ---
  private logAudit(
    poNumber: string,
    site: string,
    userEmail: string,
    fieldChanged: string,
    oldValue: string,
    newValue: string
  ) {
    try {
      const logs: AuditLogEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
      logs.unshift({
        id: 'log_' + Date.now() + Math.random(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        po_number: poNumber,
        site,
        user_email: userEmail,
        field_changed: fieldChanged,
        old_value: oldValue || '',
        new_value: newValue || '',
      });
      if (logs.length > 100) logs.pop();
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch (err) {
      console.error('Audit log local error:', err);
    }
  }

  public async getAuditLogs(siteName?: string): Promise<AuditLogEntry[]> {
    const appScriptUrl = this.getStoredAppScriptUrl();

    if (this.isLiveMode()) {
      try {
        const response = await fetch(
          `${appScriptUrl}?action=getAuditLogs&site=${encodeURIComponent(siteName || '')}`,
          { method: 'GET' }
        );
        const json = await response.json();
        if (json.status === 'ok' && Array.isArray(json.data)) {
          return json.data;
        }
      } catch (err) {
        console.warn('Apps Script getAuditLogs failed:', err);
      }
    }

    const logs: AuditLogEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
    if (!siteName) return logs;
    return logs.filter((l) => l.site.toLowerCase() === siteName.toLowerCase());
  }
}

export const api = new ApiService();
