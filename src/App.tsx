import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppsScriptGuideModal } from './components/AppsScriptGuideModal';
import { CancelModal } from './components/CancelModal';
import { DataTable } from './components/DataTable';
import { LoginPage } from './components/LoginPage';
import { SendReportModal } from './components/SendReportModal';
import { StatBar } from './components/StatBar';
import { Toast } from './components/Toast';
import { Toolbar } from './components/Toolbar';
import { Topbar } from './components/Topbar';
import { api } from './services/api';
import { exportToExcel, exportToPDF } from './services/exportService';
import { EmailRecipient, FeedbackStatus, POItem, ToastMessage, UserSession } from './types';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [poList, setPoList] = useState<POItem[]>([]);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feedbackFilter, setFeedbackFilter] = useState<string>('');
  const [vendorFilter, setVendorFilter] = useState<string>('');

  // Modals
  const [cancelModalItem, setCancelModalItem] = useState<POItem | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const [isSendReportOpen, setIsSendReportOpen] = useState<boolean>(false);
  const [isSendingReport, setIsSendingReport] = useState<boolean>(false);

  const [isAppsScriptGuideOpen, setIsAppsScriptGuideOpen] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(api.isLiveMode());

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'danger' | 'info', text: string) => {
    const id = 'toast_' + Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Format current timestamp
  const getFormattedNow = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Load site data
  const loadData = useCallback(
    async (siteName: string) => {
      setIsLoading(true);
      try {
        const [items, recs] = await Promise.all([
          api.getPOData(siteName, true), // fetch all to manage cancelled toggle client-side
          api.getEmailRecipients(siteName),
        ]);
        setPoList(items);
        setRecipients(recs);
        setLastSyncTime(getFormattedNow());
      } catch (err: any) {
        addToast('danger', err.message || 'Gagal mengambil data dari Google Sheets.');
      } finally {
        setIsLoading(false);
      }
    },
    [addToast]
  );

  // Initial session check
  useEffect(() => {
    const existing = api.getSession();
    if (existing) {
      setSession(existing);
      loadData(existing.site_name);
    }
  }, [loadData]);

  // Login handler
  const handleLogin = async (email: string) => {
    const userSession = await api.login(email);
    setSession(userSession);
    await loadData(userSession.site_name);
    addToast('success', `Selamat datang, ${userSession.email} (${userSession.site_name})`);
    return userSession;
  };

  // Logout handler
  const handleLogout = () => {
    api.logout();
    setSession(null);
    setPoList([]);
    setRecipients([]);
    addToast('info', 'Sesi telah ditutup.');
  };

  // Update feedback handler
  const handleUpdateFeedback = async (
    poNumber: string,
    feedback: FeedbackStatus,
    notes: string
  ) => {
    if (!session) return;
    try {
      const updated = await api.updateFeedback(
        poNumber,
        feedback,
        notes,
        session.email,
        session.site_name
      );
      setPoList((prev) =>
        prev.map((item) => (item.po_number === poNumber ? updated : item))
      );
      setLastSyncTime(getFormattedNow());
      addToast('success', `Tersimpan ✓ (PO #${poNumber})`);
    } catch (err: any) {
      addToast('danger', err.message || 'Gagal disimpan. Coba lagi.');
      throw err;
    }
  };

  // Open Cancel Modal
  const handleOpenCancelModal = (item: POItem) => {
    setCancelModalItem(item);
    setIsCancelModalOpen(true);
  };

  // Confirm Cancel PO
  const handleConfirmCancel = async () => {
    if (!session || !cancelModalItem) return;
    setIsCancelling(true);
    try {
      const updated = await api.cancelPO(
        cancelModalItem.po_number,
        session.email,
        session.site_name
      );
      setPoList((prev) =>
        prev.map((item) => (item.po_number === cancelModalItem.po_number ? { ...updated, feedback: 'Cancel PO', status: 'Cancelled' } : item))
      );
      setLastSyncTime(getFormattedNow());
      addToast('success', `PO #${cancelModalItem.po_number} berhasil dibatalkan.`);
      setIsCancelModalOpen(false);
      setCancelModalItem(null);
    } catch (err: any) {
      addToast('danger', err.message || 'Gagal membatalkan PO. Coba lagi.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Send Report Email
  const handleSendReport = async (customNote: string) => {
    if (!session) return;
    setIsSendingReport(true);
    try {
      const result = await api.sendReportEmail(session.site_name, session.email, customNote);
      addToast('success', result.message || 'Laporan berhasil dikirim ke email tim.');
      setIsSendReportOpen(false);
      setLastSyncTime(getFormattedNow());
    } catch (err: any) {
      addToast('danger', err.message || 'Gagal mengirim laporan.');
    } finally {
      setIsSendingReport(false);
    }
  };

  // Export PDF
  const handleExportPDF = () => {
    if (!session) return;
    exportToPDF(filteredItems, session.site_name);
    addToast('success', 'File PDF berhasil diunduh.');
  };

  // Export Excel
  const handleExportExcel = () => {
    if (!session) return;
    exportToExcel(filteredItems, session.site_name);
    addToast('success', 'File Excel berhasil diunduh.');
  };

  // Manual Refresh
  const handleRefresh = async () => {
    if (!session) return;
    await loadData(session.site_name);
    addToast('success', 'Data berhasil diperbarui dari Spreadsheet.');
  };

  // Calculate StatBar Metrics: Total PO Open, Total Nilai Open, Aging > 14 Hari, Average Aging
  const stats = useMemo(() => {
    const activeOpen = poList.filter((p) => p.status !== 'Cancelled' && p.feedback !== 'Cancel PO');
    const totalAmount = activeOpen.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

    const now = new Date().getTime();
    let aging14 = 0;
    let totalAgingDays = 0;

    activeOpen.forEach((p) => {
      if (p.po_date) {
        const parts = p.po_date.includes('-') ? p.po_date.split('-') : p.po_date.split('/');
        let poDate: Date;
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            poDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          } else {
            poDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
          }
        } else {
          poDate = new Date(p.po_date);
        }
        const diffDays = Math.max(0, Math.floor((now - poDate.getTime()) / (1000 * 3600 * 24)));
        totalAgingDays += diffDays;
        if (diffDays > 14) aging14++;
      }
    });

    const averageAging = activeOpen.length > 0 ? Math.round(totalAgingDays / activeOpen.length) : 0;

    return {
      openCount: activeOpen.length,
      totalAmount,
      aging14Count: aging14,
      averageAging,
    };
  }, [poList]);

  // Unique vendor list for filter dropdown
  const vendors = useMemo(() => {
    const list = Array.from(new Set(poList.map((p) => p.vendor).filter(Boolean)));
    return list.sort((a, b) => a.localeCompare('id'));
  }, [poList]);

  // Filter items for DataTable (Cancelled POs remain visible without filter toggle)
  const filteredItems = useMemo(() => {
    return poList.filter((item) => {
      // Vendor filter
      if (vendorFilter && item.vendor !== vendorFilter) {
        return false;
      }

      // Feedback dropdown filter
      if (feedbackFilter && item.feedback !== feedbackFilter) {
        return false;
      }

      // Search PO / Vendor / Description
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchPONum = item.po_number.toLowerCase().includes(term);
        const matchVendor = item.vendor.toLowerCase().includes(term);
        const matchDesc = item.item_description.toLowerCase().includes(term);
        if (!matchPONum && !matchVendor && !matchDesc) {
          return false;
        }
      }

      return true;
    });
  }, [poList, vendorFilter, feedbackFilter, searchTerm]);

  // Handle URL updated in guide modal
  const handleUrlUpdated = (newUrl: string) => {
    setIsLive(Boolean(newUrl && newUrl.startsWith('http')));
    if (session) {
      loadData(session.site_name);
    }
  };

  const handleResetData = () => {
    api.resetLocalData();
    if (session) {
      loadData(session.site_name);
    }
    addToast('info', 'Demo master data telah direset.');
  };

  // If not logged in, render Login Page
  if (!session) {
    return (
      <>
        <LoginPage
          onLogin={handleLogin}
          onOpenAppsScriptGuide={() => setIsAppsScriptGuideOpen(true)}
          isLive={isLive}
        />
        <AppsScriptGuideModal
          isOpen={isAppsScriptGuideOpen}
          onClose={() => setIsAppsScriptGuideOpen(false)}
          onUrlUpdated={handleUrlUpdated}
          onDataReset={handleResetData}
        />
        <Toast toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col min-w-[1024px] bg-slate-100/60 font-sans-modern">
      {/* 1. TOPBAR (48px) */}
      <Topbar
        session={session}
        lastSyncTime={lastSyncTime}
        isLive={isLive}
        onOpenAppsScriptGuide={() => setIsAppsScriptGuideOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. STAT BAR (KPI Cards: Total PO Open, Total Nilai Open, Aging > 14 Hari, Average Aging) */}
      <StatBar
        openCount={stats.openCount}
        totalAmount={stats.totalAmount}
        aging14Count={stats.aging14Count}
        averageAging={stats.averageAging}
      />

      {/* 3. TOOLBAR */}
      <Toolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        vendorFilter={vendorFilter}
        onVendorFilterChange={setVendorFilter}
        vendors={vendors}
        feedbackFilter={feedbackFilter}
        onFeedbackFilterChange={setFeedbackFilter}
        onSendReport={() => setIsSendReportOpen(true)}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* 4. DATA TABLE (High-density Grid with Pagination) */}
      <main className="flex-1 flex flex-col min-h-0">
        <DataTable
          items={filteredItems}
          isLoading={isLoading}
          onUpdateFeedback={handleUpdateFeedback}
          onOpenCancelModal={handleOpenCancelModal}
        />
      </main>

      {/* Cancel PO Dialog */}
      <CancelModal
        item={cancelModalItem}
        isOpen={isCancelModalOpen}
        isProcessing={isCancelling}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancelModalItem(null);
        }}
        onConfirm={handleConfirmCancel}
      />

      {/* Send Report Dialog */}
      <SendReportModal
        siteName={session.site_name}
        poList={poList}
        recipients={recipients}
        isOpen={isSendReportOpen}
        isProcessing={isSendingReport}
        onClose={() => setIsSendReportOpen(false)}
        onSend={handleSendReport}
      />

      {/* Google Apps Script & Integration Guide Modal */}
      <AppsScriptGuideModal
        isOpen={isAppsScriptGuideOpen}
        onClose={() => setIsAppsScriptGuideOpen(false)}
        onUrlUpdated={handleUrlUpdated}
        onDataReset={handleResetData}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
