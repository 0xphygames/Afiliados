'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Tag } from 'lucide-react';
import { Article, PlatformId } from '@/lib/types';
import type { PreviewMacro } from './CategoryPreview';

interface ArticlePreviewProps {
  macros: PreviewMacro[];
  articles: Article[];
  meta: Map<string, { stores: Set<PlatformId>; departments: Set<string> }>;
  activePlatform: PlatformId | 'all';
  onSelect: (category: string) => void;
}

// One-page preview on the blog: each macro with its micro filters and a few of its articles as cards,
// and a "Ver mais" button that opens it in the blog list. Only macros and micros with articles show.
export function ArticlePreview({ macros, articles, meta, activePlatform, onSelect }: ArticlePreviewProps) {
  const visible = articles.filter((a) => activePlatform === 'all' || meta.get(a.id)?.stores.has(activePlatform));
  const countIn = (name: string) => visible.filter((a) => meta.get(a.id)?.departments.has(name)).length;
  const articlesIn = (name: string) => visible.filter((a) => meta.get(a.id)?.departments.has(name));

  const visibleMacros = macros
    .filter((m) => countIn(m.name) > 0)
    .map((m) => ({ ...m, subcategories: m.subcategories.filter((s) => countIn(s) > 0) }));

  return (
    <div className="space-y-10">
      {visibleMacros.map((macro) => {
        const sample = articlesIn(macro.name).slice(0, 4);
        return (
          <section key={macro.name} className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-stone-200 pb-3">
              <div className="space-y-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">{macro.name}</h2>
                {macro.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {macro.subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => onSelect(sub)}
                        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{sub}</span>
                        <span className="text-[10px] text-stone-500">{countIn(sub)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => onSelect(macro.name)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 px-3.5 py-2 text-xs font-bold text-white shrink-0"
              >
                <span>Ver mais {macro.name} ({countIn(macro.name)})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {sample.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sample.map((art) => (
                  <Link
                    key={art.id}
                    href={`/artigo/${art.id}`}
                    className="group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:border-stone-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-36 sm:h-40 w-full bg-stone-100 overflow-hidden">
                        {art.coverImageUrl ? (
                          <Image
                            src={art.coverImageUrl}
                            alt={art.title}
                            fill
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-103 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <BookOpen className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h3>
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{art.summary}</p>
                      </div>
                    </div>
                    <div className="px-4 pb-4">
                      <span className="text-xs font-bold text-stone-900 inline-flex items-center gap-1.5 group-hover:underline">
                        <span>Ler artigo completo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
