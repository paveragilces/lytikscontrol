import React from 'react';

export const SectionHeader = ({ eyebrow, title, subtitle, chips = [], align = 'center', tone = 'light' }) => {
  const textPrimary = tone === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = tone === 'dark' ? 'text-slate-200/85' : 'text-slate-500';
  const alignClass = align === 'left' ? 'text-left items-start' : 'text-center items-center';
  return (
    <div className={`space-y-3 flex flex-col ${alignClass}`}>
      {eyebrow && <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-indigo-100 shadow-sm border border-white/10 uppercase tracking-[0.18em]">{eyebrow}</div>}
      <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${textPrimary}`}>{title}</h1>
      {subtitle && <p className={`text-lg max-w-2xl ${textSecondary}`}>{subtitle}</p>}
      {chips?.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {chips.map(chip => (
            <span key={chip} className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-50 shadow-sm">{chip}</span>
          ))}
        </div>
      )}
    </div>
  );
};
