import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cupons de desconto verificados',
  description: 'Cupons de desconto e frete grátis da Shopee, Shein, Mercado Livre e Amazon, com validade e loja indicadas.',
  alternates: { canonical: '/cupons' },
};

export default function CuponsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
