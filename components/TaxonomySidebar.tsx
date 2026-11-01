'use client';

import React from 'react';
import { PlatformId, Product } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import { TAXONOMY, LEGACY_MAP } from '@/lib/taxonomy';
import { TaxMacro, subscribeTaxonomy } from '@/lib/taxonomy-db';
import { ChevronDown, ChevronRight, Layers, Tag, LayoutGrid } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TaxonomySidebarProps {
  activePlatform: PlatformId | 'all';
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  products: Product[];
  categoryCounts?: { departments: Record<string, number>; subcategories: Record<string, number>; total: number };
  className?: string;
}

const ALL = 'Todos os Setores';

// Macro categories with their micro categories. Clicking a macro filters the whole department;
// clicking a micro filters only that subcategory. The active macro opens its micros.
export function TaxonomySidebar({ activePlatform, activeCategory, onSelectCategory, products, categoryCounts, className = '' }: TaxonomySidebarProps) {
  // The tree comes from the database (editable in Categorias & Setores); the code tree is the fallback
  // On phones the sector list starts closed so the products show first
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [tree, setTree] = useState<TaxMacro[]>([]);
  useEffect(() => subscribeTaxonomy((t) => setTree(t)), []);
  const macros = tree.length
    ? tree.map((m) => ({ name: m.node.name, subcategories: m.micros.map((x) => ({ name: x.name })) }))
    : TAXONOMY;

  const inStore = activePlatform === 'all' ? products : products.filter((p) => p.platform === activePlatform);

  const classify = (p: Product) => {
    const mapped = LEGACY_MAP[p.category];
    return { department: p.department || mapped?.[0], subcategory: p.subcategory || mapped?.[1] };
  };
  const countDepartment = (name: string) => categoryCounts?.departments[name] ?? inStore.filter((p) => classify(p).department === name).length;
  const countSubcategory = (name: string) => categoryCounts?.subcategories[name] ?? inStore.filter((p) => classify(p).subcategory === name).length;

  const storeLabel = activePlatform === 'all' ? 'TODAS AS LOJAS' : PLATFORMS[activePlatform].name.toUpperCase();

  const rowClass = (active: boolean) =>
    `w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-sm transition-colors ${
      active ? 'bg-stone-900 text-white font-semibold' : 'text-stone-700 hover:bg-stone-100'
    }`;

  const badge = (n: number, active: boolean) => (
    <span
      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
        active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
      }`}
    >
      {n}
    </span>
  );

  return (
    <aside className={`w-full md:w-60 lg:w-68 shrink-0 ${className}`}>
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-sm space-y-3 sticky top-24">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-serif font-bold text-stone-900">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Setores</span>
          </div>
          <span className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-white bg-stone-900 px-2 py-0.5 rounded-md">{storeLabel}</span>
            <button type="button" onClick={() => setSectionsOpen((v) => !v)} className="md:hidden text-xs font-bold text-stone-700 underline underline-offset-4">
              {sectionsOpen ? 'Fechar' : 'Abrir'}
            </button>
          </span>
        </div>

        <div className={`${sectionsOpen ? 'block' : 'hidden'} md:block space-y-3`}>
        <button type="button" onClick={() => onSelectCategory(ALL)} className={rowClass(activeCategory === ALL)}>
          <span className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            Todos os departamentos
          </span>
          {badge(categoryCounts?.total ?? inStore.length, activeCategory === ALL)}
        </button>

        {macros.map((dep) => {
          const depActive = activeCategory === dep.name;
          const open = depActive || dep.subcategories.some((s) => s.name === activeCategory);
          const total = countDepartment(dep.name);
          return (
            <div key={dep.name} className="space-y-1">
              <button type="button" onClick={() => onSelectCategory(dep.name)} className={rowClass(depActive)}>
                <span className="flex items-center gap-2">
                  {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {dep.name}
                </span>
                {badge(total, depActive)}
              </button>

              {open && (
                <div className="ml-5 pl-3 border-l border-stone-200 space-y-0.5">
                  {dep.subcategories.map((sub) => {
                    const n = countSubcategory(sub.name);
                    const active = activeCategory === sub.name;
                    return (
                      <button
                        key={sub.name}
                        type="button"
                        onClick={() => onSelectCategory(sub.name)}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                          active ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3 h-3" />
                          {sub.name}
                        </span>
                        <span className="text-[10px] text-stone-500">{n}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </aside>
  );
}
