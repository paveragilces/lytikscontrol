import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, QrCode, UserCheck, ChevronRight, XCircle, Camera, ShieldCheck, CheckCircle2, User as UserIcon, LogOut, AlertTriangle, Bell, Clock, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, CountdownCircle, Input, Select } from '../components/ui';
import { SectionHeader } from '../components/common/SectionHeader';
import { ActionTile } from '../components/common/ActionTile';

export const TabletMode = ({ visits, setVisits, decrementUse, handleCheckIn, addLog, lastCodeRotation, addNotification, handleLogout }) => {
  const [view, setView] = useState('home');
  const [scannedData, setScannedData] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [timeTick, setTimeTick] = useState(Date.now());
  const [detectedFlash, setDetectedFlash] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const docVideoRef = useRef(null);
  const docCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const docStreamRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDocCameraReady, setIsDocCameraReady] = useState(false);
  const [scanMessage, setScanMessage] = useState('Listo para escanear');
  const [docImage, setDocImage] = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const signatureCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const jsQRRef = useRef(null);

  const kioskCode = useMemo(() => visits.find(v => v.status === 'approved' && (v.usesRemaining ?? 0) > 0 && v.validationCode), [visits]);
  const timeLeft = useMemo(() => {
    if (!kioskCode?.validationExpiresAt) return null;
    return Math.max(0, Math.round((kioskCode.validationExpiresAt - timeTick) / 1000));
  }, [kioskCode, timeTick]);
  const scanError = scanMessage.toLowerCase().includes('no coincide');

  useEffect(() => {
    const interval = setInterval(() => setTimeTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.21);
    } catch (e) {
      // ignore audio errors
    }
  };

  const startCamera = async () => {
    try {
      if (!jsQRRef.current) {
        const mod = await import('jsqr');
        jsQRRef.current = mod.default || mod;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
        scanFrame();
      }
    } catch (err) {
      setScanMessage('No pudimos acceder a la cámara. Revisa permisos.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setIsCameraReady(false);
  };

  const startDocCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      docStreamRef.current = stream;
      if (docVideoRef.current) {
        docVideoRef.current.srcObject = stream;
        await docVideoRef.current.play();
        setIsDocCameraReady(true);
      }
    } catch (err) {
      setScanMessage('No pudimos acceder a la cámara de documento.');
    }
  };

  const stopDocCamera = () => {
    if (docStreamRef.current) {
      docStreamRef.current.getTracks().forEach(t => t.stop());
    }
    setIsDocCameraReady(false);
  };

  useEffect(() => {
    if (view === 'scan' && cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [view, cameraActive]);

  useEffect(() => {
    return () => {
      stopCamera();
      stopDocCamera();
    };
  }, []);

  const scanFrame = () => {
    if (view !== 'scan' || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!video.videoWidth || !video.videoHeight) {
      requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQRRef.current ? jsQRRef.current(imageData.data, canvas.width, canvas.height) : null;

    if (code && code.data) {
      const found = visits.find(v => v.qrCode === code.data);
      if (found) {
        playBeep();
        setScanMessage('QR detectado');
        setDetectedFlash(true);
        setTimeout(() => setDetectedFlash(false), 900);
        setTimeout(() => {
          setScannedData(found);
          setView('process');
          stopCamera();
        }, 240);
        return;
      }
      setScanMessage('QR leído pero no coincide con visitas aprobadas.');
    }
    requestAnimationFrame(scanFrame);
  };

  const handleProcessComplete = () => {
    if ((scannedData?.usesRemaining ?? 0) <= 0) {
      setScanMessage('El QR ya fue usado dos veces.');
      return;
    }
    decrementUse(scannedData.id);
    handleCheckIn(scannedData.id, { doc: docImage ? true : false, selfie: false });
    setVisits(prev => prev.map(v => v.id === scannedData.id ? { ...v, docImage, signatureData } : v));
    addLog('Evidencias', `Cédula y firma capturadas para ${scannedData.visitorName}`, 'Kiosko');
    stopDocCamera();
    stopCamera();
    setView('success');
  };

  const Header = () => (
    <header className="w-full px-6 md:px-10 py-6 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-white/10 p-3 rounded-2xl border border-white/15 shadow-sm backdrop-blur">
          <Building2 size={24} className="text-white" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-200/80 font-semibold">Check-in Express</p>
          <span className="text-xl font-bold tracking-tight text-white">LytiksControl Kiosk</span>
        </div>
      </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/15 text-xs text-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Cámara lista
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/20 shadow-sm text-white hover:bg-white/15">
              <LogOut size={16}/> Salir
            </button>
          </div>
        </header>
  );

  if (view === 'home') return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1324] text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-20 top-10 w-[420px] h-[420px] bg-indigo-600/30 blur-[120px] rounded-full" />
        <div className="absolute right-[-120px] bottom-[-60px] w-[460px] h-[460px] bg-cyan-500/25 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.06),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_45%)]"></div>
      </div>
      <Header />
      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-16 pt-4 animate-fade-in relative z-10">
        <SectionHeader
          eyebrow="Check-in Express"
          title="Bienvenido"
          subtitle="Solo dos caminos. Escanea tu QR o crea tu solicitud."
          tone="dark"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-10">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: 'easeOut', delay: 0.03 }}
          >
            <ActionTile
              icon={QrCode}
              title="Tengo Código QR"
              description="Escanéalo y entra en segundos."
              badge={{ label: 'Acceso más rápido', icon: ShieldCheck }}
              onClick={() => setView('scan')}
              variant="primary"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: 'easeOut', delay: 0.1 }}
          >
            <ActionTile
              icon={UserCheck}
              title="No tengo código"
              description="Serás registrado manualmente en recepción."
              badge={{ label: 'Registro en sitio' }}
              onClick={() => setView('walkin')}
              variant="secondary"
            />
          </motion.div>
        </div>
        <div className="text-sm text-slate-200 flex items-center gap-2 mt-8 justify-center">
          <ShieldCheck size={16} className="text-emerald-400" /> Verificación biométrica y evidencias disponibles para auditoría.
        </div>
      </div>
    </div>
  );

  if (view === 'scan') return (
    <div className="h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 flex flex-col items-center justify-center relative overflow-hidden text-slate-900" role="main" aria-label="Escaneo de QR">
      <button onClick={() => { setView('home'); setCameraActive(false); }} className="absolute top-8 left-8 text-slate-700 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-slate-200">
        <XCircle /> Cancelar
      </button>
      
      <div className="text-center space-y-4 animate-fade-in relative z-10 px-4 w-full max-w-5xl">
        <div className="space-y-2 max-w-3xl mx-auto">
          <p className="text-xs text-slate-500 uppercase tracking-[0.18em]">Check-in inmediato</p>
          <h2 className="text-4xl font-bold text-slate-900">Escanea tu código QR</h2>
          <p className="text-slate-500">Autoriza el uso de la cámara y coloca el QR dentro del recuadro iluminado para validar contra las visitas aprobadas.</p>
        </div>
        <motion.div 
          className="grid md:grid-cols-[1.3fr_0.7fr] gap-6 items-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="relative rounded-3xl bg-slate-900/90 overflow-hidden shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)] border border-slate-800/60" role="region" aria-label="Lector de códigos QR">
            <div className="absolute inset-0 scan-aurora"></div>
            <div className="absolute inset-4 rounded-2xl border border-white/10 scan-grid"></div>
            <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/30"></div>
            <video ref={videoRef} className="w-full h-[380px] object-cover bg-slate-900/60 mix-blend-screen" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <motion.div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: cameraActive ? 0.95 : 0.7 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="relative w-full max-w-[320px] aspect-square rounded-[26px]">
                <div className="absolute inset-0 rounded-[26px] shadow-[0_0_0_9999px_rgba(15,23,42,0.6)]"></div>
                <div className="absolute inset-0 rounded-[26px] border-2 border-white/60 shadow-[0_0_25px_rgba(255,255,255,0.25)]" />
                <div className="absolute inset-2 rounded-[22px] border border-white/25" />
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  <div className="border-l-2 border-t-2 border-white/70 rounded-tl-[22px]"></div>
                  <div></div>
                  <div className="border-r-2 border-t-2 border-white/70 rounded-tr-[22px]"></div>
                  <div></div><div></div><div></div>
                  <div className="border-l-2 border-b-2 border-white/70 rounded-bl-[22px]"></div>
                  <div></div>
                  <div className="border-r-2 border-b-2 border-white/70 rounded-br-[22px]"></div>
                </div>
                <motion.div
                  className="absolute left-4 right-4 h-14 bg-gradient-to-b from-emerald-300/35 via-indigo-200/30 to-transparent rounded-full blur-[1px]"
                  animate={{ y: ["0%", "100%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
            {(!isCameraReady || !cameraActive) && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-200 bg-slate-900/70 px-6 text-center backdrop-blur-sm" aria-live="polite">
                {cameraActive ? scanMessage : 'Activa el lector luego de que el visitante reciba su QR.'}
              </div>
            )}
            {scanError && (
              <motion.div
                className="absolute top-4 inset-x-6 flex justify-center"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                role="alert"
              >
                <div className="px-4 py-3 rounded-xl bg-red-600/90 text-white shadow-lg border border-red-400/70 flex items-center gap-2 text-sm">
                  <AlertTriangle size={16}/> QR leído pero no coincide con visitas aprobadas.
                </div>
              </motion.div>
            )}
            {detectedFlash && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-emerald-400/10 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <motion.div 
                  className="px-4 py-2 rounded-full bg-emerald-500/80 text-white font-semibold flex items-center gap-2 shadow-lg"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircle2 size={18}/> QR detectado
                </motion.div>
              </motion.div>
            )}
            <div className="absolute -bottom-10 inset-x-0 text-center text-xs text-slate-200 flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur">
                <QrCode size={14}/> Alinea tu código dentro del recuadro para continuar.
              </div>
              <span className="text-[11px] text-slate-300">Si tienes problemas, pide ayuda en recepción.</span>
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-white/10 bg-white/80 backdrop-blur text-left space-y-5 shadow-[0_25px_60px_-40px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Código de validación del kiosko</p>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className={`px-3 py-1 rounded-full ${cameraActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {cameraActive ? 'Cámara activa' : 'Cámara apagada'}
                </span>
              </div>
            </div>
            {kioskCode ? (
              <>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-extrabold text-indigo-700 tracking-[0.12em]">{kioskCode.validationCode}</p>
                  <CountdownCircle expiresAt={kioskCode.validationExpiresAt} key={`${kioskCode.validationCode}-${lastCodeRotation}`} />
                </div>
                <p className="text-xs text-slate-500">Muestra este código en el portal visitante para revelar tu QR.</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1"><RefreshCcw size={12}/> {timeLeft !== null ? `Expira en ${timeLeft}s` : 'Cambia cada 30s'}</span>
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 flex items-center gap-1"><Clock size={12}/> Usos: {kioskCode.usesRemaining ?? 0}/2</span>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm">Aún no hay visitas aprobadas con código.</p>
            )}
            <Button onClick={() => setCameraActive(v => !v)} icon={Camera} disabled={!kioskCode}>
              {cameraActive ? 'Apagar cámara' : 'Activar cámara'}
            </Button>
            {scanMessage && <p className="text-xs text-slate-500 flex items-center gap-1"><Bell size={12}/> {scanMessage}</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );

  if (view === 'process') return (
    <div className="h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 text-slate-900">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-50px_rgba(0,0,0,0.6)] overflow-hidden animate-fade-in-up">
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 p-6 text-white text-center">
          <h2 className="text-2xl font-bold">¡Hola, {scannedData.visitorName}!</h2>
          <p className="text-indigo-50/90">Visita a: {scannedData.hostName}</p>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="font-semibold text-slate-900 flex items-center gap-2"><Camera size={18}/> Foto Documento</p>
              <div className="space-y-2">
                <div className="aspect-video bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {docImage ? (
                    <img src={docImage} alt="Documento" className="w-full h-full object-cover" />
                  ) : (
                    <video ref={docVideoRef} className="w-full h-full object-cover bg-slate-100" muted />
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={startDocCamera}>Encender cámara</Button>
                  <Button onClick={() => {
                    if (!docVideoRef.current || !docCanvasRef.current) return;
                    const video = docVideoRef.current;
                    const canvas = docCanvasRef.current;
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/png');
                    setDocImage(dataUrl);
                    stopDocCamera();
                  }} disabled={!isDocCameraReady}>Capturar</Button>
                </div>
                <canvas ref={docCanvasRef} className="hidden" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-slate-900 flex items-center gap-2"><UserCheck size={18}/> Firma en tablet</p>
              <div className="aspect-video bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col">
                <canvas
                  ref={signatureCanvasRef}
                  className="flex-1 w-full"
                  onMouseDown={(e) => { setIsDrawing(true); const rect = e.target.getBoundingClientRect(); const ctx = signatureCanvasRef.current.getContext('2d'); ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top); }}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseMove={(e) => {
                    if (!isDrawing) return;
                    const rect = e.target.getBoundingClientRect();
                    const ctx = signatureCanvasRef.current.getContext('2d');
                    ctx.strokeStyle = '#1e293b';
                    ctx.lineWidth = 2;
                    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                    ctx.stroke();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setIsDrawing(true);
                    const rect = e.target.getBoundingClientRect();
                    const touch = e.touches[0];
                    const ctx = signatureCanvasRef.current.getContext('2d');
                    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
                  }}
                  onTouchEnd={(e) => { e.preventDefault(); setIsDrawing(false); }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    if (!isDrawing) return;
                    const rect = e.target.getBoundingClientRect();
                    const touch = e.touches[0];
                    const ctx = signatureCanvasRef.current.getContext('2d');
                    ctx.strokeStyle = '#1e293b';
                    ctx.lineWidth = 2;
                    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
                    ctx.stroke();
                  }}
                />
                <div className="flex justify-between p-3">
                  <Button variant="secondary" onClick={() => {
                    const canvas = signatureCanvasRef.current;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0,0,canvas.width, canvas.height);
                    setSignatureData(null);
                  }}>Borrar</Button>
                  <Button onClick={() => {
                    const canvas = signatureCanvasRef.current;
                    const dataUrl = canvas.toDataURL('image/png');
                    setSignatureData(dataUrl);
                  }}>Guardar firma</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300/60 transition-colors">
              <input type="checkbox" className="mt-1 w-5 h-5 text-indigo-500 rounded focus:ring-indigo-500" />
              <div className="text-sm text-slate-700">
                Declaro que la información es veraz y acepto las <strong className="text-indigo-600">Políticas de Seguridad y Privacidad</strong>, incluyendo la retención de imágenes para fines de auditoría BASC.
              </div>
            </label>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <Button variant="secondary" onClick={() => { setView('home'); setCameraActive(false); stopDocCamera(); stopCamera(); }} className="flex-1">Cancelar</Button>
            <Button className="flex-[2] py-4 text-lg" onClick={handleProcessComplete} disabled={!docImage || !signatureData}>Confirmar Ingreso</Button>
          </div>
          <p className="text-sm text-slate-500">Requiere foto de cédula y firma para confirmar.</p>
        </div>
      </div>
    </div>
  );

  if (view === 'success') return (
    <div className="h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 flex flex-col items-center justify-center text-slate-900 text-center p-8 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-emerald-400/25 to-transparent blur-3xl" />
      </div>
      <div className="relative w-32 h-32 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce-slow">
        <CheckCircle2 size={64} className="text-emerald-500" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Ingreso registrado</h1>
      <p className="text-slate-500 text-xl max-w-xl mb-12">Tu ingreso fue confirmado. {scannedData?.hostName} ha sido notificado para recibirte.</p>
      <Button onClick={() => setView('home')} className="px-12 py-4 rounded-full text-lg font-bold">Finalizar</Button>
    </div>
  );

  if (view === 'walkin') return (
    <div className="h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 text-slate-900">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-50px_rgba(0,0,0,0.6)] animate-fade-in-up">
        <div className="p-6 border-b border-slate-200">
          <p className="text-sm text-slate-500 uppercase tracking-[0.08em]">Registro manual</p>
          <h3 className="text-2xl font-bold text-slate-900">Walk-in en recepción</h3>
          <p className="text-slate-500">Completa tus datos y solicitaremos aprobación inmediata.</p>
        </div>
        <div className="p-6 space-y-4">
          <Input label="Tu Nombre" placeholder="Nombre completo" />
          <Input label="Empresa" placeholder="Empresa" />
          <Input label="Documento ID" placeholder="DNI / Pasaporte" />
          <Select label="A quien visitas" options={['Ana López', 'Carlos Ruiz', 'Recepción']} />
          <div className="pt-4 flex gap-3">
            <Button variant="secondary" onClick={() => setView('home')} className="flex-1">Cancelar</Button>
            <Button className="flex-1" onClick={() => {
              addNotification('Solicitud creada. Esperando aprobación de recepción/anfitrión.');
              setView('home');
            }}>Solicitar Acceso</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
