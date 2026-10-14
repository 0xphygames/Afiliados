'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Article, Coupon, SiteSettings, CustomLandingPage } from '@/lib/types';
import { INITIAL_COUPONS, PLATFORMS } from '@/lib/constants';
import {
  subscribeFirestoreProducts,
  subscribeFirestoreArticles,
  subscribeFirestoreSettings,
  subscribeFirestoreLandingPages,
  subscribeAuth,
  isUserAdmin,
  INITIAL_ARTICLES,
  INITIAL_SETTINGS,
  INITIAL_LANDING_PAGES,
} from '@/lib/firestore-products';
import {
  getStoredArticles,
  getStoredLandingPages,
  getStoredSettings,
} from '@/lib/storage';
import { testConnection } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { ArticlesSection } from '@/components/ArticlesSection';
import { ArticleDetailModal } from '@/components/ArticleDetailModal';
import { Footer } from '@/components/Footer';
import {
  ShoppingBag,
  Tag,
  ArrowRight,
  Sparkles,
  Check,
  Copy,
  Clock,
  ExternalLink,
  Flame,
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [coupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [campaigns, setCampaigns] = useState<CustomLandingPage[]>(INITIAL_LANDING_PAGES);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // Instant local cache restore
    queueMicrotask(() => {
      const localArts = getStoredArticles();
      if (localArts && localArts.length > 0) setArticles(localArts);
      const localPages = getStoredLandingPages();
      if (localPages && localPages.length > 0) setCampaigns(localPages);
      const localSettings = getStoredSettings();
      if (localSettings) setSettings(localSettings);
    });

    testConnection();

    const unsubscribeProducts = subscribeFirestoreProducts((list) => {
      if (list && list.length > 0) {
        setProducts(list);
      }
    });

    const unsubscribeArticles = subscribeFirestoreArticles((artList) => {
      if (artList && artList.length > 0) {
        setArticles(artList);
      }
    });

    const unsubscribeCampaigns = subscribeFirestoreLandingPages((pageList) => {
      if (pageList && pageList.length > 0) {
        setCampaigns(pageList);
      }
    });

    const unsubscribeSettings = subscribeFirestoreSettings((siteSettings) => {
      if (siteSettings) {
        setSettings(siteSettings);
      }
    });

    const unsubscribeAuth = subscribeAuth((user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeArticles();
      unsubscribeCampaigns();
      unsubscribeSettings();
      unsubscribeAuth();
    };
  }, []);

  const isAdmin = isUserAdmin(currentUser);

  // Strictly the 3 most recent items for each section on Home
  const recentProducts = products.slice(0, 3);
  const recentCampaigns = campaigns.filter((c) => c.isActive).slice(0, 3);
  const recentCoupons = coupons.slice(0, 3);
  const recentArticles = articles.slice(0, 3);

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  return (
    <div id="topo" className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        bannerNotice={settings.topBannerNotice}
      />

      <main className="flex-1 bg-white">
        {/* Clean Hero (only top banner, without duplicate navigation) */}
        <HeroBanner
          activePlatform="all"
          onSelectPlatform={() => {}}
          settings={settings}
        />

        {/* 1. SEÇÃO DE ACHADINHOS: APENAS OS 3 MAIS RECENTES */}
        <section id="achadinhos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-stone-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-[#EE4D2D] border border-orange-200 text-xs font-bold uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Últimos Achadinhos da Curadoria</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Achadinhos Mais Recentes
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
                Os 3 produtos mais novos garimpados, testados e aprovados pela Tamires Santos com os melhores preços e links oficiais verificados.
              </p>
            </div>

            <Link
              href="/achadinhos"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-all shrink-0 hover:gap-3"
            >
              <span>Ver todos os Achadinhos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3 Most Recent Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {recentProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={setSelectedProduct}
              />
            ))}
          </div>

          {/* Direct CTA button to full catalog */}
          <div className="mt-10 text-center">
            <Link
              href="/achadinhos"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-900 font-bold text-xs sm:text-sm border border-stone-300 shadow-2xs hover:shadow-xs transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-[#EE4D2D]" />
              <span>Explorar Catálogo Completo com Filtros por Loja & Setores ({products.length} itens)</span>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </Link>
          </div>
        </section>

        {/* 2. SEÇÃO DE CAMPANHAS & PÁGINAS ESPECIAIS: APENAS AS 3 MAIS RECENTES */}
        {recentCampaigns.length > 0 && (
          <section id="campanhas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-stone-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>Ofertas & Páginas de Alta Conversão</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                  Campanhas & Seleções Especiais
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
                  Seleções temáticas com cronômetros de urgência, cupons secretos e os menores preços históricos.
                </p>
              </div>

              <Link
                href="/campanha"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-all shrink-0 hover:gap-3"
              >
                <span>Ver todas as Campanhas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 3 Most Recent Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentCampaigns.map((camp) => {
                const platformConfig =
                  camp.platform && camp.platform !== 'all' ? PLATFORMS[camp.platform] : null;

                return (
                  <article
                    key={camp.id}
                    className="group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-16/10 w-full bg-stone-100 overflow-hidden">
                        {camp.bannerImageUrl ? (
                          <Image
                            src={camp.bannerImageUrl}
                            alt={camp.title}
                            fill
                            className="object-cover group-hover:scale-104 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent" />

                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-stone-950 rounded-md shadow-xs">
                            {camp.badge || 'PROMOÇÃO IMPERDÍVEL'}
                          </span>

                          {platformConfig && (
                            <span
                              style={{ backgroundColor: platformConfig.color }}
                              className="px-2 py-0.5 text-[10px] font-bold text-white rounded-md shadow-xs"
                            >
                              {platformConfig.name}
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-serif font-bold text-base leading-tight drop-shadow-sm">
                            {camp.title}
                          </h3>
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        {camp.scarcityText && (
                          <p className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 line-clamp-1">
                            {camp.scarcityText}
                          </p>
                        )}
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {camp.subheading || camp.headline}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <Link
                        href={`/campanha/${camp.slug}`}
                        className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Acessar Campanha</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* 2. SEÇÃO DE CUPONS: APENAS OS 3 MAIS RECENTES */}
        <section id="cupons" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-stone-200 bg-stone-50/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Economia Garantida</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Cupons de Desconto & Campanhas em Destaque
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
                Aproveite os 3 cupons mais recentes testados e aplicáveis diretamente no checkout da Shopee, Shein, Mercado Livre e Amazon.
              </p>
            </div>

            <Link
              href="/cupons"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all shrink-0 hover:gap-3"
            >
              <span>Ver todos os Cupons</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3 Most Recent Coupons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentCoupons.map((coupon) => {
              const platformConfig = PLATFORMS[coupon.platform] || PLATFORMS.shopee;
              const isCopied = copiedCode === coupon.code;

              return (
                <div
                  key={coupon.id}
                  className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        style={{ backgroundColor: platformConfig.color }}
                        className="px-2.5 py-1 text-[11px] font-bold text-white rounded-md uppercase tracking-wider shadow-2xs"
                      >
                        {platformConfig.name}
                      </span>

                      <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Verificado</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                        {coupon.discount}
                      </div>
                      <h3 className="font-serif font-bold text-base text-stone-800 mt-0.5 line-clamp-1">
                        {coupon.title}
                      </h3>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                      {coupon.description}
                    </p>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>Mínimo: <strong className="text-stone-800">{coupon.minSpend}</strong></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{coupon.expirationDate || 'Ativo'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(coupon.code, e)}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-900 text-amber-300 hover:bg-stone-800'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-stone-400" />
                          <span>{coupon.code}</span>
                        </>
                      )}
                    </button>

                    <a
                      href={coupon.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 transition-colors"
                      title="Ir para a loja parceira"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/cupons"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs sm:text-sm border border-stone-300 shadow-2xs hover:shadow-xs transition-all"
            >
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Ver Lista Completa de Cupons & Regras ({coupons.length} cupons ativos)</span>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </Link>
          </div>
        </section>

        {/* 3. SEÇÃO DO BLOG: APENAS OS 3 MAIS RECENTES */}
        <ArticlesSection
          articles={recentArticles}
          onSelectArticle={setSelectedArticle}
          showViewAllButton={true}
        />
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Article Detail Modal */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      {/* Footer */}
      <Footer
        onSelectPlatform={() => {}}
        currentUser={currentUser}
        isAdmin={isAdmin}
      />
    </div>
  );
}
