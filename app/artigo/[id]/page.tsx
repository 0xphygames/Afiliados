'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Article, SiteSettings } from '@/lib/types';
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

export default function PublicArticlePage() {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const articleId = String(rawId || '');

  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoaded, setArticlesLoaded] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [copied, setCopied] = useState(false);

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
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
                <div className="relative aspect-16/9 w-full rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm">
                  <Image
                    src={article.coverImageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                </div>
              )}

              {/* Article Content with rich hyperlinks and markdown formatting */}
              <div className="pt-6 border-t border-stone-100 max-w-none">
                <BlogContentRenderer content={article.content} className="text-base sm:text-lg leading-relaxed space-y-4" />
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
