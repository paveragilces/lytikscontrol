import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, MonitorSmartphone, Shield, Globe2, User as UserIcon, Hand, AlertTriangle, Info
} from 'lucide-react';
import { LoginScreen } from './views/LoginScreen';
import { PublicPortal } from './views/PublicPortal';
import { TabletMode } from './views/TabletMode';
import { InternalLayout } from './views/InternalLayout';
import { EvacuationView } from './views/EvacuationView';

// --- DATA INICIAL ---
const INITIAL_VISITS = [
  { id: 'v1', visitorName: 'Juan Pérez', company: 'Tech Solutions', type: 'Proveedor', hostId: 'h1', hostName: 'Ana López', status: 'pending', date: '2025-11-26', time: '10:00', cedula: '0912345678', assetBrand: 'Dell', assetSerial: 'GTX-900', hasAssets: true },
  { id: 'v2', visitorName: 'María Gomez', company: 'Audit Corp', type: 'Auditor', hostId: 'h2', hostName: 'Carlos Ruiz', status: 'approved', qrCode: 'QR-V2-SECURE', date: '2025-11-26', time: '09:00', cedula: '0987654321', hasAssets: false },
];

const VISIT_TYPES = ['Cliente', 'Proveedor', 'Auditor', 'Candidato', 'Contratista', 'Personal'];
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export default function App() {
  const [role, setRole] = useState('admin'); 
  const [visits, setVisits] = useState(INITIAL_VISITS);
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Auth States
  const [authenticated, setAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginRole, setLoginRole] = useState('admin');
  const [loginMode, setLoginMode] = useState(null);

  // Portal States
  const [portalStep, setPortalStep] = useState(1);
  const [portalFormData, setPortalFormData] = useState({ 
    visitorName: '', email: '', company: '', motive: '', type: 'Cliente', 
    date: '', time: '', cedula: '', phone: '', residenceType: 'national', passport: ''
  });
  const [codeLookup, setCodeLookup] = useState('');
  const [codeVisit, setCodeVisit] = useState(null);
  const [codeError, setCodeError] = useState('');
  const [lastCodeRotation, setLastCodeRotation] = useState(Date.now());

  // --- EFECTOS ---
  useEffect(() => {
    // Generar códigos iniciales
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
    // Rotación de códigos OTP
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

  // --- LOGICA DE NEGOCIO ---

  const addNotification = (msg, severity = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, severity, ts: new Date().toISOString() }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const addLog = (action, detail, user) => {
    setLogs(prev => [{ id: Date.now(), action, detail, time: new Date().toLocaleString(), user }, ...prev]);
  };

  const createVisitRequest = (data) => {
    const newVisit = {
      id: `v${Date.now()}`,
      ...data,
      status: 'pending',
      hostId: 'h1', 
      hostName: 'Ana López',
      hasAssets: !!data.assetBrand // Detectar si hay activos
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

  // CHECK-IN CON EVIDENCIAS (FOTOS Y FIRMA)
  const handleCheckIn = (visitId, evidenceData = {}) => {
    setVisits(prev => prev.map(v => 
      v.id === visitId ? { 
        ...v, 
        status: 'checked-in', 
        checkIn: new Date().toLocaleTimeString(), 
        evidence: evidenceData, // { docPhoto, assetPhoto, signature }
        exitPermission: false // Resetear permiso de salida al entrar
      } : v
    ));
    addLog('Check-in', `Ingreso confirmado ID ${visitId} con evidencias`, 'Kiosko');
    addNotification('Check-in exitoso. Bienvenido.');
  };

  const decrementUse = (visitId) => {
    setVisits(prev => prev.map(v => {
      if (v.id === visitId && (v.usesRemaining ?? 2) > 0) {
        return { ...v, usesRemaining: v.usesRemaining - 1 };
      }
      return v;
    }));
  };

  // VALIDACIÓN DE ACTIVOS POR PORTERÍA (Paso previo al Checkout)
  const handleAssetValidation = (visitId, guardianName) => {
    setVisits(prev => prev.map(v => 
        v.id === visitId ? { ...v, exitPermission: true, assetValidationTime: new Date().toLocaleTimeString(), guardianName } : v
    ));
    addLog('Validación Activos', `Salida autorizada para ${visitId}`, guardianName);
    addNotification('Salida autorizada por Portería.');
  };

  // CHECK-OUT SEGURO
  const handleCheckout = (visitId) => {
    // 1. Buscar visita
    const visit = visits.find(v => v.id === visitId);
    
    // 2. Validar permiso de salida (Candado)
    // Si no tiene permiso y el rol es Kiosko (usuario final), bloquear.
    // Admin puede forzar salida.
    if (role === 'kiosk' && !visit.exitPermission) {
        addNotification('⚠️ SALIDA DENEGADA: Portería debe validar activos y escarapela primero.', 'crit');
        return false; // Retorna falso para que el Kiosko sepa que falló
    }

    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: 'checked-out', checkOut: new Date().toLocaleTimeString() } : v));
    addLog('Check-out', `Salida registrada para ID ${visitId}`, role);
    addNotification('Salida registrada. Hasta pronto.');
    return true;
  };

  const markJudicialResult = (visitId, result, observation) => {
    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, judicialCheck: { result, observation, at: new Date().toISOString() } } : v));
    addLog('Verificación Judicial', `Visita ${visitId}: ${result}`, 'Seguridad');
    addNotification(`Verificación judicial: ${result}`);
  };

  // GENERADOR PDF ACTUALIZADO CON FOTOS Y FIRMA
  const generatePDF = async (visit) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('LytiksControl Access', 14, 25);
    doc.setFontSize(10);
    doc.text('Reporte de Seguridad y Trazabilidad', 14, 32);

    // Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Detalle de la Visita', 14, 55);
    
    doc.setFontSize(11);
    doc.text(`Visitante: ${visit.visitorName}`, 14, 65);
    doc.text(`ID/Cédula: ${visit.cedula || 'N/A'}`, 14, 72);
    doc.text(`Empresa: ${visit.company}`, 14, 79);
    doc.text(`Anfitrión: ${visit.hostName}`, 14, 86);
    doc.text(`Fecha: ${visit.date}`, 14, 93);
    doc.text(`Entrada: ${visit.checkIn || '--:--'}`, 100, 93);
    doc.text(`Salida: ${visit.checkOut || '--:--'}`, 150, 93);

    // Evidencias
    let y = 110;
    doc.setFontSize(14);
    doc.text('Evidencia Digital', 14, y);
    y += 10;

    if (visit.evidence) {
        if (visit.evidence.docPhoto) {
            doc.setFontSize(10);
            doc.text('Documento de Identidad:', 14, y);
            doc.addImage(visit.evidence.docPhoto, 'JPEG', 14, y + 5, 80, 50); // Foto doc
        }
        
        if (visit.evidence.assetPhoto) {
            doc.text('Activo Declarado:', 110, y);
            doc.addImage(visit.evidence.assetPhoto, 'JPEG', 110, y + 5, 80, 50); // Foto activo
        }
        
        y += 65;

        if (visit.evidence.signature) {
            doc.text('Firma Digital del Visitante:', 14, y);
            doc.addImage(visit.evidence.signature, 'PNG', 14, y + 5, 60, 30); // Firma
            
            // Texto legal
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text('Declaro haber recibido la inducción de seguridad y acepto las políticas de ingreso.', 14, y + 40);
        }
    } else {
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('Sin evidencia digital registrada (Check-in manual o anterior a actualización).', 14, y);
    }

    doc.save(`visita-${visit.id}.pdf`);
  };

  // Auth Config
  const roleOptions = [
    { id: 'visitor', label: 'Web Visitante', icon: Globe2 },
    { id: 'kiosk', label: 'Kiosco Tablet', icon: MonitorSmartphone },
    { id: 'porteria', label: 'Garita / Portería', icon: ShieldCheck }, // NUEVO ROL
    { id: 'admin', label: 'Administrador', icon: Shield },
    { id: 'reception', label: 'Recepción', icon: Hand },
  ];
  
  const demoAccounts = [
    { email: 'kiosk@demo.com', pass: 'kiosk123', role: 'kiosk', label: 'Modo Kiosko' },
    { email: 'guardia@demo.com', pass: 'guardia123', role: 'porteria', label: 'Portería' },
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
    if (!loginEmail || !loginPass) { addNotification('Datos incompletos', 'warn'); return; }
    const match = demoAccounts.find(u => u.email === loginEmail && u.pass === loginPass);
    if (!match) { addNotification('Credenciales inválidas', 'crit'); return; }
    
    setAuthenticated(true);
    setRole(match.role);
    addLog('Login', `Ingreso de ${loginEmail}`, 'Portal Auth');
  };

  // Validar Código (QR o Manual) para Portal Visitante (No Kiosko)
  const handleCodeValidate = () => {
    const found = visits.find(v => v.validationCode === codeLookup && v.status === 'approved');
    if (found) {
       setCodeVisit(found);
       setCodeError('');
    } else {
       setCodeError('Código no válido.');
    }
  };

  if (!authenticated) {
    return (
      <div className="theme-space">
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
      </div>
    );
  }

  return (
    <div className="font-sans antialiased min-h-screen bg-slate-50 text-slate-900">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {notifications.map(n => (
          <div key={n.id} className={`px-4 py-3 rounded-lg shadow-xl text-sm flex items-center gap-2 animate-slide-in-right border ${
            n.severity === 'crit' ? 'bg-red-600 text-white border-red-500' : 
            n.severity === 'warn' ? 'bg-amber-100 text-amber-900 border-amber-200' : 
            'bg-slate-800 text-white border-slate-700'
          }`}>
             {n.severity === 'crit' && <AlertTriangle size={16}/>}
             {n.msg}
          </div>
        ))}
      </div>

      {role === 'visitor' && (
        <div className="theme-space min-h-screen">
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
            handleLogout={handleLogout}
          />
        </div>
      )}

      {role === 'kiosk' && (
        <div className="theme-space min-h-screen">
          <TabletMode
            visits={visits}
            setVisits={setVisits}
            decrementUse={decrementUse}
            handleCheckIn={handleCheckIn}
            handleCheckout={handleCheckout} // Pasamos la función de salida
            addLog={addLog}
            addNotification={addNotification}
            lastCodeRotation={lastCodeRotation}
            handleLogout={handleLogout}
          />
        </div>
      )}

      {/* ROL PORTERÍA Y ADMIN COMPARTEN LAYOUT INTERNO PERO CON VISTAS DISTINTAS */}
      {['admin', 'host', 'reception', 'porteria'].includes(role) && (
        <InternalLayout
          role={role}
          visits={visits}
          logs={logs}
          updateVisitStatus={updateVisitStatus}
          handleCheckout={handleCheckout}
          handleAssetValidation={handleAssetValidation} // Nueva función para portería
          markJudicialResult={markJudicialResult}
          generatePDF={generatePDF}
          notifications={notifications}
          clearNotifications={() => setNotifications([])}
          handleLogout={handleLogout}
        />
      )}

      {role === 'sos' && (
        <EvacuationView visits={visits} handleLogout={handleLogout} />
      )}
    </div>
  );
}