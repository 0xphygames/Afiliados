'use client';

import React from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm max-w-md w-full space-y-4">
        <span className="text-4xl font-serif font-black text-rose-600">Ops!</span>
        <h1 className="font-serif text-xl font-bold text-stone-900">Algo deu errado</h1>
        <p className="text-xs text-stone-600">
          Ocorreu um erro inesperado ao carregar o conteúdo. Tente novamente ou retorne ao início.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="px-4 py-2.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-200 transition-colors"
          >
            Ir para o Início
          </Link>
        </div>
      </div>
    </div>
  );
}
