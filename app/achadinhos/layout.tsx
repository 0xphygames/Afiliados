import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Achadinhos e Ofertas | Shopee, Shein, Amazon e Mercado Livre',
  description: 'Encontre achadinhos, ofertas, cupons e produtos testados da Shopee, Shein, Amazon e Mercado Livre.',
  alternates: { canonical: '/achadinhos' },
};

export default function AchadinhosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
