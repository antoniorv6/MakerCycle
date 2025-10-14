import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Política de cookies - MakerCycle',
  description: 'Política de cookies de MakerCycle',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://makercycle.es/legal/cookies',
  },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">Política de cookies</h1>
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Qué son las cookies</h2>
            <p>Son pequeños ficheros que se almacenan en tu dispositivo al navegar por sitios web.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Qué cookies utilizamos</h2>
            <p>Actualmente, solo utilizamos cookies estrictamente necesarias para el funcionamiento del servicio (técnicas). No usamos cookies de analítica, publicidad o perfilado.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Tabla de cookies</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-slate-300">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Nombre</th>
                    <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Finalidad</th>
                    <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Duración</th>
                    <th className="border border-slate-300 px-4 py-2 text-left font-semibold">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-4 py-2 font-mono">mc_session</td>
                    <td className="border border-slate-300 px-4 py-2">Mantener la sesión del usuario autenticado</td>
                    <td className="border border-slate-300 px-4 py-2">Sesión</td>
                    <td className="border border-slate-300 px-4 py-2">Propia, <strong>técnica</strong></td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-4 py-2 font-mono">mc_csrf</td>
                    <td className="border border-slate-300 px-4 py-2">Protección anti-CSRF en formularios</td>
                    <td className="border border-slate-300 px-4 py-2">Sesión</td>
                    <td className="border border-slate-300 px-4 py-2">Propia, <strong>técnica</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Gestión de cookies</h2>
            <p>Puedes eliminar o bloquear cookies en la configuración de tu navegador. Ten en cuenta que las cookies técnicas son necesarias para el correcto funcionamiento del servicio (p. ej., mantener tu sesión iniciada).</p>
          </section>
        </div>
      </div>
      </div>
    </div>
  );
} 