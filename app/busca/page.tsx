'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { ArticleDetailModal } from '@/components/ArticleDetailModal';
import { Product, Article, Coupon } from '@/lib/types';
import { INITIAL_COUPONS, PLATFORMS } from '@/lib/constants';
import {
  subscribeFirestoreProducts,
  subscribeFirestoreArticles,
  INITIAL_ARTICLES,
} from '@/lib/firestore-products';
import { rankProducts, rankArticles, rankCoupons } from '@/lib/search-ranking';
import {
  Search,
  ArrowLeft,
  ShoppingBag,
  BookOpen,
  Tag,
  Copy,
  Check,
  ExternalLink,
  Clock,
  ArrowRight,
  Flame,
} from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [userQuery, setUserQuery] = useState<string | null>(null);
  const query = userQuery !== null ? userQuery : initialQuery;
  const setQuery = (newVal: string) => setUserQuery(newVal);

  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'articles' | 'coupons'>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [coupons] = useState<Coupon[]>(INITIAL_COUPONS);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const unsubProd = subscribeFirestoreProducts((list) => {
      if (list && list.length > 0) setProducts(list);
    });
    const unsubArt = subscribeFirestoreArticles((list) => {
      if (list && list.length > 0) setArticles(list);
    });
    return () => {
      unsubProd();
      unsubArt();
    };
  }, []);

  const results = useMemo(() => {
    const cleanQ = query.trim();
    if (!cleanQ) {
      return { products, articles, coupons, total: products.length + articles.length + coupons.length };
    }

    const matchedProducts = rankProducts(products, cleanQ);
    const matchedArticles = rankArticles(articles, cleanQ);
    const matchedCoupons = rankCoupons(coupons, cleanQ);

    return {
      products: matchedProducts,
      articles: matchedArticles,
      coupons: matchedCoupons,
      total: matchedProducts.length + matchedArticles.length + matchedCoupons.length,
    };
  }, [query, products, articles, coupons]);

  const handleCopy = (code: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const suggestions = ['Whey', 'Vestido', 'Shopee', 'Shein', 'Musculação', 'Natal', 'Creatina'];

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-stone-900 selection:text-white">
      <Navbar />

      <main className="flex-1 bg-stone-50/60 pb-16">
        {/* Search Header */}
        <section className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para a Home</span>
              </Link>
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                Busca em todo o site
              </h1>

              {/* Big Search Bar */}
              <div className="relative">
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pesquise por produto, look, cupom de desconto ou artigo..."
                  className="w-full pl-12 pr-4 py-3.5 text-sm bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900 shadow-sm text-stone-900 placeholder:text-stone-400 transition-all"
                  autoFocus
                />
              </div>

              {/* Quick suggestions */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-stone-500">
                <span className="font-bold">Sugestões rápidas:</span>
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setQuery(sug)}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Filter Tabs */}
            <div className="flex items-center gap-2 pt-8 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                ✨ Todos ({results.total})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'products'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#EE4D2D]" />
                <span>Produtos & Achadinhos ({results.products.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'articles'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Artigos do Blog ({results.articles.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('coupons')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'coupons'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cupons de Desconto ({results.coupons.length})</span>
              </button>
            </div>
          </div>
        </section>

        {/* Results Container */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
          {/* 1. Products Section */}
          {(activeTab === 'all' || activeTab === 'products') && results.products.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#EE4D2D]" />
                  <h2 className="font-serif text-xl font-bold text-stone-900">
                    Achadinhos Encontrados ({results.products.length})
                  </h2>
                </div>
                {activeTab === 'all' && (
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-bold text-stone-600 hover:text-stone-900 underline cursor-pointer"
                  >
                    Ver apenas produtos
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onOpenDetails={setSelectedProduct}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. Blog Articles Section */}
          {(activeTab === 'all' || activeTab === 'articles') && results.articles.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <h2 className="font-serif text-xl font-bold text-stone-900">
                    Artigos & Dicas do Blog ({results.articles.length})
                  </h2>
                </div>
                {activeTab === 'all' && (
                  <button
                    onClick={() => setActiveTab('articles')}
                    className="text-xs font-bold text-stone-600 hover:text-stone-900 underline cursor-pointer"
                  >
                    Ver apenas artigos
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.articles.map((art) => (
                  <Link
                    key={art.id}
                    href={`/artigo/${art.id}`}
                    className="group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-16/10 w-full bg-stone-100 overflow-hidden">
                        {art.coverImageUrl ? (
                          <Image
                            src={art.coverImageUrl}
                            alt={art.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover:scale-103 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <BookOpen className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold bg-stone-900/90 text-white rounded-md">
                          {art.category}
                        </span>
                      </div>

                      <div className="p-5 space-y-2">
                        <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2">
                          {art.title}
                        </h3>
                        <p className="text-xs text-stone-600 line-clamp-2">
                          {art.summary}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1 group-hover:underline">
                        <span>Ler artigo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 3. Coupons Section */}
          {(activeTab === 'all' || activeTab === 'coupons') && results.coupons.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <h2 className="font-serif text-xl font-bold text-stone-900">
                    Cupons de Desconto Encontrados ({results.coupons.length})
                  </h2>
                </div>
                {activeTab === 'all' && (
                  <button
                    onClick={() => setActiveTab('coupons')}
                    className="text-xs font-bold text-stone-600 hover:text-stone-900 underline cursor-pointer"
                  >
                    Ver apenas cupons
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.coupons.map((coupon) => {
                  const platformConfig = PLATFORMS[coupon.platform] || PLATFORMS.shopee;
                  const isCopied = copiedCode === coupon.code;

                  return (
                    <div
                      key={coupon.id}
                      className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            style={{ backgroundColor: platformConfig.color }}
                            className="px-2.5 py-1 text-[11px] font-bold text-white rounded-md uppercase"
                          >
                            {platformConfig.name}
                          </span>
                          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Ativo
                          </span>
                        </div>

                        <div>
                          <div className="text-2xl font-black text-stone-900">
                            {coupon.discount}
                          </div>
                          <h4 className="font-serif font-bold text-sm text-stone-800 line-clamp-1">
                            {coupon.title}
                          </h4>
                        </div>

                        <p className="text-xs text-stone-600 line-clamp-2">
                          {coupon.description}
                        </p>
                      </div>

                      <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-3 flex items-center justify-between">
                        <span className="font-mono font-black text-sm text-stone-900">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isCopied ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-white'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {results.total === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 max-w-lg mx-auto p-8 space-y-4">
              <Search className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Nenhum resultado encontrado para &ldquo;{query}&rdquo;
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Tente buscar termos mais simples como &ldquo;vestido&rdquo;, &ldquo;whey&rdquo;, &ldquo;shopee&rdquo;, ou explore as nossas páginas temáticas.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setQuery('')}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Ver Tudo
                </button>
                <Link
                  href="/achadinhos"
                  className="px-4 py-2 bg-stone-100 text-stone-800 text-xs font-bold rounded-xl border border-stone-200"
                >
                  Ir para Achadinhos
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <Footer />
    </div>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center">Carregando busca...</div>}>
      <SearchContent />
    </Suspense>
  );
}
