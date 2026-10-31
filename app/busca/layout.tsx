import type { Metadata } from 'next';

// Search result pages are not useful in Google and multiply near-duplicate URLs
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function BuscaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
