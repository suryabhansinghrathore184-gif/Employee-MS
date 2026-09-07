import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, change = '+5%', changeType = 'positive', compareText = 'vs last month', color = 'blue', onClick }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  const isPositive = changeType === 'positive';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs transition-all ${
        onClick ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer hover:border-slate-300' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>

        <div className="flex items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${
            isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
          <span className="text-slate-400 text-[11px] font-medium">{compareText}</span>
        </div>
      </div>
    </div>
  );
}
