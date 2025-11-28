import React from 'react';

export const Select = ({ label, options, className = '', tone = 'light', error, id, ...props }) => {
  const dark = tone === 'dark';
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-') || undefined;
  const describedBy = error ? `${selectId}-error` : undefined;
  return (
    <div className="mb-4">
      {label && <label htmlFor={selectId} className={`block text-sm font-semibold mb-2 ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{label}</label>}
      <select 
        id={selectId}
        className={`w-full px-4 py-3 ${dark ? 'input-base' : 'input-light'} placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400/70 focus:border-indigo-400/70 outline-none motion-soft appearance-none ${error ? 'border-red-500/70 ring-1 ring-red-500/40' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        {...props}
      >
        <option value="">Seleccionar...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {error && <p id={`${selectId}-error`} className="text-xs mt-2 text-red-400">{error}</p>}
    </div>
  );
};
