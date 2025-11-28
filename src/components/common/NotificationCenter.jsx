import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const NotificationCenter = ({ notifications = [], onClear }) => {
  const colors = {
    info: 'bg-white/5 text-white border-white/10',
    warn: 'bg-amber-500/15 text-amber-100 border-amber-300/30',
    crit: 'bg-red-500/15 text-red-100 border-red-400/30',
  };
  const icons = {
    info: <Info size={16} />,
    warn: <AlertTriangle size={16} />,
    crit: <AlertTriangle size={16} />,
  };

  return (
    <div className="absolute top-12 right-0 w-80 theme-card theme-card-strong p-4 z-20 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-white">Centro de notificaciones</p>
        <button className="text-xs text-indigo-200 hover:underline" onClick={onClear}>Limpiar</button>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {notifications.length === 0 && <p className="text-sm text-[var(--text-muted)]">Sin notificaciones recientes.</p>}
        {notifications.map(n => (
          <div key={n.id} className={`flex items-start gap-3 rounded-xl p-3 border ${colors[n.severity] || colors.info}`}>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              {icons[n.severity] || icons.info}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{n.msg}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">{n.ts ? new Date(n.ts).toLocaleTimeString() : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
