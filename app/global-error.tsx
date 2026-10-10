'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased bg-stone-50 text-stone-900">
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm max-w-md w-full space-y-4">
            <span className="text-4xl font-serif font-black text-rose-600">500</span>
            <h1 className="font-serif text-xl font-bold text-stone-900">Erro no Sistema</h1>
            <p className="text-xs text-stone-600">
              Desculpe pelo transtorno. Por favor, tente recarregar a página.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => reset()}
                className="px-4 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Recarregar
              </button>
              <Link
                href="/"
                className="px-4 py-2.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-200 transition-colors"
              >
                Início
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
