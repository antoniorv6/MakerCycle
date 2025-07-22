import React from 'react';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-16 px-4">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Política de Privacidad</h1>
      <div className="max-w-2xl text-slate-700 space-y-4">
        <p><strong>Responsable del tratamiento:</strong> MakerCycle (proyecto open source)</p>
        <p><strong>Email de contacto:</strong> contacto@makercycle.com</p>
        <p><strong>Finalidad:</strong> Gestionar el acceso y uso de la plataforma, así como el envío de notificaciones relacionadas con el servicio. No se recogen datos personales con fines comerciales ni se ceden a terceros.</p>
        <p><strong>Legitimación:</strong> Consentimiento del usuario y/o ejecución de un contrato (registro y autenticación en la plataforma).</p>
        <p><strong>Destinatarios:</strong> No se cederán datos a terceros salvo obligación legal.</p>
        <p><strong>Derechos:</strong> Acceso, rectificación, supresión, oposición, portabilidad y limitación. Puedes ejercerlos escribiendo a contacto@makercycle.com. Si consideras que el tratamiento de tus datos no se ajusta a la normativa, puedes acudir a la Autoridad de Control (www.aepd.es).</p>
        <p><strong>Conservación:</strong> Los datos se conservarán mientras dure la relación con el usuario o hasta que solicite su supresión.</p>
        <p>Para más información, consulta la <a href="/legal/cookies" className="text-blue-700 hover:underline">Política de Cookies</a>.</p>
      </div>
    </div>
  );
} 