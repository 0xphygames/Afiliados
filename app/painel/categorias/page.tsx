'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/AdminContext';
import { CustomCategory, PlatformId } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import { TAXONOMY, LEGACY_MAP } from '@/lib/taxonomy';
import {
  Tag,
  PlusCircle,
  Trash2,
  ShoppingBag,
  Sparkles,
  Layers,
  Shirt,
  Pill,
  Dumbbell,
  TreePine,
  Baby,
  Cookie,
  Home,
} from 'lucide-react';

export default function PainelCategoriasPage() {
  const { categories, products, handleSaveCategory, handleDeleteCategory } = useAdmin();
  const [newCatName, setNewCatName] = useState('');
  const [newCatPlatform, setNewCatPlatform] = useState<PlatformId | 'all'>('all');
  const [saving, setSaving] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSaving(true);
    const catId = `cat-${Date.now()}`;
    const newCategory: CustomCategory = {
      id: catId,
      name: newCatName.trim(),
      platform: newCatPlatform,
      icon: 'Tag',
      createdAt: new Date().toISOString(),
    };

    try {
      await handleSaveCategory(newCategory);
      setNewCatName('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const classified = products.map((product) => {
    const mapped = LEGACY_MAP[product.category];
    return {
      department: product.department || mapped?.[0] || 'Outros',
      subcategory: product.subcategory || mapped?.[1] || product.category,
    };
  });
  const countFor = (department: string, subcategory?: string) => classified.filter((item) =>
    item.department === department && (!subcategory || item.subcategory === subcategory)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Tag className="w-5 h-5 text-amber-600" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Categorias & Setores
          </h1>
        </div>
        <p className="text-xs text-stone-500 max-w-xl">
          Crie novas categorias para organizar seus achadinhos. Elas aparecem na barra de navegação da vitrine para facilitar as compras das suas seguidoras.
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form: Add Category */}
        <form
          onSubmit={handleAddCategory}
          className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <h2 className="font-serif font-bold text-base text-stone-900">
              Nova Categoria
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900">
              Nome da Categoria
            </label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Ex: Vestuário, Moda Praia, Calçados..."
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900">
              Vincular à Loja
            </label>
            <select
              value={newCatPlatform}
              onChange={(e) => setNewCatPlatform(e.target.value as PlatformId | 'all')}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900 font-medium"
            >
              <option value="all">✨ Todas as Lojas</option>
              <option value="shopee">🧡 Shopee</option>
              <option value="shein">🖤 Shein</option>
              <option value="mercadolivre">💛 Mercado Livre</option>
              <option value="amazon">📦 Amazon Prime</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>{saving ? 'Adicionando...' : 'Adicionar Categoria'}</span>
          </button>
        </form>

        {/* Categories List */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900">
                Categorias Ativas ({TAXONOMY.length} macrodepartamentos)
              </h2>
              <p className="text-[11px] text-stone-500">
                Sincronizadas com o banco de dados e exibidas na vitrine.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TAXONOMY.map((department) => (
                <div
                  key={department.name}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-sm text-stone-900">{department.name}</span>
                    </div>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-stone-200 font-semibold tabular-nums">
                      {countFor(department.name)} produtos
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    {department.subcategories.map((subcategory) => (
                      <div key={subcategory.name} className="flex items-center justify-between gap-2 text-xs text-stone-600">
                        <span>{subcategory.name}</span>
                        <span className="text-[10px] text-stone-400">{countFor(department.name, subcategory.name)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {categories.filter((cat) => !TAXONOMY.some((department) => department.name.toLowerCase() === cat.name.trim().toLowerCase())).map((cat) => (
              <div key={cat.id} className="p-3.5 rounded-2xl border border-stone-200 bg-white flex items-center justify-between gap-3">
                <span className="font-bold text-xs text-stone-900">{cat.name}</span>
                <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-rose-600" title="Excluir categoria"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
