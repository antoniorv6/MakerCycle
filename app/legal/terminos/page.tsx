import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Términos de uso - MakerCycle',
  description: 'Términos de uso de MakerCycle',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://makercycle.es/legal/terminos',
  },
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">Términos de uso</h1>
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">1. Objeto</h2>
            <p>Estos Términos regulan el uso de makercycle.es y sus funcionalidades.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">2. Registro y cuenta</h2>
            <p>Para utilizar ciertas funciones es necesario crear una cuenta. Debes facilitar información veraz y mantener la confidencialidad de tus credenciales.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">3. Licencia y contenido</h2>
            <p>El software se publica bajo licencia Apache 2.0. El contenido que subas debe respetar la legalidad y derechos de terceros. Nos concedes una licencia limitada para operar técnicamente el servicio (almacenamiento, copia de seguridad, visualización y transmisión).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">4. Usos prohibidos</h2>
            <p>No puedes usar el servicio para actividades ilícitas, infractoras o que comprometan la seguridad o disponibilidad del sistema.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">5. Disponibilidad y soporte</h2>
            <p>El servicio se ofrece "tal cual". Trataremos de mantener continuidad razonable, sin garantía de disponibilidad. El soporte se presta en la medida de los recursos del proyecto.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">6. Baja de cuenta</h2>
            <p>Puedes darte de baja en cualquier momento. Podemos suspender o cancelar cuentas que infrinjan estos Términos o la ley.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">7. Responsabilidad</h2>
            <p>No responderemos de daños indirectos, lucro cesante o pérdida de datos por causas ajenas a nuestro control razonable.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">8. Ley y jurisdicción</h2>
            <p>Se aplicará la ley española y la jurisdicción de Alicante, Comunidad Valenciana, salvo norma imperativa en contrario.</p>
          </section>
        </div>
      </div>
      </div>
    </div>
  );
} 