import React, { useMemo, useState } from 'react';
import { 
  ShieldAlert, CheckCircle2, UserCheck, Search, AlertTriangle
} from 'lucide-react';

export const EvacuationView = ({ visits, handleLogout }) => {
  const [accounted, setAccounted] = useState({});
  const [filter, setFilter] = useState('missing'); // 'all', 'missing', 'safe'
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar solo los que estaban "En Sitio" al momento de la emergencia
  const activeEvacuationList = useMemo(() => 
    visits.filter(v => v.status === 'checked-in'), 
  [visits]);

  // Estadísticas en tiempo real
  const stats = useMemo(() => {
    const total = activeEvacuationList.length;
    const safe = Object.values(accounted).filter(Boolean).length;
    const missing = total - safe;
    const progress = total === 0 ? 0 : (safe / total) * 100;
    return { total, safe, missing, progress };
  }, [activeEvacuationList, accounted]);

  // Lista filtrada para mostrar
  const displayedList = useMemo(() => {
    return activeEvacuationList
      .filter(v => {
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return v.visitorName.toLowerCase().includes(search) || 
                   v.company.toLowerCase().includes(search);
        }
        if (filter === 'missing') return !accounted[v.id];
        if (filter === 'safe') return accounted[v.id];
        return true;
      })
      .sort((a, b) => {
        const aSafe = !!accounted[a.id];
        const bSafe = !!accounted[b.id];
        return aSafe === bSafe ? 0 : aSafe ? 1 : -1;
      });
  }, [activeEvacuationList, filter, accounted, searchTerm]);

  const toggleSafety = (id) => {
    setAccounted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-200 flex flex-col relative overflow-hidden">
      {/* Fondo sutil animado */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-orange-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
      </div>

      {/* HEADER */}
      <header className="relative z-20 pt-6 pb-6 px-6 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-2xl animate-pulse">
                 <ShieldAlert size={28} className="text-orange-400" />
               </div>
               <div>
                 <h1 className="text-2xl font-bold text-white tracking-tight leading-none">Protocolo SOS</h1>
                 <p className="text-orange-200/60 text-xs mt-1 font-medium tracking-widest uppercase">Punto de Encuentro #1</p>
               </div>
            </div>
            <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold border border-white/10 transition-colors text-slate-300"
            >
                Finalizar
            </button>
          </div>

          {/* INDICADORES DE PROGRESO */}
          <div className="space-y-3">
            <div className="flex justify-between items-end text-sm">
                <span className="text-slate-400 font-medium">Progreso de evacuación</span>
                <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${stats.missing === 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                        {stats.safe} <span className="text-slate-500 text-sm font-normal">/ {stats.total}</span>
                    </span>
                </div>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5 relative">
                <div 
                    className={`h-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(249,115,22,0.3)] relative overflow-hidden ${stats.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-600 to-amber-500'}`}
                    style={{ width: `${stats.progress}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 w-full h-full -skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTROLES DE FILTRO */}
      <div className="sticky top-[150px] z-10 bg-[#0b1020]/90 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-3xl mx-auto space-y-3">
            <div className="relative">
                <Search className="absolute left-4 top-3 text-slate-500" size={18}/>
                <input 
                    placeholder="Buscar persona..." 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all placeholder:text-slate-600"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                {[
                    { id: 'missing', label: `Faltan (${stats.missing})`, activeClass: 'bg-orange-500/10 text-orange-200 border-orange-500/20' },
                    { id: 'safe', label: `A Salvo (${stats.safe})`, activeClass: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20' },
                    { id: 'all', label: 'Lista Completa', activeClass: 'bg-indigo-500/10 text-indigo-200 border-indigo-500/20' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all border ${filter === tab.id ? `${tab.activeClass} shadow-sm` : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* AREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full z-0 overflow-y-auto pb-10">
        
        {/* NUEVA POSICIÓN: BANNER DE ESTADO INTEGRADO */}
        {stats.missing > 0 ? (
            <div className="mb-6 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top-2 fade-in duration-500">
                <div className="p-3 bg-orange-500/20 rounded-full text-orange-400 animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <p className="text-sm font-bold text-white">Atención Requerida</p>
                    <p className="text-xs text-orange-200/70 mt-0.5">
                        Aún quedan <strong className="text-orange-100">{stats.missing} personas</strong> por localizar en la zona de riesgo.
                    </p>
                </div>
            </div>
        ) : stats.total > 0 && (
            <div className="mb-6 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top-2 fade-in duration-500">
                <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                    <p className="text-sm font-bold text-white">Zona Segura</p>
                    <p className="text-xs text-emerald-200/70 mt-0.5">
                        Todas las personas han sido contabilizadas exitosamente.
                    </p>
                </div>
            </div>
        )}

        {displayedList.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center opacity-50">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                    <UserCheck size={32} className="text-slate-600"/>
                </div>
                <p className="text-slate-500 text-sm">No hay personas en esta lista.</p>
            </div>
        ) : (
            <div className="space-y-3">
                {displayedList.map(v => {
                    const isSafe = !!accounted[v.id];
                    return (
                        <div 
                            key={v.id} 
                            onClick={() => toggleSafety(v.id)}
                            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer touch-manipulation
                                ${isSafe 
                                    ? 'bg-slate-900/40 border-white/5 opacity-60 scale-[0.99]' 
                                    : 'bg-slate-800/60 border-white/10 hover:border-orange-500/30 hover:bg-slate-800/80 active:scale-[0.98]'
                                }
                            `}
                        >
                            <div className="p-4 flex items-center gap-4">
                                {/* Indicador Visual */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${isSafe ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-700/30 border-white/10 text-slate-500 group-hover:border-orange-500/50 group-hover:text-orange-400'}`}>
                                    {isSafe ? <CheckCircle2 size={24} /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-base font-bold truncate ${isSafe ? 'text-slate-500 line-through decoration-slate-600' : 'text-white'}`}>
                                        {v.visitorName}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded border truncate max-w-[120px] ${isSafe ? 'bg-transparent border-slate-700 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                                            {v.company}
                                        </span>
                                        <span className="text-xs text-slate-500 truncate">
                                            • {v.hostName.split(' ')[0]}
                                        </span>
                                    </div>
                                </div>

                                {/* Botón de Acción */}
                                {!isSafe && (
                                    <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-300 uppercase tracking-wider group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                        Localizar
                                    </div>
                                )}
                            </div>
                            
                            {/* Barra de progreso de la tarjeta */}
                            <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isSafe ? 'w-full bg-emerald-500' : 'w-0 bg-orange-500'}`} />
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};