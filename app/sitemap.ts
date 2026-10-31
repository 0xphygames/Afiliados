import type { MetadataRoute } from 'next';

const siteUrl = 'https://achadinhoselooks.com.br';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/achadinhos`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/cupons`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/campanha`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];
}
