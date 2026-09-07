import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle2, XCircle, Clock, AlertCircle, X } from 'lucide-react';
import { api } from '../services/api';

export default function LeaveManager({ user, showToast }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'Casual',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const empId = user?.role === 'employee' ? user.employee_id : null;
      const res = await api.getLeaves(empId);
      if (res.status === 'success') {
        setLeaves(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      showToast('Please provide a reason for the leave.', 'error');
      return;
    }

    try {
      const nameParts = (user?.full_name || user?.username || 'Usha').trim().split(' ');
      await api.applyLeave({
        employee_id: user?.employee_id || user?.id || Date.now(),
        first_name: nameParts[0] || 'Usha',
        last_name: nameParts.slice(1).join(' ') || '',
        user_name: user?.full_name || user?.username || 'Usha',
        ...formData,
      });
      showToast('Leave request submitted successfully!');
      setIsModalOpen(false);
      setFormData({
        leave_type: 'Casual',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: '',
      });
      fetchLeaves();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateLeaveStatus(id, status, user?.full_name || 'Admin/HR');
      showToast(`Leave request ${status.toLowerCase()} successfully.`);
      fetchLeaves();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const displayedLeaves = leaves.filter(l => {
    if (user?.role === 'employee') {
      const myId = String(user?.employee_id || user?.id || '');
      const myName = (user?.full_name || user?.username || '').toLowerCase();
      const first = (l.first_name || '').toLowerCase();
      const full = `${l.first_name || ''} ${l.last_name || ''}`.toLowerCase();
      if (myId && String(l.employee_id) === myId) return true;
      if (myName && (full.includes(myName) || myName.includes(first))) return true;
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Leave Management</h2>
          <p className="text-xs text-gray-500 mt-1">Submit leave applications and manage approval workflows</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Apply For Leave
        </button>
      </div>

      {/* Leaves List Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" /> Leave Applications
          </h3>
          <span className="text-xs text-gray-400">{leaves.length} Applications</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading leave records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase border-b border-gray-100">
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Leave Type</th>
                  <th className="py-3.5 px-6">Start Date</th>
                  <th className="py-3.5 px-6">End Date</th>
                  <th className="py-3.5 px-6">Total Days</th>
                  <th className="py-3.5 px-6">Reason</th>
                  <th className="py-3.5 px-6">Status</th>
                  {canApprove && <th className="py-3.5 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {displayedLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-900">
                      {l.first_name} {l.last_name}
                      <span className="block text-xs font-mono font-normal text-indigo-600">{l.employee_code}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {l.leave_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">{l.start_date}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">{l.end_date}</td>
                    <td className="py-4 px-6 font-bold text-gray-900 text-xs">{l.total_days} days</td>
                    <td className="py-4 px-6 text-gray-600 text-xs max-w-xs truncate">{l.reason}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                        l.status === 'Rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    {canApprove && (
                      <td className="py-4 px-6 text-right">
                        {l.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStatus(l.id, 'Approved')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(l.id, 'Rejected')}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">By {l.approved_by || 'HR'}</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-400 text-sm">
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Apply For Leave</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Leave Type</label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Paid">Paid Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Reason</label>
                <textarea
                  rows="3"
                  required
                  placeholder="State the reason for leave request..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
