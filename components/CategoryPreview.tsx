'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { LEGACY_MAP } from '@/lib/taxonomy';
import { ArrowRight, Tag } from 'lucide-react';

export interface PreviewMacro {
  name: string;
  subcategories: string[];
}

interface CategoryPreviewProps {
  macros: PreviewMacro[];
  products: Product[];
  onSelect: (category: string) => void;
}

// Shown on the Achadinhos page before a category is picked: each macro with a few of its products,
// its micro categories and how many products each one has. "Ver mais" opens the macro in the catalog.
export function CategoryPreview({ macros, products, onSelect }: CategoryPreviewProps) {
  const departmentOf = (p: Product) => p.department || LEGACY_MAP[p.category]?.[0];
  const subcategoryOf = (p: Product) => p.subcategory || LEGACY_MAP[p.category]?.[1];
  const countDepartment = (name: string) => products.filter((p) => departmentOf(p) === name).length;
  const countSubcategory = (name: string) => products.filter((p) => subcategoryOf(p) === name).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
      {macros.map((macro) => {
        const sample = products.filter((p) => departmentOf(p) === macro.name && p.imageUrl).slice(0, 4);
        return (
          <div key={macro.name} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col gap-3">
            <button type="button" onClick={() => onSelect(macro.name)} className="group flex items-center justify-between gap-3 text-left">
              <span className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-800">{macro.name}</span>
              <span className="flex items-center gap-2 text-xs font-bold text-stone-600">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-amber-900">{countDepartment(macro.name)}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>

            {sample.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {sample.map((p) => (
                  <button key={p.id} type="button" onClick={() => onSelect(macro.name)} className="aspect-square rounded-lg bg-stone-50 border border-stone-100 overflow-hidden hover:border-stone-300">
                    <img src={p.imageUrl} alt={p.title} loading="lazy" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

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

            <button
              type="button"
              onClick={() => onSelect(macro.name)}
              className="mt-auto self-start inline-flex items-center gap-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 px-3.5 py-2 text-xs font-bold text-white"
            >
              <span>Ver mais {macro.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
