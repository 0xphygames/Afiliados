import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://achadinhoselooks.com.br'),
  title: 'Achadinhos & Looks - Tamires Santos',
  description: 'Curadoria exclusiva de achadinhos e looks da Shopee, Shein, Mercado Livre e Amazon por Tamires Santos.',
  keywords: ['achadinhos', 'ofertas', 'cupons', 'Shopee', 'Shein', 'Amazon', 'Mercado Livre', 'looks', 'moda', 'compras'],
  authors: [{ name: 'Tamires Santos' }],
  creator: 'Tamires Santos',
  publisher: 'Achadinhos & Looks',
  alternates: { canonical: '/' },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Achadinhos & Looks - Tamires Santos',
    description: 'Curadoria exclusiva de achadinhos e looks da Shopee, Shein, Mercado Livre e Amazon por Tamires Santos.',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://achadinhoselooks.com.br',
    siteName: 'Achadinhos & Looks',
    images: [{ url: '/images/hero_achadinhos_looks_1791404026649.jpg', width: 1200, height: 630, alt: 'Achadinhos & Looks por Tamires Santos' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Achadinhos & Looks - Tamires Santos',
    description: 'Curadoria exclusiva de achadinhos e looks da Shopee, Shein, Mercado Livre e Amazon por Tamires Santos.',
    images: ['/images/hero_achadinhos_looks_1791404026649.jpg'],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased bg-white text-stone-900 selection:bg-stone-900 selection:text-white" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Achadinhos & Looks',
              url: 'https://achadinhoselooks.com.br',
              logo: 'https://achadinhoselooks.com.br/favicon.svg',
              founder: { '@type': 'Person', name: 'Tamires Santos' },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Achadinhos & Looks',
              url: 'https://achadinhoselooks.com.br',
              inLanguage: 'pt-BR',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://achadinhoselooks.com.br/busca?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}

