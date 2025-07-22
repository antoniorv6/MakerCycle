import React from 'react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-16 px-4">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Política de Cookies</h1>
      <div className="max-w-2xl text-slate-700 space-y-4">
        <p>Este sitio utiliza únicamente cookies técnicas necesarias para su funcionamiento y la autenticación de usuarios. No se utilizan cookies de análisis, publicidad ni de terceros.</p>
        <p>Puedes configurar tu navegador para bloquear o eliminar las cookies, aunque ello podría afectar al funcionamiento de la web.</p>
        <p>Para más información, consulta nuestra <a href="/legal/privacidad" className="text-blue-700 hover:underline">Política de Privacidad</a>.</p>
      </div>
    </div>
  );
} 