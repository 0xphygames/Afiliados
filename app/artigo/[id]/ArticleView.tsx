'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Article, PlatformId, SiteSettings } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import {
  subscribeFirestoreArticles,
  subscribeFirestoreSettings,
  INITIAL_ARTICLES,
  INITIAL_SETTINGS,
} from '@/lib/firestore-products';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BlogContentRenderer } from '@/components/BlogContentRenderer';
import {
  ArrowLeft,
  Calendar,
  Share2,
  Check,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export function ArticleView({ initialArticle }: { initialArticle?: Article | null }) {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const articleId = String(rawId || '');

  // The server page passes the article so the first paint already has its content and SEO text
  const [articles, setArticles] = useState<Article[]>(initialArticle ? [initialArticle] : []);
  const [articlesLoaded, setArticlesLoaded] = useState(Boolean(initialArticle));
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState<PlatformId | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState('Todos os Departamentos');

  useEffect(() => {
    const unsubArt = subscribeFirestoreArticles((list) => {
      setArticles(list ?? []);
      setArticlesLoaded(true);
    });
    const unsubSet = subscribeFirestoreSettings((cfg) => {
      if (cfg) setSettings(cfg);
    });
    return () => {
      unsubArt();
      unsubSet();
    };
  }, []);

  const article = articles.find((a) => a.id === articleId) || null;

  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = article
    ? new Date(article.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  // Lines without a 'Categoria:' note belong to the article's own sector, not to 'Outros'
  const fallbackCategory = article?.subcategory || article?.department || 'Outros';
  const productLines = article?.content.split('\n').filter((line) => line.trim().startsWith('[[produto|') && line.trim().endsWith(']]')) ?? [];
  const articleProducts = productLines.map((line) => {
    const fields = line.trim().slice(10, -2).split('|').map((field) => field.trim());
    const url = fields[4] || '';
    const highlights = fields[9] || '';
    return {
      platform: (url.includes('amazon') || url.includes('amzn') ? 'amazon' : url.includes('shein') ? 'shein' : url.includes('mercadolivre') || url.includes('mercadolibre') || url.includes('meli.la') ? 'mercadolivre' : 'shopee') as PlatformId,
      category: highlights.match(/(?:^|;\s*)Categoria:\s*([^;]+)/i)?.[1]?.trim() || fallbackCategory,
    };
  });
  const articleCategories = Array.from(new Set(articleProducts.map((product) => product.category))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const filteredContent = article
    ? article.content.split('\n').filter((line) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('[[produto|') || !trimmed.endsWith(']]')) return true;
        const fields = trimmed.slice(10, -2).split('|').map((field) => field.trim());
        const url = fields[4] || '';
        const highlights = fields[9] || '';
        const platform = url.includes('amazon') || url.includes('amzn') ? 'amazon' : url.includes('shein') ? 'shein' : url.includes('mercadolivre') || url.includes('mercadolibre') || url.includes('meli.la') ? 'mercadolivre' : 'shopee';
        const category = highlights.match(/(?:^|;\s*)Categoria:\s*([^;]+)/i)?.[1]?.trim() || fallbackCategory;
        return (activePlatform === 'all' || platform === activePlatform) && (activeCategory === 'Todos os Departamentos' || category === activeCategory);
      }).join('\n')
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activePlatform="all"
        onSelectPlatform={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        productCount={0}
        bannerNotice={settings.topBannerNotice}
      />

      <main className="flex-1 bg-white">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors py-1.5 px-3 rounded-lg hover:bg-stone-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para a vitrine</span>
          </Link>

          {article ? (
            <article className="space-y-6">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
                    {article.category}
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs text-stone-500">{formattedDate}</span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
                  {article.title}
                </h1>

                <div className="flex items-center justify-between pt-4 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                      TS
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        {article.author || 'Tamires Santos'}
                      </p>
                      <p className="text-[11px] text-stone-500">Curadora & Criadora de Conteúdo</p>
                    </div>
                  </div>

                  <button
                    onClick={handleShare}
                    className="px-3 py-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copiado!' : 'Compartilhar'}</span>
                  </button>
                </div>
              </div>

              {/* Cover Image */}
              {article.coverImageUrl && (
                <div className="relative aspect-16/9 w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-stone-100">
                  <Image
                    src={article.coverImageUrl}
                    alt={article.title}
                    fill
                    className="object-cover object-center"
                    priority
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                </div>
              )}

              {/* Article Content with rich hyperlinks and markdown formatting */}
              <div className="pt-6 border-t border-stone-100 max-w-none">
                <div className="mb-6 flex flex-wrap gap-2">
                  {(['all', 'shopee', 'shein', 'mercadolivre', 'amazon'] as const).map((platform) => (
                    <button key={platform} onClick={() => setActivePlatform(platform)} className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold ${activePlatform === platform ? 'bg-stone-900 text-white' : 'border border-stone-200 bg-stone-50 text-stone-700'}`}>
                      {platform === 'all' ? '✨ Todos' : PLATFORMS[platform].name}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-4 lg:sticky lg:top-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-stone-700">Setores & Categorias</p>
                    <button onClick={() => setActiveCategory('Todos os Departamentos')} className={`mb-2 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold ${activeCategory === 'Todos os Departamentos' ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-700'}`}>
                      <span>Todos os Departamentos</span><span>{articleProducts.length}</span>
                    </button>
                    {articleCategories.map((category) => {
                      const count = articleProducts.filter((product) => product.category === category && (activePlatform === 'all' || product.platform === activePlatform)).length;
                      return <button key={category} onClick={() => setActiveCategory(category)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs ${activeCategory === category ? 'bg-stone-100 font-bold text-stone-900' : 'text-stone-600'}`}><span>{category}</span><span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800">{count}</span></button>;
                    })}
                  </aside>
                  <BlogContentRenderer content={filteredContent} className="text-[15px] sm:text-base leading-relaxed space-y-4" />
                </div>
              </div>
            </article>
          ) : !articlesLoaded ? (
            <p className="text-center py-16 text-sm text-stone-500">Carregando artigo...</p>
          ) : (
            <div className="text-center py-16 space-y-3">
              <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
              <h2 className="font-serif text-xl font-bold text-stone-900">Artigo não encontrado</h2>
              <Link href="/" className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl inline-block">
                Voltar para a página inicial
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer
        onSelectPlatform={() => {}}
        onOpenAdmin={() => {}}
        onOpenAuth={() => {}}
        currentUser={null}
        isAdmin={false}
      />
    </div>
  );
}
