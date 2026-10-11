'use client';

import React from 'react';
import Image from 'next/image';
import { Article } from '@/lib/types';
import { X, Calendar, User as UserIcon, BookOpen, Share2, Check } from 'lucide-react';
import { BlogContentRenderer } from './BlogContentRenderer';

interface ArticleDetailModalProps {
  article: Article | null;
  onClose: () => void;
}

export function ArticleDetailModal({ article, onClose }: ArticleDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!article) return null;

  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = new Date(article.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white text-stone-700 hover:text-stone-950 flex items-center justify-center shadow-xs border border-stone-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
          {/* Header metadata */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
                {article.category}
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500">{formattedDate}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center justify-between pt-2 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-[10px]">
                  TS
                </div>
                <span>Por <strong>{article.author || 'Tamires Santos'}</strong></span>
              </div>

              <button
                onClick={handleShare}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Compartilhar'}</span>
              </button>
            </div>
          </div>

          {/* Cover image if available */}
          {article.coverImageUrl && (
            <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
              <Image
                src={article.coverImageUrl}
                alt={article.title}
                fill
                className="object-cover"
                unoptimized
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Article formatted content with rich hyperlinks */}
          <div className="pt-2 border-t border-stone-100">
            <BlogContentRenderer content={article.content} className="text-sm leading-relaxed" />
          </div>
        </div>
      </div>
    </div>
  );
}
