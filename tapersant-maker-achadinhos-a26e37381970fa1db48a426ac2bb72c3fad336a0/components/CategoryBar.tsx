'use client';

import React from 'react';
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
} from 'lucide-react';

interface CategoryBarProps {
  activePlatform: PlatformId | 'all';
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  products: Product[];
  customCategories?: CustomCategory[];
}

function getCategoryIcon(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes('todos')) return <LayoutGrid className="w-3.5 h-3.5" />;
  if (lower.includes('vestuário') || lower.includes('vestuario') || lower.includes('moda') || lower.includes('look'))
    return <Shirt className="w-3.5 h-3.5" />;
  if (lower.includes('suplemento')) return <Pill className="w-3.5 h-3.5" />;
  if (lower.includes('musculação') || lower.includes('musculacao') || lower.includes('fitness') || lower.includes('treino'))
    return <Dumbbell className="w-3.5 h-3.5" />;
  if (lower.includes('natal') || lower.includes('festa')) return <TreePine className="w-3.5 h-3.5" />;
  if (lower.includes('criança') || lower.includes('crianca') || lower.includes('infantil') || lower.includes('brinquedo'))
    return <Baby className="w-3.5 h-3.5" />;
  if (lower.includes('guloseima') || lower.includes('doce') || lower.includes('chocolate') || lower.includes('snack'))
    return <Cookie className="w-3.5 h-3.5" />;
  if (lower.includes('casa') || lower.includes('cozinha') || lower.includes('decoração') || lower.includes('decor'))
    return <Home className="w-3.5 h-3.5" />;
  if (lower.includes('beleza') || lower.includes('skincare') || lower.includes('bijoux') || lower.includes('acessórios'))
    return <Sparkles className="w-3.5 h-3.5" />;
  return <Tag className="w-3.5 h-3.5" />;
}

export function CategoryBar({
  activePlatform,
  activeCategory,
  onSelectCategory,
  products,
  customCategories,
}: CategoryBarProps) {
  // Filter products by active store
  const filteredProducts =
    activePlatform === 'all'
      ? products
      : products.filter((p) => p.platform === activePlatform);

  // Dynamic set of categories
  const productCategories = Array.from(new Set(filteredProducts.map((p) => p.category)));
  const customNames = customCategories ? customCategories.map((c) => c.name) : [];
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

  const combinedCategories = Array.from(
    new Set(['Todos os Setores', ...defaultList, ...customNames, ...productCategories])
  );

  const platformName = activePlatform === 'all' ? 'Todas as Lojas' : PLATFORMS[activePlatform]?.name || 'Shopee';

  return (
    <div className="w-full bg-white border-y border-stone-200 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-900 tracking-wide uppercase">
              Setores em {platformName}
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-500 font-normal">
              {filteredProducts.length} achadinhos encontrados
            </span>
          </div>

          {activeCategory !== 'Todos os Setores' && (
            <button
              onClick={() => onSelectCategory('Todos os Setores')}
              className="text-xs text-stone-600 hover:text-stone-950 underline transition-colors font-medium"
            >
              Limpar filtro de setor
            </button>
          )}
        </div>

        {/* Scrollable Category Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-0.5">
          {combinedCategories.map((cat) => {
            const count =
              cat === 'Todos os Setores'
                ? filteredProducts.length
                : filteredProducts.filter((p) => p.category === cat).length;
            const isSelected = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center gap-2 whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-950 hover:border-stone-300'
                }`}
              >
                <span className={isSelected ? 'text-amber-300' : 'text-stone-500'}>
                  {getCategoryIcon(cat)}
                </span>
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
