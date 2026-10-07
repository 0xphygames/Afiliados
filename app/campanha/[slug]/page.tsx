'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { CustomLandingPage, Product, SiteSettings, PlatformId } from '@/lib/types';
import { PLATFORMS, INITIAL_PRODUCTS } from '@/lib/constants';
import {
  subscribeFirestoreLandingPages,
  subscribeFirestoreProducts,
  subscribeFirestoreSettings,
  INITIAL_LANDING_PAGES,
  INITIAL_SETTINGS,
} from '@/lib/firestore-products';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { Footer } from '@/components/Footer';
import {
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react';

export default function PublicCampaignPage() {
  const params = useParams();
  const rawSlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const slug = decodeURIComponent(String(rawSlug || ''));

  const [pages, setPages] = useState<CustomLandingPage[]>(INITIAL_LANDING_PAGES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubPages = subscribeFirestoreLandingPages((list) => {
      if (list && list.length > 0) setPages(list);
    });
    const unsubProds = subscribeFirestoreProducts((list) => {
      if (list && list.length > 0) setProducts(list);
    });
    const unsubSettings = subscribeFirestoreSettings((cfg) => {
      if (cfg) setSettings(cfg);
    });
    return () => {
      unsubPages();
      unsubProds();
      unsubSettings();
    };
  }, []);

  const campaign = useMemo(() => {
    return pages.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
  }, [pages, slug]);

  const campaignProducts = useMemo(() => {
    if (!campaign) return products;
    return products.filter((p) => {
      if (campaign.platform && campaign.platform !== 'all' && p.platform !== campaign.platform) {
        return false;
      }
      if (campaign.category && campaign.category.trim()) {
        const matchesCat = p.category.toLowerCase().includes(campaign.category.toLowerCase());
        const matchesTitle = p.title.toLowerCase().includes(campaign.category.toLowerCase());
        if (!matchesCat && !matchesTitle) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [campaign, products, searchQuery]);

  const platformConfig =
    campaign?.platform && campaign.platform !== 'all' ? PLATFORMS[campaign.platform] : null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activePlatform={campaign?.platform || 'all'}
        onSelectPlatform={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        productCount={campaignProducts.length}
        bannerNotice={settings.topBannerNotice}
      />

      <main className="flex-1 bg-white">
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors py-1.5 px-3 rounded-lg hover:bg-stone-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para todos os achadinhos</span>
          </Link>
        </div>

        {/* Campaign Hero Banner */}
        {campaign ? (
          <section className="bg-stone-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-4 border border-stone-800 shadow-md overflow-hidden relative">
            <div className="relative max-w-7xl mx-auto px-6 py-10 sm:py-14 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-8 z-10">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  {campaign.badge && (
                    <span className="px-3 py-1 bg-amber-400 text-stone-950 rounded-full text-xs font-bold shadow-xs">
                      {campaign.badge}
                    </span>
                  )}
                  {platformConfig && (
                    <span
                      style={{ backgroundColor: platformConfig.color }}
                      className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                    >
                      {platformConfig.name}
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  {campaign.headline || campaign.title}
                </h1>

                {campaign.subheading && (
                  <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                    {campaign.subheading}
                  </p>
                )}

                <div className="pt-2 flex items-center gap-6 text-xs text-stone-300">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Links 100% Verificados</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Cupons de Desconto</span>
                  </div>
                </div>
              </div>

              {campaign.bannerImageUrl && (
                <div className="w-full lg:w-96 aspect-16/10 rounded-2xl overflow-hidden relative border border-stone-700 shadow-lg">
                  <Image
                    src={campaign.bannerImageUrl}
                    alt={campaign.title}
                    fill
                    className="object-cover"
                    priority
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="max-w-2xl mx-auto p-12 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
            <h1 className="font-serif text-2xl font-bold text-stone-900">Campanha não encontrada</h1>
            <p className="text-xs text-stone-500">
              A campanha que você está procurando pode ter expirado ou foi desativada pela curadora.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 py-2.5 px-4 bg-stone-900 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Ver todos os achadinhos
            </Link>
          </div>
        )}

        {/* Campaign Products Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
          <div className="flex items-center justify-between pb-6 border-b border-stone-200 mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Achadinhos Selecionados desta Campanha
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Exibindo {campaignProducts.length} itens com curadoria especial de Tamires Santos
              </p>
            </div>
          </div>

          {campaignProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {campaignProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 max-w-md mx-auto">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="font-serif text-base font-bold text-stone-900">
                Nenhum produto cadastrado nesta campanha ainda
              </h3>
              <p className="text-xs text-stone-500 mt-1 mb-4">
                Tamires está preparando as melhores ofertas para esta seleção.
              </p>
              <Link
                href="/"
                className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
              >
                Explorar vitrine completa
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

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
