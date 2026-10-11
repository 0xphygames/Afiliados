import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm max-w-md w-full space-y-4">
        <span className="text-4xl font-serif font-black text-stone-900">404</span>
        <h1 className="font-serif text-xl font-bold text-stone-900">Página não encontrada</h1>
        <p className="text-xs text-stone-600">
          A página ou achadinho que você procurava não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors"
        >
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
}
