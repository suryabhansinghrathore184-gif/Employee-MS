import React, { useState } from 'react';
import { User, Briefcase, MapPin, FileText, Upload, ArrowRight, ArrowLeft, Check, X } from 'lucide-react';
import { api } from '../services/api';

export default function AddEmployee({ departments = [], onCancel, onSuccess }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Basic Info
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    avatar: null,
    // Job Details
    employee_code: 'EMP' + Math.floor(100 + Math.random() * 900),
    department_id: departments.length > 0 ? departments[0].id : 1,
    designation: '',
    manager_id: '',
    date_of_joining: new Date().toISOString().split('T')[0],
    work_type: 'Full-time',
    location: 'Headquarters',
    // Contact Info
    address: '',
    city: '',
    state: '',
    postal_code: '',
    emergency_contact: '',
    // Documents
    resume: null,
    id_proof: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.first_name || !formData.last_name || !formData.email)) {
      setError('Please fill in required basic info fields.');
      return;
    }
    setError('');
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      await api.createEmployee({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        department_id: formData.department_id,
        designation: formData.designation || 'Software Engineer',
        employee_code: formData.employee_code,
        date_of_joining: formData.date_of_joining,
        work_type: formData.work_type,
        status: 'Active',
      });
      onSuccess('New employee added successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Basic Info', icon: User },
    { num: 2, title: 'Job Details', icon: Briefcase },
    { num: 3, title: 'Contact Info', icon: MapPin },
    { num: 4, title: 'Documents', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add Employee</h2>
          <p className="text-sm text-slate-500 mt-0.5">Fill in the details to add a new employee to your organization</p>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stepper Header Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-200 text-blue-600 font-semibold'
                    : isDone
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-50 border-slate-200/60 text-slate-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isCurrent ? 'bg-blue-600 text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isDone ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <div className="hidden sm:block text-xs">
                  <span className="block font-bold leading-tight">{s.title}</span>
                  <span className="text-[10px] opacity-75">Step {s.num} of 4</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Main Form Content */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">First Name <span className="text-rose-500">*</span></label>
                  <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} placeholder="e.g. Rahul" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Last Name <span className="text-rose-500">*</span></label>
                  <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} placeholder="e.g. Sharma" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Work Email <span className="text-rose-500">*</span></label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="rahul@company.com" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Job Details */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Job Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Employee ID</label>
                  <input type="text" name="employee_code" value={formData.employee_code} onChange={handleChange} className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold text-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Department</label>
                  <select name="department_id" value={formData.department_id} onChange={handleChange} className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Designation</label>
                  <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Senior Software Engineer" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Employment Type</label>
                  <select name="work_type" value={formData.work_type} onChange={handleChange} className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" /> Contact Information
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street address..." className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Maharashtra" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Postal Code</label>
                  <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="400001" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents Upload */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Upload Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                  <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                  <span className="text-xs font-bold text-slate-800 block">Resume / CV</span>
                  <span className="text-[11px] text-slate-400 block">PDF, DOCX up to 5MB</span>
                </div>
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                  <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                  <span className="text-xs font-bold text-slate-800 block">ID Proof & Certificates</span>
                  <span className="text-[11px] text-slate-400 block">Passport, Govt ID</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Control Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={step === 1 ? onCancel : handlePrev}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> {step === 1 ? 'Cancel' : 'Previous'}
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Saving Employee...' : 'Save Employee'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
