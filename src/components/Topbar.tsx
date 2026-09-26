import React from 'react';
import { UserSession } from '../types';
import { Building2, LogOut, Radio, Settings2 } from 'lucide-react';

interface TopbarProps {
  session: UserSession;
  lastSyncTime: string;
  isLive: boolean;
  onOpenAppsScriptGuide: () => void;
  onLogout: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  session,
  lastSyncTime,
  isLive,
  onOpenAppsScriptGuide,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs flex items-center justify-between">
      {/* Brand & Site Indicator */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm text-slate-900 tracking-tight">
              PO Open Monthly Report
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
              {session.site_name}
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Apps Script Connection Badge / Button */}
        <button
          onClick={onOpenAppsScriptGuide}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            isLive
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
              : 'bg-amber-50/70 border-amber-200 text-amber-800 hover:bg-amber-100/70'
          }`}
          title="Klik untuk konfigurasi URL Google Apps Script & Integrasi Drive"
        >
          <span className="relative flex h-2 w-2">
            {isLive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isLive ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
          </span>
          <span className="font-mono-tabular font-medium">
            {isLive ? 'Apps Script: Live' : 'Demo Local Storage'}
          </span>
          <Settings2 className="w-3.5 h-3.5 opacity-60 ml-0.5" />
        </button>

        {/* Sync Info */}
        <div className="hidden lg:flex flex-col items-end text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Radio className="w-3 h-3 text-slate-400" /> Terakhir Sinkron
          </span>
          <span className="font-mono-tabular font-semibold text-slate-700">
            {lastSyncTime || '-'}
          </span>
        </div>

        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center uppercase">
            {session.email.charAt(0)}
          </div>
          <span className="text-xs font-medium text-slate-700 max-w-[150px] truncate hidden md:inline">
            {session.email}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200/80 hover:border-red-200 transition-colors"
          title="Keluar dari akun"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
