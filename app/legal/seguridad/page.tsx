import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Seguridad y gestión de incidentes - MakerCycle',
  description: 'Seguridad y gestión de incidentes de MakerCycle',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://makercycle.es/legal/seguridad',
  },
};

export default function SeguridadPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">Seguridad y gestión de incidentes</h1>
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Medidas técnicas y organizativas</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cifrado TLS en tránsito.</li>
              <li>Contraseñas almacenadas con hash y salt (p. ej., Argon2/bcrypt).</li>
              <li>Control de accesos y principio de mínimo privilegio.</li>
              <li>Separación de entornos y control de despliegues.</li>
              <li>Copias de seguridad cifradas y pruebas periódicas de restauración.</li>
              <li>Registro de eventos de seguridad (accesos, errores críticos) y retención limitada.</li>
              <li>Monitorización básica y respuesta a incidentes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Gestión de vulnerabilidades</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Política de dependencias actualizadas; parches de seguridad con prioridad.</li>
              <li>Revisiones de código y buenas prácticas de desarrollo seguro.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Notificación de brechas</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Evaluación de riesgos ante cualquier incidente que afecte a datos personales.</li>
              <li>Si procede, comunicación a la AEPD en ≤72h y a los usuarios cuando exista alto riesgo.</li>
              <li>Canal de contacto para seguridad: contacto@3dmstore.es.</li>
            </ul>
          </section>
        </div>
      </div>
      </div>
    </div>
  );
} 