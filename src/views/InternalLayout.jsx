import React, { useState, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Users, ClipboardCheck, LogOut, Bell, 
  Search, CheckCircle2, XCircle, Printer, Download, Gavel, X, ExternalLink, Laptop, ShieldCheck,
  FileText, Settings, Lock, Save, Upload, Trash2, Image as ImageIcon, AlertTriangle, Copy, 
  Activity, Fingerprint, MapPin, Car, CheckSquare, HardDrive,
  Clock, Calendar, Filter, ChevronDown // <--- FALTABAN ESTOS
} from 'lucide-react';

import { Button, Select } from '../components/ui';
import { StatusBadge } from '../components/common/StatusBadge';
import { Topbar } from '../components/layout/Topbar';
import { SidebarItem } from './partials/InternalPartials'; 
import { NotificationCenter } from '../components/common/NotificationCenter';

// --- CONSTANTES LEGALES (ECUADOR) ---
const CRIME_TYPES = [
    { id: 'none', label: 'Sin Antecedentes / Homónimo', risk: 'low', severity: 'info' },
    { id: 'civil_deudas', label: 'Civil - Cobro de Deudas / Coactiva', risk: 'medium', severity: 'warning' },
    { id: 'civil_familia', label: 'Civil - Alimentos / Divorcio', risk: 'low', severity: 'info' },
    { id: 'transito_leve', label: 'Tránsito - Contravenciones', risk: 'low', severity: 'info' },
    { id: 'transito_grave', label: 'Tránsito - Muerte / Lesiones / Embriaguez', risk: 'high', severity: 'warning' },
    { id: 'penal_robo', label: 'Penal - Robo / Hurto / Abigeato', risk: 'high', severity: 'critical' },
    { id: 'penal_estafa', label: 'Penal - Estafa / Abuso de Confianza', risk: 'high', severity: 'critical' },
    { id: 'penal_vida', label: 'Penal - Homicidio / Asesinato / Lesiones', risk: 'critical', severity: 'critical' },
    { id: 'penal_drogas', label: 'Penal - Tráfico de Sustancias', risk: 'critical', severity: 'critical' },
    { id: 'penal_lavado', label: 'Penal - Lavado de Activos / Testaferrismo', risk: 'critical', severity: 'critical' },
    { id: 'penal_sexual', label: 'Penal - Delitos Sexuales', risk: 'critical', severity: 'critical' }
];

// --- COMPONENTES VISUALES AUXILIARES ---
const AdminStatCard = ({ title, value, icon: Icon, colorClass, trend, chart }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
    <div className="flex justify-between items-start">
        <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
            {trend && (
                <div className={`text-xs font-medium mt-2 flex items-center gap-1 ${trend.includes('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trend.includes('+') ? <Activity size={12}/> : <AlertTriangle size={12}/>}
                    {trend}
                </div>
            )}
        </div>
        <div className={`p-2.5 rounded-lg ${colorClass}`}>
            <Icon size={20} />
        </div>
    </div>
    {chart && <div className="mt-3">{chart}</div>}
  </div>
);

const MiniBarChart = () => (
  <div className="flex items-end gap-2 h-16 w-full mt-2">
    {[40, 65, 45, 80, 55, 90, 60].map((h, i) => (
      <div key={i} className="flex-1 bg-indigo-50 rounded-t-sm relative group">
        <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-sm transition-all duration-500 group-hover:bg-indigo-600" style={{ height: `${h}%` }} />
      </div>
    ))}
  </div>
);

// --- MODAL MEJORADO: VERIFICACIÓN JUDICIAL CON EVIDENCIA ---
const SecurityCheckModal = ({ visit, onClose, onConfirm }) => {
    const [selectedCrime, setSelectedCrime] = useState('none');
    const [observation, setObservation] = useState('');
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [evidencePreview, setEvidencePreview] = useState(null);
    
    const fileInputRef = useRef(null);
    const crimeInfo = CRIME_TYPES.find(c => c.id === selectedCrime);
    const isHighRisk = ['high', 'critical'].includes(crimeInfo?.risk);

    const handleCopy = () => {
        navigator.clipboard.writeText(visit.cedula || '');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEvidenceFile(file);
            setEvidencePreview(URL.createObjectURL(file));
        }
    };

    const removeFile = () => {
        setEvidenceFile(null);
        setEvidencePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-scale-in flex flex-col max-h-[90vh]">
                
                {/* Header Premium */}
                <div className="bg-slate-50/80 backdrop-blur px-6 py-5 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Gavel size={22} className="text-indigo-600"/> Auditoría Judicial
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Protocolo de Verificación BASC 5.1</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
                    
                    {/* Paso 1: Identificación */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">1. Copiar Identificación</p>
                        </div>
                        <div className="flex gap-0 shadow-sm rounded-xl overflow-hidden border border-slate-200 group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <div className="flex-1 bg-slate-50 px-4 py-3 text-slate-700 font-mono font-bold text-lg flex items-center gap-3">
                                <Fingerprint size={20} className="text-slate-400"/>
                                {visit.cedula || 'Sin Cédula'}
                            </div>
                            <button 
                                onClick={handleCopy}
                                className="bg-white border-l border-slate-200 px-5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors font-medium text-sm flex items-center gap-2"
                            >
                                <Copy size={16}/> Copiar
                            </button>
                        </div>
                    </div>

                    {/* Paso 2: Fuente Oficial */}
                    <div className="space-y-3">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">2. Consultar Fuente (eSATJE)</p>
                        <a 
                            href="https://consultas.funcionjudicial.gob.ec/informacionjudicialindividual/pages/index.jsf#!/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between w-full bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-200 rounded-xl px-4 py-3.5 transition-all group"
                        >
                            <span className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                                <GlobeIcon size={18} /> Abrir Portal Consejo de la Judicatura
                            </span>
                            <ExternalLink size={16} className="text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform"/>
                        </a>
                    </div>

                    {/* Paso 3: Evidencia (Nuevo) */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">3. Adjuntar Evidencia (Opcional)</p>
                            {evidenceFile && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Adjuntado</span>}
                        </div>
                        
                        {!evidenceFile ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-slate-50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all gap-2 group"
                            >
                                <div className="p-3 bg-slate-100 group-hover:bg-white rounded-full transition-colors">
                                    <Upload size={20} className="text-slate-400 group-hover:text-indigo-500"/>
                                </div>
                                <p className="text-xs text-slate-500 font-medium text-center">Click para subir captura de pantalla <br/><span className="text-indigo-500">JPG, PNG (Max 2MB)</span></p>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                                <img src={evidencePreview} className="w-full h-32 object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Evidencia"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                    <p className="text-white text-xs font-medium truncate flex-1">{evidenceFile.name}</p>
                                    <button 
                                        onClick={removeFile}
                                        className="p-1.5 bg-white/20 hover:bg-red-500/80 backdrop-blur rounded-lg text-white transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Paso 4: Resultado y Observaciones */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">4. Dictamen Final</p>
                        
                        <div className="bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <select 
                                className="w-full px-3 py-2.5 bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer"
                                value={selectedCrime}
                                onChange={e => setSelectedCrime(e.target.value)}
                            >
                                {CRIME_TYPES.map(t => (
                                    <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tarjeta de Riesgo Mejorada */}
                        <div className={`border-l-4 rounded-r-xl p-4 flex items-start gap-4 shadow-sm transition-colors ${
                            crimeInfo.risk === 'critical' ? 'bg-red-50 border-red-500' :
                            crimeInfo.risk === 'high' ? 'bg-orange-50 border-orange-500' :
                            crimeInfo.risk === 'medium' ? 'bg-amber-50 border-amber-500' :
                            'bg-emerald-50 border-emerald-500'
                        }`}>
                            <div className={`p-2 rounded-full shrink-0 ${
                                crimeInfo.risk === 'critical' ? 'bg-red-100 text-red-600' :
                                crimeInfo.risk === 'high' ? 'bg-orange-100 text-orange-600' :
                                crimeInfo.risk === 'medium' ? 'bg-amber-100 text-amber-600' :
                                'bg-emerald-100 text-emerald-600'
                            }`}>
                                {['critical','high'].includes(crimeInfo.risk) ? <AlertTriangle size={20}/> : <ShieldCheck size={20}/>}
                            </div>
                            <div>
                                <p className={`text-sm font-bold uppercase ${
                                    crimeInfo.risk === 'critical' ? 'text-red-700' :
                                    crimeInfo.risk === 'high' ? 'text-orange-700' :
                                    crimeInfo.risk === 'medium' ? 'text-amber-700' :
                                    'text-emerald-700'
                                }`}>Riesgo: {crimeInfo.risk === 'none' ? 'Bajo' : crimeInfo.risk}</p>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    {crimeInfo.risk === 'critical' ? 'ALERTA CRÍTICA: Prohibir ingreso y notificar a Gerencia de Seguridad.' :
                                     crimeInfo.risk === 'high' ? 'ALERTA ALTA: Requiere aprobación escrita de seguridad.' :
                                     'El visitante cumple con los parámetros de seguridad estándar.'}
                                </p>
                            </div>
                        </div>

                        <textarea 
                            placeholder="Añadir observaciones internas (Opcional)..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm min-h-[80px] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white resize-none"
                            value={observation}
                            onChange={e => setObservation(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex gap-3 justify-end sticky bottom-0 z-10">
                    <Button variant="secondary" onClick={onClose} className="border-slate-300 text-slate-600 hover:bg-slate-100">Cancelar</Button>
                    {isHighRisk ? (
                        <Button 
                            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                            onClick={() => onConfirm('rejected', { risk: crimeInfo.risk, type: crimeInfo.label, obs: observation, evidence: evidenceFile })}
                        >
                            Rechazar Acceso
                        </Button>
                    ) : (
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                            onClick={() => onConfirm('approved', { risk: crimeInfo.risk, type: crimeInfo.label, obs: observation, evidence: evidenceFile })}
                        >
                            Aprobar Ingreso
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- ICONO HELPER ---
const GlobeIcon = ({size, className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
);

// --- MODAL DE VALIDACIÓN DE ACTIVOS (PORTERÍA) ---
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
                            <img src={visit.evidence.docPhoto} className="w-16 h-16 rounded-xl object-cover border border-slate-200" alt="ID"/>
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

export const InternalLayout = ({ role, visits, logs, updateVisitStatus, generatePDF, handleLogout, notifications = [], clearNotifications, handleAssetValidation }) => {
  const [activeTab, setActiveTab] = useState(role === 'porteria' ? 'porteria' : 'dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');
  
  // Estado para el modal de verificación (Nuevo)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedVisitForReview, setSelectedVisitForReview] = useState(null);
  const [assetModal, setAssetModal] = useState(null); 

  // --- LÓGICA DE DATOS ---
  const filteredVisits = useMemo(() => {
    if (role === 'host') return visits.filter(v => v.hostId === 'h1');
    if (role === 'reception') return visits.filter(v => v.date === new Date().toISOString().split('T')[0]);
    return visits;
  }, [visits, role]);

  const porteriaVisits = useMemo(() => 
    visits.filter(v => v.status === 'checked-in'), 
  [visits]);

  const stats = useMemo(() => ({
    total: filteredVisits.length,
    pending: filteredVisits.filter(v => v.status === 'pending').length,
    onsite: filteredVisits.filter(v => v.status === 'checked-in').length,
    rejected: filteredVisits.filter(v => v.status === 'rejected').length,
  }), [filteredVisits]);

  // --- CÁLCULOS BASC COMPLETOS (5.1 - 5.6) ---
  const bascMetrics = useMemo(() => {
    const totalVisits = Math.max(visits.length, 1);
    const totalCheckedIn = Math.max(visits.filter(v => v.status === 'checked-in').length, 1);
    
    // 5.1 Identificación y Control
    const idComplianceCount = visits.filter(v => v.cedula && v.cedula.length >= 10).length;
    const identityScore = Math.round((idComplianceCount / totalVisits) * 100);

    // 5.4 Capacitación (Inducción)
    const safetyAckCount = visits.filter(v => v.safetyAck).length;
    const safetyScore = Math.round((safetyAckCount / totalVisits) * 100);

    // 5.2 Seguridad Física (Activos)
    const assetControlCount = visits.filter(v => v.assetSerial).length;
    const vehicleControlCount = visits.filter(v => v.plate).length;
    
    // 5.5 Trazabilidad (Logs y Tiempos)
    const traceabilityScore = Math.round((visits.filter(v => v.checkIn).length / totalCheckedIn) * 100) || 0;

    // 5.6 Mejora Continua (Gestión de Rechazos/Riesgos)
    const riskManagementScore = Math.round((stats.rejected / (stats.total + 1)) * 100); 

    // 6.1 Seguridad Info (Políticas)
    const policyCompliance = Math.round((visits.filter(v => v.policyAccepted).length / totalVisits) * 100);

    // 5.3 Áreas Críticas
    const areaStats = visits.reduce((acc, v) => {
        const area = v.area || 'General';
        acc[area] = (acc[area] || 0) + 1;
        return acc;
    }, {});

    // Score Global BASC
    const globalScore = Math.round(
        (identityScore * 0.25) + 
        (safetyScore * 0.25) + 
        (traceabilityScore * 0.25) + 
        (policyCompliance * 0.25)
    );

    return { 
        identityScore, 
        safetyScore, 
        policyCompliance, 
        globalScore, 
        assetControlCount, 
        vehicleControlCount, 
        areaStats,
        traceabilityScore,
        riskManagementScore,
        totalVisits
    };
  }, [visits, stats]);

  // --- MANEJADORES DE SEGURIDAD ---
  const handleReviewClick = (visit) => {
      setSelectedVisitForReview(visit);
      setVerifyModalOpen(true);
  };

  const handleReviewConfirm = (status, securityData) => {
      if (selectedVisitForReview) {
          // Nota: En un entorno real, securityData se enviaría a la API
          console.log("Security Audit Data:", securityData); 
          updateVisitStatus(selectedVisitForReview.id, status, role);
      }
      setVerifyModalOpen(false);
      setSelectedVisitForReview(null);
  };

  // Mocks para rellenar logs en demo
  const MOCK_AUDIT_LOGS = [
    { id: 1025, action: 'SYSTEM_BACKUP', user: 'Automático', detail: 'Respaldo encriptado BASC realizado', time: '03:00 AM', severity: 'info' },
    { id: 1024, action: 'ACCESS_DENIED', user: 'Sistema', detail: 'Intento acceso área restringida (Server Room)', time: '11:05 AM', severity: 'critical' },
    { id: 1023, action: 'LOGIN_SUCCESS', user: 'admin@demo.com', detail: 'Inicio de sesión exitoso IP: 192.168.1.45', time: '10:42 AM', severity: 'info' },
    { id: 1022, action: 'VISIT_CREATED', user: 'Portal Web', detail: 'Solicitud creada desde IP externa', time: '10:15 AM', severity: 'success' },
    { id: 1021, action: 'QR_SCAN', user: 'Kiosko 1', detail: 'Escaneo QR fallido (Código expirado)', time: '09:58 AM', severity: 'warning' },
  ];
  const sortedLogs = [...logs, ...MOCK_AUDIT_LOGS].sort((a,b) => b.id - a.id);

  return (
    <div className="theme-admin flex h-screen overflow-hidden bg-slate-50/50 text-slate-900 font-sans">
      
      {/* MODAL DE VERIFICACIÓN JUDICIAL */}
      {verifyModalOpen && selectedVisitForReview && (
          <SecurityCheckModal 
              visit={selectedVisitForReview} 
              onClose={() => setVerifyModalOpen(false)} 
              onConfirm={handleReviewConfirm} 
          />
      )}

      {/* MODAL DE VALIDACIÓN DE ACTIVOS (PORTERÍA) */}
      {assetModal && (
          <AssetCheckModal 
              visit={assetModal} 
              onClose={() => setAssetModal(null)} 
              onConfirm={(id, guardian) => { handleAssetValidation(id, guardian); setAssetModal(null); }} 
          />
      )}

      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0f172a] text-white flex flex-col shadow-2xl z-30 transition-all duration-300 print:hidden">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800/50 bg-[#0b111f]">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
                <span className="font-bold text-xl tracking-tight block leading-none">Lytiks</span>
                <span className="text-xs text-indigo-400 font-medium tracking-widest uppercase">Control Panel</span>
            </div>
        </div>

        <div className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          {/* MENU PORTERÍA */}
          {role === 'porteria' ? (
            <>
               <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-4">Garita</p>
               <SidebarItem icon={LogOut} label="Control Salidas" active={activeTab === 'porteria'} onClick={() => setActiveTab('porteria')} />
            </>
          ) : (
            <>
              {/* MENU ADMIN / RECEPCIÓN */}
              <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-4">Operativo</p>
              <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <SidebarItem icon={Users} label="Gestión Visitas" active={activeTab === 'visits'} onClick={() => setActiveTab('visits')} />
              
              {role === 'admin' && (
                <>
                  <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8">Cumplimiento BASC</p>
                  <SidebarItem icon={ClipboardCheck} label="Reporte Auditoría" active={activeTab === 'basc'} onClick={() => setActiveTab('basc')} />
                  <SidebarItem icon={FileText} label="Logs de Sistema" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
                  
                  <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8">Configuración</p>
                  <SidebarItem icon={Settings} label="Ajustes Globales" active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
                </>
              )}
            </>
          )}
        </div>

        <div className="p-4 m-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-[#0f172a]">
                {role.substring(0,2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate capitalize text-white">{role}</p>
              <p className="text-xs text-slate-400 truncate">Sesión Activa</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* TOPBAR */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-20 print:hidden">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {activeTab === 'dashboard' ? 'Resumen Operativo' : 
                     activeTab === 'visits' ? 'Control de Accesos' : 
                     activeTab === 'porteria' ? 'Control de Salidas' :
                     activeTab === 'basc' ? 'Auditoría de Cumplimiento BASC' :
                     activeTab === 'logs' ? 'Registro de Eventos' : 'Ajustes del Sistema'}
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sistema en línea • {new Date().toLocaleDateString()}
                </p>
            </div>

            <div className="flex items-center gap-4">
                {activeTab === 'basc' && (
                    <Button 
                        variant="secondary" 
                        onClick={() => window.print()} 
                        icon={Printer} 
                        className="hidden md:flex h-10 py-2 px-4 text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                    >
                        Imprimir Reporte
                    </Button>
                )}

                <div className="relative group">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-3 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all relative border border-transparent hover:border-slate-100"
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                    </button>
                    {showNotifications && (
                          <div className="absolute right-0 top-14 w-80 z-50">
                             <NotificationCenter notifications={notifications} onClear={clearNotifications} />
                          </div>
                    )}
                </div>
            </div>
        </header>

        {/* SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto space-y-8 pb-10 print:max-w-none print:pb-0">
            
            {/* --- VISTA PORTERÍA (CONTROL SALIDAS) [NUEVO] --- */}
            {activeTab === 'porteria' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <Search className="text-slate-400"/>
                        <input placeholder="Buscar persona en sitio..." className="flex-1 outline-none text-sm"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {porteriaVisits.map(v => (
                            <div key={v.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-5 flex items-start justify-between">
                                    <div className="flex gap-4">
                                        {v.evidence?.docPhoto ? <img src={v.evidence.docPhoto} className="w-12 h-12 rounded-xl object-cover bg-slate-100" alt="Visita"/> : <div className="w-12 h-12 rounded-xl bg-slate-100"/>}
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

            {/* --- DASHBOARD ADMIN --- */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-in">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <AdminStatCard title="Visitas Totales" value={stats.total} icon={Users} colorClass="bg-blue-50 text-blue-600" trend="Datos reales" chart={<MiniBarChart />}/>
                  <AdminStatCard title="Pendientes" value={stats.pending} icon={Clock} colorClass="bg-amber-50 text-amber-600" />
                  <AdminStatCard title="En Sitio" value={stats.onsite} icon={Calendar} colorClass="bg-emerald-50 text-emerald-600" trend="Activos ahora" />
                  <AdminStatCard title="Rechazados" value={stats.rejected} icon={XCircle} colorClass="bg-red-50 text-red-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">Actividad Reciente</h3>
                            <button className="text-sm text-indigo-600 font-medium hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">Ver todo</button>
                        </div>
                        <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
                            {sortedLogs.slice(0, 6).map((log, idx) => (
                                <div key={idx} className="relative pl-6">
                                    <div className={`absolute -left-[25px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${log.severity === 'critical' ? 'bg-red-500' : log.severity === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                                            <p className="text-sm text-slate-500 mt-0.5">{log.detail}</p>
                                        </div>
                                        <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">{log.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <h3 className="font-bold text-lg mb-2 relative z-10">Acciones Rápidas</h3>
                            <div className="space-y-3 relative z-10 mt-6">
                                <button onClick={() => setActiveTab('basc')} className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all text-left flex items-center gap-3 group">
                                    <ClipboardCheck size={18} className="text-emerald-400 group-hover:scale-110 transition-transform"/> Auditoría BASC
                                </button>
                                <button onClick={() => setActiveTab('visits')} className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all text-left flex items-center gap-3 group">
                                    <Users size={18} className="text-indigo-400 group-hover:scale-110 transition-transform"/> Registrar Visita
                                </button>
                            </div>
                        </div>
                        {/* Resumen de Riesgo */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Nivel de Riesgo Diario</h4>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-bold text-slate-800">{bascMetrics.riskManagementScore}%</span>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">CONTROLADO</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{width: '92%'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* --- REPORTE BASC COMPLETÍSIMO --- */}
            {activeTab === 'basc' && (
              <div className="animate-fade-in space-y-8 print:space-y-6">
                
                {/* Header */}
                <div className="hidden print:flex items-center justify-between mb-8 border-b border-slate-900 pb-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={40} className="text-black"/>
                    <div>
                      <h1 className="text-2xl font-bold text-black">LytiksControl</h1>
                      <p className="text-sm text-gray-600">Informe de Auditoría BASC V6</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-500">REF: {new Date().getTime()}</p>
                    <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
                  </div>
                </div>

                {/* SCORECARD GLOBAL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-[#0f172a] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden print:bg-white print:text-black print:border print:border-black">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-4 print:border-black print:text-black">
                                    <CheckCircle2 size={12}/> CERTIFICABLE BASC V6
                                </div>
                                <h3 className="text-5xl font-bold mb-2">{bascMetrics.globalScore}%</h3>
                                <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-4 print:text-black">Índice de Cumplimiento Normativo</p>
                            </div>
                            <div className={`w-36 h-36 rounded-full border-[8px] flex items-center justify-center bg-slate-800/50 backdrop-blur print:border-black print:bg-transparent ${bascMetrics.globalScore > 90 ? 'border-emerald-500' : 'border-amber-500'}`}>
                                <span className="text-4xl font-bold text-white print:text-black">{bascMetrics.globalScore > 90 ? 'A+' : 'B'}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* KRIs Rápidos */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center gap-6 print:border-gray-300">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg print:text-black"><Fingerprint size={20}/></div>
                                    <span className="text-sm font-medium text-slate-700">Identidad (5.1)</span>
                                </div>
                                <span className="font-bold text-slate-900">{bascMetrics.identityScore}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg print:text-black"><ShieldCheck size={20}/></div>
                                    <span className="text-sm font-medium text-slate-700">Inducción (5.4)</span>
                                </div>
                                <span className="font-bold text-slate-900">{bascMetrics.safetyScore}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DESGLOSE POR ESTÁNDARES */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
                        <FileText size={20} className="text-indigo-600"/> Evaluación por Capítulos BASC
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* 5.1 CONTROL DE ACCESO */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 print:border-gray-300">
                            <div className="flex justify-between items-start mb-6">
                                <div><h4 className="font-bold text-slate-800">5.1 Control de Acceso</h4><p className="text-xs text-slate-500">Validación de identidad y autorización.</p></div>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">CUMPLE</span>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-center justify-between text-sm"><span className="text-slate-600 flex items-center gap-2"><UserCheck size={16} className="text-emerald-500"/> Registros con Cédula</span><span className="font-medium text-slate-900">{bascMetrics.identityScore}% ({visits.filter(v=>v.cedula).length})</span></li>
                                <li className="flex items-center justify-between text-sm"><span className="text-slate-600 flex items-center gap-2"><MapPin size={16} className="text-emerald-500"/> Control Zonas Críticas</span><span className="font-medium text-slate-900">{Object.keys(bascMetrics.areaStats).length} Áreas</span></li>
                            </ul>
                        </div>

                        {/* 5.2 SEGURIDAD FÍSICA */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 print:border-gray-300">
                            <div className="flex justify-between items-start mb-6">
                                <div><h4 className="font-bold text-slate-800">5.2 Seguridad Física</h4><p className="text-xs text-slate-500">Inspección y control de bienes.</p></div>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">CUMPLE</span>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-center justify-between text-sm"><span className="text-slate-600 flex items-center gap-2"><Laptop size={16} className="text-indigo-500"/> Equipos Registrados</span><span className="font-medium text-slate-900">{bascMetrics.assetControlCount}</span></li>
                                <li className="flex items-center justify-between text-sm"><span className="text-slate-600 flex items-center gap-2"><Car size={16} className="text-indigo-500"/> Vehículos Controlados</span><span className="font-medium text-slate-900">{bascMetrics.vehicleControlCount}</span></li>
                            </ul>
                        </div>

                        {/* 5.4 PERSONAL Y CAPACITACIÓN */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 print:border-gray-300">
                            <div className="flex justify-between items-start mb-6">
                                <div><h4 className="font-bold text-slate-800">5.4 Personal y Capacitación</h4><p className="text-xs text-slate-500">Concientización de seguridad.</p></div>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">CUMPLE</span>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-center justify-between text-sm"><span className="text-slate-600 flex items-center gap-2"><CheckSquare size={16} className="text-emerald-500"/> Inducción Video (Safety)</span><span className="font-medium text-slate-900">{bascMetrics.safetyScore}% Completado</span></li>
                            </ul>
                        </div>

                        {/* 5.5 / 6.1 TRAZABILIDAD Y CIBERSEGURIDAD */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 print:border-gray-300">
                            <div className="flex justify-between items-start mb-6">
                                <div><h4 className="font-bold text-slate-800">5.5 y 6.1 Trazabilidad</h4><p className="text-xs text-slate-500">Integridad de datos y registros.</p></div>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">CUMPLE</span>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-center justify-between text-sm"><span className="text-slate-600 flex items-center gap-2"><HardDrive size={16} className="text-blue-500"/> Integridad Logs</span><span className="font-medium text-slate-900">Auditables</span></li>
                                <li className="flex items-center justify-between text-sm"><span className="text-slate-600 flex items-center gap-2"><Lock size={16} className="text-blue-500"/> Política Datos</span><span className="font-medium text-slate-900">{bascMetrics.policyCompliance}% Aceptada</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* MAPA DE CALOR DE ÁREAS */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 print:border-gray-300 print:break-inside-avoid">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPin size={20} className="text-indigo-600"/> Accesos por Áreas Críticas (5.3)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(bascMetrics.areaStats).map(([area, count]) => (
                            <div key={area} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-500 uppercase font-semibold">{area}</p>
                                <p className="text-lg font-bold text-slate-900">{count} <span className="text-xs font-normal text-slate-400">visitas</span></p>
                            </div>
                        ))}
                        {Object.keys(bascMetrics.areaStats).length === 0 && <p className="text-sm text-slate-400">No hay datos de áreas registrados.</p>}
                    </div>
                </div>
              </div>
            )}

            {/* --- VISITAS (Con Modal de Seguridad) --- */}
            {activeTab === 'visits' && (
              <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                        <Search className="text-slate-400" size={20} />
                        <input placeholder="Buscar visita por nombre, empresa o estado..." className="flex-1 bg-transparent outline-none text-sm" />
                    </div>
                    <Button icon={Users} className="bg-indigo-600 text-white rounded-xl">Nueva Visita</Button>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200"><tr>{['Visitante', 'Empresa', 'Horario', 'Estado', 'Acciones'].map(h => <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-slate-100">
                        {filteredVisits.map(visit => (
                            <tr key={visit.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-semibold text-slate-900">{visit.visitorName}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{visit.company}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{visit.date} {visit.time}</td>
                            <td className="px-6 py-4"><StatusBadge status={visit.status} /></td>
                            <td className="px-6 py-4 flex gap-2">
                                {visit.status === 'pending' && (
                                    <>
                                        <button 
                                            onClick={() => handleReviewClick(visit)} 
                                            className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"
                                            title="Verificar y Aprobar"
                                        >
                                            <CheckCircle2 size={18}/>
                                        </button>
                                        <button 
                                            onClick={() => updateVisitStatus(visit.id, 'rejected', role)} 
                                            className="text-red-600 hover:bg-red-50 p-1 rounded"
                                            title="Rechazar"
                                        >
                                            <XCircle size={18}/>
                                        </button>
                                    </>
                                )}
                                <button onClick={() => generatePDF(visit)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"><FileText size={18}/></button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                  </div>
              </div>
            )}

            {activeTab === 'logs' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                         <h2 className="text-lg font-bold text-slate-800">Logs de Sistema</h2>
                         <Button variant="secondary" icon={Download}>CSV</Button>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Evento</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Usuario</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Detalle</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Hora</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedLogs.map((log, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-semibold text-sm text-slate-700">{log.action}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{log.user}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{log.detail}</td>
                                        <td className="px-6 py-4 text-right text-xs font-mono text-slate-400">{log.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'config' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in items-start">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-1">
                        {[{id:'general', icon:Settings, label:'General'}, {id:'security', icon:Lock, label:'Seguridad'}].map(item => (
                            <button key={item.id} onClick={() => setSettingsTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${settingsTab === item.id ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : 'text-slate-600 hover:bg-slate-50'}`}>
                                <item.icon size={18}/> {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Ajustes de Sistema</h3>
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-slate-700">Nombre Organización</label>
                                <input className="w-full px-4 py-2 border rounded-lg" defaultValue="Demo Corp S.A." />
                                <Button className="mt-4" icon={Save}>Guardar</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
};