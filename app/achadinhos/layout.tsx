import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Achadinhos da Shopee, Shein, Mercado Livre e Amazon',
  description: 'Catálogo de achadinhos com preço atualizado, cupons verificados e links diretos para as lojas. Escolha por loja ou categoria.',
  alternates: { canonical: '/achadinhos' },
};

export default function AchadinhosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
