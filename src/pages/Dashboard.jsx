import React, { useEffect, useState } from 'react';
import { 
  Users, UserCheck, UserX, Calendar, FolderGit2, CheckSquare, 
  Clock, Activity, Plus, RefreshCw, AlertCircle, Building2, CalendarDays 
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { AttendanceBarChart, DepartmentDonutChart, ProductivityTrendChart } from '../components/Charts';
import { api } from '../services/api';

export default function Dashboard({ user, onAddEmployee, onAddDepartment, onViewEmployees, onViewAttendance }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getStats(user?.role || 'admin');
      if (response.status === 'success') {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
        <button onClick={fetchStats} className="px-3.5 py-1.5 bg-rose-100 text-rose-900 rounded-xl text-xs font-semibold cursor-pointer">
          Retry
        </button>
      </div>
    );
  }

  const userName = user?.full_name || 'User';
  const canManage = ['admin', 'hr'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Dashboard Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, <strong className="text-blue-600 font-semibold">{userName}</strong>! Here's what's happening today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200/60">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span>{currentDateFormatted}</span>
          </div>

          {canManage && (
            <button
              onClick={onAddEmployee}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* 8 Dashboard KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Employees" value={stats?.total_employees || 5} icon={Users} change="+12%" changeType="positive" compareText="vs last month" color="blue" onClick={onViewEmployees} />
        <StatCard title="Present Today" value={stats?.present_employees || 4} icon={UserCheck} change="94%" changeType="positive" compareText="click to view list" color="emerald" onClick={() => onViewAttendance && onViewAttendance('Present')} />
        <StatCard title="Absent Today" value={stats?.absent_employees || 1} icon={UserX} change="-2%" changeType="negative" compareText="click to view list" color="rose" onClick={() => onViewAttendance && onViewAttendance('Absent')} />
        <StatCard title="Pending Leaves" value={stats?.pending_leaves || 2} icon={Calendar} change="4 req" changeType="positive" compareText="requires review" color="amber" />

        <StatCard title="Active Projects" value={stats?.active_projects || 2} icon={FolderGit2} change="+1 new" changeType="positive" compareText="in progress" color="violet" />
        <StatCard title="Completed Tasks" value={stats?.completed_tasks || 12} icon={CheckSquare} change="85%" changeType="positive" compareText="completion rate" color="emerald" />
        <StatCard title="Total Working Hours" value={`${stats?.working_hours_today || 38.5} hrs`} icon={Clock} change="+4.5h" changeType="positive" compareText="today" color="indigo" onClick={() => onViewAttendance && onViewAttendance('All')} />
        <StatCard title="Productivity" value={`${stats?.avg_productivity || 94}%`} icon={Activity} change="+3.2%" changeType="positive" compareText="avg score" color="amber" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceBarChart />
        <DepartmentDonutChart departments={stats?.department_breakdown || []} />
      </div>

      {/* Productivity Trend & Recent Additions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProductivityTrendChart />
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Employee Roster</h3>
                <p className="text-xs text-slate-400">Recent team member updates</p>
              </div>
              <button onClick={onViewEmployees} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
                View All Employees →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
                    <th className="pb-3 pr-4">Code</th>
                    <th className="pb-3 px-4">Name</th>
                    <th className="pb-3 px-4">Department</th>
                    <th className="pb-3 px-4">Designation</th>
                    <th className="pb-3 pl-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {stats?.recent_employees?.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs font-semibold text-blue-600">{emp.employee_code}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{emp.first_name} {emp.last_name}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{emp.department_name || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{emp.designation}</td>
                      <td className="py-3 pl-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
