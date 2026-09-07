import React from 'react';
import { BarChart2, PieChart, TrendingUp } from 'lucide-react';

export function AttendanceBarChart() {
  const [filterMode, setFilterMode] = React.useState('all'); // 'all', 'present', 'absent'

  const days = [
    { day: 'Mon', present: 94, absent: 6, totalCount: 50 },
    { day: 'Tue', present: 98, absent: 2, totalCount: 50 },
    { day: 'Wed', present: 92, absent: 8, totalCount: 50 },
    { day: 'Thu', present: 96, absent: 4, totalCount: 50 },
    { day: 'Fri', present: 90, absent: 10, totalCount: 50 },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" /> Weekly Attendance Overview
          </h3>
          <p className="text-xs text-slate-400">
            {filterMode === 'absent'
              ? 'Displaying daily Absenteeism rates across all departments'
              : filterMode === 'present'
              ? 'Displaying daily Present attendance rates'
              : 'Present vs Absent rate for the current week'}
          </p>
        </div>
        
        {/* Interactive Present / Absent Legend Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterMode('present')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === 'present'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${filterMode === 'present' ? 'bg-white' : 'bg-blue-600'} inline-block`} />
            Present
          </button>
          <button
            onClick={() => setFilterMode('absent')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filterMode === 'absent'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${filterMode === 'absent' ? 'bg-white' : 'bg-rose-500'} inline-block`} />
            Absent
          </button>
        </div>
      </div>

      <div className="h-52 flex items-end justify-between gap-4 pt-6 px-2">
        {days.map((item) => {
          const isAbsentOnly = filterMode === 'absent';
          const isPresentOnly = filterMode === 'present';
          const heightPct = isAbsentOnly ? item.absent * 5 : isPresentOnly ? item.present : item.present;
          const displayPct = isAbsentOnly ? `${item.absent}%` : `${item.present}%`;

          return (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
              {/* Tooltip on Hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10">
                {item.day}: {item.present}% Present ({item.absent}% Absent)
              </div>

              {/* Value Badge on top */}
              <span className={`text-[11px] font-bold ${
                isAbsentOnly ? 'text-rose-600' : isPresentOnly ? 'text-blue-600' : 'text-slate-600'
              }`}>
                {displayPct}
              </span>

              {/* Bar */}
              <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full relative">
                {isAbsentOnly ? (
                  <div
                    className="w-full bg-rose-500 group-hover:bg-rose-600 transition-all rounded-t-xl"
                    style={{ height: `${Math.max(heightPct, 15)}%` }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col justify-end">
                    <div
                      className="w-full bg-rose-200 transition-all"
                      style={{ height: `${item.absent}%` }}
                    />
                    <div
                      className="w-full bg-blue-600 group-hover:bg-blue-700 transition-all rounded-t-xl"
                      style={{ height: `${item.present}%` }}
                    />
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-600">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DepartmentDonutChart({ departments = [] }) {
  const deptData = departments.length ? departments : [
    { name: 'Engineering', count: 45, color: 'bg-blue-600' },
    { name: 'HR', count: 15, color: 'bg-indigo-500' },
    { name: 'Marketing', count: 25, color: 'bg-emerald-500' },
    { name: 'Finance', count: 15, color: 'bg-amber-500' },
  ];

  const total = deptData.reduce((acc, d) => acc + (d.employee_count || d.count || 1), 0);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" /> Department Distribution
          </h3>
          <p className="text-xs text-slate-400">Headcount breakdown across departments</p>
        </div>
      </div>

      <div className="space-y-4">
        {deptData.map((d, i) => {
          const count = d.employee_count || d.count || 1;
          const pct = Math.round((count / total) * 100);
          const colors = ['bg-blue-600', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500'];
          const color = colors[i % colors.length];

          return (
            <div key={d.id || d.name} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">{d.name}</span>
                <span className="text-slate-900 font-bold">{count} ({pct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProductivityTrendChart() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Productivity Trend
          </h3>
          <p className="text-xs text-slate-400">Monthly active hours vs task output score</p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
          +4.2% Growth
        </span>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-400 uppercase font-semibold block">Average Score</span>
          <span className="text-xl font-bold text-slate-900">94.8 / 100</span>
        </div>
        <div>
          <span className="text-slate-400 uppercase font-semibold block">Active Hours Logged</span>
          <span className="text-xl font-bold text-blue-600">1,420 hrs</span>
        </div>
        <div>
          <span className="text-slate-400 uppercase font-semibold block">Efficiency</span>
          <span className="text-xl font-bold text-emerald-600">Optimal</span>
        </div>
      </div>
    </div>
  );
}
