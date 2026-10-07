'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/lib/types';
import { Sparkles, ArrowRight, BookOpen, Tag } from 'lucide-react';
import { SocialShare } from './SocialShare';

interface ArticlesSectionProps {
  articles: Article[];
  onSelectArticle?: (article: Article) => void;
}

export function ArticlesSection({ articles, onSelectArticle }: ArticlesSectionProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section id="blog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 rounded-full text-xs font-semibold border border-amber-200 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Blog & Dicas de Compras da Tamires</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Guias, Resenhas e Dicas Exclusivas
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Artigos testados com foco em custo-benefício, cupons verificados e recomendações sinceras para Shopee, Shein, Mercado Livre e Amazon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-stone-500 hidden sm:inline">Compartilhar Blog:</span>
          <SocialShare compact title="Blog de Achadinhos e Looks da Tamires Santos · Dicas de Compras e Cupons" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {articles.map((art) => {
          const funnelTags = art.bottomFunnelKeywords || [
            'Vale a pena comprar?',
            'Onde comprar mais barato',
            'Cupom verificado',
          ];

          return (
            <Link
              key={art.id}
              href={`/artigo/${art.id}`}
              className="group cursor-pointer bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:border-stone-300 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
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
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[11px] font-bold bg-stone-900/90 backdrop-blur-xs text-white rounded-md shadow-xs">
                      {art.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[11px] font-semibold text-stone-500">
                    Por {art.author || 'Tamires Santos'}
                  </span>
                  <h3 className="font-serif font-bold text-stone-900 text-base leading-snug group-hover:text-amber-800 transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>

                  {/* Fundo de Funil Tags */}
                  <div className="pt-2 flex flex-wrap items-center gap-1">
                    {funnelTags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5 text-amber-600" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <span className="text-xs font-bold text-stone-900 inline-flex items-center gap-1.5 group-hover:underline">
                  <span>Ler artigo completo</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
