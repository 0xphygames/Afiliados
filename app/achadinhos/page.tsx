'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { PlatformId, Product, SortOption, CustomCategory } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import {
  subscribeFirestoreProducts,
  subscribeFirestoreCategories,
  INITIAL_CUSTOM_CATEGORIES,
} from '@/lib/firestore-products';
import { Navbar } from '@/components/Navbar';
import { TaxonomySidebar } from '@/components/TaxonomySidebar';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { Footer } from '@/components/Footer';
import {
  ArrowUpDown,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function AchadinhosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [activePlatform, setActivePlatform] = useState<PlatformId | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('Todos os Setores');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubProds = subscribeFirestoreProducts((list) => {
      setProducts(list || []);
      setIsLoadingProducts(false);
    }, () => {
      setIsLoadingProducts(false);
    });
    const unsubCats = subscribeFirestoreCategories((catList) => {
      if (catList && catList.length > 0) setCategories(catList);
    });
    return () => {
      unsubProds();
      unsubCats();
    };
  }, []);

  const handleSelectPlatform = (platform: PlatformId | 'all') => {
    setActivePlatform(platform);
    setActiveCategory('Todos os Setores');
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (activePlatform !== 'all' && p.platform !== activePlatform) {
          return false;
        }
        if (
          activeCategory !== 'Todos os Setores' &&
          p.department !== activeCategory &&
          p.subcategory !== activeCategory
        ) {
          return false;
        }
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
    <div className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-stone-900 selection:text-white">
      <Navbar
        activePlatform={activePlatform}
        onSelectPlatform={handleSelectPlatform}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        productCount={products.length}
      />

      <main className="flex-1 bg-white pb-16">
        {/* Header Breadcrumb & Title */}
        <section className="bg-stone-50/60 border-b border-stone-200">
          <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para a Home</span>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 text-white text-xs font-bold">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                  <span>Catálogo Completo</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
                  {activePlatform === 'all'
                    ? 'Todos os Achadinhos Selecionados'
                    : `Achadinhos da ${currentPlatformInfo?.name}`}
                </h1>
                <p className="text-xs sm:text-sm text-stone-600">
                  {currentPlatformInfo?.tagline ||
                    'Todos os produtos testados e aprovados com cupons válidos e links diretos.'}
                </p>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs text-stone-700 bg-white border border-stone-300 rounded-xl px-3 py-2 shadow-2xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="bg-transparent text-stone-900 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="discount">Maior Desconto (%)</option>
                  <option value="rating">Melhor Avaliados</option>
                </select>
              </div>
            </div>

            {/* Platform Quick Filter */}
            <div className="flex items-center gap-2 pt-6 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleSelectPlatform('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activePlatform === 'all'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                ✨ Todos ({products.length})
              </button>
              <button
                onClick={() => handleSelectPlatform('shopee')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activePlatform === 'shopee'
                    ? 'bg-[#EE4D2D] text-white shadow-sm'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                🧡 Shopee
              </button>
              <button
                onClick={() => handleSelectPlatform('shein')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activePlatform === 'shein'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                🖤 Shein
              </button>
              <button
                onClick={() => handleSelectPlatform('mercadolivre')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activePlatform === 'mercadolivre'
                    ? 'bg-[#2D3277] text-white shadow-sm'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                💛 Mercado Livre
              </button>
              <button
                onClick={() => handleSelectPlatform('amazon')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activePlatform === 'amazon'
                    ? 'bg-[#D97706] text-white shadow-sm'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                📦 Amazon
              </button>
            </div>
          </div>
        </section>

        {/* Vertical Category Sidebar beside Product Grid */}
        <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
            <TaxonomySidebar
              activePlatform={activePlatform}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              products={products}
            />

            <div className="flex-1 min-w-0 w-full">
              {isLoadingProducts ? (
                <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 max-w-md mx-auto space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full border-4 border-stone-200 border-t-amber-500 animate-spin" />
                  <h3 className="font-serif text-lg font-bold text-stone-900">Carregando achadinhos...</h3>
                  <p className="text-xs text-stone-500">Buscando o catálogo atualizado.</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetails={setSelectedProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 max-w-md mx-auto space-y-3">
                  <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Nenhum achadinho encontrado
                  </h3>
                  <p className="text-xs text-stone-500">
                    Não encontramos produtos para este filtro.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory('Todos os Setores');
                      setActivePlatform('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
                  >
                    Ver Todos os Produtos
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <Footer onSelectPlatform={handleSelectPlatform} />
    </div>
  );
}
