import React from 'react';

export default function TerminosPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-16 px-4">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Términos y Condiciones</h1>
      <div className="max-w-2xl text-slate-700 space-y-4">
        <p><strong>Objeto:</strong> Estos términos regulan el uso de MakerCycle, software open source para la gestión y cálculo de costes en impresión 3D.</p>
        <p><strong>Propiedad intelectual:</strong> MakerCycle se distribuye bajo licencia MIT. Puedes usar, modificar y distribuir el software conforme a dicha licencia.</p>
        <p><strong>Limitación de responsabilidad:</strong> MakerCycle se ofrece "tal cual", sin garantías de ningún tipo. Los desarrolladores y colaboradores no se responsabilizan de daños derivados del uso del software.</p>
        <p><strong>Uso adecuado:</strong> El usuario se compromete a utilizar la plataforma conforme a la ley, la moral y el orden público, absteniéndose de realizar actividades ilícitas o que puedan dañar a terceros.</p>
        <p><strong>Legislación aplicable:</strong> Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de Barcelona, salvo que la ley disponga lo contrario.</p>
      </div>
    </div>
  );
} 