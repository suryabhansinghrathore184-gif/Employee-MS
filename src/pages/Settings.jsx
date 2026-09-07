import React, { useState } from 'react';
import { Sliders, Building2, Shield, Users, Lock, Bell, Check } from 'lucide-react';

export default function Settings({ showToast }) {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h2>
          <p className="text-sm text-slate-500 mt-0.5">Configure system preferences, user roles, security, and notification alerts</p>
        </div>
      </div>

      {/* Tabs */}
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
        {activeTab === 'general' && (
          <form onSubmit={handleSave} className="space-y-4 max-w-lg">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">General Information</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Company Name</label>
              <input type="text" defaultValue="EMS Corporate Technologies" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tagline</label>
              <input type="text" defaultValue="Manage People • Improve Productivity • Grow Together" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">System Language</label>
              <select defaultValue="en" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none">
                <option value="en">English (US)</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-xs">
              Save General Preferences
            </button>
          </form>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Role-Based Access Matrix</h3>
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
                  <tr><td className="p-3 font-semibold text-slate-900">Employee Management</td><td className="p-3 text-emerald-600 font-bold">Full CRUD</td><td className="p-3 text-emerald-600 font-bold">Full CRUD</td><td className="p-3 text-blue-600 font-semibold">Read Only</td><td className="p-3 text-slate-400">Self Profile</td></tr>
                  <tr><td className="p-3 font-semibold text-slate-900">Leave Approvals</td><td className="p-3 text-emerald-600 font-bold">Approve/Reject</td><td className="p-3 text-emerald-600 font-bold">Approve/Reject</td><td className="p-3 text-blue-600 font-semibold">Approve Team</td><td className="p-3 text-slate-400">Apply Only</td></tr>
                  <tr><td className="p-3 font-semibold text-slate-900">Projects & Tasks</td><td className="p-3 text-emerald-600 font-bold">Full Access</td><td className="p-3 text-slate-400">Read Only</td><td className="p-3 text-emerald-600 font-bold">Assign & Manage</td><td className="p-3 text-blue-600 font-semibold">Update Task</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handleSave} className="space-y-4 max-w-lg">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">Security & Credentials</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
            </div>
            <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-xs">
              Update Password
            </button>
          </form>
        )}

        {(activeTab === 'departments' || activeTab === 'users' || activeTab === 'notifications') && (
          <div className="py-8 text-center text-slate-500 text-sm">
            Configuration parameters set to active corporate defaults.
          </div>
        )}
      </div>
    </div>
  );
}
