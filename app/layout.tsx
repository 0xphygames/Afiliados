import type {Metadata} from 'next';
import './globals.css';
import { GoogleTag } from '@/components/GoogleTag';
import { ConsentBanner } from '@/components/ConsentBanner';
import { WebMcp } from '@/components/WebMcp';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  applicationName: SITE_NAME,
  keywords: ['achadinhos', 'achadinhos shopee', 'cupons shopee', 'achadinhos shein', 'promoções mercado livre', 'ofertas amazon'],
  title: {
    default: 'Achadinhos & Looks - Tamires Santos',
    template: '%s | Achadinhos & Looks',
  },
  description: 'Curadoria exclusiva de achadinhos e looks da Shopee, Shein, Mercado Livre e Amazon por Tamires Santos.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Achadinhos & Looks - Tamires Santos',
    description: 'Curadoria exclusiva de achadinhos e looks da Shopee, Shein, Mercado Livre e Amazon por Tamires Santos.',
    type: 'website',
    siteName: SITE_NAME,
    locale: 'pt_BR',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Achadinhos & Looks - Tamires Santos',
    description: 'Curadoria exclusiva de achadinhos e looks da Shopee, Shein, Mercado Livre e Amazon por Tamires Santos.',
  },
};

const profileLinks = [
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  process.env.NEXT_PUBLIC_TIKTOK_URL,
  process.env.NEXT_PUBLIC_YOUTUBE_URL,
  process.env.NEXT_PUBLIC_FACEBOOK_URL,
].filter((value): value is string => Boolean(value));
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contato@achadinhoselooks.com.br';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased bg-white text-stone-900 selection:bg-stone-900 selection:text-white" suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.svg`,
          founder: { '@type': 'Person', name: 'Tamires Santos' },
          ...(process.env.NEXT_PUBLIC_BUSINESS_TELEPHONE ? { telephone: process.env.NEXT_PUBLIC_BUSINESS_TELEPHONE } : {}),
          ...(process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ? { address: { '@type': 'PostalAddress', streetAddress: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS, addressCountry: 'BR' } } : {}),
          email: contactEmail,
          contactPoint: { '@type': 'ContactPoint', email: contactEmail, contactType: 'customer service', availableLanguage: 'pt-BR' },
          ...(profileLinks.length ? { sameAs: profileLinks } : {}),
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          inLanguage: 'pt-BR',
          potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/busca?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
        }) }} />
        <GoogleTag />
        <WebMcp />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}

