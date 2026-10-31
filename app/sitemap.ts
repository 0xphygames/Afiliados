import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const siteUrl = 'https://achadinhoselooks.com.br';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { data } = await supabase.from('articles').select('id,created_at').order('created_at', { ascending: false });
  const articleEntries = (data ?? []).map((article) => ({
    url: `${siteUrl}/artigo/${encodeURIComponent(String(article.id))}`,
    lastModified: article.created_at ? new Date(article.created_at) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));
  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/achadinhos`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/cupons`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/campanha`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    ...articleEntries,
  ];
}
