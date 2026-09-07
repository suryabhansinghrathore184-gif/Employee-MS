import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EmployeeModal from './components/EmployeeModal';
import DepartmentModal from './components/DepartmentModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';

import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import AddEmployee from './pages/AddEmployee';
import EmployeeProfile from './pages/EmployeeProfile';
import DepartmentList from './pages/DepartmentList';
import AttendanceManager from './pages/AttendanceManager';
import LeaveManager from './pages/LeaveManager';
import PayrollManager from './pages/PayrollManager';
import ProjectTaskManager from './pages/ProjectTaskManager';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';

import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ems_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ems_token') || null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState(null);
  const [attendanceFilter, setAttendanceFilter] = useState('All');

  // Modals state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);

  // Delete state
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const loadDepartments = async () => {
    try {
      const res = await api.getDepartments();
      if (res.status === 'success') {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  useEffect(() => {
    if (token) {
      loadDepartments();
    }
  }, [token]);

  const handleLoginSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setActiveTab('dashboard');
    localStorage.setItem('ems_user', JSON.stringify(userData));
    localStorage.setItem('ems_token', authToken);
    showToast(`Welcome back, ${userData.full_name} (${(userData.role || 'user').toUpperCase()})!`);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setActiveTab('dashboard');
    localStorage.removeItem('ems_user');
    localStorage.removeItem('ems_token');
    showToast('Logged out successfully.');
  };

  const handleOpenAddEmployee = () => {
    setActiveTab('add-employee');
  };

  const handleOpenEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setIsEmployeeModalOpen(true);
  };

  const handleViewProfile = (emp) => {
    setSelectedProfileEmployee(emp);
    setActiveTab('profile');
  };

  const handleViewAttendanceWithFilter = (status) => {
    setAttendanceFilter(status);
    setActiveTab('attendance');
  };

  const handleSaveEmployee = async (formData) => {
    if (editingEmployee) {
      await api.updateEmployee(editingEmployee.id, formData);
      showToast('Employee updated successfully!');
      setIsEmployeeModalOpen(false);
    }
    loadDepartments();
  };

  const handleConfirmDeleteEmployee = async () => {
    if (!deletingEmployee) return;
    try {
      setIsDeleting(true);
      await api.deleteEmployee(deletingEmployee.id);
      showToast(`Employee ${deletingEmployee.first_name} ${deletingEmployee.last_name} deleted.`);
      setDeletingEmployee(null);
      loadDepartments();
    } catch (err) {
      showToast(err.message || 'Failed to delete employee.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveDepartment = async (formData) => {
    await api.createDepartment(formData);
    showToast(`Department '${formData.name}' created successfully!`);
    loadDepartments();
  };

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={user?.role || 'admin'} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          user={user}
          onLogout={handleLogout}
          globalSearch={globalSearch}
          setGlobalSearch={(val) => {
            setGlobalSearch(val);
            if (val.trim() && activeTab !== 'employees') {
              setActiveTab('employees');
            }
          }}
          onAddEmployee={handleOpenAddEmployee}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              user={user}
              onAddEmployee={handleOpenAddEmployee}
              onAddDepartment={() => setIsDepartmentModalOpen(true)}
              onViewEmployees={() => setActiveTab('employees')}
              onViewAttendance={handleViewAttendanceWithFilter}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeeList
              departments={departments}
              onAddEmployee={handleOpenAddEmployee}
              onEditEmployee={handleOpenEditEmployee}
              onViewProfile={handleViewProfile}
              onDeleteRequest={(emp) => setDeletingEmployee(emp)}
              searchTerm={globalSearch}
              setSearchTerm={setGlobalSearch}
            />
          )}

          {activeTab === 'add-employee' && (
            <AddEmployee
              departments={departments}
              onCancel={() => setActiveTab('employees')}
              onSuccess={(msg) => {
                showToast(msg);
                loadDepartments();
                setActiveTab('employees');
              }}
            />
          )}

          {activeTab === 'profile' && (
            <EmployeeProfile
              employee={selectedProfileEmployee}
              onBack={() => setActiveTab('employees')}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceManager user={user} showToast={showToast} initialStatusFilter={attendanceFilter} />
          )}

          {activeTab === 'leaves' && (
            <LeaveManager user={user} showToast={showToast} />
          )}

          {activeTab === 'payroll' && (
            <PayrollManager user={user} showToast={showToast} />
          )}

          {activeTab === 'projects' && (
            <ProjectTaskManager user={user} showToast={showToast} />
          )}

          {activeTab === 'reports' && (
            <Reports departments={departments} />
          )}

          {activeTab === 'departments' && (
            <DepartmentList
              onAddDepartment={() => setIsDepartmentModalOpen(true)}
            />
          )}

          {activeTab === 'settings' && (
            <Settings showToast={showToast} />
          )}
        </main>
      </div>

      {/* Modals & Toast */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSubmit={handleSaveEmployee}
        employee={editingEmployee}
        departments={departments}
      />

      <DepartmentModal
        isOpen={isDepartmentModalOpen}
        onClose={() => setIsDepartmentModalOpen(false)}
        onSubmit={handleSaveDepartment}
      />

      <DeleteConfirmModal
        isOpen={!!deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={handleConfirmDeleteEmployee}
        title="Delete Employee Record?"
        message={
          deletingEmployee
            ? `Are you sure you want to delete ${deletingEmployee.first_name} ${deletingEmployee.last_name}? This action cannot be undone.`
            : ''
        }
        isDeleting={isDeleting}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
