import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-500/10 text-amber-100 border border-amber-400/40",
    approved: "bg-blue-500/10 text-blue-100 border border-blue-400/40",
    rejected: "bg-red-500/10 text-red-100 border border-red-400/40",
    'checked-in': "bg-emerald-500/10 text-emerald-100 border border-emerald-400/40",
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
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
};
