import React, { useEffect, useState } from 'react';

export const CountdownCircle = ({ expiresAt }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  const total = 30000;
  const remaining = Math.max(0, expiresAt - now);
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
  const deg = (pct / 100) * 360;
  const seconds = Math.ceil(remaining / 1000);
  return (
    <div className="w-10 h-10 rounded-full border border-slate-200 relative grid place-items-center" style={{ background: `conic-gradient(#6366f1 ${deg}deg, #e5e7eb ${deg}deg)` }}>
      <div className="w-7 h-7 rounded-full bg-white grid place-items-center text-[11px] font-semibold text-slate-700">
        {seconds}
      </div>
    </div>
  );
};
