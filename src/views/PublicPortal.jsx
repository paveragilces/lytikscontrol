import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, ChevronRight, CheckCircle2, LogOut, 
  Laptop, Tablet, Smartphone, Car, Monitor, ShieldAlert, 
  Play, AlertCircle, UserPlus, QrCode, ArrowLeft, X, Clock3
} from 'lucide-react';
import { Button, Input, Select } from '../components/ui'; 
import { QRCodeCanvas } from 'qrcode.react';
import ReactPlayer from 'react-player';

// Listas de datos
const COMMON_BRANDS = ['Apple', 'Dell', 'HP', 'Lenovo', 'Samsung', 'Asus', 'Acer', 'Microsoft', 'Huawei', 'Xiaomi', 'Otra'];

const AREAS = [
  'Presidencia', 'Dirección Ejecutiva', 'Subdirección', 'Marketing', 
  'Comunicaciones', 'Logística', 'Comercial', 'Contabilidad', 
  'Ventas', 'Recursos Humanos', 'Tecnología (TI)', 'Legal', 
  'Operaciones', 'Recepción'
];

// --- COMPONENTE MODAL DE INDUCCIÓN (ADAPTADO A TAILWIND) ---
const TrainingModal = ({ onClose, onComplete }) => {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const initialTime = 20; // Tiempo obligatorio en segundos
  const [timer, setTimer] = useState(initialTime);
  const [videoError, setVideoError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const playerRef = useRef(null);
  
  const VIDEO_URL = 'https://www.youtube.com/watch?v=rM-60R_sQe4';
  const FALLBACK_MP4 = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  const POSTER = 'https://img.youtube.com/vi/rM-60R_sQe4/hqdefault.jpg';
  const videoSource = useFallback ? FALLBACK_MP4 : VIDEO_URL;

  useEffect(() => {
    let interval;
    if (videoPlaying && !videoCompleted && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setVideoCompleted(true);
            setVideoPlaying(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [videoPlaying, videoCompleted, timer]);

  const handleConfirm = () => {
    if (videoCompleted && acknowledged) {
      onComplete();
    }
  };

  const progressPercentage = ((initialTime - timer) / initialTime) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f1623] w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header Modal */}
        <header className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Requisito de Ingreso</span>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert size={20} className="text-indigo-400"/> Inducción de Seguridad
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </header>

        {/* Body Modal */}
        <div className="flex-1 flex flex-col bg-black/20">
          <div className="relative w-full aspect-video bg-black group">
             {/* Indicador de estado sobre el video */}
             <div className="absolute top-4 right-4 z-20 pointer-events-none">
                {videoCompleted ? (
                   <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-bold shadow-lg flex items-center gap-2 backdrop-blur-md">
                     <CheckCircle2 size={14} /> Completado
                   </span>
                ) : (
                   <span className="px-3 py-1 rounded-full bg-black/60 text-white border border-white/20 text-xs font-bold shadow-lg flex items-center gap-2 backdrop-blur-md">
                     <Clock3 size={14} className="text-amber-400" /> Tiempo restante: {timer}s
                   </span>
                )}
             </div>

            <ReactPlayer
              ref={playerRef}
              url={videoSource}
              width="100%"
              height="100%"
              playing={videoPlaying && !videoError}
              controls
              playsinline
              light={!videoPlaying ? POSTER : false}
              playIcon={
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <Play size={28} />
                </div>
              }
              onClickPreview={() => setVideoPlaying(true)}
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              onEnded={() => {
                setVideoCompleted(true);
                setVideoPlaying(false);
              }}
              onError={() => {
                if (!useFallback) {
                  setUseFallback(true);
                  setVideoError(false);
                  setVideoPlaying(false);
                } else {
                  setVideoError(true);
                }
              }}
              config={{ 
                youtube: { playerVars: { modestbranding: 1, fs: 0, rel: 0 } } 
              }}
            />
            
            {!videoPlaying && !videoError && (
              <button 
                onClick={() => setVideoPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors"
              >
                <div className="flex flex-col items-center gap-2 text-white">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                    <Play size={28}/>
                  </div>
                  <span className="text-sm font-semibold">Reproducir</span>
                </div>
              </button>
            )}

            {videoError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-300">
                <AlertCircle size={32} className="mb-2 text-red-400" />
                <p>No se pudo cargar el video.</p>
              </div>
            )}
          </div>

          {/* Barra de progreso */}
          <div className="h-1 w-full bg-slate-800">
             <div 
               className="h-full bg-emerald-500 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
               style={{ width: `${progressPercentage}%` }}
             />
          </div>

          {/* Actions Footer */}
          <div className="p-6 bg-[#0f1623] space-y-4">
            <label className={`flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/5 cursor-pointer transition-all ${!videoCompleted ? 'opacity-50 pointer-events-none grayscale' : 'hover:bg-white/10 hover:border-indigo-500/30'}`}>
              <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 rounded border-slate-600 bg-transparent focus:ring-indigo-500 accent-indigo-500"
                checked={acknowledged} 
                onChange={(e) => setAcknowledged(e.target.checked)}
                disabled={!videoCompleted}
              />
              <div className="flex-1">
                <strong className="block text-white text-sm mb-1">Confirmación de Visualización</strong>
                <span className="text-xs text-slate-400 leading-relaxed">Declaro haber visto el video completo y comprendido las normas de seguridad y políticas de ingreso a las instalaciones.</span>
              </div>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={onClose} className="bg-transparent border border-white/10 text-slate-300 hover:bg-white/5">
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={!videoCompleted || !acknowledged}
                className={`bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 px-8 transition-all ${(!videoCompleted || !acknowledged) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Confirmar y Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PublicPortal = ({
  VISIT_TYPES,
  formData,
  setFormData,
  step,
  setStep,
  createVisitRequest,
  codeLookup,
  setCodeLookup,
  codeError,
  setCodeError, // FIX: Se agregó esta prop
  codeVisit,
  handleCodeValidate,
  handleLogout,
}) => {
  const [portalView, setPortalView] = useState('landing'); 
  const [errors, setErrors] = useState({});
  const [hasAssets, setHasAssets] = useState(false);
  const [hasVehicle, setHasVehicle] = useState(false);

  // --- NUEVO: Estado para el Modal ---
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [isInductionCompleted, setIsInductionCompleted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // Validaciones
    if (!formData.area) newErrors.area = 'Selecciona el área que visitas';
    if (!formData.host) newErrors.host = 'Ingresa el nombre de la persona';
    if (!formData.date) newErrors.date = 'Requerido';
    if (!formData.time) newErrors.time = 'Requerido';
    
    if (formData.residenceType === 'national') {
      if (!formData.cedula || !/^(0[1-9]|1[0-9]|2[0-4])\d{8}$/.test(formData.cedula)) newErrors.cedula = 'Cédula inválida';
      if (!formData.phone || !/^09\d{8}$/.test(formData.phone)) newErrors.phone = 'Celular inválido';
    } else {
      if (!formData.passport) newErrors.cedula = 'Documento requerido';
      if (!formData.phone) newErrors.phone = 'Contacto requerido';
    }
    
    if (!formData.policyAccepted) newErrors.policy = 'Debes aceptar las políticas.';
    
    // Validación de inducción usando el nuevo estado
    if (!isInductionCompleted) newErrors.safety = 'Debes completar la inducción.';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    const finalData = { ...formData, safetyAck: true }; // Aseguramos que safetyAck vaya true
    if (!hasAssets) { finalData.assetType = null; finalData.assetBrand = null; finalData.assetSerial = null; }
    if (!hasVehicle) { finalData.plate = null; }

    createVisitRequest(finalData);
    setStep(3);
  };

  const handleDeviceTypeSelect = (type) => {
    setFormData({ ...formData, assetType: type });
  };

  const handleInductionSuccess = () => {
    setIsInductionCompleted(true);
    setFormData(prev => ({...prev, safetyAck: true}));
    setShowTrainingModal(false);
    // Limpiamos error visual si existía
    if(errors.safety) setErrors(prev => ({...prev, safety: null}));
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b1020] text-white flex flex-col items-center justify-center p-4">
      
      {/* --- MODAL INYECCIÓN --- */}
      {showTrainingModal && (
        <TrainingModal 
          onClose={() => setShowTrainingModal(false)}
          onComplete={handleInductionSuccess}
        />
      )}

      {/* FONDO ANIMADO */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-32 top-[-160px] w-[520px] h-[520px] bg-indigo-500/25 blur-[120px] rounded-full" />
        <div className="absolute right-[-200px] bottom-[-140px] w-[620px] h-[620px] bg-cyan-400/25 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
        <div className="absolute inset-0 opacity-60 tech-lines"></div>
      </div>

      <button onClick={handleLogout} className="absolute top-6 right-6 z-20 text-xs font-medium px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-2 transition-colors backdrop-blur-md">
        <LogOut size={14}/> Cerrar sesión
      </button>

      <div className="relative z-10 mb-8 text-center space-y-3">
        <div className="bg-indigo-500/20 border border-indigo-500/30 p-3 rounded-2xl inline-block backdrop-blur-sm shadow-lg shadow-indigo-500/10">
          <Building2 size={32} className="text-indigo-300" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Portal de Visitas</h1>
        <p className="text-slate-400">Registro seguro y cumplimiento normativo</p>
      </div>

      {/* --- VISTA 1: LANDING --- */}
      {portalView === 'landing' && (
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10 animate-fade-in-up">
            <button 
                onClick={() => setPortalView('form')}
                className="group relative overflow-hidden bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 rounded-[32px] p-1 transition-all duration-300 text-left"
            >
                <div className="p-8 h-full flex flex-col justify-between min-h-[240px]">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 mb-6">
                        <UserPlus size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Solicitar Visita</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Completa el formulario de seguridad para pre-registrar tu ingreso a las instalaciones.</p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-indigo-300 font-medium text-sm group-hover:text-white transition-colors">
                        Iniciar Registro <ChevronRight size={16}/>
                    </div>
                </div>
            </button>

            <button 
                onClick={() => setPortalView('code')}
                className="group relative overflow-hidden bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 rounded-[32px] p-1 transition-all duration-300 text-left"
            >
                <div className="p-8 h-full flex flex-col justify-between min-h-[240px]">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 mb-6">
                        <QrCode size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Ya tengo código</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Ingresa el código de 6 dígitos proporcionado por el kiosko para validar tu acceso.</p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-emerald-300 font-medium text-sm group-hover:text-white transition-colors">
                        Revelar QR <ChevronRight size={16}/>
                    </div>
                </div>
            </button>
        </div>
      )}

      {/* --- VISTA 2: FORMULARIO --- */}
      {portalView === 'form' && (
        <div className="w-full max-w-2xl relative z-10 animate-fade-in-up">
            <button onClick={() => setPortalView('landing')} className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                <ArrowLeft size={18}/> Volver al inicio
            </button>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-1 shadow-2xl overflow-hidden">
            <div className="bg-[#0f1623]/80 rounded-[28px] p-6 md:p-8">
                
                {step === 1 && (
                <div className="animate-fade-in">
                    <div className="mb-6">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold mb-1">Paso 1 de 2</p>
                        <h2 className="text-2xl font-bold text-white">Datos Personales</h2>
                    </div>

                    <div className="space-y-5">
                    <Input 
                        label="Nombre Completo" placeholder="Ej. Juan Pérez" 
                        value={formData.visitorName} onChange={e => setFormData({...formData, visitorName: e.target.value})} 
                        error={errors.visitorName} required tone="dark" className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500"
                    />
                    <Input 
                        label="Correo Electrónico" type="email" placeholder="juan@empresa.com" 
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                        error={errors.email} required tone="dark" className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500"
                    />
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="font-semibold">Residencia</span>
                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                          <button type="button" onClick={() => { setFormData({...formData, residenceType: 'national'}); setErrors({}); }} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${formData.residenceType === 'national' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Nacional</button>
                          <button type="button" onClick={() => { setFormData({...formData, residenceType: 'international'}); setErrors({}); }} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${formData.residenceType === 'international' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Internacional</button>
                        </div>
                    </div>
                    {formData.residenceType === 'national' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input 
                          label="Cédula (Ecuador)" placeholder="10 dígitos" 
                          value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value.replace(/\D/g, '').slice(0,10)})} 
                          error={errors.cedula} required tone="dark" className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500"
                          />
                          <Input 
                          label="Celular" placeholder="09xxxxxxxx" 
                          value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0,10)})} 
                          error={errors.phone} required tone="dark" className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500"
                          />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input 
                          label="Documento (Pasaporte/DNI)" placeholder="Texto libre" 
                          value={formData.passport} onChange={e => setFormData({...formData, passport: e.target.value})} 
                          error={errors.cedula} required tone="dark" className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500"
                          />
                          <Input 
                          label="Contacto" placeholder="Teléfono o WhatsApp" 
                          value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
                          error={errors.phone} required tone="dark" className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500"
                          />
                      </div>
                    )}
                    <Input 
                        label="Empresa de procedencia" placeholder="Nombre de tu empresa" 
                        value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} 
                        error={errors.company} required tone="dark" className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500"
                    />
                    
                    <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white py-4 shadow-lg shadow-indigo-500/20" onClick={() => {
                        const errs = {};
                        if (!formData.visitorName) errs.visitorName = 'Requerido';
                        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Email inválido';
                        if (formData.residenceType === 'national') {
                          if (!formData.cedula || !/^(0[1-9]|1[0-9]|2[0-4])\d{8}$/.test(formData.cedula)) errs.cedula = 'Cédula inválida';
                          if (!formData.phone || !/^09\d{8}$/.test(formData.phone)) errs.phone = 'Celular inválido';
                        } else {
                          if (!formData.passport) errs.cedula = 'Documento requerido';
                          if (!formData.phone) errs.phone = 'Contacto requerido';
                        }
                        if (!formData.company) errs.company = 'Requerido';
                        setErrors(errs);
                        if (Object.keys(errs).length === 0) setStep(2);
                    }}>Continuar <ChevronRight size={18} /></Button>
                    </div>
                </div>
                )}

                {step === 2 && (
                <div className="animate-fade-in">
                    <div className="mb-6">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold mb-1">Paso 2 de 2</p>
                        <h2 className="text-2xl font-bold text-white">Seguridad y Activos</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Select tone="dark" label="Tipo de Visitante" options={VISIT_TYPES} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} error={errors.type} className="bg-slate-900/50 border-white/10 text-white" />
                        <Select tone="dark" label="Motivo" options={['Reunión', 'Entrevista', 'Mantenimiento', 'Entrega']} value={formData.motive} onChange={e => setFormData({...formData, motive: e.target.value})} error={errors.motive} className="bg-slate-900/50 border-white/10 text-white" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select 
                            tone="dark" label="Área Visitada" options={AREAS} 
                            value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} 
                            error={errors.area} className="bg-slate-900/50 border-white/10 text-white"
                        />
                        <Input 
                            tone="dark" label="Nombre de la persona" placeholder="Ej. Ana López"
                            value={formData.host} onChange={e => setFormData({...formData, host: e.target.value})} 
                            error={errors.host} className="bg-slate-900/50 border-white/10 text-white"
                        />
                    </div>
                    
                    {/* ACTIVOS */}
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Monitor size={16} className="text-indigo-400"/> ¿Ingresas con equipo electrónico?</label>
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                <button type="button" onClick={() => setHasAssets(false)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${!hasAssets ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>No</button>
                                <button type="button" onClick={() => setHasAssets(true)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${hasAssets ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Sí</button>
                            </div>
                        </div>
                        {hasAssets && (
                            <div className="animate-fade-in space-y-4 pt-2 border-t border-white/10">
                                <div className="grid grid-cols-3 gap-3">
                                    {[ { id: 'Laptop', icon: Laptop }, { id: 'Tablet', icon: Tablet }, { id: 'Móvil', icon: Smartphone } ].map((device) => (
                                        <button key={device.id} type="button" onClick={() => handleDeviceTypeSelect(device.id)} 
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${formData.assetType === device.id ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}>
                                            <device.icon size={20} className="mb-1"/> <span className="text-[10px] font-medium">{device.id}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Select tone="dark" label="Marca" options={COMMON_BRANDS} value={formData.assetBrand} onChange={e => setFormData({...formData, assetBrand: e.target.value})} className="bg-slate-900/50 border-white/10 text-white" />
                                    <Input tone="dark" label="Serial" placeholder="N/S" value={formData.assetSerial} onChange={e => setFormData({...formData, assetSerial: e.target.value})} className="bg-slate-900/50 border-white/10 text-white" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* VEHICULO */}
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Car size={16} className="text-indigo-400"/> ¿Ingresas con vehículo?</label>
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                                <button type="button" onClick={() => setHasVehicle(false)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${!hasVehicle ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>No</button>
                                <button type="button" onClick={() => setHasVehicle(true)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${hasVehicle ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Sí</button>
                            </div>
                        </div>
                        {hasVehicle && <div className="animate-fade-in pt-2 border-t border-white/10"><Input tone="dark" label="Placa" placeholder="Ej. ABC-1234" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value.toUpperCase()})} className="bg-slate-900/50 border-white/10 text-white uppercase" /></div>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input tone="dark" label="Fecha" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} error={errors.date} required className="bg-slate-900/50 border-white/10 text-white" />
                        <Input tone="dark" label="Hora" type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} error={errors.time} required className="bg-slate-900/50 border-white/10 text-white" />
                    </div>
                    
                    {/* VIDEO INDUCCIÓN REEMPLAZADO POR TARJETA DE ESTADO */}
                    <div className={`rounded-2xl border p-4 flex items-center justify-between transition-all ${errors.safety ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5'}`}>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldAlert size={20} className={isInductionCompleted ? 'text-emerald-400' : 'text-indigo-400'} />
                                <span className="font-bold text-white">Inducción de Seguridad</span>
                            </div>
                            <p className="text-xs text-slate-400">
                                {isInductionCompleted 
                                    ? 'Capacitación completada y confirmada.' 
                                    : 'Debes ver el video de seguridad para continuar.'}
                            </p>
                        </div>

                        {isInductionCompleted ? (
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                                <CheckCircle2 size={16} /> Completado
                            </div>
                        ) : (
                            <Button 
                                type="button"
                                onClick={() => setShowTrainingModal(true)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 text-sm py-2"
                            >
                                <Play size={16} className="mr-2" /> Iniciar
                            </Button>
                        )}
                    </div>
                    {errors.safety && <p className="text-xs text-red-400 font-medium ml-2">{errors.safety}</p>}

                    <label className="flex items-start gap-3 p-3 rounded-xl border border-white/10 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                        <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-500 bg-transparent focus:ring-indigo-500 accent-indigo-500" checked={formData.policyAccepted || false} onChange={e => setFormData({...formData, policyAccepted: e.target.checked})} />
                        <div className="text-xs text-slate-400">Autorizo el tratamiento de mis datos personales según la política BASC.</div>
                    </label>

                    <div className="flex gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setStep(1)} type="button" className="bg-white/5 border-white/10 text-white hover:bg-white/10">Atrás</Button>
                        <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" type="submit" disabled={!isInductionCompleted}>Enviar Solicitud</Button>
                    </div>
                    </form>
                </div>
                )}

                {step === 3 && (
                <div className="text-center py-12 animate-fade-in space-y-6">
                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 size={48} className="text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">¡Solicitud Enviada!</h2>
                        <p className="text-slate-400 max-w-sm mx-auto">
                            Tu pre-registro ha sido exitoso. Recibirás tu código QR en el correo proporcionado.
                        </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 max-w-xs mx-auto text-left">
                        <div className="mb-2">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Anfitrión</p>
                            <p className="text-white font-medium text-sm">{formData.host}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Área</p>
                            <p className="text-white font-medium text-sm">{formData.area}</p>
                        </div>
                    </div>
                    <Button className="bg-white/10 border border-white/10 text-white hover:bg-white/20" onClick={() => { 
                        setStep(1); setHasAssets(false); setIsInductionCompleted(false);
                        setFormData({visitorName: '', email: '', cedula: '', phone: '', company: '', motive: '', type: 'Cliente', date: '', time: '', host: '', area: ''});
                        setPortalView('landing'); 
                    }}>Volver al Inicio</Button>
                </div>
                )}
            </div>
            </div>
        </div>
      )}

      {/* --- VISTA 3: VALIDACIÓN QR (YA TENGO CÓDIGO) --- */}
      {portalView === 'code' && (
        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
            <button onClick={() => setPortalView('landing')} className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                <ArrowLeft size={18}/> Volver al inicio
            </button>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 space-y-6 shadow-2xl">
                <div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 mb-4 text-emerald-300">
                        <QrCode size={24} />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-bold mb-1">Validación Rápida</p>
                    <h3 className="text-xl font-bold text-white">Ingreso Express</h3>
                    <p className="text-slate-400 text-sm mt-1">Ingresa el código de 6 dígitos del kiosko para revelar tu QR.</p>
                </div>
                
                <div className="space-y-4">
                    <input 
                        value={codeLookup} 
                        onChange={e => { setCodeLookup(e.target.value); setCodeError(''); }} 
                        maxLength={6} 
                        placeholder="000 000" 
                        className="w-full text-center text-3xl tracking-[0.3em] font-mono bg-black/40 border border-white/10 rounded-2xl px-4 py-6 text-white focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-white/10 shadow-inner" 
                    />
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 py-4" onClick={handleCodeValidate} disabled={!codeLookup || codeLookup.length < 6}>
                        Validar Código
                    </Button>
                </div>
                
                {codeError && <p className="text-sm text-red-300 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center font-medium animate-pulse">{codeError}</p>}
                
                {codeVisit && (
                    <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xl relative overflow-hidden animate-fade-in-up">
                        <div className="relative z-10 text-center space-y-4">
                            <div>
                                <p className="text-xs text-white/70 uppercase tracking-widest font-bold">Bienvenido</p>
                                <p className="font-bold text-2xl mt-1">{codeVisit.visitorName}</p>
                                <p className="text-sm text-white/80">{codeVisit.company}</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl">
                                <QRCodeCanvas value={codeVisit.qrCode || 'QR pendiente'} size={160} />
                            </div>
                            <p className="font-mono text-sm opacity-80 bg-black/20 rounded-full px-3 py-1 inline-block">{codeVisit.qrCode}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
};