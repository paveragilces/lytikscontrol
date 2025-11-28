import React from 'react';

export const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium motion-soft ${
      active 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    {label}
  </button>
);

export const StatCard = ({ title, value, icon: Icon, color, variant = 'light' }) => {
  if (variant === 'dark') {
    const colors = {
      blue: "bg-white/10 text-blue-200 border border-blue-300/30",
      amber: "bg-white/10 text-amber-200 border border-amber-300/30",
      emerald: "bg-white/10 text-emerald-200 border border-emerald-300/30",
      red: "bg-white/10 text-red-200 border border-red-300/30"
    };
    return (
      <div className="glass-blur text-white p-6 rounded-2xl border border-white/10 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.7)] flex items-center justify-between motion-soft hover:shadow-xl hover:-translate-y-1">
        <div>
          <p className="text-sm text-slate-200/90 font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-4 rounded-full ${colors[color] || colors.blue}`}>
          <Icon size={24} />
        </div>
      </div>
    );
  }
  const colors = {
      blue: "bg-blue-50 text-blue-600",
      amber: "bg-amber-50 text-amber-600",
      emerald: "bg-emerald-50 text-emerald-600",
      red: "bg-red-50 text-red-600"
  };
  return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between motion-soft hover:shadow-lg hover:-translate-y-1">
          <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
              <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          </div>
          <div className={`p-4 rounded-full ${colors[color] || colors.blue}`}>
              <Icon size={24} />
          </div>
      </div>
  )
}
