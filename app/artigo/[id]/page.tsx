import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import type { Article } from '@/lib/types';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import { ArticleView } from './ArticleView';

type Props = { params: Promise<{ id: string }> };

// Server-side read so search engines get the real title, description and text
async function getArticle(id: string): Promise<Article | null> {
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    title: data.title,
    category: data.category,
    summary: data.summary,
    content: data.content,
    coverImageUrl: data.cover_image_url || '',
    author: data.author || 'Tamires Santos',
    featured: Boolean(data.featured),
    createdAt: data.created_at,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return { title: 'Artigo não encontrado', robots: { index: false, follow: true } };

  const url = `${SITE_URL}/artigo/${article.id}`;
  const description = article.summary.slice(0, 160);
  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description,
      url,
      type: 'article',
      siteName: SITE_NAME,
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : undefined,
      publishedTime: article.createdAt,
      authors: [article.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    },
  };
}

export default async function PublicArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);

  // Structured data so Google can show the article with its author and date
  const jsonLd = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.summary.slice(0, 160),
        image: article.coverImageUrl ? [article.coverImageUrl] : undefined,
        datePublished: article.createdAt,
        dateModified: article.createdAt,
        author: { '@type': 'Person', name: article.author },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        mainEntityOfPage: `${SITE_URL}/artigo/${article.id}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <ArticleView initialArticle={article} />
    </>
  );
}
