'use client';

import React, { useState } from 'react';
import { PlatformId, Product, CustomCategory } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import { TAXONOMY, LEGACY_MAP } from '@/lib/taxonomy';
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

  const classify = (p: Product) => {
    const mapped = LEGACY_MAP[p.category];
    return { department: p.department || mapped?.[0] || p.category, subcategory: p.subcategory || mapped?.[1] || p.category };
  };
  const activeDepartments = TAXONOMY.map((department) => ({
    ...department,
    count: storeProducts.filter((p) => classify(p).department === department.name).length,
    subcategories: department.subcategories.map((subcategory) => ({
      ...subcategory,
      count: storeProducts.filter((p) => {
        const classified = classify(p);
        return classified.department === department.name && classified.subcategory === subcategory.name;
      }).length,
    })).filter((subcategory) => subcategory.count > 0),
  })).filter((department) => department.count > 0);
  // Flat rendering keeps the existing responsive component stable while exposing
  // the macro first and its populated microcategories immediately below it.
  const activeSectorsWithCount = activeDepartments.flatMap((department) => [
    { name: department.name, count: department.count },
    ...department.subcategories.map((subcategory) => ({ name: subcategory.name, count: subcategory.count })),
  ]);

  const platformName =
    activePlatform === 'all' ? 'Todas as Lojas' : PLATFORMS[activePlatform]?.name || 'Loja';
  const platformColor =
    activePlatform !== 'all' && PLATFORMS[activePlatform]
      ? PLATFORMS[activePlatform].color
      : '#1c1917';

  return (
    <aside className={`w-full md:w-60 lg:w-68 shrink-0 ${className}`}>
      {/* ======================================================== */}
      {/* 1. VISÃO DESKTOP & TABLET (MD+): Barra lateral vertical e visual */}
      {/* ======================================================== */}
      <div className="hidden md:block sticky top-24 bg-white rounded-3xl border border-stone-200 p-4 shadow-sm space-y-3">
        {/* Header da Barra Lateral */}
        <div className="pb-3 border-b border-stone-200">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-stone-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Setores & Abas
              </h3>
            </div>
            <span
              style={{ backgroundColor: platformColor }}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white shadow-xs uppercase tracking-wider"
            >
              {platformName}
            </span>
          </div>
          <p className="text-[11px] text-stone-500">
            Filtre os achadinhos por departamento:
          </p>
        </div>

        {/* Lista Vertical de Setores */}
        <div className="space-y-1">
          {/* Opção padrão: Todos os Setores */}
          <button
            onClick={() => onSelectCategory('Todos os Setores')}
            className={`w-full px-3 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-between text-left cursor-pointer ${
              activeCategory === 'Todos os Setores'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <span
                className={
                  activeCategory === 'Todos os Setores' ? 'text-amber-300' : 'text-stone-500'
                }
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
              </span>
              <span className="truncate">Todos os Departamentos</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ml-2 shrink-0 ${
                activeCategory === 'Todos os Setores'
                  ? 'bg-white/20 text-white'
                  : 'bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              {storeProducts.length}
            </span>
          </button>

          {/* Setores Verticais */}
          {activeSectorsWithCount.map((sector) => {
            const isSelected = activeCategory.toLowerCase() === sector.name.toLowerCase();

            return (
              <button
                key={sector.name}
                onClick={() => onSelectCategory(sector.name)}
                className={`w-full px-3 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-between text-left cursor-pointer group ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={
                      isSelected
                        ? 'text-amber-300'
                        : 'text-stone-500 group-hover:text-stone-900 group-hover:scale-110 transition-transform'
                    }
                  >
                    {getCategoryIcon(sector.name)}
                  </span>
                  <span className="truncate">{sector.name}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ml-2 shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : sector.count > 0
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {sector.count}
                </span>
              </button>
            );
          })}
        </div>

        {activeCategory !== 'Todos os Setores' && (
          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={() => onSelectCategory('Todos os Setores')}
              className="w-full text-center py-2 text-xs text-stone-600 hover:text-stone-900 font-semibold underline transition-colors cursor-pointer"
            >
              Limpar filtro de setor
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. VISÃO MOBILE (< MD): Seletor vertical visual de setores */}
      {/* ======================================================== */}
      <div className="md:hidden bg-white rounded-2xl border border-stone-200 p-3 mb-4 shadow-sm space-y-2">
        <button
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-stone-900 py-1 focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Filter className="w-4 h-4 text-stone-600 shrink-0" />
            <span className="truncate">
              Setor:{' '}
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-extrabold">
                {activeCategory}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-500 shrink-0">
            <span>{mobileExpanded ? 'Fechar abas' : 'Ver todos os setores'}</span>
            {mobileExpanded ? (
              <ChevronUp className="w-4 h-4 text-stone-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-700" />
            )}
          </div>
        </button>

        {/* Visual vertical selector on mobile */}
        {mobileExpanded && (
          <div className="pt-2 border-t border-stone-100 space-y-1.5 max-h-72 overflow-y-auto no-scrollbar animate-fade-in">
            <button
              onClick={() => {
                onSelectCategory('Todos os Setores');
                setMobileExpanded(false);
              }}
              className={`w-full px-3 py-2 text-xs rounded-xl flex items-center justify-between text-left font-semibold ${
                activeCategory === 'Todos os Setores'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Todos os Setores</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white/20 rounded-full">{storeProducts.length}</span>
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
                  className={`w-full px-3 py-2 text-xs rounded-xl flex items-center justify-between text-left font-semibold ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(sector.name)}
                    <span className="truncate">{sector.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded-full">{sector.count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
