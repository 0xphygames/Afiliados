'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CustomLandingPage, PlatformId, SiteSettings } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import {
  subscribeFirestoreLandingPages,
  subscribeFirestoreSettings,
  INITIAL_LANDING_PAGES,
  INITIAL_SETTINGS,
} from '@/lib/firestore-products';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Flame,
  Star,
  Search,
  Filter,
  Layers,
  ShoppingBag,
  ExternalLink,
  Tag,
  AlertTriangle,
} from 'lucide-react';

export default function CampanhasCatalogPage() {
  const [pages, setPages] = useState<CustomLandingPage[]>(INITIAL_LANDING_PAGES);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubPages = subscribeFirestoreLandingPages((list) => {
      if (list && list.length > 0) setPages(list);
    });
    const unsubSettings = subscribeFirestoreSettings((cfg) => {
      if (cfg) setSettings(cfg);
    });
    return () => {
      unsubPages();
      unsubSettings();
    };
  }, []);

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      if (!page.isActive) return false;
      if (selectedPlatform !== 'all' && page.platform && page.platform !== 'all' && page.platform !== selectedPlatform) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = page.title.toLowerCase().includes(q);
        const matchesHeadline = (page.headline || '').toLowerCase().includes(q);
        const matchesSubheading = (page.subheading || '').toLowerCase().includes(q);
        const matchesCategory = (page.category || '').toLowerCase().includes(q);
        const matchesBadge = (page.badge || '').toLowerCase().includes(q);
        return matchesTitle || matchesHeadline || matchesSubheading || matchesCategory || matchesBadge;
      }
      return true;
    });
  }, [pages, selectedPlatform, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activePlatform={selectedPlatform}
        onSelectPlatform={setSelectedPlatform}
        searchQuery=""
        onSearchChange={() => {}}
        bannerNotice={settings.topBannerNotice}
      />

      <main className="flex-1 pb-16">
        {/* Editorial Hero Header for Campaigns */}
        <section className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-semibold text-amber-900">
                <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>Páginas de Alta Conversão & Fundo de Funil</span>
                <span className="text-amber-300">·</span>
                <span className="text-amber-700 font-normal">Cupons Verificados</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
                Campanhas & Seleções Especiais
              </h1>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Páginas temáticas dedicadas para que você aproveite o menor preço do ano, gatilhos de frete grátis e cupons secretos das principais lojas parceiras (Shopee, Shein, Mercado Livre e Amazon).
              </p>

              {/* Guarantees Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-stone-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Links Oficiais de Afiliada</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ofertas com Validação Real</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Atualizações Constantes</span>
                </div>
              </div>
            </div>

            {/* Platform & Search Controls */}
            <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Store Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedPlatform('all')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    selectedPlatform === 'all'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Todas as Lojas ({pages.filter((p) => p.isActive).length})
                </button>
                <button
                  onClick={() => setSelectedPlatform('shopee')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    selectedPlatform === 'shopee'
                      ? 'bg-[#EE4D2D] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  🧡 Shopee
                </button>
                <button
                  onClick={() => setSelectedPlatform('shein')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    selectedPlatform === 'shein'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  🖤 Shein
                </button>
                <button
                  onClick={() => setSelectedPlatform('mercadolivre')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    selectedPlatform === 'mercadolivre'
                      ? 'bg-[#FFE600] text-stone-950 font-bold shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  💛 Mercado Livre
                </button>
                <button
                  onClick={() => setSelectedPlatform('amazon')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    selectedPlatform === 'amazon'
                      ? 'bg-[#232F3E] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  📦 Amazon
                </button>
              </div>

              {/* Local Search Input */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrar campanhas..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Campaigns Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Todas as Campanhas Ativas ({filteredPages.length})
              </h2>
              <p className="text-xs text-stone-500">
                Clique na campanha para abrir a página dedicada com contagem regressiva e cupons exclusivos.
              </p>
            </div>
          </div>

          {filteredPages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPages.map((page) => {
                const platformConfig =
                  page.platform && page.platform !== 'all' ? PLATFORMS[page.platform] : null;

                return (
                  <article
                    key={page.id}
                    className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-stone-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Media container with responsive aspect ratio and smooth overlay */}
                      <div className="relative aspect-16/10 w-full bg-stone-100 overflow-hidden border-b border-stone-100">
                        {page.bannerImageUrl ? (
                          <Image
                            src={page.bannerImageUrl}
                            alt={page.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover object-center group-hover:scale-104 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-stone-400 bg-stone-100">
                            <ShoppingBag className="w-10 h-10 mb-2 text-stone-300" />
                            <span className="text-xs font-semibold">Campanha Especial</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-amber-400 text-stone-950 rounded-lg shadow-xs flex items-center gap-1">
                            <Flame className="w-3 h-3 text-stone-950" />
                            <span>{page.badge || 'PROMOÇÃO IMPERDÍVEL'}</span>
                          </span>

                          {platformConfig && (
                            <span
                              style={{ backgroundColor: platformConfig.color }}
                              className="px-2.5 py-1 text-[10px] font-bold text-white rounded-lg shadow-xs uppercase tracking-wider"
                            >
                              {platformConfig.name}
                            </span>
                          )}
                        </div>

                        {/* Countdown / Scarcity Badge in Image */}
                        <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                          {page.countdownActive && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                              <Clock className="w-3 h-3" />
                              <span>Oferta por Tempo Limitado</span>
                            </div>
                          )}

                          <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug drop-shadow-sm text-balance">
                            {page.title}
                          </h3>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 space-y-3">
                        {page.scarcityText && (
                          <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-900">
                            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                            <span className="truncate">{page.scarcityText}</span>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                          {page.subheading || page.headline || 'Curadoria de produtos exclusivos com cupons verificados.'}
                        </p>

                        {/* Trust & Rating */}
                        <div className="pt-1 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100">
                          <div className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{page.ratingScore ? page.ratingScore.toFixed(1) : '4.9'} / 5.0</span>
                            <span className="text-stone-400 font-normal">
                              ({page.testimonials?.length || 18} avaliações)
                            </span>
                          </div>

                          <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                            {page.category || 'Curadoria Especial'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="p-5 pt-0">
                      <Link
                        href={`/campanha/${page.slug}`}
                        className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group-hover:bg-amber-500 group-hover:text-stone-950"
                      >
                        <span>{page.ctaText || 'Acessar Campanha & Cupons'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 max-w-md mx-auto space-y-3">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Nenhuma campanha encontrada
              </h3>
              <p className="text-xs text-stone-500">
                Não encontramos nenhuma campanha com o filtro selecionado. Tente alterar a loja ou termo de busca.
              </p>
              <button
                onClick={() => {
                  setSelectedPlatform('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
              >
                Limpar Filtros
              </button>
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
