import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BlogContentRenderer } from '@/components/BlogContentRenderer';
import { supabase } from '@/lib/supabase';
import type { Article } from '@/lib/types';

const siteUrl = 'https://achadinhoselooks.com.br';

function mapArticle(row: Record<string, unknown>): Article {
  return {
    id: String(row.id ?? ''), title: String(row.title ?? ''),
    category: String(row.category ?? 'Guia de compras'), summary: String(row.summary ?? ''),
    content: String(row.content ?? ''), coverImageUrl: row.cover_image_url ? String(row.cover_image_url) : '',
    author: String(row.author ?? 'Tamires Santos'), featured: Boolean(row.featured),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

async function getArticle(id: string): Promise<Article | null> {
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapArticle(data as Record<string, unknown>);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return { title: 'Artigo não encontrado | Achadinhos & Looks' };
  return {
    title: `${article.title} | Achadinhos & Looks`,
    description: article.summary || `Confira ${article.title} na curadoria de Tamires Santos.`,
    authors: [{ name: article.author || 'Tamires Santos' }],
    alternates: { canonical: `/artigo/${encodeURIComponent(article.id)}` },
    openGraph: {
      type: 'article', url: `${siteUrl}/artigo/${encodeURIComponent(article.id)}`,
      title: article.title, description: article.summary, publishedTime: article.createdAt,
      authors: [article.author || 'Tamires Santos'],
      images: article.coverImageUrl ? [{ url: article.coverImageUrl, alt: article.title }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: article.title, description: article.summary, images: article.coverImageUrl ? [article.coverImageUrl] : undefined },
  };
}

export default async function PublicArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();
  const formattedDate = new Date(article.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const structuredData = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article', headline: article.title,
    description: article.summary, image: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    author: { '@type': 'Person', name: article.author || 'Tamires Santos' },
    publisher: { '@type': 'Organization', name: 'Achadinhos & Looks', url: siteUrl },
    datePublished: article.createdAt, dateModified: article.createdAt,
    mainEntityOfPage: `${siteUrl}/artigo/${encodeURIComponent(article.id)}`, inLanguage: 'pt-BR',
  }).replace(/</g, '\\u003c');

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-stone-900 selection:text-white">
      <Navbar activePlatform="all" productCount={0} />
      <main className="flex-1 bg-white"><div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-950 py-1.5 px-3 rounded-lg hover:bg-stone-100"><ArrowLeft className="w-3.5 h-3.5" />Voltar para a vitrine</Link>
        <article className="space-y-6">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
          <div className="space-y-3"><div className="flex items-center gap-2"><span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">{article.category}</span><span className="text-stone-300">·</span><time dateTime={article.createdAt} className="text-xs text-stone-500">{formattedDate}</time></div><h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">{article.title}</h1><div className="flex items-center gap-3 pt-4 border-b border-stone-100 pb-4"><div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">TS</div><div><p className="text-xs font-bold text-stone-900">{article.author || 'Tamires Santos'}</p><p className="text-[11px] text-stone-500">Curadora & Criadora de Conteúdo</p></div></div></div>
          {article.coverImageUrl && <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm"><Image src={article.coverImageUrl} alt={article.title} fill className="object-cover" priority unoptimized /></div>}
          <div className="pt-6 border-t border-stone-100 max-w-none"><BlogContentRenderer content={article.content} className="text-base sm:text-lg leading-relaxed space-y-4" /></div>
        </article>
      </div></main>
      <Footer />
    </div>
  );
}
