import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, Filter, UserX, Plus, Search, Calendar, CheckCircle2, AlertCircle, X, Check } from 'lucide-react';
import { api } from '../services/api';

export default function AttendanceManager({ user, showToast, initialStatusFilter = 'All' }) {
  const [allRecords, setAllRecords] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters state
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Mark Modal state
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [markEmployeeId, setMarkEmployeeId] = useState('');
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markStatus, setMarkStatus] = useState('Late');
  const [markNotes, setMarkNotes] = useState('');
  const [submittingMark, setSubmittingMark] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const empId = user?.role === 'employee' ? user.employee_id : null;
      // Fetch all logs without status restriction so tab badge counts remain accurate
      const res = await api.getAttendance(empId, null, dateFilter || null);
      if (res.status === 'success') {
        setAllRecords(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.getEmployees();
      if (res.status === 'success') {
        setEmployeesList(res.data);
        if (res.data.length > 0 && !markEmployeeId) {
          setMarkEmployeeId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user, dateFilter]);

  useEffect(() => {
    if (['admin', 'hr', 'manager'].includes(user?.role)) {
      fetchEmployees();
    }
  }, [user]);

  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // Today's attendance status for current logged-in user
  const todayStr = new Date().toISOString().split('T')[0];
  const myEmpId = Number(user?.employee_id || 1);
  const myTodayRecord = allRecords.find(r => Number(r.employee_id) === myEmpId && r.date === todayStr);

  const isCheckedIn = !!myTodayRecord && !!myTodayRecord.check_in && !myTodayRecord.check_out;
  const isShiftCompleted = !!myTodayRecord && !!myTodayRecord.check_in && !!myTodayRecord.check_out;

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const res = await api.checkIn(user?.employee_id || 1);
      showToast(res.message);
      fetchAttendance();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const res = await api.checkOut(user?.employee_id || 1);
      showToast(res.message);
      fetchAttendance();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    if (!markEmployeeId) {
      showToast('Please select an employee.', 'error');
      return;
    }
    try {
      setSubmittingMark(true);
      const res = await api.markAbsent(markEmployeeId, markDate, markNotes, markStatus);
      showToast(res.message || `Employee recorded as ${markStatus}`);
      setIsMarkModalOpen(false);
      setMarkNotes('');
      fetchAttendance();
    } catch (err) {
      showToast(err.message || 'Failed to update attendance', 'error');
    } finally {
      setSubmittingMark(false);
    }
  };

  // Calculate accurate badge counts from entire dataset
  const totalCount = allRecords.length;
  const presentCount = allRecords.filter(r => r.status === 'Present').length;
  const absentCount = allRecords.filter(r => r.status === 'Absent').length;
  const lateCount = allRecords.filter(r => r.status === 'Late').length;
  const halfDayCount = allRecords.filter(r => r.status === 'Half Day').length;

  // Filter records locally by active status tab & search term
  const displayedRecords = allRecords.filter(r => {
    if (user?.role === 'employee' && String(r.employee_id) !== String(user?.employee_id || 1)) {
      return false;
    }
    const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;
    const fullName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
    const code = (r.employee_code || '').toLowerCase();
    const dept = (r.department_name || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(q) || code.includes(q) || dept.includes(q);
    return matchesStatus && matchesSearch;
  });

  const canManage = ['admin', 'hr', 'manager'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Header & Check-In Widget */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Attendance Management</h2>
          <p className="text-sm text-slate-300 mt-1">
            Logged in as <strong className="text-blue-400 capitalize">{user?.full_name} ({user?.role})</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {canManage && (
            <button
              onClick={() => { setMarkStatus('Absent'); setIsMarkModalOpen(true); }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserX className="w-4 h-4" /> + Mark Employee Absent
            </button>
          )}

          {canManage && (
            <button
              onClick={() => { setMarkStatus('Late'); setIsMarkModalOpen(true); }}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-4 h-4" /> + Record Late Arrival
            </button>
          )}

          {!isCheckedIn && !isShiftCompleted && (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" /> Check In Now
            </button>
          )}

          {isCheckedIn && (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Square className="w-4 h-4 fill-white" /> Check Out
            </button>
          )}

          {isShiftCompleted && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-2xl text-xs font-bold">
              <Check className="w-4 h-4 text-emerald-400" /> Shift Completed Today ({myTodayRecord.working_hours} hrs)
            </div>
          )}
        </div>
      </div>

      {/* Control Toolbar & Status Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold flex-wrap">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Logs ({totalCount})
          </button>

          <button
            onClick={() => setStatusFilter('Present')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'Present'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${statusFilter === 'Present' ? 'bg-white' : 'bg-emerald-500'} inline-block`} />
            Present ({presentCount})
          </button>

          <button
            onClick={() => setStatusFilter('Absent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'Absent'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${statusFilter === 'Absent' ? 'bg-white' : 'bg-rose-500'} inline-block`} />
            Absent ({absentCount})
          </button>

          <button
            onClick={() => setStatusFilter('Late')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'Late'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${statusFilter === 'Late' ? 'bg-white' : 'bg-amber-500'} inline-block`} />
            Late ({lateCount})
          </button>
        </div>

        {/* Search & Date Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-700 text-xs"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> Attendance Log ({displayedRecords.length} Shown)
          </h3>
          <span className="text-xs font-semibold text-slate-400">Total {allRecords.length} Records</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading attendance records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Check In</th>
                  <th className="py-3.5 px-6">Check Out</th>
                  <th className="py-3.5 px-6">Working Hours</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {displayedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">{rec.date}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {rec.first_name} {rec.last_name}
                      <span className="block text-xs font-mono font-normal text-blue-600">{rec.employee_code}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">{rec.department_name || 'N/A'}</td>
                    <td className="py-4 px-6 font-mono text-xs text-emerald-700 font-semibold">{rec.check_in || '--:--'}</td>
                    <td className="py-4 px-6 font-mono text-xs text-rose-700 font-semibold">{rec.check_out || '--:--'}</td>
                    <td className="py-4 px-6 font-bold text-slate-900 text-xs">{rec.working_hours || rec.work_hours || (rec.check_in && rec.check_out ? '9.00' : '0.00')} hrs</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        rec.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rec.status === 'Absent'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 max-w-[200px] truncate">
                      {rec.notes || '--'}
                    </td>
                  </tr>
                ))}
                {displayedRecords.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400 text-sm">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-amber-500" />
                        <span>No attendance records found under status <strong>"{statusFilter}"</strong>.</span>
                        {canManage && (
                          <button
                            onClick={() => { setMarkStatus(statusFilter !== 'All' ? statusFilter : 'Late'); setIsMarkModalOpen(true); }}
                            className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            + Record Employee as {statusFilter !== 'All' ? statusFilter : 'Late'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Employee Attendance Modal */}
      {isMarkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Record Employee Attendance</h3>
              </div>
              <button
                onClick={() => setIsMarkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMarkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Employee</label>
                <select
                  value={markEmployeeId}
                  onChange={(e) => setMarkEmployeeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                >
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_code}) - {emp.department_name || 'Dept'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={markStatus}
                    onChange={(e) => setMarkStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                    <option value="Present">Present</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={markDate}
                    onChange={(e) => setMarkDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Notes</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Arrived 30 mins late due to traffic, unannounced absence..."
                  value={markNotes}
                  onChange={(e) => setMarkNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMarkModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMark}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingMark ? 'Saving...' : `Save Record as ${markStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
