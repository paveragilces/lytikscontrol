import React from 'react';

export const Badge = ({ status }) => {
  const styles = {
    pending: "bg-[rgba(245,158,11,0.14)] text-amber-200 border border-amber-500/40",
    approved: "bg-[rgba(96,165,250,0.14)] text-blue-200 border border-blue-500/40",
    rejected: "bg-[rgba(239,68,68,0.14)] text-red-200 border border-red-500/40",
    'checked-in': "bg-[rgba(16,185,129,0.14)] text-emerald-200 border border-emerald-500/40",
    'checked-out': "bg-white/10 text-slate-200 border border-white/15",
  };
  const labels = {
    pending: "Pendiente",
    approved: "Aprobada",
    rejected: "Rechazada",
    'checked-in': "En Sitio",
    'checked-out': "Finalizada",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
};
