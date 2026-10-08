'use client';

import React from 'react';
import Image from 'next/image';
import { PlatformId } from '@/lib/types';
import { PlusCircle, Search, ShieldCheck, Lock, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  activePlatform: PlatformId | 'all';
  onSelectPlatform: (platform: PlatformId | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  productCount: number;
  bannerNotice?: string;
}

export function Navbar({
  activePlatform,
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

      {/* Top Bar: Wordmark, Navigation Links, Search Input */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectPlatform('all')}
            className="text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 rounded-sm"
          >
            <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
              Achadinhos & Looks
            </span>
            <span className="block text-[11px] font-medium tracking-wider uppercase text-stone-500">
              Por Tamires Santos
            </span>
          </button>
        </div>

        {/* Navigation links / platform selectors */}
        <nav className="hidden lg:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 shadow-inner">
          <button
            onClick={() => onSelectPlatform('shopee')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
              activePlatform === 'shopee'
                ? 'bg-[#EE4D2D] text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
            }`}
          >
            <span>Shopee</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">Principal</span>
          </button>

          <button
            onClick={() => onSelectPlatform('shein')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
              activePlatform === 'shein'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
            }`}
          >
            Shein
          </button>

          <button
            onClick={() => onSelectPlatform('mercadolivre')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
              activePlatform === 'mercadolivre'
                ? 'bg-[#FFE600] text-stone-900 font-bold shadow-sm'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
            }`}
          >
            Mercado Livre
          </button>

          <button
            onClick={() => onSelectPlatform('amazon')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
              activePlatform === 'amazon'
                ? 'bg-[#232F3E] text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
            }`}
          >
            Amazon
          </button>

          <button
            onClick={() => onSelectPlatform('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
              activePlatform === 'all'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/60'
            }`}
          >
            Todos os Achados
          </button>
        </nav>

        {/* Search input */}
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar achado..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 transition-all text-stone-900 placeholder:text-stone-400 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Mobile Platform Navigation */}
      <div className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto border-t border-stone-200 no-scrollbar bg-white">
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
    </header>
  );
}
