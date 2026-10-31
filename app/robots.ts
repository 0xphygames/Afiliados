import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://achadinhoselooks.com.br/sitemap.xml',
    host: 'https://achadinhoselooks.com.br',
  };
}
