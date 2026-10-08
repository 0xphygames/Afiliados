'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PlatformId, Product, Article, SiteSettings, SortOption, CustomLandingPage, CustomCategory } from '@/lib/types';
import { PLATFORMS, INITIAL_PRODUCTS } from '@/lib/constants';
import {
  subscribeFirestoreProducts,
  subscribeFirestoreArticles,
  subscribeFirestoreSettings,
  subscribeFirestoreLandingPages,
  subscribeFirestoreCategories,
  subscribeAuth,
  isUserAdmin,
  INITIAL_ARTICLES,
  INITIAL_SETTINGS,
  INITIAL_LANDING_PAGES,
  INITIAL_CUSTOM_CATEGORIES,
} from '@/lib/firestore-products';
import { testConnection } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { CategorySidebar } from '@/components/CategorySidebar';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { ArticlesSection } from '@/components/ArticlesSection';
import { ArticleDetailModal } from '@/components/ArticleDetailModal';
import { LandingPagesSection } from '@/components/LandingPagesSection';
import { VipGroupSection } from '@/components/VipGroupSection';
import { Footer } from '@/components/Footer';
import {
  ArrowUpDown,
  ShoppingBag,
  Database,
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [landingPages, setLandingPages] = useState<CustomLandingPage[]>(INITIAL_LANDING_PAGES);
  const [categories, setCategories] = useState<CustomCategory[]>(INITIAL_CUSTOM_CATEGORIES);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [activePlatform, setActivePlatform] = useState<PlatformId | 'all'>('shopee');
  const [activeCategory, setActiveCategory] = useState<string>('Todos os Setores');
  const [activeCampaignSlug, setActiveCampaignSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('recent');

  // Modal states for customer viewing
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Subscribe to real-time Firestore database & Auth
  useEffect(() => {
    // Validate connection
    testConnection();

    // Listen to real-time products
    const unsubscribeProducts = subscribeFirestoreProducts((list) => {
      if (list && list.length > 0) {
        setProducts(list);
      }
    });

    // Listen to real-time articles
    const unsubscribeArticles = subscribeFirestoreArticles((artList) => {
      if (artList && artList.length > 0) {
        setArticles(artList);
      }
    });

    // Listen to real-time settings
    const unsubscribeSettings = subscribeFirestoreSettings((siteSettings) => {
      if (siteSettings) {
        setSettings(siteSettings);
      }
    });

    // Listen to real-time landing pages
    const unsubscribePages = subscribeFirestoreLandingPages((pagesList) => {
      if (pagesList && pagesList.length > 0) {
        setLandingPages(pagesList);
      }
    });

    // Listen to real-time categories
    const unsubscribeCategories = subscribeFirestoreCategories((catsList) => {
      if (catsList && catsList.length > 0) {
        setCategories(catsList);
      }
    });

    // Listen to auth
    const unsubscribeAuth = subscribeAuth((user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeArticles();
      unsubscribeSettings();
      unsubscribePages();
      unsubscribeCategories();
      unsubscribeAuth();
    };
  }, []);

  const isAdmin = isUserAdmin(currentUser);

  // Change platform
  const handleSelectPlatform = (platform: PlatformId | 'all') => {
    setActivePlatform(platform);
    setActiveCategory('Todos os Setores');
    setActiveCampaignSlug(null);
  };

  // Change category
  const handleSelectCategory = (category: string) => {
    setActiveCategory(category);
  };

  // Select campaign
  const handleSelectCampaign = (page: CustomLandingPage) => {
    setActiveCampaignSlug(page.slug);
    if (page.platform) {
      setActivePlatform(page.platform);
    }
    if (page.category) {
      setActiveCategory(page.category);
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Platform filter
        if (activePlatform !== 'all' && p.platform !== activePlatform) {
          return false;
        }
        // Category filter
        if (
          activeCategory !== 'Todos os Setores' &&
          p.category.toLowerCase() !== activeCategory.toLowerCase()
        ) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchTip = p.tamiresTip?.toLowerCase().includes(q) ?? false;
          const matchBadge = p.badge?.toLowerCase().includes(q) ?? false;
          if (!matchTitle && !matchCat && !matchTip && !matchBadge) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        if (sortOption === 'discount') {
          const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        }
        if (sortOption === 'rating') return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, activePlatform, activeCategory, searchQuery, sortOption]);

  const currentPlatformInfo = activePlatform !== 'all' ? PLATFORMS[activePlatform] : null;

  return (
    <div id="topo" className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activePlatform={activePlatform}
        onSelectPlatform={handleSelectPlatform}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        productCount={products.length}
        bannerNotice={settings.topBannerNotice}
      />

      <main className="flex-1 bg-white">
        {/* Campaign Hero Showcase */}
        <HeroBanner
          activePlatform={activePlatform}
          onSelectPlatform={handleSelectPlatform}
          settings={settings}
        />

        {/* Landing Pages & Special Campaigns Carousel */}
        <LandingPagesSection
          pages={landingPages}
          onSelectCampaign={handleSelectCampaign}
          activeCampaignSlug={activeCampaignSlug}
          onClearCampaign={() => setActiveCampaignSlug(null)}
        />

        {/* Category & Sector Filter Bar */}
        <CategoryBar
          activePlatform={activePlatform}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          products={products}
          customCategories={categories}
        />

        {/* Section Header with Controls */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
                  {activePlatform === 'all'
                    ? 'Todos os Achadinhos Selecionados'
                    : `Achadinhos da ${currentPlatformInfo?.name}`}
                </h2>
                {activeCategory !== 'Todos os Setores' && (
                  <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-300">
                    {activeCategory}
                  </span>
                )}
                
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {currentPlatformInfo?.tagline ||
                  'Produtos testados, preÃ§os imperdÃ­veis e links diretos para compras seguras.'}
              </p>
            </div>

            {/* Sort and Filters */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-white border border-stone-300 rounded-xl px-3 py-1.5 shadow-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="bg-transparent text-stone-900 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="price-asc">Menor PreÃ§o</option>
                  <option value="price-desc">Maior PreÃ§o</option>
                  <option value="discount">Maior Desconto (%)</option>
                  <option value="rating">Melhor Avaliados</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 shadow-xs max-w-xl mx-auto my-8">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">
                Nenhum achadinho encontrado neste filtro
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
                {searchQuery
                  ? `NÃ£o encontramos resultados para "${searchQuery}". Tente outro termo.`
                  : `Ainda nÃ£o temos produtos cadastrados no setor "${activeCategory}".`}
              </p>
              <div className="flex items-center justify-center gap-3">
                {activeCategory !== 'Todos os Setores' && (
                  <button
                    onClick={() => handleSelectCategory('Todos os Setores')}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors border border-stone-300"
                  >
                    Ver todos os setores
                  </button>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                  >
                    Limpar busca
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Blog & Articles Section (Public Display) */}
        <ArticlesSection
          articles={articles}
          onSelectArticle={setSelectedArticle}
        />

        {/* VIP Channels & Community Banner */}
        <VipGroupSection />
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

      {/* Footer with discrete backoffice routing */}
      <Footer
        onSelectPlatform={handleSelectPlatform}
        currentUser={currentUser}
        isAdmin={isAdmin}
      />
    </div>
  );
}


