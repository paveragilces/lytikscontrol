import React from 'react';
import { motion } from 'framer-motion';

export const ActionTile = ({ icon: Icon, title, description, badge, onClick, variant = 'primary', className = '' }) => {
  const isPrimary = variant === 'primary';
  const secondaryBg = 'bg-gradient-to-br from-[#0f172a]/85 via-[#111827]/80 to-[#0b1324]/85 text-white border-white/15 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)]';
  const primaryBg = 'bg-gradient-to-br from-[#3b2a68] via-[#2f3b63] to-[#1b243f] text-white border-white/12 shadow-[0_22px_70px_-40px_rgba(59,70,99,0.8)]';
  return (
    <motion.button 
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`group relative overflow-hidden rounded-[30px] p-10 text-left border min-h-[260px] ${isPrimary ? primaryBg : secondaryBg} ${className}`}
    >
      <div className="absolute inset-0 pointer-events-none">
        {isPrimary && <div className="absolute inset-[-20%] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_40%)] opacity-80"></div>}
      </div>
      {badge && (
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[11px] font-semibold ${isPrimary ? 'bg-white/15 border-white/25 text-white' : 'bg-white/10 border-white/15 text-white'}`}>
          {badge.icon && <badge.icon size={12} />} {badge.label}
        </div>
      )}
      <div className="relative space-y-4 mt-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <span className={`p-4 rounded-2xl ${isPrimary ? 'bg-white/18 text-white' : 'bg-white/10 text-white'}`}>
              <Icon size={30}/>
            </span>
          )}
          <h3 className={`text-3xl md:text-4xl font-extrabold ${isPrimary ? 'text-white' : 'text-white'}`}>{title}</h3>
        </div>
        <p className={`text-lg leading-relaxed ${isPrimary ? 'text-indigo-50' : 'text-slate-100/90'}`}>{description}</p>
      </div>
    </motion.button>
  );
};
