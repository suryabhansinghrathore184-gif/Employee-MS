import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, Shield, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function DepartmentList({ onAddDepartment }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getDepartments();
      if (res.status === 'success') {
        setDepartments(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Departments Directory</h2>
          <p className="text-xs text-gray-500 mt-1">Manage organizational structures and department units</p>
        </div>
        <button
          onClick={onAddDepartment}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-violet-600 animate-spin" />
          <span className="text-sm font-medium text-gray-500">Loading departments...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 uppercase">
                    {dept.code}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{dept.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-6">
                  {dept.description || 'No description provided for this department.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-violet-500" />
                  <span className="font-semibold text-gray-900">{dept.total_employees || 0}</span> Total Employees
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  {dept.active_employees || 0} Active
                </span>
              </div>
            </div>
          ))}

          {departments.length === 0 && (
            <div className="col-span-full p-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-100">
              No departments registered. Click 'Add Department' to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
