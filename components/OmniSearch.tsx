'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ShoppingBag,
  BookOpen,
  Tag,
  ArrowRight,
  ExternalLink,
  Flame,
  Star,
  Check,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { Product, Article, Coupon, PlatformId } from '@/lib/types';
import { PLATFORMS, INITIAL_PRODUCTS, INITIAL_COUPONS } from '@/lib/constants';
import {
  subscribeFirestoreProducts,
  subscribeFirestoreArticles,
  subscribeFirestoreCoupons,
  INITIAL_ARTICLES,
} from '@/lib/firestore-products';
import { rankProducts, rankArticles, rankCoupons } from '@/lib/search-ranking';

interface OmniSearchProps {
  onSelectProduct?: (product: Product) => void;
  className?: string;
  placeholder?: string;
}

export function OmniSearch({
  onSelectProduct,
  className = '',
  placeholder = 'Buscar achadinhos, posts do blog ou cupons...',
}: OmniSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [articles, setArticles] = useState<Article[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  useEffect(() => subscribeFirestoreCoupons((list) => setCoupons(list)), []);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to real-time products and articles
  useEffect(() => {
    const unsubProd = subscribeFirestoreProducts((list) => {
      if (list && list.length > 0) setProducts(list);
    });
    const unsubArt = subscribeFirestoreArticles((list) => {
      if (list && list.length > 0) setArticles(list);
    });
    return () => {
      unProd();
      unsubArt();
    };
    function unProd() {
      unsubProd();
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Omni Search Algorithm (Multi-entity elastic search with weighted relevance ranking)
  const results = useMemo(() => {
    const cleanQ = query.trim();
    if (!cleanQ || cleanQ.length < 2) {
      return {
        products: [],
        articles: [],
        coupons: [],
        total: 0,
      };
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim()) {
        setIsOpen(false);
        router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleCopyCoupon = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-stone-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all text-stone-900 placeholder:text-stone-400 shadow-2xs"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 p-0.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Live OmniSearch Dropdown Panel */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 sm:right-auto sm:w-[500px] lg:w-[580px] top-full mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-stone-100 max-h-[80vh] flex flex-col">
          {/* Header Summary */}
          <div className="p-3 bg-stone-50/90 flex items-center justify-between text-xs text-stone-600">
            <span className="font-semibold">
              Resultados para &ldquo;<strong className="text-stone-900">{query}</strong>&rdquo;
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
              {results.total} encontrado{results.total !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto flex-1 p-2 space-y-4 no-scrollbar">
            {results.total === 0 ? (
              <div className="text-center py-8 px-4 text-stone-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="font-bold text-xs text-stone-800">
                  Nenhum resultado encontrado para &ldquo;{query}&rdquo;
                </p>
                <p className="text-[11px] text-stone-400 mt-1 max-w-xs mx-auto">
                  Tente buscar por marcas como Shopee, Shein, categorias como Suplementos ou vestidos.
                </p>
              </div>
            ) : (
              <>
                {/* 1. Achadinhos & Produtos */}
                {results.products.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 text-stone-700">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#EE4D2D]" />
                        <span>Achadinhos & Produtos ({results.products.length})</span>
                      </span>
                      <Link
                        href={`/achadinhos?q=${encodeURIComponent(query)}`}
                        onClick={() => setIsOpen(false)}
                        className="text-amber-700 hover:text-amber-900 font-semibold"
                      >
                        Ver todos
                      </Link>
                    </div>

                    <div className="space-y-1 mt-1">
                      {results.products.slice(0, 4).map((prod) => {
                        const platformCfg = PLATFORMS[prod.platform] || PLATFORMS.shopee;
                        const formattedPrice = new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(prod.price);

                        return (
                          <div
                            key={prod.id}
                            onClick={() => {
                              setIsOpen(false);
                              if (onSelectProduct) {
                                onSelectProduct(prod);
                              } else {
                                router.push(`/achadinhos?q=${encodeURIComponent(prod.title)}`);
                              }
                            }}
                            className="p-2 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="relative w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                              <Image
                                src={prod.imageUrl}
                                alt={prod.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                unoptimized
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span
                                  style={{ backgroundColor: platformCfg.color }}
                                  className="text-[9px] font-bold text-white px-1.5 py-0.2 rounded"
                                >
                                  {platformCfg.name}
                                </span>
                                <span className="text-[10px] text-stone-500 font-semibold truncate">
                                  {prod.category}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-stone-900 truncate group-hover:text-amber-800 transition-colors">
                                {prod.title}
                              </h4>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-bold text-xs text-stone-900 block">
                                {formattedPrice}
                              </span>
                              {prod.rating && (
                                <span className="text-[10px] text-amber-700 flex items-center gap-0.5 justify-end">
                                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                  <span>{prod.rating.toFixed(1)}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Blog & Artigos */}
                {results.articles.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 text-stone-700">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Artigos & Dicas do Blog ({results.articles.length})</span>
                      </span>
                      <Link
                        href={`/blog?q=${encodeURIComponent(query)}`}
                        onClick={() => setIsOpen(false)}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold"
                      >
                        Ver todos
                      </Link>
                    </div>

                    <div className="space-y-1 mt-1">
                      {results.articles.slice(0, 3).map((art) => (
                        <Link
                          key={art.id}
                          href={`/artigo/${art.id}`}
                          onClick={() => setIsOpen(false)}
                          className="p-2 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-3 group block"
                        >
                          {art.coverImageUrl && (
                            <div className="relative w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                              <Image
                                src={art.coverImageUrl}
                                alt={art.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                unoptimized
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mb-0.5 inline-block">
                              {art.category}
                            </span>
                            <h4 className="text-xs font-bold text-stone-900 truncate group-hover:text-emerald-800 transition-colors">
                              {art.title}
                            </h4>
                            <p className="text-[11px] text-stone-500 line-clamp-1">
                              {art.summary}
                            </p>
                          </div>

                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Cupons de Desconto */}
                {results.coupons.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 text-stone-700">
                        <Tag className="w-3.5 h-3.5 text-amber-600" />
                        <span>Cupons de Desconto ({results.coupons.length})</span>
                      </span>
                      <Link
                        href="/cupons"
                        onClick={() => setIsOpen(false)}
                        className="text-amber-700 hover:text-amber-900 font-semibold"
                      >
                        Ver todos
                      </Link>
                    </div>

                    <div className="space-y-1.5 mt-1">
                      {results.coupons.slice(0, 3).map((cupom) => {
                        const platformCfg = PLATFORMS[cupom.platform] || PLATFORMS.shopee;
                        const isCopied = copiedCode === cupom.code;

                        return (
                          <div
                            key={cupom.id}
                            className="p-2 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span
                                  style={{ backgroundColor: platformCfg.color }}
                                  className="text-[9px] font-bold text-white px-1.5 py-0.2 rounded"
                                >
                                  {platformCfg.name}
                                </span>
                                <span className="font-bold text-xs text-amber-950 truncate">
                                  {cupom.discount}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-600 truncate">
                                {cupom.title}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleCopyCoupon(cupom.code, e)}
                              className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-amber-300" />
                                  <span>{cupom.code}</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer View All Link */}
          {results.total > 0 && (
            <div className="p-2.5 bg-stone-50 text-center">
              <Link
                href={`/busca?q=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="w-full py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 group"
              >
                <span>Ver todos os {results.total} resultados na página de busca</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
