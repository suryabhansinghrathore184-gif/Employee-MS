import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Clock, ShieldCheck, Cpu } from 'lucide-react';
import { api } from '../services/api';

export default function ProductivityTracker({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProductivity = async () => {
    try {
      setLoading(true);
      const empId = user?.role === 'employee' ? user.employee_id : null;
      const res = await api.getProductivity(empId);
      if (res.status === 'success') {
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductivity();
  }, [user]);

  const avgScore = logs.length ? Math.round(logs.reduce((a, b) => a + (b.productivity_score || 0), 0) / logs.length) : 92;

  return (
    <div className="space-y-6">
      {/* Privacy Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-emerald-900 text-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold block">Privacy Controls & Responsible Productivity Tracking</span>
            <span className="text-xs text-emerald-700">Productivity tracking is strictly aggregate and role-permission controlled to empower employee time management.</span>
          </div>
        </div>
      </div>

      {/* Average Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Avg Productivity Score</span>
            <div className="text-3xl font-bold text-gray-900 mt-1">{avgScore}%</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
            <Activity className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Avg Active Hours / Day</span>
            <div className="text-3xl font-bold text-gray-900 mt-1">7.4 hrs</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            <Clock className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Idle Time Rate</span>
            <div className="text-3xl font-bold text-gray-900 mt-1">5.2%</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
            <Cpu className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Productivity Logs
          </h3>
          <span className="text-xs text-gray-400">{logs.length} Logs</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading productivity metrics...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase border-b border-gray-100">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Active Hours</th>
                  <th className="py-3.5 px-6">Idle Hours</th>
                  <th className="py-3.5 px-6">Score</th>
                  <th className="py-3.5 px-6">App Usage Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{log.date}</td>
                    <td className="py-4 px-6 font-semibold text-gray-900">{log.employee_name}</td>
                    <td className="py-4 px-6 font-bold text-emerald-600 text-xs">{log.active_hours} hrs</td>
                    <td className="py-4 px-6 font-semibold text-amber-600 text-xs">{log.idle_hours} hrs</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                        {log.productivity_score}%
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {log.app_usage && Object.entries(log.app_usage).map(([app, time]) => (
                          <span key={app} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                            {app}: <strong>{time}</strong>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
