import React, { useState } from 'react';
import { Search, Bell, LogOut } from 'lucide-react';

export default function Navbar({ user, onLogout, globalSearch, setGlobalSearch, onAddEmployee }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'Amit Gupta submitted a sick leave request.', time: '10m ago' },
    { id: 2, text: 'Project Customer CRM Redesign deadline updated.', time: '1h ago' },
    { id: 3, text: 'Monthly attendance report generated.', time: '3h ago' },
  ];

  const userName = user?.full_name || 'User';
  const userRole = (user?.role || 'admin').toUpperCase();
  const avatarLetter = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Global Search Field */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Global search employees, projects..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-800"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Add Employee Quick Button for Admin / HR / Manager */}
        {['admin', 'hr', 'manager'].includes(user?.role) && (
          <button
            onClick={onAddEmployee}
            className="hidden sm:flex px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/20 transition-all shadow-xs items-center gap-1.5 cursor-pointer"
          >
            <span className="text-base leading-none">+</span> Add Employee
          </button>
        )}

        <div className="h-6 w-px bg-slate-200" />

        {/* Notification Dropdown Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">Notifications</span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs space-y-1">
                    <p className="text-slate-700 font-medium">{n.text}</p>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic User Identity Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {avatarLetter}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-bold text-slate-900 leading-tight">{userName}</div>
            <div className="text-xs text-blue-600 font-semibold">{userRole}</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Logout"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
