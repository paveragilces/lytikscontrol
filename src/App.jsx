import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Building2, QrCode, UserCheck, ShieldCheck, Clock, Fingerprint,
  LayoutDashboard, Users, FileText, Settings, 
  CheckCircle2, XCircle, ChevronRight, Camera, Search,
  Bell, Filter, Calendar, MapPin, MonitorSmartphone, Shield, Globe2, User as UserIcon, Hand, AlertTriangle, Info
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Card, Badge, Input, Select, CountdownCircle } from './components/ui';
import { LoginScreen } from './views/LoginScreen';
import { PublicPortal } from './views/PublicPortal';
import { TabletMode } from './views/TabletMode';
import { InternalLayout } from './views/InternalLayout';

// --- MOCK DATA & CONFIG ---

const INITIAL_VISITS = [
  { id: 'v1', visitorName: 'Juan Pérez', company: 'Tech Solutions', type: 'Proveedor', hostId: 'h1', hostName: 'Ana López', area: 'Logística', motive: 'Reunión', status: 'pending', date: '2025-11-26', time: '10:00' },
  { id: 'v2', visitorName: 'María Gomez', company: 'Audit Corp', type: 'Auditor', hostId: 'h2', hostName: 'Carlos Ruiz', area: 'Finanzas', motive: 'Auditoría', status: 'approved', qrCode: 'QR-V2-SECURE', date: '2025-11-26', time: '09:00', checkIn: null },
  { id: 'v3', visitorName: 'Roberto Díaz', company: 'Freelance', type: 'Contratista', hostId: 'h1', hostName: 'Ana López', area: 'IT', motive: 'Mantenimiento', status: 'checked-in', qrCode: 'QR-V3-SECURE', date: '2025-11-26', time: '08:30', checkIn: '08:35', photos: { doc: true, face: true } },
];

const INITIAL_LOGS = [
  { id: 1, action: 'Aprobación', detail: 'Ana López aprobó visita de Roberto Díaz', time: '2025-11-25 14:00', user: 'Ana López' },
  { id: 2, action: 'Check-in', detail: 'Roberto Díaz ingresó a planta', time: '2025-11-26 08:35', user: 'Tablet Recepción' },
];

const VISIT_TYPES = ['Cliente', 'Proveedor', 'Auditor', 'Candidato', 'Contratista', 'Personal'];
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export default function App() {
  const [role, setRole] = useState('admin'); 
  const [visits, setVisits] = useState(INITIAL_VISITS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [notifications, setNotifications] = useState([]);
  const [codeLookup, setCodeLookup] = useState('');
  const [codeVisit, setCodeVisit] = useState(null);
  const [codeError, setCodeError] = useState('');
  const [lastCodeRotation, setLastCodeRotation] = useState(Date.now());
  const jsQRRef = useRef(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginRole, setLoginRole] = useState('admin');
  const [loginMode, setLoginMode] = useState(null); // kiosk | visitor | admin
  const [portalStep, setPortalStep] = useState(1);
  const [portalFormData, setPortalFormData] = useState({ visitorName: '', email: '', company: '', motive: '', type: 'Cliente', date: '', time: '' });

  useEffect(() => {
    // Auto-asigna códigos/QR/uses a visitas aprobadas
    setVisits(prev => prev.map(v => {
      if (v.status === 'approved') {
        return { 
          ...v, 
          validationCode: v.validationCode || generateCode(), 
          validationExpiresAt: v.validationExpiresAt || Date.now() + 30000,
          usesRemaining: v.usesRemaining ?? 2,
          qrCode: v.qrCode || `QR-${v.id}-${Date.now()}`
        };
      }
      return v;
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisits(prev => prev.map(v => {
        if (v.status === 'approved' && (v.usesRemaining ?? 2) > 0) {
          return { 
            ...v, 
            validationCode: generateCode(), 
            validationExpiresAt: Date.now() + 30000 
          };
        }
        return v;
      }));
      setLastCodeRotation(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---

  const addNotification = (msg, severity = 'info') => {
    const id = Date.now();
    const ts = new Date().toISOString();
    setNotifications(prev => {
      if (prev.some(n => n.msg === msg && n.severity === severity)) return prev;
      return [...prev, { id, msg, severity, ts }];
    });
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const createVisitRequest = (data) => {
    const newVisit = {
      id: `v${Date.now()}`,
      ...data,
      status: 'pending',
      hostId: 'h1', 
      hostName: 'Ana López', 
    };
    setVisits(prev => [newVisit, ...prev]);
    addLog('Solicitud', `Nueva solicitud de ${data.visitorName}`, 'Sistema Público');
    addNotification('Solicitud enviada con éxito.');
  };

  const updateVisitStatus = (id, newStatus, actorName) => {
    setVisits(prev => prev.map(v => {
      if (v.id === id) {
        return { 
          ...v, 
          status: newStatus,
          qrCode: newStatus === 'approved' ? `QR-${v.id}-${Date.now()}` : v.qrCode,
          validationCode: newStatus === 'approved' ? generateCode() : v.validationCode,
          validationExpiresAt: newStatus === 'approved' ? Date.now() + 30000 : v.validationExpiresAt,
          usesRemaining: newStatus === 'approved' ? 2 : v.usesRemaining
        };
      }
      return v;
    }));
    addLog('Cambio de Estado', `Visita ${id} cambió a ${newStatus}`, actorName);
    addNotification(`Visita ${newStatus === 'approved' ? 'Aprobada' : 'Actualizada'}`);
  };

  const handleCheckIn = (visitId, photos) => {
    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: 'checked-in', checkIn: new Date().toLocaleTimeString(), photos } : v));
    addLog('Check-in', `Ingreso confirmado ID ${visitId}`, 'Tablet Recepción');
    addNotification('Check-in exitoso. Bienvenido.');
  };

  const addLog = (action, detail, user) => {
    setLogs(prev => [{ id: Date.now(), action, detail, time: new Date().toLocaleString(), user }, ...prev]);
  };

  const decrementUse = (visitId) => {
    setVisits(prev => prev.map(v => {
      if (v.id === visitId && (v.usesRemaining ?? 2) > 0) {
        return { ...v, usesRemaining: v.usesRemaining - 1 };
      }
      return v;
    }));
  };

  const generatePDF = async (visit) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Reporte de Visita', 14, 20);
    doc.setFontSize(11);
    doc.text(`Visitante: ${visit.visitorName}`, 14, 30);
    doc.text(`Empresa: ${visit.company} | Tipo: ${visit.type}`, 14, 38);
    doc.text(`Anfitrión: ${visit.hostName}`, 14, 46);
    doc.text(`Fecha/Hora: ${visit.date} ${visit.time}`, 14, 54);
    doc.text(`Estado: ${visit.status}`, 14, 62);
    doc.text(`QR: ${visit.qrCode || ''}`, 14, 70);
    doc.text(`Usos restantes: ${visit.usesRemaining ?? 0}`, 14, 78);

    let y = 90;
    if (visit.docImage) {
      doc.text('Foto documento:', 14, y);
      doc.addImage(visit.docImage, 'PNG', 14, y + 4, 60, 40);
      y += 48;
    }
    if (visit.signatureData) {
      doc.text('Firma:', 14, y);
      doc.addImage(visit.signatureData, 'PNG', 14, y + 4, 60, 30);
      y += 40;
    }
    doc.save(`visita-${visit.id}.pdf`);
  };

  const roleOptions = [
    { id: 'visitor', label: 'Web Visitante', icon: Globe2, gradient: 'from-indigo-500 to-cyan-500' },
    { id: 'kiosk', label: 'Tablet / Kiosco', icon: MonitorSmartphone, gradient: 'from-purple-500 to-indigo-500' },
    { id: 'admin', label: 'Administrador', icon: Shield, gradient: 'from-emerald-500 to-teal-500' },
    { id: 'host', label: 'Anfitrión (Ana)', icon: UserIcon, gradient: 'from-amber-500 to-orange-500' },
    { id: 'reception', label: 'Recepción', icon: Hand, gradient: 'from-rose-500 to-orange-500' },
  ];
  const demoAccounts = [
    { email: 'kiosk@demo.com', pass: 'kiosk123', role: 'kiosk', label: 'Modo Kiosko' },
    { email: 'rx@demo.com', pass: 'recep123', role: 'reception', label: 'Recepción' },
    { email: 'admin@demo.com', pass: 'admin123', role: 'admin', label: 'Administrador' },
  ];

  const handleLogout = () => {
    setAuthenticated(false);
    setRole('admin');
    setLoginMode(null);
    setLoginEmail('');
    setLoginPass('');
    addNotification('Sesión cerrada');
  };

  const handleLogin = () => {
    if (!loginEmail || !loginPass) {
      addNotification('Completa email y clave para acceder.');
      return;
    }
    const match = demoAccounts.find(u => u.email === loginEmail && u.pass === loginPass);
    if (!match && !loginEmail.endsWith('@empresa.com')) {
      addNotification('Credenciales demo: kiosk@demo.com / kiosk123, rx@demo.com / recep123, admin@demo.com / admin123');
      return;
    }
    const effectiveRole = match ? match.role : loginRole;
    setAuthenticated(true);
    setRole(effectiveRole);
    addLog('Login', `Ingreso de ${loginEmail} como ${effectiveRole}`, 'Portal Auth');
  };

  const handleCodeValidate = () => {
    const found = visits.find(v => v.validationCode === codeLookup && v.status === 'approved');
    if (found) {
      if ((found.usesRemaining ?? 0) <= 0) {
        setCodeError('Código ya utilizado.');
        setCodeVisit(null);
        return;
      }
      if (found.validationExpiresAt && found.validationExpiresAt < Date.now()) {
        setCodeError('Código expiró, solicita uno nuevo en el kiosko.');
        setCodeVisit(null);
        return;
      }
      setCodeVisit(found);
      setCodeError('');
    } else {
      setCodeVisit(null);
      setCodeError('Código no válido o visita no aprobada.');
    }
  };

  if (!authenticated) {
    return (
      <LoginScreen
        setAuthenticated={setAuthenticated}
        setRole={setRole}
        addLog={addLog}
        loginMode={loginMode}
        setLoginMode={setLoginMode}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPass={loginPass}
        setLoginPass={setLoginPass}
        loginRole={loginRole}
        setLoginRole={setLoginRole}
        handleLogin={handleLogin}
        roleOptions={roleOptions}
        demoAccounts={demoAccounts}
      />
    );
  }

  return (
    <div className={`font-sans antialiased min-h-screen bg-slate-50 text-slate-900`}>
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2" aria-live="assertive">
        {notifications.map(n => {
          const styles = {
            info: 'bg-slate-900 text-white border border-white/10',
            warn: 'bg-amber-50 text-amber-900 border border-amber-200',
            crit: 'bg-red-600 text-white border border-red-500/60'
          };
          const icons = {
            info: <Info size={16} className="opacity-80" />,
            warn: <AlertTriangle size={16} />,
            crit: <AlertTriangle size={16} />
          };
          return (
            <div key={n.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-slide-in-right ${styles[n.severity] || styles.info}`}>
              {icons[n.severity] || icons.info} {n.msg}
            </div>
          );
        })}
      </div>

      {role === 'visitor' && (
        <PublicPortal
          VISIT_TYPES={VISIT_TYPES}
          formData={portalFormData}
          setFormData={setPortalFormData}
          step={portalStep}
          setStep={setPortalStep}
          createVisitRequest={createVisitRequest}
          codeLookup={codeLookup}
          setCodeLookup={setCodeLookup}
          codeError={codeError}
          codeVisit={codeVisit}
          handleCodeValidate={handleCodeValidate}
          setCodeError={setCodeError}
          handleLogout={handleLogout}
        />
      )}
      {role === 'kiosk' && (
        <TabletMode
          visits={visits}
          setVisits={setVisits}
          decrementUse={decrementUse}
          handleCheckIn={handleCheckIn}
          addLog={addLog}
          addNotification={addNotification}
          lastCodeRotation={lastCodeRotation}
          handleLogout={handleLogout}
        />
      )}
      {['admin', 'host', 'reception'].includes(role) && (
        <InternalLayout
          role={role}
          visits={visits}
          logs={logs}
          updateVisitStatus={updateVisitStatus}
          generatePDF={generatePDF}
          notifications={notifications}
          clearNotifications={() => setNotifications([])}
          handleLogout={handleLogout}
        />
      )}
    </div>
  );
}
