import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Topbar = ({ title, subtitle, actions, badge }) => (
  <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 md:px-8 bg-[rgba(12,18,32,0.7)] backdrop-blur sticky top-0 z-20">
    <div className="flex items-center gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)] font-semibold">{subtitle}</p>
        <h2 className="text-lg md:text-xl font-bold text-white leading-tight">{title}</h2>
      </div>
      {badge && (
        <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white flex items-center gap-1">
          <ShieldCheck size={14}/> {badge}
        </span>
      )}
    </div>
    <div className="flex items-center gap-3">
      {actions}
    </div>
  </header>
);
