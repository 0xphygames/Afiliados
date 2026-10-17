'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { fetchSitePageBySlug } from '@/lib/firestore-products';
import { SitePage, PlatformId } from '@/lib/types';

// Pages created in the admin. Static routes (/cupons, /blog, ...) take precedence over this one.
export default function SitePageView() {
  const params = useParams<{ slug: string[] }>();
  const slug = Array.isArray(params?.slug) ? params.slug.join('/') : '';

  const [page, setPage] = useState<SitePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchSitePageBySlug(slug)
      .then((found) => {
        if (active) setPage(found && found.isActive ? found : null);
      })
      .catch((err) => {
        console.error(err);
        if (active) setPage(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const paragraphs = (page?.body || '').split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar activePlatform={selectedPlatform} onSelectPlatform={setSelectedPlatform} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 space-y-6">
        {loading ? (
          <p className="text-sm text-stone-500">Carregando página...</p>
        ) : page ? (
          <article className="space-y-5">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">{page.title}</h1>
            {paragraphs.map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-stone-700 whitespace-pre-line">
                {p}
              </p>
            ))}
          </article>
        ) : (
          <div className="text-center py-16 space-y-3">
            <h1 className="font-serif text-2xl font-bold text-stone-900">Página não encontrada</h1>
            <Link href="/" className="inline-block px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl">
              Voltar para a página inicial
            </Link>
          </div>
        )}
      </main>

      <Footer onSelectPlatform={setSelectedPlatform} />
    </div>
  );
}
