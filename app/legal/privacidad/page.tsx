import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Política de privacidad - MakerCycle',
  description: 'Política de privacidad de MakerCycle',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://makercycle.es/legal/privacidad',
  },
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">Política de privacidad</h1>
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">1. Identidad del responsable</h2>
            <p>Responsable: Adrián Burnao González de la Aleja (N/A) – Domicilio: Calle el Abedul 2, Alicante, España – Contacto: contacto@3dmstore.es.</p>
            <p>Delegado/a de Protección de Datos (si aplica): no aplica / indicar contacto DPO.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">2. Finalidades del tratamiento</h2>
            <p>(i) Crear y gestionar la cuenta de usuario.</p>
            <p>(ii) Autenticación, operación y mantenimiento del servicio.</p>
            <p>(iii) Comunicaciones estrictamente relacionadas con el servicio.</p>
            <p>(iv) Soporte técnico y atención a solicitudes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">3. Bases jurídicas</h2>
            <p>– Ejecución de un contrato (art. 6.1.b RGPD) para alta/gestión de cuenta y prestación del servicio.</p>
            <p>– Interés legítimo (art. 6.1.f RGPD) en seguridad del servicio y prevención del fraude (ponderación interna disponible).</p>
            <p>– Consentimiento (art. 6.1.a RGPD) únicamente si se habilitan comunicaciones comerciales o cookies no necesarias (no activas por defecto).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">4. Categorías de datos</h2>
            <p>Identificativos (nombre/alias), contacto (email), credenciales (hash), metadatos técnicos (logs, IP disociada/pseudonimizada cuando sea posible).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">5. Destinatarios y encargados</h2>
            <p>No se ceden datos a terceros salvo obligación legal. Podrán acceder a los datos proveedores necesarios para la prestación (Netlify, Supabase) mediante contratos de encargo de tratamiento (art. 28 RGPD). No se realizan transferencias internacionales fuera del EEE salvo que el proveedor lo requiera; en tal caso se aplicarán garantías adecuadas (Cláusulas Contractuales Tipo u otras).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">6. Conservación</h2>
            <p>Los datos se conservan solo con fines de almacenamiento, no para uso comercial ni analítico. Los registros técnicos de seguridad podrán conservarse por tiempos razonables para investigación de incidentes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">7. Derechos</h2>
            <p>Puedes ejercer acceso, rectificación, supresión, oposición, portabilidad y limitación escribiendo a contacto@3dmstore.es. Tienes derecho a presentar reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">8. Menores</h2>
            <p>El servicio está dirigido a mayores de 14 años. Si eres menor de 14, se requiere consentimiento parental/tutelar para el uso del servicio.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">9. Seguridad</h2>
            <p>Aplicamos medidas técnicas y organizativas adecuadas (TLS, hash+salt de contraseñas, control de accesos, copias de seguridad cifradas y pruebas de restauración, registro de eventos, principio de mínimo privilegio).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-900">10. Cambios en la política</h2>
            <p>Podremos actualizar esta política para reflejar cambios normativos o del servicio. La versión vigente se publicará en esta URL.</p>
          </section>
        </div>
      </div>
      </div>
    </div>
  );
} 