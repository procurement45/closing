import React, { useState } from 'react';
import { UserSession } from '../types';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Mail,
  Radio,
  Settings2,
  ShieldCheck,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => Promise<UserSession>;
  onOpenAppsScriptGuide: () => void;
  isLive: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onOpenAppsScriptGuide,
  isLive,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Silakan masukkan alamat email Anda.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onLogin(email.trim());
    } catch (err: any) {
      setError(err.message || 'Email tidak terdaftar. Hubungi admin purchasing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Container */}
      <div className="w-full max-w-[440px]">
        {/* Main Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-blue-900/5">
          {/* Header Brand */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                PO Open Monthly Report
              </h1>
              <p className="text-xs text-slate-500">
                Portal Pelaporan &amp; Pemantauan Site
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="email-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Alamat Email Pengguna
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="staffprocurement45@gmail.com"
                  disabled={isLoading}
                  className={`w-full h-11 pl-10 pr-4 text-sm font-mono-tabular rounded-xl border bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                    error
                      ? 'border-rose-400 focus:ring-4 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                  }`}
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-1.5 text-xs font-medium text-rose-600 flex items-center gap-1">
                  <span>{error}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-500 text-center leading-relaxed">
            Akses dibatasi untuk email yang terdaftar di tab <strong>UserMapping</strong>.
          </p>

          {/* Quick Login Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pilih Akun Demo (Whitelist)
              </span>
              <button
                type="button"
                onClick={onOpenAppsScriptGuide}
                className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Settings2 className="w-3 h-3" />
                <span>Apps Script</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('staffprocurement45@gmail.com')}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 text-left flex items-center justify-between text-xs transition-colors group"
              >
                <div>
                  <div className="font-semibold text-slate-800 group-hover:text-blue-700">
                    staffprocurement45@gmail.com
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Site Balikpapan (Pengguna Utama)
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-700 font-semibold">
                  BPN
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('site.samarinda@company.com')}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 text-left flex items-center justify-between text-xs transition-colors group"
              >
                <div>
                  <div className="font-semibold text-slate-800 group-hover:text-blue-700">
                    site.samarinda@company.com
                  </div>
                  <span className="text-[11px] text-slate-500">Site Samarinda</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                  SMD
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('site.sorong@company.com')}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 text-left flex items-center justify-between text-xs transition-colors group"
              >
                <div>
                  <div className="font-semibold text-slate-800 group-hover:text-blue-700">
                    site.sorong@company.com
                  </div>
                  <span className="text-[11px] text-slate-500">Site Sorong</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                  SRG
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span
            className={`w-2 h-2 rounded-full ${
              isLive ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span>
            {isLive ? 'Google Apps Script: Terhubung Live' : 'Mode: Demo Local Storage'}
          </span>
        </div>
      </div>
    </div>
  );
};
