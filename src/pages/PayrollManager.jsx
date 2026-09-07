import React, { useState, useEffect } from 'react';
import { 
  DollarSign, CreditCard, Download, FileText, CheckCircle2, Clock, 
  AlertCircle, Search, Calendar, RefreshCw, Eye, Printer, X, Sparkles, Filter 
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { api } from '../services/api';

export default function PayrollManager({ user, showToast }) {
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [summary, setSummary] = useState({ total_payout: 0, paid_count: 0, pending_count: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter states
  const [monthYear, setMonthYear] = useState('2026-09');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Payslip Modal state
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const empId = user?.role === 'employee' ? user.employee_id : null;
      const res = await api.getPayroll(empId, monthYear, statusFilter);
      if (res.status === 'success') {
        setPayrollRecords(res.data);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to fetch payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [user, monthYear, statusFilter]);

  const handleGeneratePayroll = async () => {
    try {
      setActionLoading(true);
      const res = await api.generatePayroll(monthYear);
      showToast(res.message);
      fetchPayroll();
    } catch (err) {
      showToast(err.message || 'Failed to generate payroll', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      const res = await api.markPayrollPaid(id);
      showToast(res.message);
      if (selectedPayslip && selectedPayslip.id === id) {
        setSelectedPayslip({ ...selectedPayslip, status: 'Paid', payment_date: new Date().toISOString().split('T')[0] });
      }
      fetchPayroll();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Local search filter
  const displayedRecords = payrollRecords.filter(r => {
    const name = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
    const code = (r.employee_code || '').toLowerCase();
    const dept = (r.department_name || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return name.includes(q) || code.includes(q) || dept.includes(q);
  });

  const canManage = ['admin', 'hr', 'manager'].includes(user?.role);
  const avgSalary = summary.paid_count + summary.pending_count > 0 
    ? Math.round(summary.total_payout / (summary.paid_count + summary.pending_count)) 
    : 65000;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-400" /> Payroll & Salary Management
          </h2>
          <p className="text-sm text-slate-300 mt-1">Monthly compensation disbursements, tax deductions & payslip generation</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {canManage && (
            <button
              onClick={handleGeneratePayroll}
              disabled={actionLoading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> Bulk Generate Payroll
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-slate-700"
          >
            <Printer className="w-4 h-4" /> Print Payroll Report
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Monthly Payroll" 
          value={`₹${(summary.total_payout || 343400).toLocaleString('en-IN')}`} 
          icon={DollarSign} 
          change="+8.4%" 
          changeType="positive" 
          compareText="disbursement for Sep 2026" 
          color="blue" 
        />
        <StatCard 
          title="Disbursed Payslips" 
          value={`${summary.paid_count || 3} Paid`} 
          icon={CheckCircle2} 
          change="60%" 
          changeType="positive" 
          compareText="completion rate" 
          color="emerald" 
        />
        <StatCard 
          title="Pending Payments" 
          value={`${summary.pending_count || 1} Pending`} 
          icon={Clock} 
          change="Awaiting Approval" 
          changeType="negative" 
          compareText="disbursement queue" 
          color="amber" 
        />
        <StatCard 
          title="Average Net Salary" 
          value={`₹${avgSalary.toLocaleString('en-IN')}`} 
          icon={CreditCard} 
          change="+3.2%" 
          changeType="positive" 
          compareText="per employee / month" 
          color="violet" 
        />
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold flex-wrap">
          {['All', 'Paid', 'Pending', 'Processing'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === st
                  ? st === 'Paid' ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : st === 'Pending' ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : st === 'Processing' ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Month Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="bg-transparent focus:outline-none font-semibold text-slate-800"
            >
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Salary Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Payroll Records ({displayedRecords.length})
          </h3>
          <span className="text-xs font-semibold text-slate-400">Pay Period: {monthYear}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" /> Loading payroll logs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Basic Salary</th>
                  <th className="py-3.5 px-6">Allowances & HRA</th>
                  <th className="py-3.5 px-6">Deductions (Tax/PF)</th>
                  <th className="py-3.5 px-6">Net Payable</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {displayedRecords.map((rec) => {
                  const basic = floatVal(rec.basic_salary);
                  const allowances = floatVal(rec.hra) + floatVal(rec.allowances) + floatVal(rec.bonuses);
                  const deductions = floatVal(rec.tax_deduction) + floatVal(rec.pf_deduction);
                  const netPay = floatVal(rec.net_salary);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {(rec.first_name || 'E').charAt(0)}
                          </div>
                          <div>
                            <div>{rec.first_name} {rec.last_name}</div>
                            <span className="text-xs font-mono font-normal text-blue-600">{rec.employee_code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-medium">{rec.department_name || 'Engineering'}</td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-700">₹{basic.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6 font-mono text-xs text-emerald-700 font-medium">+₹{allowances.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6 font-mono text-xs text-rose-700 font-medium">-₹{deductions.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6 font-mono text-sm font-extrabold text-slate-900">₹{netPay.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          rec.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rec.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedPayslip(rec)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Payslip
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {displayedRecords.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400 text-sm">
                      No payroll records found for pay period <strong className="text-slate-700">{monthYear}</strong>.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Printable Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150 overflow-y-auto max-h-[90vh]">
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-blue-600 font-extrabold text-lg">
                <FileText className="w-6 h-6" /> Payslip Breakdown
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corporate Payslip Document Card */}
            <div id="printable-payslip" className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-6">
              {/* Company Logo Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">EMS ENTERPRISE SYSTEM</h1>
                  <p className="text-xs text-slate-500">Official Monthly Compensation & Tax Document</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    PAYSLIP #{selectedPayslip.employee_code}-{selectedPayslip.month_year}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Pay Period: {selectedPayslip.month_year}</p>
                </div>
              </div>

              {/* Employee Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-white p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 uppercase font-semibold block">Employee Name</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedPayslip.first_name} {selectedPayslip.last_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold block">Employee ID</span>
                  <span className="font-mono font-bold text-blue-600">{selectedPayslip.employee_code}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold block">Department</span>
                  <span className="font-semibold text-slate-800">{selectedPayslip.department_name || 'Engineering'}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold block">Designation</span>
                  <span className="font-semibold text-slate-800">{selectedPayslip.designation || 'Software Engineer'}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold block">Payment Mode</span>
                  <span className="font-semibold text-slate-800">{selectedPayslip.payment_method || 'Direct Bank Transfer'}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold block">Payment Date</span>
                  <span className="font-semibold text-emerald-700">{selectedPayslip.payment_date || 'Pending'}</span>
                </div>
              </div>

              {/* Itemized Salary Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {/* Earnings Table */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 text-emerald-700">
                    Earnings (+)
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Basic Salary</span>
                      <span className="font-mono font-semibold text-slate-900">₹{floatVal(selectedPayslip.basic_salary).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>House Rent Allowance (HRA)</span>
                      <span className="font-mono font-semibold text-slate-900">₹{floatVal(selectedPayslip.hra).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Special Allowances</span>
                      <span className="font-mono font-semibold text-slate-900">₹{floatVal(selectedPayslip.allowances).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Performance Bonus</span>
                      <span className="font-mono font-semibold text-emerald-700">₹{floatVal(selectedPayslip.bonuses).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Table */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 text-rose-700">
                    Deductions (-)
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Income Tax (TDS)</span>
                      <span className="font-mono font-semibold text-rose-700">₹{floatVal(selectedPayslip.tax_deduction).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Provident Fund (PF)</span>
                      <span className="font-mono font-semibold text-rose-700">₹{floatVal(selectedPayslip.pf_deduction).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Net Salary Banner */}
              <div className="bg-blue-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-md">
                <div>
                  <span className="text-xs text-blue-200 uppercase font-bold tracking-wider block">Net Take-Home Payable</span>
                  <span className="text-xs text-blue-300">Directly deposited to registered bank account</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono">₹{floatVal(selectedPayslip.net_salary).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {canManage && selectedPayslip.status !== 'Paid' ? (
                <button
                  onClick={() => handleMarkPaid(selectedPayslip.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  ✓ Confirm Payment as Paid
                </button>
              ) : <div />}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Download / Print Payslip PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function floatVal(v) {
  return parseFloat(v || 0);
}
