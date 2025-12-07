
import React from 'react';
import { ToastMessage } from '../types';

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const icons = {
    success: 'fa-circle-check text-wes-success',
    error: 'fa-circle-exclamation text-red-500',
    info: 'fa-circle-info text-wes-accent',
  };

  const borders = {
    success: 'border-l-wes-success',
    error: 'border-l-red-500',
    info: 'border-l-wes-accent',
  };

  return (
    <div 
      className={`
        glass-panel mb-3 p-4 rounded-r-lg border-l-4 ${borders[toast.type]} 
        shadow-xl flex items-start gap-3 min-w-[300px] max-w-md animate-fadeIn
        transform transition-all duration-300 hover:scale-[1.02]
      `}
      role="alert"
    >
      <i className={`fa-solid ${icons[toast.type]} mt-0.5 text-lg`}></i>
      <div className="flex-1">
        <p className="text-sm font-medium text-white leading-tight">{toast.message}</p>
      </div>
      <button 
        onClick={() => onRemove(toast.id)}
        className="text-slate-500 hover:text-white transition-colors"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
};