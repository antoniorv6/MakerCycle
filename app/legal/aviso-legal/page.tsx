import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Aviso legal - MakerCycle',
  description: 'Aviso legal de MakerCycle',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://makercycle.es/legal/aviso-legal',
  },
};

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">Aviso legal</h1>
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Responsable del sitio</h2>
            <p>El titular y responsable de makercycle.es es Adrián Burnao González de la Aleja (N/A), con domicilio en Calle el Abedul 2, Alicante, España. Puedes contactar en contacto@3dmstore.es.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Objeto</h2>
            <p>Este sitio ofrece un servicio online de software de gestión/proyecto (MakerCycle) orientado a la comunidad y distribuido como software libre (licencia Apache 2.0).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Condiciones de uso</h2>
            <p>El acceso y uso del sitio implica la aceptación de estas condiciones y de la Política de Privacidad, Cookies y Términos. Te comprometes a hacer un uso diligente y conforme a la ley, absteniéndote de realizar actividades ilícitas o contrarias a la buena fe.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Propiedad intelectual e industrial</h2>
            <p>Salvo indicación en contrario, los contenidos del sitio pertenecen a sus legítimos titulares y el software se distribuye bajo licencia Apache 2.0. El código puede estar alojado públicamente en repositorios abiertos con su licencia correspondiente.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Responsabilidad</h2>
            <p>El servicio se presta "tal cual", sin garantías de disponibilidad o continuidad. No nos hacemos responsables de daños que pudieran derivarse de interferencias, interrupciones, malware u otros elementos ajenos al control razonable.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Enlaces</h2>
            <p>Los enlaces a sitios de terceros se ofrecen para conveniencia. No ejercemos control sobre ellos y no asumimos responsabilidades por sus contenidos o políticas.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Ley aplicable y jurisdicción</h2>
            <p>Este Aviso legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Alicante, Comunidad Valenciana, salvo norma imperativa en contrario.</p>
          </section>
        </div>
      </div>
      </div>
    </div>
  );
} 