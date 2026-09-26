import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCode,
  HardDrive,
  Link as LinkIcon,
  Loader2,
  Mail,
  RefreshCw,
  RotateCcw,
  Settings2,
  Table,
  X,
} from 'lucide-react';

interface AppsScriptGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlUpdated: (url: string) => void;
  onDataReset: () => void;
}

export const AppsScriptGuideModal: React.FC<AppsScriptGuideModalProps> = ({
  isOpen,
  onClose,
  onUrlUpdated,
  onDataReset,
}) => {
  const [url, setUrl] = useState(api.getAppsScriptUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    api.setAppsScriptUrl(url);
    onUrlUpdated(url);
    setTestResult({
      success: true,
      message: url
        ? 'URL Google Apps Script berhasil disimpan!'
        : 'Mode dialihkan ke Demo Local Storage.',
    });
  };

  const handleTestConnection = async () => {
    if (!url) {
      setTestResult({ success: false, message: 'Masukkan URL Web App terlebih dahulu.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${url}?action=ping`, { method: 'GET' });
      const json = await res.json();
      if (json.status === 'ok') {
        setTestResult({
          success: true,
          message: 'Berhasil terhubung ke Google Apps Script Web App! Database, Gmail, dan Drive siap.',
        });
      } else {
        setTestResult({ success: false, message: 'Respon API tidak valid: ' + JSON.stringify(json) });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Koneksi gagal: ' + (err.message || 'Pastikan Web App di-deploy dengan akses "Anyone".'),
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[620px] max-h-[90vh] flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Integrasi Google Apps Script &amp; Workspace
              </h3>
              <p className="text-xs text-slate-500">
                Google Sheets &bull; Gmail API &bull; Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          {/* Web App URL Input Box */}
          <div className="p-4 rounded-2xl border border-blue-200/80 bg-blue-50/30 space-y-3">
            <label className="block font-bold text-slate-900 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-blue-600" />
              URL Google Apps Script Web App (Deployment Exec)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 h-9 px-3 text-xs font-mono-tabular rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-white text-slate-900 outline-none"
              />
              <button
                type="button"
                onClick={handleSave}
                className="px-3.5 h-9 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-3.5 h-9 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Uji</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <X className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              *Jika dikosongkan, aplikasi secara otomatis menggunakan mode <strong>Demo Local Storage</strong> yang sudah dilengkapi master data siap pakai.
            </p>
          </div>

          {/* 4 Steps Guide */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-slate-500" />
              Langkah Cepat Setup di Google Spreadsheet
            </h4>
            <ol className="list-decimal pl-4 space-y-2 text-slate-600 leading-relaxed">
              <li>
                Buka <strong className="text-slate-900">Google Sheets baru</strong> di browser. Buka menu{' '}
                <em className="text-blue-700 font-semibold">Extensions &gt; Apps Script</em>.
              </li>
              <li>
                Salin seluruh kode dari file repositori{' '}
                <code className="bg-slate-100 text-blue-800 px-1 py-0.5 rounded font-mono">
                  apps-script/Code.gs
                </code>{' '}
                ke editor Apps Script.
              </li>
              <li>
                Pilih fungsi <code className="bg-slate-100 font-semibold text-slate-800 px-1 py-0.5 rounded">setupInitialSheets</code> di menu dropdown dan klik <strong>Run</strong> untuk otomatis membuat tab <code>POData</code>, <code>UserMapping</code>, <code>EmailRecipients</code>, dan <code>AuditLog</code>.
              </li>
              <li>
                Klik <strong>Deploy &gt; New deployment &gt; Web app</strong>. Atur <em>Execute as: Me</em> dan <em>Who has access: Anyone</em>. Salin URL Web App dan tempelkan ke kolom input di atas.
              </li>
            </ol>
          </div>

          {/* Feature Architecture Cards */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <Table className="w-4 h-4 text-emerald-600 mb-1" />
              <div className="font-bold text-slate-800 text-[11px]">Google Sheets</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Master data PO &amp; Audit Trail</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <Mail className="w-4 h-4 text-blue-600 mb-1" />
              <div className="font-bold text-slate-800 text-[11px]">Gmail / MailApp</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Email laporan otomatis per site</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <HardDrive className="w-4 h-4 text-indigo-600 mb-1" />
              <div className="font-bold text-slate-800 text-[11px]">Google Drive</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Arsip PDF bulanan terstruktur</div>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block text-xs">Reset Data Uji Coba</span>
              <span className="text-[11px] text-slate-400">
                Kembalikan demo data lokal ke daftar awal PRD.
              </span>
            </div>
            <button
              type="button"
              onClick={onDataReset}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200/80 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
