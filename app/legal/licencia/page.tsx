import React from 'react';

export default function LicenciaPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-16 px-4">
      <h1 className="text-3xl font-bold mb-4 text-slate-900">Licencia MIT</h1>
      <p className="text-lg text-slate-700 max-w-2xl text-center">
        Este proyecto está licenciado bajo la Licencia MIT. Puedes usar, modificar y distribuir el software libremente, siempre que incluyas el aviso de copyright y la licencia en todas las copias o partes sustanciales del software.
      </p>
      <pre className="bg-slate-100 rounded-lg p-4 mt-8 text-xs text-slate-600 max-w-2xl overflow-x-auto">
{`MIT License

Copyright (c) 2024 MakerCycle

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
      </pre>
    </div>
  );
} 