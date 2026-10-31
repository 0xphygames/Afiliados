import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campanhas e ofertas especiais',
  description: 'Páginas temáticas com as melhores ofertas do momento, frete grátis e cupons exclusivos das lojas parceiras.',
};

export default function CampanhaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
