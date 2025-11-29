import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Building2, LogOut, Clock, ChevronRight, ScanLine, UserPlus, ShieldCheck, 
  ArrowLeft, Camera, PenTool, CheckCircle2, AlertTriangle, RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import SignatureCanvas from 'react-signature-canvas';
import { Button, CountdownCircle } from '../components/ui';

export const TabletMode = ({ visits, setVisits, decrementUse, handleCheckIn, handleCheckout, addLog, addNotification, handleLogout, lastCodeRotation }) => {
  const [view, setView] = useState('home'); // home, scan, photo-id, photo-asset, signature, process, process-exit
  const [flowType, setFlowType] = useState('entry'); // 'entry' | 'exit'
  const [scannedData, setScannedData] = useState(null);
  const [revealedCodeId, setRevealedCodeId] = useState(null);
  
  // Evidencias temporales
  const [evidence, setEvidence] = useState({ docPhoto: null, assetPhoto: null, signature: null });

  // Refs
  const webcamRef = useRef(null);
  const sigPadRef = useRef(null);
  
  // Escáner
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const jsQRRef = useRef(null);
  const [scanMessage, setScanMessage] = useState('Encuadra el código QR');
  const streamRef = useRef(null);

  const activeVisits = useMemo(() => 
    visits.filter(v => v.status === 'approved' && (v.usesRemaining ?? 0) > 0 && v.validationCode), 
  [visits, lastCodeRotation]);

  // --- LÓGICA DE CÁMARA QR ---
  const startCamera = async () => {
    try {
      if (!jsQRRef.current) { const mod = await import('jsqr'); jsQRRef.current = mod.default || mod; }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); requestAnimationFrame(scanFrame); }
    } catch (err) { setScanMessage('Error: No se pudo acceder a la cámara.'); }
  };
  const stopCamera = () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };

  const scanFrame = () => {
    if (view !== 'scan' || !videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQRRef.current ? jsQRRef.current(imageData.data, imageData.width, imageData.height) : null;
        
        if (code) {
            // BUSCAR VISITA
            const found = visits.find(v => v.qrCode === code.data);
            if (found) {
                stopCamera();
                setScannedData(found);
                
                if (flowType === 'entry') {
                    // Si es entrada, vamos al Wizard de evidencias
                    if (found.status === 'checked-in') {
                        addNotification('Esta visita ya ingresó.', 'warn');
                        setView('home');
                    } else {
                        setEvidence({ docPhoto: null, assetPhoto: null, signature: null });
                        setView('photo-id'); // Paso 1 del Wizard
                    }
                } else {
                    // Si es salida, intentamos checkout
                    const success = handleCheckout(found.id);
                    if (success) {
                        setView('process-exit');
                    } else {
                        // Falló validación de portería
                        setView('home');
                    }
                }
                return;
            }
        }
    }
    requestAnimationFrame(scanFrame);
  };

  useEffect(() => { if (view === 'scan') startCamera(); else stopCamera(); return () => stopCamera(); }, [view]);

  // --- MANEJADORES DE EVIDENCIA ---
  const capturePhoto = (type) => {
      const imageSrc = webcamRef.current.getScreenshot();
      setEvidence(prev => ({ ...prev, [type]: imageSrc }));
  };

  const clearSignature = () => sigPadRef.current.clear();
  
  const saveSignatureAndFinish = () => {
      if (sigPadRef.current.isEmpty()) {
          addNotification('Por favor firme para continuar', 'warn');
          return;
      }
      const sigData = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
      const finalEvidence = { ...evidence, signature: sigData };
      
      // TRIGGER FINAL CHECK-IN
      handleCheckIn(scannedData.id, finalEvidence);
      decrementUse(scannedData.id);
      setView('process');
  };

  // --- COMPONENTES AUXILIARES ---
  const Background = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
       <div className="absolute -left-32 top-[-160px] w-[520px] h-[520px] bg-indigo-500/25 blur-[120px] rounded-full" />
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_40%)]" />
    </div>
  );

  const StepHeader = ({ step, title, desc }) => (
      <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold mb-3 shadow-lg shadow-indigo-500/30">{step}</div>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <p className="text-slate-400 mt-1">{desc}</p>
      </div>
  );

  // --- VISTAS ---

  if (view === 'home') return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b1020] text-white flex flex-col font-sans">
      <Background />
      <header className="w-full px-8 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-200/40"><Building2 size={24} className="text-indigo-100" /></div>
          <div><p className="text-[10px] uppercase tracking-widest text-indigo-200 font-bold">Punto de Acceso</p><span className="text-xl font-bold">Recepción Principal</span></div>
        </div>
        <button onClick={handleLogout} className="p-2.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10"><LogOut size={18}/></button>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full p-6 relative z-10 grid lg:grid-cols-12 gap-8">
         <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
            <div>
                <h1 className="text-5xl font-extrabold mb-2">Bienvenido a <span className="text-indigo-400">Lytiks</span></h1>
                <p className="text-slate-300 text-lg">Seleccione la operación a realizar.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
                <button onClick={() => { setFlowType('entry'); setView('scan'); }} className="group relative overflow-hidden rounded-3xl bg-indigo-600 p-8 text-left transition-all hover:bg-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20">
                    <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4"><ScanLine size={32}/></div>
                        <div><h3 className="text-2xl font-bold mb-1">Registrar Entrada</h3><p className="text-indigo-200 text-sm">Escanear QR de acceso</p></div>
                    </div>
                </button>
                <button onClick={() => { setFlowType('exit'); setView('scan'); }} className="group relative overflow-hidden rounded-3xl bg-slate-800 border border-white/10 p-8 text-left transition-all hover:bg-slate-700">
                    <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4 text-emerald-400"><LogOut size={32}/></div>
                        <div><h3 className="text-2xl font-bold mb-1">Registrar Salida</h3><p className="text-slate-400 text-sm">Finalizar visita</p></div>
                    </div>
                </button>
            </div>
            
            <button onClick={() => setView('walkin')} className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-between group">
                <div className="flex items-center gap-4"><UserPlus className="text-slate-400"/><span className="font-semibold text-lg">¿No tienes código? Registro Manual</span></div>
                <ChevronRight className="text-slate-500 group-hover:translate-x-1 transition-transform"/>
            </button>
         </div>

         <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-[32px] p-6 flex flex-col backdrop-blur-md">
             <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                 <RefreshCcw className="text-indigo-400" size={20}/>
                 <h3 className="font-bold text-lg">Próximas Visitas</h3>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                 {activeVisits.length === 0 ? (
                     <div className="text-center py-10 opacity-50"><Clock size={40} className="mx-auto mb-3"/><p>No hay visitas pendientes</p></div>
                 ) : (
                     activeVisits.map(v => (
                         <div key={v.id} onClick={() => setRevealedCodeId(revealedCodeId === v.id ? null : v.id)} className={`p-4 rounded-xl border transition-all cursor-pointer ${revealedCodeId === v.id ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                             <div className="flex justify-between items-center">
                                 <div><p className="font-bold">{v.visitorName}</p><p className="text-xs opacity-70">{v.company}</p></div>
                                 {revealedCodeId === v.id ? <CountdownCircle expiresAt={v.validationExpiresAt}/> : <div className="text-xs bg-white/10 px-2 py-1 rounded">Ver QR</div>}
                             </div>
                             {revealedCodeId === v.id && <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-center"><span className="text-2xl font-mono font-bold tracking-widest">{v.validationCode}</span><span className="text-[10px] uppercase tracking-widest opacity-70">Código Temporal</span></div>}
                         </div>
                     ))
                 )}
             </div>
         </div>
      </div>
    </div>
  );

  // --- WIZARD: PHOTO ID ---
  if (view === 'photo-id') return (
      <div className="min-h-screen bg-[#0b1020] flex flex-col items-center justify-center p-6 text-white relative">
          <Background/>
          <StepHeader step="1" title="Foto de Identificación" desc="Por favor muestre su Cédula o Pasaporte a la cámara." />
          <div className="w-full max-w-md aspect-video bg-black rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl relative z-10 mb-8 group">
              {evidence.docPhoto ? (
                  <img src={evidence.docPhoto} className="w-full h-full object-cover" />
              ) : (
                  <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover mirror-0" />
              )}
              <div className="absolute inset-0 border-[3px] border-white/30 m-8 rounded-xl pointer-events-none opacity-50"></div>
          </div>
          <div className="flex gap-4 relative z-10">
              {evidence.docPhoto ? (
                  <>
                    <Button variant="secondary" onClick={() => setEvidence({...evidence, docPhoto: null})} className="bg-white/10 border-white/10 text-white">Repetir</Button>
                    <Button onClick={() => setView(scannedData.hasAssets ? 'photo-asset' : 'signature')} className="px-8">Continuar <ChevronRight size={18}/></Button>
                  </>
              ) : (
                  <Button onClick={() => capturePhoto('docPhoto')} icon={Camera} className="px-8 py-4 text-lg">Capturar Foto</Button>
              )}
          </div>
      </div>
  );

  // --- WIZARD: PHOTO ASSET ---
  if (view === 'photo-asset') return (
      <div className="min-h-screen bg-[#0b1020] flex flex-col items-center justify-center p-6 text-white relative">
          <Background/>
          <StepHeader step="2" title="Registro de Activos" desc={`Muestre el equipo: ${scannedData?.assetBrand || 'Equipo'} - ${scannedData?.assetSerial || ''}`} />
          <div className="w-full max-w-md aspect-video bg-black rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl relative z-10 mb-8">
              {evidence.assetPhoto ? (
                  <img src={evidence.assetPhoto} className="w-full h-full object-cover" />
              ) : (
                  <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />
              )}
          </div>
          <div className="flex gap-4 relative z-10">
              {evidence.assetPhoto ? (
                  <>
                    <Button variant="secondary" onClick={() => setEvidence({...evidence, assetPhoto: null})} className="bg-white/10 border-white/10 text-white">Repetir</Button>
                    <Button onClick={() => setView('signature')} className="px-8">Continuar <ChevronRight size={18}/></Button>
                  </>
              ) : (
                  <Button onClick={() => capturePhoto('assetPhoto')} icon={Camera} className="px-8 py-4 text-lg">Capturar Activo</Button>
              )}
          </div>
      </div>
  );

  // --- WIZARD: SIGNATURE ---
  if (view === 'signature') return (
      <div className="min-h-screen bg-[#0b1020] flex flex-col items-center justify-center p-6 text-white relative">
          <Background/>
          <StepHeader step={scannedData?.hasAssets ? "3" : "2"} title="Firma Digital" desc="Firme en el recuadro para aceptar las políticas." />
          <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 mb-8">
              <SignatureCanvas 
                  ref={sigPadRef}
                  penColor="black"
                  canvasProps={{className: 'w-full h-64 bg-white cursor-crosshair'}}
              />
              <div className="border-t border-slate-200 p-3 bg-slate-50 flex justify-between text-slate-500 text-sm">
                  <span>X Firmar Aquí</span>
                  <button onClick={clearSignature} className="text-red-500 hover:text-red-700 font-bold">Borrar</button>
              </div>
          </div>
          <Button onClick={saveSignatureAndFinish} icon={CheckCircle2} className="px-10 py-4 text-lg relative z-10 bg-emerald-600 hover:bg-emerald-500">Confirmar Ingreso</Button>
      </div>
  );

  // --- SCAN VIEW ---
  if (view === 'scan') return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent">
            <div><h2 className="text-white font-bold text-lg">{flowType === 'entry' ? 'Escanear Entrada' : 'Escanear Salida'}</h2><p className="text-slate-300 text-sm">Coloca el código frente a la cámara</p></div>
            <button onClick={() => setView('home')} className="p-3 bg-white/10 rounded-full text-white border border-white/10"><LogOut size={20} className="rotate-180"/></button>
        </div>
        <div className="relative flex-1 flex flex-col items-center justify-center">
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-70" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="relative w-72 h-72 z-10 border-4 border-emerald-500/50 rounded-3xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-[scan_2s_infinite_linear]"></div>
            </div>
            <p className="relative z-10 mt-10 text-white font-medium bg-black/60 px-6 py-3 rounded-full backdrop-blur-xl border border-white/10">{scanMessage}</p>
        </div>
    </div>
  );

  // --- SUCCESS ENTRY ---
  if (view === 'process') return (
    <div className="min-h-screen bg-[#052e16] flex items-center justify-center p-6 text-center relative overflow-hidden">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[40px] shadow-2xl max-w-lg w-full relative z-10">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck size={48} className="text-emerald-600" /></div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">¡Ingreso Exitoso!</h2>
            <p className="text-slate-500 text-lg mb-8">Bienvenido, <span className="font-bold text-slate-800">{scannedData?.visitorName}</span>.</p>
            <Button onClick={() => { setView('home'); setScannedData(null); }} className="w-full py-4 text-lg bg-emerald-600 hover:bg-emerald-700">Terminar</Button>
        </motion.div>
    </div>
  );

  // --- SUCCESS EXIT ---
  if (view === 'process-exit') return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center relative overflow-hidden">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[40px] shadow-2xl max-w-lg w-full relative z-10">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"><LogOut size={48} className="text-blue-600" /></div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Salida Registrada</h2>
            <p className="text-slate-500 text-lg mb-8">Gracias por su visita, <span className="font-bold text-slate-800">{scannedData?.visitorName}</span>.</p>
            <Button onClick={() => { setView('home'); setScannedData(null); }} className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700">Volver al Inicio</Button>
        </motion.div>
    </div>
  );

  return null;
};