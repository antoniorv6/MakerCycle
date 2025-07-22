import Link from 'next/link';

export default function LegalIndexPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-16 px-4">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Información Legal</h1>
      <ul className="space-y-4 text-lg text-slate-700">
        <li><Link href="/legal/aviso-legal" className="text-blue-700 hover:underline">Aviso Legal</Link></li>
        <li><Link href="/legal/privacidad" className="text-blue-700 hover:underline">Política de Privacidad</Link></li>
        <li><Link href="/legal/cookies" className="text-blue-700 hover:underline">Política de Cookies</Link></li>
        <li><Link href="/legal/terminos" className="text-blue-700 hover:underline">Términos y Condiciones</Link></li>
        <li><Link href="/legal/seguridad" className="text-blue-700 hover:underline">Seguridad</Link></li>
        <li><Link href="/legal/licencia" className="text-blue-700 hover:underline">Licencia MIT</Link></li>
      </ul>
    </div>
  );
} 