import React, { useState, useEffect } from 'react';
import { FileText, Filter, Download, Printer } from 'lucide-react';
import { api } from '../services/api';

export default function Reports({ departments = [] }) {
  const [reportType, setReportType] = useState('attendance');
  const [deptFilter, setDeptFilter] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.getReports(reportType, deptFilter);
      if (res.status === 'success') {
        setReportData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, deptFilter]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Reports & Analytics Engine</h2>
          <p className="text-xs text-gray-500 mt-1">Generate comprehensive workforce reports across all modules</p>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer print:hidden"
        >
          <Printer className="w-4 h-4" /> Print / Export PDF
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Report Type:</span>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none text-gray-800 font-semibold"
            >
              <option value="attendance">Attendance Report</option>
              <option value="leave">Leave History Report</option>
              <option value="projects">Projects & Tasks Progress</option>
              <option value="productivity">Productivity Summary</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none text-gray-700"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 capitalize">
            <FileText className="w-5 h-5 text-indigo-600" /> {reportType.replace('_', ' ')} Summary
          </h3>
          <span className="text-xs text-gray-400">{reportData.length} Entries</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Generating report...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase border-b border-gray-100">
                  {reportType === 'attendance' && (
                    <>
                      <th className="py-3.5 px-6">Date</th>
                      <th className="py-3.5 px-6">Employee</th>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6">Check In</th>
                      <th className="py-3.5 px-6">Check Out</th>
                      <th className="py-3.5 px-6">Working Hours</th>
                      <th className="py-3.5 px-6">Status</th>
                    </>
                  )}
                  {reportType === 'leave' && (
                    <>
                      <th className="py-3.5 px-6">Employee</th>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6">Leave Type</th>
                      <th className="py-3.5 px-6">Start Date</th>
                      <th className="py-3.5 px-6">End Date</th>
                      <th className="py-3.5 px-6">Days</th>
                      <th className="py-3.5 px-6">Status</th>
                    </>
                  )}
                  {reportType === 'projects' && (
                    <>
                      <th className="py-3.5 px-6">Project</th>
                      <th className="py-3.5 px-6">Task Title</th>
                      <th className="py-3.5 px-6">Assignee</th>
                      <th className="py-3.5 px-6">Priority</th>
                      <th className="py-3.5 px-6">Due Date</th>
                      <th className="py-3.5 px-6">Status</th>
                    </>
                  )}
                  {reportType === 'productivity' && (
                    <>
                      <th className="py-3.5 px-6">Date</th>
                      <th className="py-3.5 px-6">Employee</th>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6">Active Hours</th>
                      <th className="py-3.5 px-6">Idle Hours</th>
                      <th className="py-3.5 px-6">Score</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    {reportType === 'attendance' && (
                      <>
                        <td className="py-4 px-6 font-medium text-gray-900">{row.date}</td>
                        <td className="py-4 px-6 font-semibold text-gray-900">{row.employee_name}</td>
                        <td className="py-4 px-6 text-gray-500 text-xs">{row.department_name}</td>
                        <td className="py-4 px-6 font-mono text-xs text-emerald-700">{row.check_in || '--:--'}</td>
                        <td className="py-4 px-6 font-mono text-xs text-rose-700">{row.check_out || '--:--'}</td>
                        <td className="py-4 px-6 font-bold text-gray-900">{row.working_hours} hrs</td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">{row.status}</span>
                        </td>
                      </>
                    )}
                    {reportType === 'leave' && (
                      <>
                        <td className="py-4 px-6 font-semibold text-gray-900">{row.employee_name}</td>
                        <td className="py-4 px-6 text-gray-500 text-xs">{row.department_name}</td>
                        <td className="py-4 px-6 font-semibold text-indigo-600">{row.leave_type}</td>
                        <td className="py-4 px-6">{row.start_date}</td>
                        <td className="py-4 px-6">{row.end_date}</td>
                        <td className="py-4 px-6 font-bold">{row.total_days} days</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{row.status}</span>
                        </td>
                      </>
                    )}
                    {reportType === 'projects' && (
                      <>
                        <td className="py-4 px-6 font-bold text-indigo-600">{row.project_name}</td>
                        <td className="py-4 px-6 font-medium text-gray-900">{row.task_title}</td>
                        <td className="py-4 px-6 text-gray-700">{row.assignee_name}</td>
                        <td className="py-4 px-6 font-semibold text-xs">{row.priority}</td>
                        <td className="py-4 px-6 font-mono text-xs">{row.due_date}</td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{row.task_status}</span>
                        </td>
                      </>
                    )}
                    {reportType === 'productivity' && (
                      <>
                        <td className="py-4 px-6 font-medium text-gray-900">{row.date}</td>
                        <td className="py-4 px-6 font-semibold text-gray-900">{row.employee_name}</td>
                        <td className="py-4 px-6 text-gray-500 text-xs">{row.department_name}</td>
                        <td className="py-4 px-6 font-bold text-emerald-600">{row.active_hours} hrs</td>
                        <td className="py-4 px-6 font-bold text-amber-600">{row.idle_hours} hrs</td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">{row.productivity_score}%</span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {reportData.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400 text-sm">No report entries found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
