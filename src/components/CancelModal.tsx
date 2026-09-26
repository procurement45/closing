import React, { useEffect } from 'react';
import { POItem } from '../types';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface CancelModalProps {
  item: POItem | null;
  isOpen: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  item,
  isOpen,
  isProcessing,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
    >
      <div className="w-full max-w-[460px] bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="cancel-dialog-title"
                className="text-base font-bold text-slate-900"
              >
                Batalkan Purchase Order?
              </h3>
              <p className="text-xs text-slate-500">Konfirmasi pembatalan item PO</p>
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

        <div className="text-xs text-slate-600 space-y-2.5 my-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Nomor PO:</span>
            <span className="font-mono-tabular font-bold text-slate-900">
              {item.po_number}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Vendor:</span>
            <span className="font-medium text-slate-800">{item.vendor}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Nilai:</span>
            <span className="font-mono-tabular font-bold text-slate-900">
              Rp {(item.total_amount || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
            PO ini akan ditandai berstatus <strong>Cancelled</strong> di Google Sheets. Anda tetap dapat menampilkannya via toggle filter.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-sm shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Ya, Batalkan PO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
