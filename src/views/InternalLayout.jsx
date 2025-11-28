import React, { useMemo, useState } from 'react';
import { LayoutDashboard, Users, FileText, Settings, Bell, Calendar, Clock, Search, Filter, CheckCircle2, XCircle, MapPin, UserCheck, ShieldCheck, User as UserIcon, AlertTriangle } from 'lucide-react';
import { Card, Button } from '../components/ui';
import { SidebarItem, StatCard } from './partials/InternalPartials';
import { NotificationCenter } from '../components/common/NotificationCenter';
import { StatusBadge } from '../components/common/StatusBadge';
import { AppShell } from '../components/layout/AppShell';
import { Topbar } from '../components/layout/Topbar';

export const InternalLayout = ({ role, visits, logs, updateVisitStatus, generatePDF, handleLogout, notifications = [], clearNotifications }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredVisits = useMemo(() => {
    if (role === 'host') return visits.filter(v => v.hostId === 'h1');
    if (role === 'reception') return visits.filter(v => v.date === '2025-11-26');
    return visits;
  }, [visits, role]);

  const riskStats = useMemo(() => {
    const now = Date.now();
    const expiring = visits.filter(v => v.status === 'pending' && new Date(v.date).getTime() < now).length;
    const reused = visits.filter(v => v.usesRemaining === 0).length;
    return { expiring, reused };
  }, [visits]);

  const stats = {
    total: filteredVisits.length,
    pending: filteredVisits.filter(v => v.status === 'pending').length,
    onsite: filteredVisits.filter(v => v.status === 'checked-in').length,
  };

  return (
    <AppShell>
    <div className="flex h-screen">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <Settings className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">LytiksControl</h1>
              <p className="text-xs text-slate-400">Control de Accesos BASC</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Users} label="Visitas" active={activeTab === 'visits'} onClick={() => setActiveTab('visits')} />
          {role === 'admin' && (
            <>
              <SidebarItem icon={FileText} label="Auditoría & Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
              <SidebarItem icon={Settings} label="Configuración" active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
            </>
          )}
        </nav>

        <div className="p-4 bg-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
              {role === 'admin' ? 'AD' : role === 'host' ? 'AL' : 'RX'}
            </div>
            <div>
              <p className="text-sm font-medium text-white capitalize">{role}</p>
              <p className="text-xs text-slate-400">En línea</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[var(--page-bg)] text-white relative">
        <Topbar
          title={
            activeTab === 'dashboard' ? 'Resumen General' :
            activeTab === 'visits' ? 'Gestión de Visitas' :
            activeTab === 'logs' ? 'Registro de Auditoría' :
            'Configuración de Empresa'
          }
          subtitle="LytiksControl Access"
          badge="Sesión segura"
          actions={
            <div className="flex items-center gap-3 relative text-white">
              <button
                onClick={() => setShowNotifications(v => !v)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors relative border border-white/10"
              >
                <Bell size={20} />
                {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>}
              </button>
              {showNotifications && (
                <NotificationCenter
                  notifications={notifications}
                  onClear={() => { clearNotifications?.(); setShowNotifications(false); }}
                />
              )}
              <Button variant="secondary" onClick={handleLogout} className="text-white border-white/15 bg-white/5 hover:bg-white/10">Cerrar sesión</Button>
            </div>
          }
        />

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Visitas Totales" value={stats.total} icon={Users} color="blue" variant="dark" />
                <div onClick={() => setActiveTab('visits')} className="cursor-pointer">
                  <StatCard title="Pendientes Aprobación" value={stats.pending} icon={Clock} color="amber" variant="dark" />
                </div>
                <StatCard title="Actualmente en Sitio" value={stats.onsite} icon={Calendar} color="emerald" variant="dark" />
                <StatCard title="Riesgos detectados" value={riskStats.expiring + riskStats.reused} icon={AlertTriangle} color="red" variant="dark" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Últimos Movimientos" className="h-full glass-blur text-white">
                  <div className="space-y-4">
                    {logs.slice(0, 6).map(log => (
                      <div key={log.id} className="flex items-start gap-3 text-sm pb-3 border-b border-white/10 last:border-0">
                        <div className="bg-white/10 p-2 rounded-full mt-1 text-white/80">
                          <FileText size={14}/>
                        </div>
                        <div>
                          <p className="font-medium text-white">{log.action}</p>
                          <p className="text-[var(--text-subtle)]">{log.detail}</p>
                          <span className="text-xs text-[var(--text-muted)] mt-1 block">{log.time} • {log.user}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card title="Riesgos y alertas" className="glass-blur text-white">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between bg-red-500/15 border border-red-400/30 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 text-red-100"><AlertTriangle size={16}/> Pendientes vencidos</div>
                      <span className="font-bold text-red-100">{riskStats.expiring}</span>
                    </div>
                    <div className="flex items-center justify-between bg-amber-500/15 border border-amber-400/30 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 text-amber-100"><AlertTriangle size={16}/> Intentos de reuso</div>
                      <span className="font-bold text-amber-100">{riskStats.reused}</span>
                    </div>
                    <div className="flex items-center justify-between bg-indigo-500/15 border border-indigo-400/30 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 text-indigo-100"><ShieldCheck size={16}/> MFA / QR encriptado</div>
                      <span className="font-bold text-indigo-100">On</span>
                    </div>
                  </div>
                </Card>
                <Card title="Filtros rápidos" className="glass-blur text-white">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {['Hoy', 'Pendientes', 'Aprobadas', 'En sitio', 'Reuso detectado', 'Expira pronto'].map(tag => (
                      <button key={tag} className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15 motion-soft">
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-[var(--text-muted)]">
                    <p>Filtros persistentes para próximas sesiones.</p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center glass-blur text-white p-4 rounded-xl border border-white/10">
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-white/70" size={18} />
                    <input placeholder="Buscar visita..." className="pl-10 pr-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 bg-white/10 border border-white/20 text-white placeholder:text-white/60" aria-label="Buscar visita" />
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white border border-white/15 bg-white/10 hover:bg-white/15">
                    <Filter size={16} /> Filtros
                  </button>
                </div>
                {(role === 'reception' || role === 'admin') && (
                  <Button icon={Users} onClick={() => alert("Función para crear visita manual")} className="bg-white text-slate-900 border border-white/80 hover:bg-white/90">Nueva Visita</Button>
                )}
              </div>

              <div className="bg-white/95 backdrop-blur text-slate-900 rounded-xl shadow-[0_25px_60px_-45px_rgba(0,0,0,0.6)] border border-white/70 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Visitante</th>
                      <th className="px-6 py-4">Empresa / Tipo</th>
                      <th className="px-6 py-4">Fecha / Hora</th>
                      <th className="px-6 py-4">Anfitrión</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredVisits.length === 0 ? (
                      <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">No hay visitas registradas</td></tr>
                    ) : filteredVisits.map(visit => (
                      <tr key={visit.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{visit.visitorName}</p>
                          <p className="text-xs text-gray-500">{visit.email || 'No email'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{visit.company}</p>
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{visit.type}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5"><Calendar size={14}/> {visit.date}</div>
                          <div className="flex items-center gap-1.5 mt-1"><Clock size={14}/> {visit.time}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{visit.hostName}</td>
                        <td className="px-6 py-4"><StatusBadge status={visit.status} /></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {visit.status === 'pending' && (
                              <>
                                <button onClick={() => updateVisitStatus(visit.id, 'approved', role)} className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"><CheckCircle2 size={18} /></button>
                                <button onClick={() => updateVisitStatus(visit.id, 'rejected', role)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><XCircle size={18} /></button>
                              </>
                            )}
                            {visit.status === 'approved' && role === 'reception' && (
                              <button onClick={() => alert("Usa el modo Tablet para hacer check-in")} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-medium">Check-in</button>
                            )}
                            {(visit.docImage || visit.signatureData) && (
                              <button onClick={() => generatePDF(visit)} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium border border-slate-200">PDF</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && role === 'admin' && (
            <Card title="Registro de Auditoría y Seguridad" className="bg-white/95 backdrop-blur text-slate-900 border border-white/70 shadow-[0_25px_60px_-45px_rgba(0,0,0,0.6)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-gray-500 border-b">
                    <tr>
                      <th className="py-3 px-4">Fecha/Hora</th>
                      <th className="py-3 px-4">Usuario</th>
                      <th className="py-3 px-4">Acción</th>
                      <th className="py-3 px-4">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-xs text-gray-500">{log.time}</td>
                        <td className="py-3 px-4 font-medium text-gray-700">{log.user}</td>
                        <td className="py-3 px-4"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200">{log.action}</span></td>
                        <td className="py-3 px-4 text-gray-600">{log.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'config' && (
            <div className="grid gap-6 lg:grid-cols-3 animate-fade-in">
              <Card title="Branding y temas" className="glass-blur text-white border border-white/10">
                <p className="text-sm text-[var(--text-subtle)] mb-4">Personaliza logo, colores y fondo del kiosko.</p>
                <div className="space-y-3 text-sm">
                  <button className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 motion-soft">Subir logo</button>
                  <button className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 motion-soft">Elegir paleta</button>
                  <button className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 motion-soft">Fondo dinámico</button>
                </div>
              </Card>
              <Card title="Seguridad y MFA" className="glass-blur text-white border border-white/10">
                <p className="text-sm text-[var(--text-subtle)] mb-4">Endurece políticas de acceso y QR.</p>
                <div className="space-y-3 text-sm">
                  <label className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                    <span>MFA obligatorio</span>
                    <input type="checkbox" defaultChecked className="accent-indigo-500" />
                  </label>
                  <label className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                    <span>QR encriptado</span>
                    <input type="checkbox" defaultChecked className="accent-indigo-500" />
                  </label>
                  <label className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                    <span>Retención de evidencias</span>
                    <input type="checkbox" defaultChecked className="accent-indigo-500" />
                  </label>
                </div>
              </Card>
              <Card title="Integraciones y exportes" className="glass-blur text-white border border-white/10">
                <p className="text-sm text-[var(--text-subtle)] mb-4">Conecta con tus sistemas.</p>
                <div className="space-y-3 text-sm">
                  <button className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 motion-soft">Webhook / API</button>
                  <button className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 motion-soft">Exportar PDF/CSV</button>
                  <button className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 motion-soft">SIEM / Logs</button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
    </AppShell>
  );
};
