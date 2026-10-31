import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { SITE_URL } from '@/lib/seo';

// Rebuilt on each request so new articles and pages show up without a redeploy
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = ['', '/achadinhos', '/blog', '/cupons', '/campanha'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const [articles, pages, sitePages] = await Promise.all([
    supabase.from('articles').select('id, created_at'),
    supabase.from('landing_pages').select('slug, updated_at').eq('is_active', true),
    supabase.from('site_pages').select('slug, updated_at').eq('is_active', true),
  ]);

  const articleRoutes = (articles.data ?? []).map((a) => ({
    url: `${SITE_URL}/artigo/${a.id}`,
    lastModified: new Date(a.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const campaignRoutes = (pages.data ?? []).map((p) => ({
    url: `${SITE_URL}/campanha/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const customRoutes = (sitePages.data ?? []).map((p) => ({
    url: `${SITE_URL}/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...articleRoutes, ...campaignRoutes, ...customRoutes];
}
