import React from 'react';

export const AppShell = ({ children, className = '' }) => (
  <div className={`min-h-screen bg-[var(--page-bg)] text-[var(--text-strong)] ${className}`}>
    {children}
  </div>
);
