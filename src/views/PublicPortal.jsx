import React, { useState } from 'react';
import { Building2, ChevronRight, CheckCircle2, LogOut } from 'lucide-react';
import { Button, Card, Input, Select } from '../components/ui';
import { QRCodeCanvas } from 'qrcode.react';

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
  codeVisit,
  handleCodeValidate,
  setCodeError,
  handleLogout,
}) => {
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const nextErrors = {};
    if (!formData.visitorName) nextErrors.visitorName = 'Ingresa tu nombre completo';
    if (!formData.email) nextErrors.email = 'El correo es obligatorio';
    if (!formData.company) nextErrors.company = 'La empresa es obligatoria';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      setErrors(prev => ({ ...prev, date: !formData.date ? 'Requerido' : undefined, time: !formData.time ? 'Requerido' : undefined }));
      return;
    }
    createVisitRequest(formData);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 relative">
      <button onClick={handleLogout} className="absolute top-4 right-4 text-sm px-4 py-2 rounded-full bg-slate-900/80 text-white shadow-lg border border-white/10 flex items-center gap-2">
        <LogOut size={16}/> Cerrar sesión
      </button>
      <div className="mb-10 text-center space-y-2">
        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl shadow-sm inline-block">
          <Building2 size={32} className="text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Portal de Visitas</h1>
        <p className="text-slate-500">Gestiona tu acceso a nuestras oficinas</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] w-full max-w-6xl">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur" role="form" aria-label="Formulario de solicitud de visita">
          {step === 1 && (
            <div className="animate-fade-in-up">
              <div className="text-left mb-6">
                <p className="text-sm uppercase tracking-[0.14em] text-slate-500 font-semibold">Solicitud de Ingreso</p>
                <h2 className="text-2xl font-bold text-slate-900">Paso 1: Tus Datos</h2>
              </div>
              <div className="space-y-4">
                <Input label="Nombre Completo" placeholder="Ej. Juan Pérez" value={formData.visitorName} onChange={e => setFormData({...formData, visitorName: e.target.value})} error={errors.visitorName} required />
                <Input label="Correo Electrónico" type="email" placeholder="juan@empresa.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} error={errors.email} required />
                <Input label="Empresa de procedencia" placeholder="Nombre de tu empresa" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} error={errors.company} required />
                <Button className="w-full mt-4" onClick={() => validateStep1() && setStep(2)} disabled={!formData.visitorName}>Continuar <ChevronRight size={16} className="ml-1" /></Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in-up">
              <div className="text-left mb-6">
                <p className="text-sm uppercase tracking-[0.14em] text-slate-500 font-semibold">Detalles de la visita</p>
                <h2 className="text-2xl font-bold text-slate-900">Paso 2: Agenda y motivo</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Tipo de Visitante" options={VISIT_TYPES} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} error={errors.type} />
                  <Select label="Motivo" options={['Reunión', 'Entrevista', 'Mantenimiento', 'Entrega']} value={formData.motive} onChange={e => setFormData({...formData, motive: e.target.value})} error={errors.motive} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Fecha" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} error={errors.date} required />
                  <Input label="Hora Estimada" type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} error={errors.time} required />
                </div>
                <Input label="Persona a visitar" placeholder="Buscar anfitrión..." defaultValue="Ana López" disabled className="bg-slate-50" />
                
                <div className="flex gap-3 mt-6">
                  <Button variant="secondary" onClick={() => setStep(1)} type="button">Atrás</Button>
                  <Button className="flex-1" type="submit">Enviar Solicitud</Button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 animate-fade-in space-y-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">¡Solicitud Enviada!</h2>
              <p className="text-slate-600 mb-2 px-4">
                Notificamos a tu anfitrión. Recibirás un código QR en tu correo <strong className="text-slate-900">{formData.email || 'registrado'}</strong> cuando sea aprobada.
              </p>
              <p className="text-sm text-slate-500">Si estás en recepción, pide el código temporal del kiosko y valídalo abajo para ver tu QR.</p>
              <Button variant="secondary" onClick={() => { setStep(1); setFormData({visitorName: '', email: '', company: '', motive: '', type: 'Cliente', date: '', time: ''}) }}>
                Nueva Solicitud
              </Button>
            </div>
          )}
        </Card>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl p-6 space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.12em] text-slate-500 font-semibold">Validación rápida</p>
            <h3 className="text-xl font-bold text-slate-900">Usa el código del kiosko</h3>
            <p className="text-slate-500 text-sm">Ingresa el código de 6 dígitos que aparece en la pantalla del kiosko para revelar tu QR sin login.</p>
          </div>
          <div className="flex gap-2">
            <input value={codeLookup} onChange={e => { setCodeLookup(e.target.value); setCodeError(''); }} maxLength={6} placeholder="Ej. 482913" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-400/70 outline-none" />
            <Button onClick={handleCodeValidate} disabled={!codeLookup || codeLookup.length < 6}>Validar</Button>
          </div>
          {codeError && <p className="text-sm text-red-600" role="alert" aria-live="assertive">{codeError}</p>}
          {codeVisit && (
            <div className="p-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 text-slate-900 space-y-3 shadow-[0_20px_50px_-30px_rgba(79,70,229,0.5)]">
              <p className="text-sm font-semibold text-indigo-700">Visita encontrada</p>
              <p className="font-bold text-lg">{codeVisit.visitorName}</p>
              <p className="text-sm text-slate-600">{codeVisit.company} • {codeVisit.type}</p>
              <div className="mt-3 p-4 rounded-xl bg-white border border-indigo-100">
                <p className="text-xs text-slate-500">Tu código QR</p>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-100 via-white to-cyan-50 shadow-inner">
                    <QRCodeCanvas value={codeVisit.qrCode || 'QR pendiente'} size={180} />
                  </div>
                  <div className="space-y-2">
                    <p className="font-mono text-xl text-indigo-700 break-all bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 shadow-sm">{codeVisit.qrCode || 'QR pendiente'}</p>
                    <p className="text-xs text-slate-500">Uso restante: {codeVisit.usesRemaining ?? 0} / 2</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
