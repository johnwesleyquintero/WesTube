import React from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[] | string[];
}

export const GlassSelect: React.FC<GlassSelectProps> = ({ 
  label, 
  options, 
  className = "", 
  ...props 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-[10px] font-bold text-wes-accent uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <select 
          className="w-full glass-input rounded-xl p-3 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-wes-accent transition-all"
          {...props}
        >
          {options.map((opt, idx) => {
            const isString = typeof opt === 'string';
            const value = isString ? opt : opt.value;
            const label = isString ? opt : opt.label;
            
            return (
              <option key={`${value}-${idx}`} value={value} className="bg-wes-900 text-slate-300">
                {label}
              </option>
            );
          })}
        </select>
        <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none"></i>
      </div>
    </div>
  );
};