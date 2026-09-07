import React, { useState } from 'react';
import { Sliders, Building2, Shield, Users, Lock, Bell, Check, Save, Key, AlertCircle, UserCheck } from 'lucide-react';
import { api } from '../services/api';

export default function Settings({ showToast, user, onAddDepartment }) {
  const [activeTab, setActiveTab] = useState('general');

  // General Settings State
  const [companyName, setCompanyName] = useState('EMS Corporate Technologies');
  const [tagline, setTagline] = useState('Manage People • Improve Productivity • Grow Together');
  const [currency, setCurrency] = useState('INR (₹)');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Notification Toggles State
  const [notifications, setNotifications] = useState({
    emailLeaveAlerts: true,
    emailAttendanceSummary: true,
    desktopPush: false,
    payrollAlerts: true,
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'users', label: 'Users & Accounts', icon: Users },
    { id: 'security', label: 'Security & Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  // System Users List
  const userAccounts = [
    { id: 1, name: 'Suryabhan Singh (Admin)', email: 'admin@company.com', role: 'Admin', status: 'Active', lastActive: 'Just now' },
    { id: 2, name: 'Priya Singh (HR Lead)', email: 'hr@company.com', role: 'HR Lead', status: 'Active', lastActive: '12m ago' },
    { id: 3, name: 'Vikram Mehta (Manager)', email: 'manager@company.com', role: 'Manager', status: 'Active', lastActive: '1h ago' },
    { id: 4, name: 'Rahul Sharma (Employee)', email: 'rahul@company.com', role: 'Employee', status: 'Active', lastActive: '2h ago' },
  ];

  // System Departments Summary
  const departmentSummary = [
    { id: 1, name: 'Engineering', code: 'ENG', count: 2, status: 'Active' },
    { id: 2, name: 'Human Resources', code: 'HR', count: 1, status: 'Active' },
    { id: 3, name: 'Marketing & Sales', code: 'MKT', count: 1, status: 'Active' },
    { id: 4, name: 'Finance', code: 'FIN', count: 1, status: 'Active' },
  ];

  const handleGeneralSave = (e) => {
    e.preventDefault();
    showToast('General settings saved successfully!');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setSecurityError('');

    if (!currentPassword) {
      setSecurityError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError('New password and confirmation password do not match.');
      return;
    }

    showToast('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleNotificationSave = (e) => {
    e.preventDefault();
    showToast('Notification preferences updated!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings</h2>
          <p className="text-xs text-slate-500 mt-1">Configure company preferences, security credentials, user roles, and alert rules</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs flex items-center gap-2 overflow-x-auto">
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
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-2xs">
        {/* General Tab */}
        {activeTab === 'general' && (
          <form onSubmit={handleGeneralSave} className="space-y-5 max-w-xl">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" /> General Company Information
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">SaaS Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Default Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                >
                  <option value="en">English (US)</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save General Preferences
            </button>
          </form>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> Active Department Units
              </h3>
              {onAddDepartment && (
                <button
                  onClick={onAddDepartment}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
                >
                  + Add Department
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departmentSummary.map((d) => (
                <div key={d.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{d.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-100 text-blue-700 rounded-md font-semibold">{d.code}</span>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">{d.count} Assigned Employees</span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roles & Permissions Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> Role-Based Access Control (RBAC) Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 font-bold uppercase text-slate-500 border-b border-slate-100">
                    <th className="p-3">Module</th>
                    <th className="p-3">Admin</th>
                    <th className="p-3">HR Lead</th>
                    <th className="p-3">Manager</th>
                    <th className="p-3">Employee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr><td className="p-3 font-semibold text-slate-900">Dashboard Metrics</td><td className="p-3 text-emerald-600 font-bold">Full</td><td className="p-3 text-emerald-600 font-bold">Full</td><td className="p-3 text-blue-600 font-semibold">Team</td><td className="p-3 text-slate-400">Personal</td></tr>
                  <tr><td className="p-3 font-semibold text-slate-900">Employee Directory</td><td className="p-3 text-emerald-600 font-bold">Full CRUD</td><td className="p-3 text-emerald-600 font-bold">Full CRUD</td><td className="p-3 text-blue-600 font-semibold">Read Only</td><td className="p-3 text-slate-400">Self Profile</td></tr>
                  <tr><td className="p-3 font-semibold text-slate-900">Attendance Punch Logs</td><td className="p-3 text-emerald-600 font-bold">All Logs</td><td className="p-3 text-emerald-600 font-bold">All Logs</td><td className="p-3 text-blue-600 font-semibold">All Logs</td><td className="p-3 text-indigo-600 font-bold">Own Logs Only</td></tr>
                  <tr><td className="p-3 font-semibold text-slate-900">Leave Approvals</td><td className="p-3 text-emerald-600 font-bold">Approve/Reject</td><td className="p-3 text-emerald-600 font-bold">Approve/Reject</td><td className="p-3 text-blue-600 font-semibold">Approve Team</td><td className="p-3 text-slate-400">Apply Only</td></tr>
                  <tr><td className="p-3 font-semibold text-slate-900">Projects & Tasks</td><td className="p-3 text-emerald-600 font-bold">Full Access</td><td className="p-3 text-slate-400">Read Only</td><td className="p-3 text-emerald-600 font-bold">Assign & Manage</td><td className="p-3 text-blue-600 font-semibold">Update Task</td></tr>
                  <tr><td className="p-3 font-semibold text-slate-900">Payroll Engine</td><td className="p-3 text-emerald-600 font-bold">Full Access</td><td className="p-3 text-emerald-600 font-bold">Full Access</td><td className="p-3 text-slate-400">No Access</td><td className="p-3 text-blue-600 font-semibold">View Payslip</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users & Accounts Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Authorized System User Accounts
            </h3>
            <div className="space-y-3">
              {userAccounts.map((u) => (
                <div key={u.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{u.name}</span>
                      <span className="text-xs text-slate-500 font-mono">{u.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded-lg">{u.role}</span>
                    <span className="text-xs text-slate-400">Active {u.lastActive}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security & Password Tab */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-xl">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" /> Security & Password Update
            </h3>

            {securityError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Key className="w-4 h-4" /> Update Password
            </button>
          </form>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleNotificationSave} className="space-y-5 max-w-xl">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" /> Notification Alert Preferences
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <div>
                  <span className="font-semibold text-sm text-slate-900 block">Email Leave Request Alerts</span>
                  <span className="text-xs text-slate-500">Receive notifications when employees submit leave requests</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailLeaveAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailLeaveAlerts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <div>
                  <span className="font-semibold text-sm text-slate-900 block">Daily Attendance Summary Email</span>
                  <span className="text-xs text-slate-500">Get daily summary report of present and absent counts</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailAttendanceSummary}
                  onChange={(e) => setNotifications({ ...notifications, emailAttendanceSummary: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <div>
                  <span className="font-semibold text-sm text-slate-900 block">Payroll Generation Alerts</span>
                  <span className="text-xs text-slate-500">Receive alerts when monthly payslips are generated or marked paid</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.payrollAlerts}
                  onChange={(e) => setNotifications({ ...notifications, payrollAlerts: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer"
                />
              </label>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Notification Preferences
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
