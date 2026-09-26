import React from 'react';
import {
  Building,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Send,
  X,
} from 'lucide-react';

interface ToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  feedbackFilter: string;
  onFeedbackFilterChange: (value: string) => void;
  vendorFilter: string;
  onVendorFilterChange: (value: string) => void;
  vendors: string[];
  onSendReport: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  searchTerm,
  onSearchChange,
  feedbackFilter,
  onFeedbackFilterChange,
  vendorFilter,
  onVendorFilterChange,
  vendors,
  onSendReport,
  onExportPDF,
  onExportExcel,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="px-6 py-3.5 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
      {/* Left Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative w-56">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari No. PO, Vendor, Item..."
            className="w-full h-9 pl-9 pr-8 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-800 placeholder:text-slate-400 transition-all outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Vendor Filter Dropdown */}
        <div className="relative flex items-center">
          <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <select
            value={vendorFilter}
            onChange={(e) => onVendorFilterChange(e.target.value)}
            aria-label="Filter Vendor"
            className="h-9 pl-8 pr-8 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-700 cursor-pointer transition-all outline-none max-w-[200px] truncate"
          >
            <option value="">Semua Vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>
        </div>

        {/* Feedback Status Dropdown */}
        <div className="relative flex items-center">
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <select
            value={feedbackFilter}
            onChange={(e) => onFeedbackFilterChange(e.target.value)}
            aria-label="Filter status Feedback"
            className="h-9 pl-8 pr-8 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-700 cursor-pointer transition-all outline-none"
          >
            <option value="">Semua Feedback</option>
            <option value="Belum Datang">Belum Datang</option>
            <option value="Proses Pengiriman">Proses Pengiriman</option>
            <option value="Proses Retur">Proses Retur</option>
            <option value="Menunggu Konfirmasi Vendor">Menunggu Konfirmasi Vendor</option>
            <option value="Cancel PO">Cancel PO</option>
          </select>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
          title="Sinkronkan data dari Google Sheets"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Export PDF */}
        <button
          onClick={onExportPDF}
          className="h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
          title="Unduh laporan dalam format PDF"
        >
          <FileText className="w-3.5 h-3.5 text-rose-600" />
          <span>PDF</span>
        </button>

        {/* Export Excel */}
        <button
          onClick={onExportExcel}
          className="h-9 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
          title="Unduh laporan dalam format Excel (.xlsx)"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Excel</span>
        </button>

        {/* Send Report Primary Button */}
        <button
          onClick={onSendReport}
          className="h-9 px-4 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Kirim Laporan</span>
        </button>
      </div>
    </div>
  );
};
