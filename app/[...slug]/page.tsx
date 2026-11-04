import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo';

// Pages created in the admin. Static routes (/cupons, /blog, ...) take precedence over this one.
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug: segments } = await params;
  const slug = segments.join('/');
  const { data } = await supabase.from('site_pages').select('title, body').eq('slug', slug).maybeSingle();
  if (!data?.title) return { title: 'Página não encontrada', robots: { index: false, follow: true } };
  return {
    title: data.title,
    description: data.body?.replace(/\s+/g, ' ').trim().slice(0, 160),
    alternates: { canonical: `${SITE_URL}/${slug}` },
  };
}

export default async function SitePageView({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: segments } = await params;
  const slug = segments.join('/');
  const { data } = await supabase.from('site_pages').select('title, body, is_active, updated_at').eq('slug', slug).maybeSingle();
  if (!data?.is_active) notFound();

  const body = typeof data.body === 'string' ? data.body : '';
  const paragraphs = body.split(/\n\s*\n/).filter((p: string) => p.trim());

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 space-y-6">
        <article className="space-y-5">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">{data.title}</h1>
            {paragraphs.map((p: string, i: number) => (
              <p key={i} className="text-base leading-relaxed text-stone-700 whitespace-pre-line">
                {p}
              </p>
            ))}
          </article>
      </main>

      <Footer />
    </div>
  );
}
