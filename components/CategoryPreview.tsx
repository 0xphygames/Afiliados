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

// Shown on the Achadinhos page before a category is picked: each macro with its micros and how many products each has
export function CategoryPreview({ macros, products, onSelect }: CategoryPreviewProps) {
  const departmentOf = (p: Product) => p.department || LEGACY_MAP[p.category]?.[0];
  const subcategoryOf = (p: Product) => p.subcategory || LEGACY_MAP[p.category]?.[1];
  const countDepartment = (name: string) => products.filter((p) => departmentOf(p) === name).length;
  const countSubcategory = (name: string) => products.filter((p) => subcategoryOf(p) === name).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
      {macros.map((macro) => (
        <div key={macro.name} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col gap-3">
          <button type="button" onClick={() => onSelect(macro.name)} className="group flex items-center justify-between gap-3 text-left">
            <span className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-800">{macro.name}</span>
            <span className="flex items-center gap-2 text-xs font-bold text-stone-600">
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-amber-900">{countDepartment(macro.name)}</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
          <div className="flex flex-wrap gap-2">
            {macro.subcategories.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => onSelect(sub)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100"
              >
                <Tag className="w-3 h-3" />
                <span>{sub}</span>
                <span className="text-[10px] text-stone-500">{countSubcategory(sub)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
