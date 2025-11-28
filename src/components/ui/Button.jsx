import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled = false, type = 'button' }) => {
  const baseStyle = "btn-base flex items-center justify-center gap-2 px-4 py-3 motion-soft focus-outline active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "btn-primary hover:shadow-lg hover:-translate-y-0.5",
    secondary: "btn-secondary hover:-translate-y-0.5 hover:shadow-md",
    danger: "bg-red-600/90 text-white hover:bg-red-500 rounded-xl",
    ghost: "btn-ghost hover:bg-white/10",
  };

  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
      {Icon && <Icon size={18} className="opacity-90" />}
      {children}
    </button>
  );
};
