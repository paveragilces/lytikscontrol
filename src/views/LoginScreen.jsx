import React from 'react';
import { ShieldCheck, Fingerprint, MonitorSmartphone, Shield, UserCheck, Siren, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui';

export const LoginScreen = ({
  setAuthenticated,
  setRole,
  addLog,
  loginMode,
  setLoginMode,
  loginEmail,
  setLoginEmail,
  loginPass,
  setLoginPass,
  loginRole,
  setLoginRole,
  handleLogin,
  roleOptions,
  demoAccounts,
}) => (
  <div className="min-h-screen relative overflow-hidden bg-[#0b1020] text-white flex items-center justify-center p-6">
    {/* Fondo animado */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div 
        className="absolute -left-32 top-[-160px] w-[520px] h-[520px] bg-indigo-500/25 blur-[120px] rounded-full"
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute right-[-200px] bottom-[-140px] w-[620px] h-[620px] bg-cyan-400/25 blur-[140px] rounded-full"
        animate={{ x: [0, -40, 20, 0], y: [0, 30, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
      <div className="absolute inset-0 opacity-60 tech-lines"></div>
    </div>

    <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 w-full max-w-6xl relative z-10">
      {/* Panel Izquierdo: Info */}
      <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_25px_80px_-40px_rgba(0,0,0,0.8)] flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-slate-200 mb-6 w-fit">
          <ShieldCheck size={14} /> Seguridad & Trazabilidad BASC
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          Lytiks<span className="text-indigo-400">Control</span> Access
        </h1>
        <p className="text-slate-300 text-lg leading-relaxed mb-8">
          Plataforma integral para gestión de identidades, control de accesos y seguridad física con estándares internacionales.
        </p>
        
        <div className="grid gap-4">
          {[
            { title: "MFA & Biometría", desc: "Validación multifactorial", icon: Fingerprint },
            { title: "Audit Trail", desc: "Trazabilidad forense", icon: Shield },
            { title: "Zero Trust", desc: "Acceso mínimo privilegiado", icon: ShieldCheck },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-300">
                <item.icon size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel Derecho: Login */}
      <div className="p-8 rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-[0_25px_80px_-40px_rgba(0,0,0,0.8)]">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.14em] text-slate-400 font-semibold mb-1">Bienvenido</p>
          <h3 className="text-2xl font-bold text-white">Selecciona tu perfil</h3>
        </div>

        <div className="space-y-4">
          {/* Grid de Accesos Normales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button 
              onClick={() => { setAuthenticated(true); setRole('kiosk'); addLog('Login', 'Acceso directo Kiosko', 'Portal Auth'); }} 
              className="group relative p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 hover:border-indigo-400/50 transition-all text-left"
            >
              <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MonitorSmartphone className="text-purple-300" size={20} />
              </div>
              <p className="font-semibold text-white text-sm">Kiosko</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Modo Tablet</p>
            </button>

            <button 
              onClick={() => { setAuthenticated(true); setRole('visitor'); addLog('Login', 'Acceso directo Visitante', 'Portal Auth'); }} 
              className="group relative p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 hover:from-cyan-500/20 hover:to-teal-500/20 hover:border-cyan-400/50 transition-all text-left"
            >
              <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UserCheck className="text-cyan-300" size={20} />
              </div>
              <p className="font-semibold text-white text-sm">Visitante</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Auto-registro</p>
            </button>

            <button 
              onClick={() => setLoginMode(loginMode === 'admin' ? null : 'admin')} 
              className={`group relative p-4 rounded-2xl border transition-all text-left ${loginMode === 'admin' ? 'bg-amber-500/20 border-amber-500/50' : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-white/10 hover:border-amber-400/50'}`}
            >
              <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Shield className="text-amber-300" size={20} />
              </div>
              <p className="font-semibold text-white text-sm">Admin</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Gestión</p>
            </button>
          </div>

          {/* Formulario Admin (Expandible) */}
          {loginMode === 'admin' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-slate-900/50 rounded-2xl p-5 border border-white/10 space-y-4"
            >
              <div className="grid grid-cols-2 gap-2 mb-4">
                {demoAccounts.filter(acc => !['kiosk','visitor'].includes(acc.role)).map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => { setLoginEmail(acc.email); setLoginPass(acc.pass); setLoginRole(acc.role); }}
                    className="text-xs bg-white/5 hover:bg-white/10 p-2 rounded-lg text-left transition-colors border border-white/5"
                  >
                    <span className="block font-medium text-white">{acc.label}</span>
                    <span className="text-slate-500">{acc.email}</span>
                  </button>
                ))}
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                    <input 
                        value={loginEmail} 
                        onChange={e => setLoginEmail(e.target.value)} 
                        placeholder="Usuario" 
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600" 
                    />
                </div>
                <div className="relative">
                    <input 
                        type="password"
                        value={loginPass} 
                        onChange={e => setLoginPass(e.target.value)} 
                        placeholder="Contraseña" 
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600" 
                    />
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500" onClick={handleLogin}>
                    Iniciar Sesión <ChevronRight size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Separador */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center"><span className="bg-[#151b2e] px-2 text-xs text-slate-500 uppercase">Emergencia</span></div>
          </div>

          {/* BOTÓN SOS / MODO EVACUACIÓN (CALL TO ACTION) */}
          <button 
            onClick={() => { setAuthenticated(true); setRole('sos'); addLog('Login', 'Modo SOS Evacuación Activado', 'Portal Auth'); }} 
            className="w-full group relative overflow-hidden rounded-2xl bg-red-600 hover:bg-red-500 border border-red-400 p-4 transition-all shadow-lg shadow-red-900/40 flex items-center justify-between"
          >
            {/* Efecto de pulso de fondo */}
            <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite] group-hover:animate-none"></div>
            
            <div className="flex items-center gap-4 relative z-10">
                <div className="bg-white/20 p-2.5 rounded-xl text-white">
                    <Siren size={24} className="animate-bounce-slow" />
                </div>
                <div className="text-left">
                    <p className="text-base font-bold text-white leading-none">MODO SOS / EVACUACIÓN</p>
                    <p className="text-xs text-red-100 mt-1 opacity-90">Lista de vida y conteo rápido</p>
                </div>
            </div>
            <ChevronRight className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all relative z-10" />
          </button>

        </div>
      </div>
    </div>
  </div>
);