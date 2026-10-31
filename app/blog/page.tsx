'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArticleDetailModal } from '@/components/ArticleDetailModal';
import { CategorySidebar } from '@/components/CategorySidebar';
import { Article, CustomCategory, PlatformId, Product } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import { subscribeFirestoreArticles, subscribeFirestoreCategories } from '@/lib/firestore-products';
import {
  BookOpen,
  ArrowLeft,
  Search,
  ArrowRight,
  Clock,
  Sparkles,
  User,
} from 'lucide-react';
import { SocialShare } from '@/components/SocialShare';

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoaded, setArticlesLoaded] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos os Setores');
  const [activePlatform, setActivePlatform] = useState<PlatformId | 'all'>('all');
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);

  useEffect(() => subscribeFirestoreCategories((list) => setCustomCats(list)), []);

  useEffect(() => {
    // Wait for Supabase before rendering, so the bundled placeholder article never flashes
    const unsub = subscribeFirestoreArticles((list) => {
      setArticles(list ?? []);
      setArticlesLoaded(true);
    });
    return () => unsub();
  }, []);

  // Same sectors as the Achadinhos page: defaults plus the ones created in the admin
  const categories = useMemo(() => {
    const defaults = ['Vestuário', 'Suplementos', 'Musculação', 'Natal', 'Dia das Crianças', 'Guloseimas', 'Casa & Decoração', 'Beleza & Skincare'];
    const names = customCats.map((c) => c.name);
    return Array.from(new Set(['Todos os Setores', ...defaults, ...names]));
  }, [customCats]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (activePlatform !== 'all' && art.platform !== activePlatform) {
        return false;
      }
      if (activeCategory !== 'Todos os Setores' && art.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = art.title.toLowerCase().includes(q);
        const matchSummary = art.summary.toLowerCase().includes(q);
        const matchCat = art.category.toLowerCase().includes(q);
        const matchContent = art.content.toLowerCase().includes(q);
        if (!matchTitle && !matchSummary && !matchCat && !matchContent) return false;
      }
      return true;
    });
  }, [articles, activePlatform, activeCategory, searchQuery]);

  const featuredArticle = articles[0] || null;

  // The Achadinhos sidebar counts products by store and sector; articles use the same fields
  const articlesAsProducts = useMemo(
    () => articles.map((a) => ({ id: a.id, title: a.title, platform: a.platform || '', category: a.category }) as unknown as Product),
    [articles],
  );
  const storeCount = (p: 'all' | PlatformId) =>
    p === 'all' ? articles.length : articles.filter((a) => a.platform === p).length;

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-stone-900 selection:text-white">
      <Navbar />

      <main className="flex-1 bg-stone-50/60 pb-16">
        {/* Header Section */}
        <section className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para a Vitrine</span>
              </Link>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Blog & Resenhas Exclusivas</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900">
                  Dicas de Compras, Looks & Achadinhos
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Confira resenhas honestas, comparações de preços, dicas de caimento e guias para economizar na Shopee, Shein, Mercado Livre e Amazon.
                </p>
              </div>

              {/* Share */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-500">Compartilhar Blog:</span>
                <SocialShare compact title="Blog de Achadinhos & Dicas por Tamires Santos" />
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="pt-8 flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4">
              {/* Search in blog */}
              <div className="relative w-full lg:w-64 lg:shrink-0">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar artigos..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900 placeholder:text-stone-400 shadow-2xs"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Store bar, same as the Achadinhos page */}
        <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'shopee', 'shein', 'mercadolivre', 'amazon'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setActivePlatform(p)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  activePlatform === p
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {p === 'all' ? '✨ Todos' : PLATFORMS[p].name} ({storeCount(p)})
              </button>
            ))}
          </div>
        </section>

        <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
            <CategorySidebar
              activePlatform={activePlatform}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              products={articlesAsProducts}
              customCategories={customCats}
            />

            <div className="flex-1 min-w-0 w-full">
        {/* Featured Article Hero (When no search active) */}
        {!searchQuery && activeCategory === 'Todos os Setores' && featuredArticle && (
          <section className="pt-0">
            <Link
              href={`/artigo/${featuredArticle.id}`}
              className="group block bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="relative lg:col-span-7 aspect-16/10 lg:aspect-auto lg:min-h-[360px] bg-stone-100 overflow-hidden">
                  {featuredArticle.coverImageUrl ? (
                    <Image
                      src={featuredArticle.coverImageUrl}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover group-hover:scale-102 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm">
                      Destaque da Semana
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                        {featuredArticle.category}
                      </span>
                      <span>·</span>
                      <span>{new Date(featuredArticle.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors leading-tight">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-4">
                      {featuredArticle.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold">
                        TS
                      </div>
                      <span className="text-xs font-semibold text-stone-700">
                        {featuredArticle.author || 'Tamires Santos'}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Ler Resenha</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* All Articles Grid */}
        <section className="pt-0">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Todos os Artigos ({filteredArticles.length})
            </h3>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((art) => (
                <Link
                  key={art.id}
                  href={`/artigo/${art.id}`}
                  className="group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:border-stone-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Media */}
                    <div className="relative aspect-16/10 w-full bg-stone-100 overflow-hidden">
                      {art.coverImageUrl ? (
                        <Image
                          src={art.coverImageUrl}
                          alt={art.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-103 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <BookOpen className="w-8 h-8" />
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-[11px] font-bold bg-stone-900/90 backdrop-blur-xs text-white rounded-md shadow-xs">
                          {art.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span>Por {art.author || 'Tamires Santos'}</span>
                        <span>{new Date(art.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>

                      <h4 className="font-serif font-bold text-base text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h4>

                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                        {art.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <span className="text-xs font-bold text-stone-900 inline-flex items-center gap-1.5 group-hover:underline">
                      <span>Ler artigo completo</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : !articlesLoaded ? (
            <p className="text-center py-16 text-sm text-stone-500">Carregando artigos...</p>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 max-w-md mx-auto p-6 space-y-3">
              <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
              <h4 className="font-serif font-bold text-base text-stone-900">
                Nenhum artigo encontrado
              </h4>
              <p className="text-xs text-stone-500">
                Não encontramos posts com o termo &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('Todos os Setores');
                }}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </section>
            </div>
          </div>
        </section>
      </main>

      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <Footer />
    </div>
  );
}
