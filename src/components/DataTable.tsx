import React, { useState } from 'react';
import { FeedbackStatus, POItem } from '../types';
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Inbox,
  Loader2,
  X,
} from 'lucide-react';

interface DataTableProps {
  items: POItem[];
  isLoading: boolean;
  onUpdateFeedback: (poNumber: string, feedback: FeedbackStatus, notes: string) => Promise<void>;
  onOpenCancelModal: (item: POItem) => void;
}

interface RowState {
  saving: boolean;
  saved: boolean;
  error: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  items,
  isLoading,
  onUpdateFeedback,
  onOpenCancelModal,
}) => {
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  // Pagination state (25 rows/page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;
  const totalPages = Math.ceil(items.length / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = items.slice(startIndex, startIndex + pageSize);

  const getAgingDays = (dateStr: string): number => {
    if (!dateStr) return 0;
    try {
      const parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
      let poDate: Date;
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          poDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else {
          poDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
      } else {
        poDate = new Date(dateStr);
      }
      const now = new Date();
      const diffMs = now.getTime() - poDate.getTime();
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const handleFeedbackChange = async (po: POItem, newFeedback: FeedbackStatus) => {
    if (newFeedback === 'Cancel PO') {
      if (po.status !== 'Cancelled' && po.feedback !== 'Cancel PO') {
        onOpenCancelModal(po);
        return;
      }
    }

    const currentNote = editingNotes[po.po_number] !== undefined ? editingNotes[po.po_number] : po.notes;

    setRowStates((prev) => ({
      ...prev,
      [po.po_number]: { saving: true, saved: false, error: false },
    }));

    try {
      await onUpdateFeedback(po.po_number, newFeedback, currentNote);
      setRowStates((prev) => ({
        ...prev,
        [po.po_number]: { saving: false, saved: true, error: false },
      }));

      setTimeout(() => {
        setRowStates((prev) => ({
          ...prev,
          [po.po_number]: { ...prev[po.po_number], saved: false },
        }));
      }, 2000);
    } catch {
      setRowStates((prev) => ({
        ...prev,
        [po.po_number]: { saving: false, saved: false, error: true },
      }));
    }
  };

  const handleNotesBlur = async (po: POItem) => {
    const newNote = editingNotes[po.po_number];
    if (newNote === undefined || newNote === po.notes) return;

    setRowStates((prev) => ({
      ...prev,
      [po.po_number]: { saving: true, saved: false, error: false },
    }));

    try {
      await onUpdateFeedback(po.po_number, po.feedback, newNote);
      setRowStates((prev) => ({
        ...prev,
        [po.po_number]: { saving: false, saved: true, error: false },
      }));

      setTimeout(() => {
        setRowStates((prev) => ({
          ...prev,
          [po.po_number]: { ...prev[po.po_number], saved: false },
        }));
      }, 2000);
    } catch {
      setRowStates((prev) => ({
        ...prev,
        [po.po_number]: { saving: false, saved: false, error: true },
      }));
    }
  };

  return (
    <div className="p-6 flex-1 flex flex-col min-h-0 bg-slate-50/50">
      {/* Modern Card Container */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Scrollable Table Area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[950px]">
            {/* Header */}
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200">
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th scope="col" className="w-[45px] px-3.5 py-3 text-center">#</th>
                <th scope="col" className="w-[120px] px-3.5 py-3">Site</th>
                <th scope="col" className="w-[150px] px-3.5 py-3 font-mono-tabular">No. PO</th>
                <th scope="col" className="w-[110px] px-3.5 py-3">Tgl PO</th>
                <th scope="col" className="w-[170px] px-3.5 py-3">Vendor</th>
                <th scope="col" className="w-[240px] px-3.5 py-3">Deskripsi Item</th>
                <th scope="col" className="w-[140px] px-3.5 py-3 text-right font-mono-tabular">Total Nilai</th>
                <th scope="col" className="w-[210px] px-3.5 py-3">Status Feedback</th>
                <th scope="col" className="w-[220px] px-3.5 py-3">Catatan Tambahan</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-sm font-medium">Memuat data Purchase Order...</span>
                      <span className="text-xs text-slate-400">Menyinkronkan dengan Google Sheets</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-8 h-8 text-slate-300" />
                      <span className="text-sm font-semibold text-slate-700">Tidak ada PO yang ditemukan</span>
                      <span className="text-xs text-slate-400">
                        Coba sesuaikan kata kunci pencarian atau reset filter.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((po, idx) => {
                  const globalIdx = startIndex + idx + 1;
                  const isCancelled = po.status === 'Cancelled' || po.feedback === 'Cancel PO';
                  const agingDays = getAgingDays(po.po_date);
                  const isAging60 = !isCancelled && agingDays > 60;
                  const isAging30 = !isCancelled && agingDays > 30 && agingDays <= 60;

                  const rowState = rowStates[po.po_number] || {
                    saving: false,
                    saved: false,
                    error: false,
                  };

                  const noteValue =
                    editingNotes[po.po_number] !== undefined
                      ? editingNotes[po.po_number]
                      : po.notes || '';

                  return (
                    <tr
                      key={po.id || po.po_number}
                      className={`group transition-colors ${
                        isCancelled
                          ? 'bg-slate-50/70 text-slate-400'
                          : isAging60
                          ? 'bg-rose-50/30 hover:bg-rose-50/50'
                          : isAging30
                          ? 'bg-amber-50/30 hover:bg-amber-50/50'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Index */}
                      <td className="px-3.5 py-2.5 text-center font-mono-tabular text-slate-400 text-xs">
                        {globalIdx}
                      </td>

                      {/* Site */}
                      <td className="px-3.5 py-2.5 font-medium text-slate-700">
                        {po.site_name}
                      </td>

                      {/* No. PO */}
                      <td className="px-3.5 py-2.5 font-mono-tabular">
                        <a
                          href={`https://bis.kanosolution.app/bagong/scm/PurchaseOrder?id=${encodeURIComponent(po.po_number)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 font-semibold hover:underline group/link ${
                            isCancelled
                              ? 'line-through text-slate-400 hover:text-slate-600'
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                          title={`Buka detail PO ${po.po_number} di BIS Kanosolution`}
                        >
                          <span>{po.po_number}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                        </a>
                      </td>

                      {/* Tgl PO + Aging Badge */}
                      <td className="px-3.5 py-2.5">
                        <div className="font-mono-tabular text-slate-600">
                          {po.po_date}
                        </div>
                        {!isCancelled && agingDays > 30 && (
                          <div className="mt-0.5">
                            {isAging60 ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                <AlertCircle className="w-2.5 h-2.5" />
                                {agingDays} hari
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-2.5 h-2.5" />
                                {agingDays} hari
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Vendor */}
                      <td className="px-3.5 py-2.5 font-medium text-slate-800 max-w-[170px] truncate" title={po.vendor}>
                        {po.vendor}
                      </td>

                      {/* Description */}
                      <td className="px-3.5 py-2.5 text-slate-600 max-w-[240px] truncate" title={po.item_description}>
                        {po.item_description}
                      </td>

                      {/* Total Amount */}
                      <td className="px-3.5 py-2.5 text-right font-mono-tabular font-bold text-slate-900">
                        Rp {(po.total_amount || 0).toLocaleString('id-ID')}
                      </td>

                      {/* Feedback Selector */}
                      <td className="px-3.5 py-2">
                        <div className="relative flex items-center">
                          <select
                            value={po.feedback || (isCancelled ? 'Cancel PO' : '')}
                            disabled={rowState.saving}
                            onChange={(e) =>
                              handleFeedbackChange(po, e.target.value as FeedbackStatus)
                            }
                            aria-label={`Feedback status untuk PO ${po.po_number}`}
                            className={`w-full h-8 pl-2.5 pr-7 text-xs font-medium rounded-lg border appearance-none cursor-pointer outline-none transition-all ${
                              (!po.feedback && !isCancelled)
                                ? 'bg-slate-50 text-slate-500 border-slate-200'
                                : (po.feedback === 'Cancel PO' || isCancelled)
                                ? 'bg-rose-50/80 text-rose-700 border-rose-200 font-semibold'
                                : po.feedback === 'Proses Pengiriman'
                                ? 'bg-blue-50/80 text-blue-700 border-blue-200 font-semibold'
                                : po.feedback === 'Proses Retur'
                                ? 'bg-amber-50/80 text-amber-700 border-amber-200 font-semibold'
                                : po.feedback === 'Menunggu Konfirmasi Vendor'
                                ? 'bg-purple-50/80 text-purple-700 border-purple-200 font-semibold'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            } focus:ring-2 focus:ring-blue-500/20`}
                          >
                            <option value="">Belum ada feedback</option>
                            <option value="Belum Datang">Belum Datang</option>
                            <option value="Proses Pengiriman">Proses Pengiriman</option>
                            <option value="Proses Retur">Proses Retur</option>
                            <option value="Menunggu Konfirmasi Vendor">
                              Menunggu Konfirmasi Vendor
                            </option>
                            <option value="Cancel PO" className="text-rose-600 font-semibold">
                              Cancel PO
                            </option>
                          </select>

                          {/* State indicators */}
                          {rowState.saving && (
                            <span className="absolute right-2 pointer-events-none text-blue-600">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            </span>
                          )}
                          {rowState.saved && (
                            <span
                              className="absolute right-2 pointer-events-none text-emerald-600 font-bold"
                              title="Tersimpan ✓"
                            >
                              <Check className="w-4 h-4" />
                            </span>
                          )}
                          {rowState.error && (
                            <span
                              className="absolute right-2 pointer-events-none text-rose-600 font-bold"
                              title="Gagal disimpan"
                            >
                              <X className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Notes Input */}
                      <td className="px-3.5 py-2">
                        <input
                          type="text"
                          maxLength={200}
                          value={noteValue}
                          placeholder="Ketik catatan..."
                          disabled={rowState.saving}
                          onChange={(e) =>
                            setEditingNotes((prev) => ({
                              ...prev,
                              [po.po_number]: e.target.value,
                            }))
                          }
                          onBlur={() => handleNotesBlur(po)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="w-full h-8 px-2.5 text-xs rounded-lg border border-transparent hover:border-slate-200 focus:border-blue-400 focus:bg-white bg-slate-50/50 hover:bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none transition-all truncate"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modern Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Menampilkan{' '}
              <strong className="text-slate-800 font-mono-tabular font-semibold">
                {startIndex + 1}–{Math.min(startIndex + pageSize, items.length)}
              </strong>{' '}
              dari{' '}
              <strong className="text-slate-800 font-mono-tabular font-semibold">
                {items.length}
              </strong>{' '}
              PO
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-mono-tabular font-semibold text-xs transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
