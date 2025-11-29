import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Users, ClipboardCheck, LogOut, Bell, 
  Search, CheckCircle2, XCircle, Printer, Download, Gavel, X, ExternalLink, Laptop, ShieldCheck
} from 'lucide-react';
import { Button, StatusBadge, Select, SidebarItem, Topbar } from '../components/ui';

// --- MODAL: VALIDACIÓN DE ACTIVOS (PORTERÍA) ---
const AssetCheckModal = ({ visit, onClose, onConfirm }) => {
    const [assetsOk, setAssetsOk] = useState(false);
    const [badgeReturned, setBadgeReturned] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex gap-2"><ShieldCheck/> Validación de Salida</h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        {visit.evidence?.docPhoto ? (
                            <img src={visit.evidence.docPhoto} className="w-16 h-16 rounded-xl object-cover border border-slate-200"/>
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">NO FOTO</div>
                        )}
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg">{visit.visitorName}</h4>
                            <p className="text-slate-500 text-sm">{visit.company}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Activos Declarados</p>
                        {visit.hasAssets ? (
                            <div className="flex items-start gap-3">
                                <Laptop className="text-indigo-600 mt-1" size={20}/>
                                <div>
                                    <p className="font-bold text-slate-800">{visit.assetBrand}</p>
                                    <p className="font-mono text-xs text-slate-500">S/N: {visit.assetSerial}</p>
                                    {visit.evidence?.assetPhoto && <p className="text-[10px] text-indigo-600 mt-1 cursor-pointer hover:underline">Ver foto activo</p>}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">No declaró activos al ingreso.</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        {visit.hasAssets && (
                            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50">
                                <input type="checkbox" checked={assetsOk} onChange={e => setAssetsOk(e.target.checked)} className="w-5 h-5 accent-indigo-600"/>
                                <span className="text-sm font-medium">Activos Verificados (Coincide Serial)</span>
                            </label>
                        )}
                        <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" checked={badgeReturned} onChange={e => setBadgeReturned(e.target.checked)} className="w-5 h-5 accent-indigo-600"/>
                            <span className="text-sm font-medium">Escarapela Recibida</span>
                        </label>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-200">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button 
                        disabled={!badgeReturned || (visit.hasAssets && !assetsOk)}
                        onClick={() => onConfirm(visit.id, 'Guardia Turno')} 
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        Autorizar Salida
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- MODAL: VERIFICACIÓN JUDICIAL ---
const SecurityCheckModal = ({ visit, onClose, onConfirm }) => {
    const [risk, setRisk] = useState('none');
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-lg flex gap-2"><Gavel size={20}/> Verificación Judicial</h3><button onClick={onClose}><X size={20}/></button></div>
                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><p className="text-xs text-slate-500 uppercase font-bold">Cédula</p><p className="font-mono text-lg font-bold">{visit.cedula || 'N/A'}</p></div>
                    <a href="https://consultas.funcionjudicial.gob.ec/informacionjudicialindividual/pages/index.jsf#!/" target="_blank" className="flex items-center gap-2 text-indigo-600 text-sm font-medium hover:underline"><ExternalLink size={14}/> Consultar Función Judicial</a>
                    <div>
                        <label className="block text-sm font-bold mb-2">Resultado</label>
                        <Select options={['Sin Antecedentes', 'Riesgo Medio (Civil)', 'Riesgo Alto (Penal)']} value={risk} onChange={e => setRisk(e.target.value)} />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={() => onConfirm(risk === 'Riesgo Alto (Penal)' ? 'rejected' : 'approved')}>Confirmar</Button>
                </div>
            </div>
        </div>
    );
};

export const InternalLayout = ({ role, visits, logs, updateVisitStatus, markJudicialResult, generatePDF, handleLogout, notifications, clearNotifications, handleAssetValidation }) => {
    const [tab, setTab] = useState(role === 'porteria' ? 'porteria' : 'dashboard');
    const [verifyModal, setVerifyModal] = useState(null); 
    const [assetModal, setAssetModal] = useState(null); 

    const stats = useMemo(() => ({
        total: visits.length,
        pending: visits.filter(v => v.status === 'pending').length,
        onsite: visits.filter(v => v.status === 'checked-in').length,
    }), [visits]);

    const porteriaVisits = useMemo(() => 
        visits.filter(v => v.status === 'checked-in'), 
    [visits]);

    return (
        <div className="flex h-screen bg-[var(--page-bg)] text-[var(--text-strong)] font-sans theme-admin">
            
            {/* MODALES */}
            {verifyModal && <SecurityCheckModal visit={verifyModal} onClose={() => setVerifyModal(null)} onConfirm={(status) => { updateVisitStatus(verifyModal.id, status, role); setVerifyModal(null); }} />}
            {assetModal && <AssetCheckModal visit={assetModal} onClose={() => setAssetModal(null)} onConfirm={(id, guardian) => { handleAssetValidation(id, guardian); setAssetModal(null); }} />}

            {/* SIDEBAR */}
            <aside className="w-64 bg-[#0f172a] text-white flex flex-col shadow-xl z-20">
                <div className="h-16 flex items-center px-6 border-b border-slate-800 font-bold text-lg tracking-tight bg-[#0b111f]">
                    <ShieldCheck className="mr-2 text-indigo-500"/> LytiksControl
                </div>
                <div className="p-4 space-y-1 overflow-y-auto">
                    {role === 'porteria' ? (
                        <>
                            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-2">Garita</p>
                            <SidebarItem icon={LogOut} label="Control Salidas" active={tab === 'porteria'} onClick={() => setTab('porteria')} />
                        </>
                    ) : (
                        <>
                            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-2">Gestión</p>
                            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={tab === 'dashboard'} onClick={() => setTab('dashboard')} />
                            <SidebarItem icon={Users} label="Visitas" active={tab === 'visits'} onClick={() => setTab('visits')} />
                            {role === 'admin' && <SidebarItem icon={ClipboardCheck} label="Auditoría BASC" active={tab === 'basc'} onClick={() => setTab('basc')} />}
                        </>
                    )}
                </div>
                <div className="mt-auto p-4 border-t border-slate-800 bg-[#0b111f]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm shadow-lg">{role[0].toUpperCase()}</div>
                        <div className="text-sm overflow-hidden">
                            <p className="font-bold capitalize truncate">{role}</p>
                            <p className="text-xs text-slate-400">En línea</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 text-slate-400 hover:text-white text-sm hover:bg-slate-800 p-2 rounded-lg transition-colors">
                        <LogOut size={16}/> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <Topbar 
                  title={tab === 'dashboard' ? 'Resumen Operativo' : tab === 'visits' ? 'Control de Accesos' : tab === 'porteria' ? 'Control de Salidas' : 'Auditoría BASC'}
                  subtitle={role === 'porteria' ? 'Garita Principal' : 'Panel de Administración'}
                  actions={
                    <div className="relative group cursor-pointer">
                        <Bell size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors"/>
                        {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                    </div>
                  }
                />
                
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    {/* VISTA PORTERÍA (CONTROL SALIDAS) */}
                    {tab === 'porteria' && (
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <Search className="text-slate-400"/>
                                <input placeholder="Buscar persona en sitio..." className="flex-1 outline-none text-sm"/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {porteriaVisits.map(v => (
                                    <div key={v.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                        <div className="p-5 flex items-start justify-between">
                                            <div className="flex gap-4">
                                                {v.evidence?.docPhoto ? <img src={v.evidence.docPhoto} className="w-12 h-12 rounded-xl object-cover bg-slate-100"/> : <div className="w-12 h-12 rounded-xl bg-slate-100"/>}
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{v.visitorName}</h3>
                                                    <p className="text-xs text-slate-500">{v.company}</p>
                                                    {v.hasAssets && <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100"><Laptop size={10}/> CON ACTIVOS</span>}
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-slate-400">{v.checkIn}</span>
                                        </div>
                                        <div className="mt-auto p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                            {v.exitPermission ? (
                                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14}/> LISTO PARA SALIR</span>
                                            ) : (
                                                <Button variant="secondary" onClick={() => setAssetModal(v)} className="w-full text-xs">Validar Salida</Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {porteriaVisits.length === 0 && <div className="col-span-full text-center py-10 text-slate-500">No hay visitas en sitio.</div>}
                            </div>
                        </div>
                    )}

                    {/* VISTA DASHBOARD */}
                    {tab === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Total Visitas</p><p className="text-4xl font-bold text-slate-800 mt-2">{stats.total}</p></div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Pendientes</p><p className="text-4xl font-bold text-amber-600 mt-2">{stats.pending}</p></div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><p className="text-slate-500 text-xs uppercase font-bold tracking-wider">En Sitio</p><p className="text-4xl font-bold text-emerald-600 mt-2">{stats.onsite}</p></div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <h3 className="font-bold text-slate-800 mb-6 text-lg">Actividad Reciente</h3>
                                <div className="space-y-0 relative">
                                    <div className="absolute top-2 left-2.5 bottom-2 w-0.5 bg-slate-100"></div>
                                    {logs.slice(0, 8).map(log => (
                                        <div key={log.id} className="flex items-start gap-4 py-3 relative z-10">
                                            <div className="w-5 h-5 rounded-full bg-white border-4 border-indigo-100 flex-shrink-0 mt-0.5"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-700">{log.action}</p>
                                                <p className="text-sm text-slate-500">{log.detail} <span className="text-xs text-slate-400">• {log.user}</span></p>
                                            </div>
                                            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">{log.time.split(' ')[1]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VISTA VISITAS */}
                    {tab === 'visits' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Listado Maestro</h3>
                                <Button variant="secondary" icon={Download} className="text-xs">Exportar</Button>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Visitante</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Activos</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {visits.map(v => (
                                        <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900 text-sm">{v.visitorName}</p>
                                                <p className="text-xs text-slate-500">{v.company}</p>
                                            </td>
                                            <td className="px-6 py-4"><StatusBadge status={v.status}/></td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                {v.hasAssets ? `${v.assetBrand} (${v.assetSerial})` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                {v.status === 'pending' && <Button size="sm" onClick={() => setVerifyModal(v)} className="py-1.5 px-3 text-xs">Aprobar</Button>}
                                                <Button variant="secondary" onClick={() => generatePDF(v)} className="py-1.5 px-3 text-xs"><Printer size={14}/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* VISTA BASC */}
                    {tab === 'basc' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-2xl flex justify-between items-center shadow-lg">
                                <div><h2 className="text-2xl font-bold mb-1">Certificable BASC V6</h2><p className="text-slate-400 text-sm">Índice de cumplimiento en tiempo real</p></div>
                                <div className="text-5xl font-bold text-emerald-400 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm">A+</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={20}/></div><h4 className="font-bold text-slate-800">5.1 Control de Identidad</h4></div>
                                    <p className="text-sm text-slate-500 leading-relaxed">El 100% de los ingresos cuenta con verificación de cédula y antecedentes judiciales.</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck size={20}/></div><h4 className="font-bold text-slate-800">5.2 Seguridad de Activos</h4></div>
                                    <p className="text-sm text-slate-500 leading-relaxed">Trazabilidad fotográfica de activos y validación cruzada en portería.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};