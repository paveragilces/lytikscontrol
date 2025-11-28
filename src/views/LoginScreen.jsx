import React from 'react';
import { ShieldCheck, Fingerprint, MonitorSmartphone, Shield, UserCheck } from 'lucide-react';
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
    <div className="absolute inset-0 overflow-hidden">
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
      <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_25px_80px_-40px_rgba(0,0,0,0.8)]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-slate-200 mb-4">
          <ShieldCheck size={14} /> Seguridad & Trazabilidad
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">LytiksControl Access</h1>
        <p className="text-slate-200 mt-4 text-lg">Autenticación reforzada para operaciones críticas. Validación QR, biometría y auditoría con trazabilidad end-to-end.</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {['BASC Ready','Logs firmados','Zero Trust','QR encriptado'].map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-slate-200">{tag}</span>
          ))}
        </div>
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            { title: "MFA Ready", desc: "OTP + políticas de dispositivo" },
            { title: "Audit Trail", desc: "Logs firmados y exportables" },
            { title: "Zero Trust", desc: "Sesiones con tiempo y rol" },
          ].map(card => (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">{card.title}</p>
              <p className="text-xs text-slate-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="p-8 rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-[0_25px_80px_-40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-200/40">
            <Fingerprint className="text-indigo-100" size={26} />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.14em] text-slate-300 font-semibold">Portal Seguro</p>
            <h3 className="text-xl font-bold">Inicio de sesión</h3>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-slate-300">Elige tu modo de operación:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={() => { setAuthenticated(true); setRole('kiosk'); addLog('Login', 'Acceso directo Kiosko sin credencial', 'Portal Auth'); }} className="rounded-2xl border border-white/15 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 px-4 py-5 text-left hover:border-white/40 transition-colors flex items-start gap-3">
              <MonitorSmartphone className="mt-1 text-white/90" size={22} />
              <div>
                <p className="text-sm font-semibold text-white">Kiosko</p>
                <p className="text-xs text-slate-200">Tablet mostrador sin login</p>
              </div>
            </button>
            <button onClick={() => { setAuthenticated(true); setRole('visitor'); addLog('Login', 'Acceso directo Visitante', 'Portal Auth'); }} className="rounded-2xl border border-white/15 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 px-4 py-5 text-left hover:border-white/40 transition-colors flex items-start gap-3">
              <UserCheck className="mt-1 text-white/90" size={22} />
              <div>
                <p className="text-sm font-semibold text-white">Visitante</p>
                <p className="text-xs text-slate-200">Formulario público</p>
              </div>
            </button>
            <button onClick={() => setLoginMode('admin')} className="rounded-2xl border border-white/15 bg-gradient-to-br from-amber-500/20 to-red-500/20 px-4 py-5 text-left hover:border-white/40 transition-colors flex items-start gap-3">
              <Shield className="mt-1 text-white/90" size={22} />
              <div>
                <p className="text-sm font-semibold text-white">Administrativo</p>
                <p className="text-xs text-slate-200">Requiere credenciales</p>
              </div>
            </button>
          </div>

          {loginMode === 'admin' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {demoAccounts.filter(acc => acc.role !== 'kiosk' && acc.role !== 'visitor').map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => { setLoginEmail(acc.email); setLoginPass(acc.pass); setLoginRole(acc.role); }}
                    className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-left hover:border-white/30 transition-colors"
                  >
                    <p className="text-sm font-semibold text-white">{acc.label}</p>
                    <p className="text-xs text-slate-300">{acc.email} / {acc.pass}</p>
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm text-slate-200 font-semibold block mb-2">Correo corporativo</label>
                <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="tu@empresa.com" className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/10 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400/70 outline-none" />
              </div>
              <div>
                <label className="text-sm text-slate-200 font-semibold block mb-2">Clave temporal / OTP</label>
                <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••" className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/10 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400/70 outline-none" />
              </div>
              <div>
                <label className="text-sm text-slate-200 font-semibold block mb-2">Rol de acceso</label>
                <select value={loginRole} onChange={e => setLoginRole(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/10 text-white focus:ring-2 focus:ring-indigo-400/70 outline-none">
                  {roleOptions.filter(r => r.id !== 'kiosk' && r.id !== 'visitor').map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <Button className="w-full mt-2" onClick={handleLogin}>Ingresar</Button>
              <p className="text-xs text-slate-300">Este acceso queda registrado en el log y habilita lectura de QR, captura de cédula y firma.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
