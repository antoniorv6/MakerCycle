import React from 'react';

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-16 px-4">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Aviso Legal</h1>
      <div className="max-w-2xl text-slate-700 space-y-4">
        <p><strong>Responsable:</strong> MakerCycle (proyecto open source)</p>
        <p><strong>Email de contacto:</strong> contacto@makercycle.com</p>
        <p>Este sitio web es un proyecto open source para la gestión y cálculo de costes en impresión 3D. El uso del sitio implica la aceptación de las condiciones de uso y políticas aquí expuestas.</p>
        <p>MakerCycle no es una empresa registrada, sino un software libre mantenido por la comunidad. No se realiza actividad comercial directa ni se recogen datos personales con fines comerciales.</p>
        <p>Para más información, consulta la <a href="/legal/privacidad" className="text-blue-700 hover:underline">Política de Privacidad</a> y la <a href="/legal/cookies" className="text-blue-700 hover:underline">Política de Cookies</a>.</p>
      </div>
    </div>
  );
} 