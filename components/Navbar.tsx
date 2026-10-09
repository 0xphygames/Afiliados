'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlatformId } from '@/lib/types';
import { ShieldCheck, Tag, BookOpen, ShoppingBag, Home, Flame } from 'lucide-react';
import { OmniSearch } from './OmniSearch';

interface NavbarProps {
  activePlatform?: PlatformId | 'all';
  onSelectPlatform?: (platform: PlatformId | 'all') => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  productCount?: number;
  bannerNotice?: string;
}

export function Navbar({
  activePlatform = 'all',
  onSelectPlatform,
  searchQuery,
  onSearchChange,
  productCount,
  bannerNotice,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-all">
      {/* Slim trust banner */}
      <div className="bg-stone-900 text-stone-100 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        <span>{bannerNotice || 'Curadoria oficial de Tamires Santos · Links com cupons verificados e compras 100% seguras'}</span>
      </div>

      {/* Top Bar: Wordmark, Navigation Links, OmniSearch Input */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            className="text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 rounded-sm"
          >
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
              Achadinhos & Looks
            </span>
            <span className="block text-[11px] font-medium tracking-wider uppercase text-stone-500">
              Por Tamires Santos
            </span>
          </Link>
        </div>

        {/* Navigation links with real routes */}
        <nav className="hidden lg:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 shadow-2xs">
          <Link
            href="/"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5 text-stone-500" />
            <span>Home</span>
          </Link>
          <Link
            href="/achadinhos"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#EE4D2D]" />
            <span>Achadinhos</span>
          </Link>
          <Link
            href="/blog"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Blog</span>
          </Link>
          <Link
            href="/cupons"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cupons</span>
          </Link>
          <Link
            href="/campanha"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            <span>Campanhas</span>
          </Link>
        </nav>

        {/* Fast OmniSearch with Elasticsearch-like multi-entity search */}
        <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xs xl:max-w-sm">
          <OmniSearch placeholder="Buscar em todo o site..." />
        </div>
      </div>

      {/* Mobile Platform Navigation */}
      {onSelectPlatform && (
        <div className="lg:hidden flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-t border-stone-200 no-scrollbar bg-white">
          <button
            onClick={() => onSelectPlatform('shopee')}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
              activePlatform === 'shopee'
                ? 'bg-[#EE4D2D] text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            🧡 Shopee
          </button>
          <button
            onClick={() => onSelectPlatform('shein')}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
              activePlatform === 'shein'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            🖤 Shein
          </button>
          <button
            onClick={() => onSelectPlatform('mercadolivre')}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
              activePlatform === 'mercadolivre'
                ? 'bg-[#FFE600] text-stone-900 font-bold shadow-xs'
                : 'bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            💛 Mercado Livre
          </button>
          <button
            onClick={() => onSelectPlatform('amazon')}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
              activePlatform === 'amazon'
                ? 'bg-[#232F3E] text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            📦 Amazon
          </button>
          <button
            onClick={() => onSelectPlatform('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
              activePlatform === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            ✨ Todos
          </button>
        </div>
      )}
    </header>
  );
}

