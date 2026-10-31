import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guia de compras e ofertas | Achadinhos & Looks',
  description: 'Confira análises, comparativos e recomendações de produtos com links oficiais e ofertas selecionadas.',
  alternates: { canonical: '/artigo' },
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
