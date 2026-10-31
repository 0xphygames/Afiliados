import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog: guias de compra, looks e reviews',
  description: 'Guias de compra, comparativos e dicas de looks e fitness, com links para os produtos recomendados.',
  alternates: { canonical: '/blog' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
