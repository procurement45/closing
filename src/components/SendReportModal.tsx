import React, { useEffect, useState } from 'react';
import { EmailRecipient, POItem } from '../types';
import {
  FileText,
  HardDrive,
  Loader2,
  Mail,
  Send,
  Users,
  X,
} from 'lucide-react';

interface SendReportModalProps {
  siteName: string;
  poList: POItem[];
  recipients: EmailRecipient[];
  isOpen: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onSend: (customNote: string) => Promise<void>;
}

export const SendReportModal: React.FC<SendReportModalProps> = ({
  siteName,
  poList,
  recipients,
  isOpen,
  isProcessing,
  onClose,
  onSend,
}) => {
  const [customNote, setCustomNote] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const activePOs = poList.filter((p) => p.status === 'Open');
  const totalAmount = activePOs.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const formattedAmount = 'Rp ' + totalAmount.toLocaleString('id-ID');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSend(customNote);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-report-title"
    >
      <div className="w-full max-w-[520px] bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="send-report-title"
                className="text-base font-bold text-slate-900"
              >
                Kirim Laporan Bulanan
              </h3>
              <p className="text-xs text-slate-500">{siteName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Summary Box */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-100">
            <div>
              <span className="text-[11px] font-semibold text-blue-900/70 block">
                Jumlah PO Open Aktif
              </span>
              <span className="text-lg font-bold font-mono-tabular text-blue-900">
                {activePOs.length} PO
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-blue-900/70 block">
                Total Nilai Laporan
              </span>
              <span className="text-base font-bold font-mono-tabular text-blue-900 truncate block">
                {formattedAmount}
              </span>
            </div>
          </div>

          {/* Recipients List */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Penerima Email (dari Tab EmailRecipients)
              </span>
              <span className="text-[11px] text-slate-400 font-mono-tabular">
                {recipients.length} alamat
              </span>
            </div>
            <div className="max-h-32 overflow-y-auto p-2.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
              {recipients.length === 0 ? (
                <span className="text-slate-400 italic">
                  Belum ada penerima terdaftar untuk site ini di Google Sheets.
                </span>
              ) : (
                recipients.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60"
                  >
                    <span className="font-mono-tabular font-medium text-slate-800">
                      {r.email}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {r.name} {r.role ? `(${r.role})` : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Custom Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Pengantar (Opsional)
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Tambahkan pesan pengantar atau instruksi khusus untuk tim purchasing..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-800 placeholder:text-slate-400 outline-none"
            />
          </div>

          {/* Drive and Email Info */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
            <HardDrive className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              Email HTML &amp; attachment PDF akan dikirimkan otomatis via{' '}
              <strong>Gmail / MailApp</strong>, serta diarsipkan di folder Google Drive{' '}
              <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded">
                PO_Monthly_Reports
              </code>
              .
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isProcessing || recipients.length === 0}
              className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengirim Email &amp; Arsip Drive...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Laporan Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
