import React from 'react';
import { AlertTriangle, Clock, Layers, Wallet } from 'lucide-react';

interface StatBarProps {
  openCount: number;
  totalAmount: number;
  aging14Count: number;
  averageAging: number;
}

export const StatBar: React.FC<StatBarProps> = ({
  openCount,
  totalAmount,
  aging14Count,
  averageAging,
}) => {
  const formattedAmount = 'Rp ' + totalAmount.toLocaleString('id-ID');

  return (
    <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/60 border-b border-slate-200/80">
      {/* Card 1: Total PO Open */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total PO Open
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono-tabular text-slate-900">
              {openCount}
            </span>
            <span className="text-xs text-slate-500">Purchase Orders</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      {/* Card 2: Total Nilai Open */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Nilai Open
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono-tabular text-blue-700">
              {formattedAmount}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Wallet className="w-5 h-5" />
        </div>
      </div>

      {/* Card 3: Aging > 14 Hari */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Aging &gt; 14 Hari
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono-tabular text-amber-600">
              {aging14Count}
            </span>
            <span className="text-xs text-amber-600/80 font-medium">Perlu Follow-up</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* Card 4: Average Aging */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average Aging
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono-tabular text-slate-900">
              {averageAging}
            </span>
            <span className="text-xs text-slate-500">Hari Rata-rata</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
