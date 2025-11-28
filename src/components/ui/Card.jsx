import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action }) => (
  <div className={`theme-card card-hover overflow-hidden ${className}`}>
    {(title || action) && (
      <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur">
        <div>
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-[var(--text-subtle)] mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);
