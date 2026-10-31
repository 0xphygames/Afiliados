import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog de Ofertas, Looks e Guias de Compra | Achadinhos & Looks',
  description: 'Guias de compra, comparativos, looks e dicas para encontrar ofertas e produtos com links oficiais.',
  alternates: { canonical: '/blog' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
