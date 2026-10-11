import type {Metadata} from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Achadinhos & Looks - Tamires Santos | Teste Autodeploy',
  description: 'Curadoria exclusiva de achadinhos e looks da Shopee, Shein, Mercado Livre e Amazon por Tamires Santos.',
  openGraph: {
    title: 'Achadinhos & Looks - Tamires Santos | Teste Autodeploy',
    description: 'Curadoria exclusiva de achadinhos e looks da Shopee, Shein, Mercado Livre e Amazon por Tamires Santos.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Achadinhos & Looks - Tamires Santos | Teste Autodeploy',
    description: 'Curadoria exclusiva de achadinhos e looks da Shopee, Shein, Mercado Livre e Amazon por Tamires Santos.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${plusJakarta.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-white text-stone-900 selection:bg-stone-900 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

