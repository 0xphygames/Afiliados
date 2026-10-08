'use client';

import React, { useState } from 'react';
import { PlatformId, Product, CustomCategory } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import {
  Tag,
  Shirt,
  Pill,
  Dumbbell,
  TreePine,
  Baby,
  Cookie,
  Home,
  Sparkles,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
} from 'lucide-react';

interface CategorySidebarProps {
  activePlatform: PlatformId | 'all';
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  products: Product[];
  customCategories?: CustomCategory[];
  className?: string;
}

function getCategoryIcon(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes('todos')) return <LayoutGrid className="w-3.5 h-3.5" />;
  if (
    lower.includes('vestuário') ||
    lower.includes('vestuario') ||
    lower.includes('moda') ||
    lower.includes('look')
  )
    return <Shirt className="w-3.5 h-3.5" />;
  if (lower.includes('suplemento')) return <Pill className="w-3.5 h-3.5" />;
  if (
    lower.includes('musculação') ||
    lower.includes('musculacao') ||
    lower.includes('fitness') ||
    lower.includes('treino')
  )
    return <Dumbbell className="w-3.5 h-3.5" />;
  if (lower.includes('natal') || lower.includes('festa')) return <TreePine className="w-3.5 h-3.5" />;
  if (
    lower.includes('criança') ||
    lower.includes('crianca') ||
    lower.includes('infantil') ||
    lower.includes('brinquedo')
  )
    return <Baby className="w-3.5 h-3.5" />;
  if (
    lower.includes('guloseima') ||
    lower.includes('doce') ||
    lower.includes('chocolate') ||
    lower.includes('snack')
  )
    return <Cookie className="w-3.5 h-3.5" />;
  if (
    lower.includes('casa') ||
    lower.includes('cozinha') ||
    lower.includes('decoração') ||
    lower.includes('decor')
  )
    return <Home className="w-3.5 h-3.5" />;
  if (
    lower.includes('beleza') ||
    lower.includes('skincare') ||
    lower.includes('bijoux') ||
    lower.includes('acessórios')
  )
    return <Sparkles className="w-3.5 h-3.5" />;
  return <Tag className="w-3.5 h-3.5" />;
}

export function CategorySidebar({
  activePlatform,
  activeCategory,
  onSelectCategory,
  products,
  customCategories,
  className = '',
}: CategorySidebarProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Filter products by platform first to check availability in the current store
  const storeProducts =
    activePlatform === 'all'
      ? products
      : products.filter((p) => p.platform === activePlatform);

  // Discover all potential category names
  const productCategories = Array.from(new Set(storeProducts.map((p) => p.category.trim())));
  const customNames = customCategories ? customCategories.map((c) => c.name.trim()) : [];
  const defaultList =
    activePlatform !== 'all' && PLATFORMS[activePlatform]
      ? PLATFORMS[activePlatform].defaultCategories.filter((c) => c !== 'Todos os Setores')
      : [
          'Vestuário',
          'Suplementos',
          'Musculação',
          'Natal',
          'Dia das Crianças',
          'Guloseimas',
          'Casa & Decoração',
          'Beleza & Skincare',
        ];

  const allCandidateCategories = Array.from(
    new Set([...productCategories, ...customNames, ...defaultList])
  );

  // REQUISITO CRÍTICO DO USUÁRIO:
  // "so mostrar o setor que tiver alguma coisa correlacionada, oque tiver sem nada com 0 oculta"
  // Calculate counts for each category and strictly filter out any with count === 0
  const activeSectorsWithCount: { name: string; count: number }[] = [];

  allCandidateCategories.forEach((catName) => {
    const count = storeProducts.filter(
      (p) => p.category.trim().toLowerCase() === catName.toLowerCase()
    ).length;
    // Oculta completamente se count === 0!
    if (count > 0) {
      activeSectorsWithCount.push({ name: catName, count });
    }
  });

  // Sort sectors by product count descending
  activeSectorsWithCount.sort((a, b) => b.count - a.count);

  const platformName =
    activePlatform === 'all' ? 'Todas as Lojas' : PLATFORMS[activePlatform]?.name || 'Loja';

  return (
    <aside className={`w-full lg:w-60 xl:w-64 shrink-0 ${className}`}>
      {/* ======================================================== */}
      {/* 1. VISÃO DESKTOP (PC): Barra lateral suave, discreta e fixa */}
      {/* ======================================================== */}
      <div className="hidden lg:block sticky top-24 bg-stone-50/80 backdrop-blur-xs rounded-2xl border border-stone-200/90 p-4 shadow-2xs">
        {/* Header da Barra Lateral */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Setores Ativos
            </h3>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700">
            {platformName}
          </span>
        </div>

        {/* Lista Vertical de Setores (Apenas os que possuem achadinhos > 0) */}
        <div className="space-y-1">
          {/* Opção padrão: Todos os Setores */}
          <button
            onClick={() => onSelectCategory('Todos os Setores')}
            className={`w-full px-3 py-2 text-xs font-medium rounded-xl transition-all duration-150 flex items-center justify-between text-left ${
              activeCategory === 'Todos os Setores'
                ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                : 'text-stone-700 hover:bg-stone-200/60 hover:text-stone-900'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className={
                  activeCategory === 'Todos os Setores' ? 'text-amber-300' : 'text-stone-500'
                }
              >
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              </span>
              <span className="truncate">Todos os Setores</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ml-2 shrink-0 ${
                activeCategory === 'Todos os Setores'
                  ? 'bg-white/20 text-white'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {storeProducts.length}
            </span>
          </button>

          {/* Setores filtrados com mais de 0 produtos */}
          {activeSectorsWithCount.map((sector) => {
            const isSelected = activeCategory.toLowerCase() === sector.name.toLowerCase();

            return (
              <button
                key={sector.name}
                onClick={() => onSelectCategory(sector.name)}
                className={`w-full px-3 py-2 text-xs font-medium rounded-xl transition-all duration-150 flex items-center justify-between text-left ${
                  isSelected
                    ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-200/60 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={isSelected ? 'text-amber-300' : 'text-stone-500'}>
                    {getCategoryIcon(sector.name)}
                  </span>
                  <span className="truncate">{sector.name}</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ml-2 shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {sector.count}
                </span>
              </button>
            );
          })}
        </div>

        {activeCategory !== 'Todos os Setores' && (
          <div className="pt-3 mt-3 border-t border-stone-200">
            <button
              onClick={() => onSelectCategory('Todos os Setores')}
              className="w-full text-center py-1.5 text-[11px] text-stone-600 hover:text-stone-900 font-semibold underline transition-colors"
            >
              Limpar filtro de setor
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. VISÃO MOBILE: Discreta, suave e redimensionável sem estourar */}
      {/* ======================================================== */}
      <div className="lg:hidden bg-stone-50/90 rounded-xl border border-stone-200 p-2.5 mb-4 shadow-2xs">
        <button
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-stone-800 py-1 px-1 focus:outline-none"
        >
          <div className="flex items-center gap-2 truncate">
            <Filter className="w-3.5 h-3.5 text-stone-600 shrink-0" />
            <span className="truncate">
              Setor:{' '}
              <strong className="text-stone-950 font-bold">
                {activeCategory}
              </strong>
            </span>
            <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded-full font-bold">
              {activeCategory === 'Todos os Setores'
                ? storeProducts.length
                : storeProducts.filter(
                    (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
                  ).length}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-stone-500 shrink-0">
            <span>{mobileExpanded ? 'Fechar' : 'Trocar Setor'}</span>
            {mobileExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </button>

        {/* Conteúdo Expansível no Mobile */}
        {mobileExpanded && (
          <div className="pt-2.5 mt-2 border-t border-stone-200 space-y-1 max-h-60 overflow-y-auto no-scrollbar animate-fade-in">
            <button
              onClick={() => {
                onSelectCategory('Todos os Setores');
                setMobileExpanded(false);
              }}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between text-left ${
                activeCategory === 'Todos os Setores'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span className="truncate">Todos os Setores</span>
              <span className="text-[10px] opacity-80">{storeProducts.length}</span>
            </button>

            {activeSectorsWithCount.map((sector) => {
              const isSelected = activeCategory.toLowerCase() === sector.name.toLowerCase();
              return (
                <button
                  key={sector.name}
                  onClick={() => {
                    onSelectCategory(sector.name);
                    setMobileExpanded(false);
                  }}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between text-left ${
                    isSelected
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <span className="truncate">{sector.name}</span>
                  <span className="text-[10px] opacity-80">{sector.count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
