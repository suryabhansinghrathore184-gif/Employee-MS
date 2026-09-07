import React, { useState } from 'react';
import { User, Briefcase, Calendar, FileText, CheckSquare, Award, Clock, ArrowLeft, Mail, Phone, MapPin, Building2, DollarSign } from 'lucide-react';

export default function EmployeeProfile({ employee, onBack }) {
  const [activeTab, setActiveTab] = useState('personal');

  if (!employee) return null;

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'job', label: 'Job Details', icon: Briefcase },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leaves', label: 'Leave History', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'projects', label: 'Projects', icon: CheckSquare },
    { id: 'performance', label: 'Performance', icon: Award },
  ];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Employees
        </button>
      </div>

      {/* Employee Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-3xl shadow-lg shadow-blue-600/30 shrink-0">
            {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {employee.first_name} {employee.last_name}
                </h2>
                <span className="text-xs font-mono font-bold text-blue-600">{employee.employee_code}</span>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 w-fit mx-auto sm:mx-0">
                {employee.status || 'Active'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-blue-600" /> {employee.designation}</span>
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-blue-600" /> {employee.department_name || 'Engineering'}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-blue-600" /> {employee.email}</span>
            </div>
          </div>
        </div>

        {/* Profile Tabs Bar */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-2xs">
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div><span className="text-xs font-semibold text-slate-400 block uppercase">Full Name</span> <span className="font-semibold text-slate-900">{employee.first_name} {employee.last_name}</span></div>
              <div><span className="text-xs font-semibold text-slate-400 block uppercase">Email</span> <span className="font-semibold text-slate-900">{employee.email}</span></div>
              <div><span className="text-xs font-semibold text-slate-400 block uppercase">Phone</span> <span className="font-semibold text-slate-900">{employee.phone || '+91 9876543210'}</span></div>
              <div><span className="text-xs font-semibold text-slate-400 block uppercase">Joining Date</span> <span className="font-semibold text-slate-900">{employee.date_of_joining}</span></div>
            </div>
          </div>
        )}

        {activeTab === 'job' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Job & Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div><span className="text-xs font-semibold text-slate-400 block uppercase">Department</span> <span className="font-semibold text-slate-900">{employee.department_name}</span></div>
              <div><span className="text-xs font-semibold text-slate-400 block uppercase">Designation</span> <span className="font-semibold text-slate-900">{employee.designation}</span></div>
              <div><span className="text-xs font-semibold text-slate-400 block uppercase">Annual Salary</span> <span className="font-bold text-emerald-600">{formatCurrency(employee.salary)}</span></div>
              <div><span className="text-xs font-semibold text-slate-400 block uppercase">Work Type</span> <span className="font-semibold text-slate-900">{employee.work_type || 'Full-time'}</span></div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4 text-sm text-slate-600">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Attendance Log</h3>
            <p>Monthly Attendance Rate: <strong className="text-slate-900">96.5%</strong> (Present 22 days, Absent 0 days, Leaves 1 day)</p>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="space-y-4 text-sm text-slate-600">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Leave Balance Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-900"><span className="block text-xs font-bold uppercase">Casual Leaves</span><span className="text-xl font-bold">10 / 12 Remaining</span></div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900"><span className="block text-xs font-bold uppercase">Sick Leaves</span><span className="text-xl font-bold">8 / 10 Remaining</span></div>
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-900"><span className="block text-xs font-bold uppercase">Paid Leaves</span><span className="text-xl font-bold">15 / 15 Remaining</span></div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4 text-sm text-slate-600">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Employee Verification Documents</h3>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-xl font-semibold text-slate-800 text-xs flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Resume_Rahul_Sharma.pdf
              </div>
              <div className="p-3 bg-slate-100 rounded-xl font-semibold text-slate-800 text-xs flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Govt_ID_Proof.pdf
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4 text-sm text-slate-600">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Assigned Projects</h3>
            <p>Assigned to <strong className="text-slate-900">Enterprise HR Portal</strong> (Lead Developer)</p>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4 text-sm text-slate-600">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Performance Score</h3>
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-500" />
              <div>
                <span className="text-2xl font-extrabold text-slate-900">96 / 100</span>
                <span className="block text-xs text-slate-500 font-semibold">Consistently exceeds task completion deadlines.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
