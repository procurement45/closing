export type FeedbackStatus = 
  | 'Belum Datang'
  | 'Proses Pengiriman'
  | 'Proses Retur'
  | 'Menunggu Konfirmasi Vendor'
  | 'Cancel PO'
  | '';

export type POStatus = 'Open' | 'Cancelled';

export interface POItem {
  id: string;
  site_name: string;
  po_number: string;
  po_date: string; // DD/MM/YYYY or YYYY-MM-DD
  vendor: string;
  item_description: string;
  total_amount: number;
  feedback: FeedbackStatus;
  notes: string;
  last_updated: string;
  status: POStatus;
}

export interface UserSession {
  email: string;
  site_name: string;
  is_active: boolean;
  login_time: string;
}

export interface EmailRecipient {
  site_name: string;
  email: string;
  name: string;
  role: string;
}

export interface AuditLogEntry {
  id?: string;
  timestamp: string;
  po_number: string;
  site: string;
  user_email: string;
  field_changed: string;
  old_value: string;
  new_value: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'danger' | 'info';
  text: string;
}

export interface SendReportResult {
  success: boolean;
  message: string;
  recipients?: string[];
  driveFileUrl?: string;
}
