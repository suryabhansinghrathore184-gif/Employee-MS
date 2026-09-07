import React from 'react';
import { 
  LayoutDashboard, Users, Clock, Calendar, CheckSquare, 
  FileText, Building2, Settings, DollarSign 
} from 'lucide-react';
import Logo from './Logo';

export default function Sidebar({ activeTab, setActiveTab, userRole = 'admin' }) {
  const normalizedRole = String(userRole).toLowerCase();
  const isManagement = ['admin', 'hr', 'manager'].includes(normalizedRole);

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'hr', 'manager', 'employee'] },
    { id: 'employees', label: 'Employees', icon: Users, roles: ['admin', 'hr', 'manager'] },
    { id: 'attendance', label: 'Attendance', icon: Clock, roles: ['admin', 'hr', 'manager', 'employee'] },
    { id: 'leaves', label: 'Leave Management', icon: Calendar, roles: ['admin', 'hr', 'manager', 'employee'] },
    { id: 'payroll', label: 'Payroll & Salary', icon: DollarSign, roles: ['admin', 'hr', 'manager', 'employee'] },
    { id: 'projects', label: 'Projects & Tasks', icon: CheckSquare, roles: ['admin', 'hr', 'manager', 'employee'] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['admin', 'hr', 'manager'] },
    { id: 'departments', label: 'Departments', icon: Building2, roles: ['admin', 'hr', 'manager'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'hr', 'manager', 'employee'] },
  ];

  const visibleNavItems = allNavItems.filter(item => item.roles.includes(normalizedRole) || isManagement);

  return (
    <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 select-none z-40 border-r border-slate-800/60">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-5 border-b border-slate-800/80">
        <Logo variant="medium" dark={true} />
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Main Navigation</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-400 font-semibold">{userRole.toUpperCase()}</span>
        </div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer User Role Info */}
      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-400 text-center space-y-1">
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{userRole.toUpperCase()} ACCESS</p>
        <p className="text-[10px] font-semibold text-slate-300 tracking-tight">Manage People • Grow Together</p>
      </div>
    </aside>
  );
}
