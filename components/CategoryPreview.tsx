'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { LEGACY_MAP } from '@/lib/taxonomy';
import { ProductCard } from './ProductCard';
import { ArrowRight, Tag } from 'lucide-react';

export interface PreviewMacro {
  name: string;
  subcategories: string[];
}

interface CategoryPreviewProps {
  macros: PreviewMacro[];
  products: Product[];
  onSelect: (category: string) => void;
  onOpenDetails?: (product: Product) => void;
}

// One-page preview on the Achadinhos page: each macro with its micro filters and a few of its products
// as cards, and a "Ver mais" button that opens it in the catalog. Only macros and micros with products show.
export function CategoryPreview({ macros, products, onSelect, onOpenDetails }: CategoryPreviewProps) {
  const departmentOf = (p: Product) => p.department || LEGACY_MAP[p.category]?.[0];
  const subcategoryOf = (p: Product) => p.subcategory || LEGACY_MAP[p.category]?.[1];
  const countDepartment = (name: string) => products.filter((p) => departmentOf(p) === name).length;
  const countSubcategory = (name: string) => products.filter((p) => subcategoryOf(p) === name).length;

  const visibleMacros = macros
    .filter((m) => countDepartment(m.name) > 0)
    .map((m) => ({ ...m, subcategories: m.subcategories.filter((s) => countSubcategory(s) > 0) }));

  return (
    <div className="space-y-10">
      {visibleMacros.map((macro) => {
        const sample = products.filter((p) => departmentOf(p) === macro.name).slice(0, 4);
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
                        <span className="text-[10px] text-stone-500">{countSubcategory(sub)}</span>
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
                <span>Ver mais {macro.name} ({countDepartment(macro.name)})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {sample.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {sample.map((product) => (
                  <ProductCard key={product.id} product={product} onOpenDetails={onOpenDetails} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
