import React from 'react';

export const Input = ({ label, hint, className = '', tone = 'light', error, id, ...props }) => {
  const dark = tone === 'dark';
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-') || undefined;
  const describedBy = [];
  if (hint) describedBy.push(`${inputId}-hint`);
  if (error) describedBy.push(`${inputId}-error`);

  return (
    <div className="mb-4">
      {label && <label htmlFor={inputId} className={`block text-sm font-semibold mb-2 ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{label}</label>}
      <input 
        id={inputId}
        className={`w-full px-4 py-3 ${dark ? 'input-base placeholder:text-slate-400' : 'input-light placeholder:text-slate-400'} focus:outline-none focus:ring-2 focus:ring-indigo-400/70 focus:border-indigo-400/70 motion-soft ${error ? 'border-red-500/70 ring-1 ring-red-500/40' : ''} ${className}`} 
        aria-invalid={!!error}
        aria-describedby={describedBy.join(' ') || undefined}
        {...props} 
      />
      {hint && <p id={`${inputId}-hint`} className={`text-xs mt-2 ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{hint}</p>}
      {error && <p id={`${inputId}-error`} className="text-xs mt-2 text-red-400">{error}</p>}
    </div>
  );
};
