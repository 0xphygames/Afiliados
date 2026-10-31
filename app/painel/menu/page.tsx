'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Menu & Rotas is managed together with site pages. */
export default function PainelMenuPage() {
  const router = useRouter();
  useEffect(() => router.replace('/painel/paginas'), [router]);
  return <p className="p-8 text-sm text-stone-500">Redirecionando para Páginas do Site…</p>;
}
