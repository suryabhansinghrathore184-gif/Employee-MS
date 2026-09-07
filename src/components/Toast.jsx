import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
      isSuccess 
        ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900' 
        : 'bg-rose-50/95 border-rose-200 text-rose-900'
    }`}>
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-600 mr-3 shrink-0" />
      )}
      <span className="text-sm font-medium pr-4">{message}</span>
      <button 
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-black/5 text-gray-500 transition-colors ml-auto"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
