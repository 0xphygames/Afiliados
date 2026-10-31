'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAdmin } from '@/lib/AdminContext';
import { PLATFORMS } from '@/lib/constants';
import { PlatformId } from '@/lib/types';
import { TAXONOMY, LEGACY_MAP } from '@/lib/taxonomy';
import { subscribeTaxonomy, TaxMacro } from '@/lib/taxonomy-db';
import {
  PlusCircle,
  Search,
  Filter,
  ExternalLink,
  Pencil,
  Trash2,
  Copy,
  Check,
  ShoppingBag,
  Star,
  Sparkles,
} from 'lucide-react';

export default function PainelProdutosPage() {
  const { products, handleDeleteProduct } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformId | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tree, setTree] = useState<TaxMacro[]>([]);
  useEffect(() => subscribeTaxonomy((t) => setTree(t)), []);
  const categoryOptions = useMemo(() => TAXONOMY.flatMap((d) => [
    { value: d.name, label: d.name },
    ...d.subcategories.map((s) => ({ value: s.name, label: `${d.name} › ${s.name}` })),
  ]), []);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (platformFilter !== 'all' && p.platform !== platformFilter) return false;
      if (categoryFilter !== 'all' && p.department !== categoryFilter && p.subcategory !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = p.title.toLowerCase().includes(q);
        const mCat = p.category.toLowerCase().includes(q);
        const mBadge = p.badge?.toLowerCase().includes(q) || false;
        if (!mTitle && !mCat && !mBadge) return false;
      }
      return true;
    });
  }, [products, platformFilter, categoryFilter, searchQuery]);

  const handleCopy = (id: string, url?: string) => {
    if (url && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Achadinhos & Produtos
            </h1>
            <span className="text-xs font-bold bg-stone-100 text-stone-800 px-2.5 py-0.5 rounded-full border border-stone-300">
              {filteredProducts.length} itens
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Gerencie toda a vitrine oficial. Novos produtos aparecem instantaneamente para suas clientes.
          </p>
        </div>

        <Link
          href="/painel/produtos/novo"
          className="py-3 px-5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 group shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
          <span>Cadastrar Novo Achadinho</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, categoria ou selo..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
          />
        </div>

        {/* Platform tabs filter */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              platformFilter === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Todas ({products.length})
          </button>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 bg-white text-stone-700"
          >
            <option value="all">Todos os setores ({products.length})</option>
            {tree.map((m) => (
              <optgroup key={m.node.id} label={`${m.node.name} (${products.filter((p) => p.department === m.node.name).length})`}>
                <option value={m.node.name}>Toda a macro: {m.node.name}</option>
                {m.micros.map((mi) => (
                  <option key={mi.id} value={mi.name}>
                    {mi.name} ({products.filter((p) => p.subcategory === mi.name).length})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            onClick={() => setPlatformFilter('shopee')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              platformFilter === 'shopee'
                ? 'bg-[#EE4D2D] text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Shopee ({products.filter((p) => p.platform === 'shopee').length})
          </button>
          <button
            onClick={() => setPlatformFilter('shein')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              platformFilter === 'shein'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Shein ({products.filter((p) => p.platform === 'shein').length})
          </button>
          <button
            onClick={() => setPlatformFilter('mercadolivre')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              platformFilter === 'mercadolivre'
                ? 'bg-[#FFE600] text-stone-900 font-bold shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Mercado Livre ({products.filter((p) => p.platform === 'mercadolivre').length})
          </button>
          <button
            onClick={() => setPlatformFilter('amazon')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              platformFilter === 'amazon'
                ? 'bg-[#232F3E] text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Amazon ({products.filter((p) => p.platform === 'amazon').length})
          </button>
        </div>
      </div>

      {/* Products List Table / Cards */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-serif font-bold text-base text-stone-900">
              Nenhum achadinho encontrado
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Não encontramos produtos para os filtros selecionados. Tente limpar a busca ou cadastre um novo produto.
            </p>
            <div className="pt-2">
              <Link
                href="/painel/produtos/novo"
                className="inline-flex items-center gap-1.5 py-2 px-4 bg-stone-900 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>Cadastrar novo achadinho</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredProducts.map((product) => {
              const platform = PLATFORMS[product.platform] || PLATFORMS.shopee;
              const formattedPrice = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(product.price);
              const formattedOrigPrice = product.originalPrice
                ? new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(product.originalPrice)
                : null;

              return (
                <div
                  key={product.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
                >
                  {/* Left: Image & Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          style={{ backgroundColor: platform.color }}
                          className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md uppercase tracking-wider"
                        >
                          {platform.name}
                        </span>
                        <span className="text-xs font-semibold text-stone-600">
                          {product.category}
                        </span>
                        {product.badge && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                            {product.badge}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-[11px] text-stone-600 font-semibold ml-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{product.rating?.toFixed(1) || '5.0'}</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug line-clamp-1">
                        {product.title}
                      </h3>

                      {product.tamiresTip && (
                        <p className="text-[11px] text-amber-900 italic line-clamp-1">
                          &ldquo;{product.tamiresTip}&rdquo;
                        </p>
                      )}

                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="font-bold text-sm sm:text-base text-stone-900 tabular-nums">
                          {formattedPrice}
                        </span>
                        {formattedOrigPrice && (
                          <span className="text-xs text-stone-400 line-through tabular-nums">
                            {formattedOrigPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                    {/* Copy Link */}
                    <button
                      onClick={() => handleCopy(product.id, product.affiliateUrl)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors text-xs font-semibold flex items-center gap-1"
                      title="Copiar link de afiliado"
                    >
                      {copiedId === product.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] text-emerald-700">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copiar</span>
                        </>
                      )}
                    </button>

                    {/* Test Link */}
                    {product.affiliateUrl && (
                      <a
                        href={product.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors text-xs font-semibold flex items-center gap-1"
                        title="Abrir link de afiliado em nova aba"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Abrir Link</span>
                      </a>
                    )}

                    {/* Edit button */}
                    <Link
                      href={`/painel/produtos/editar/${product.id}`}
                      className="p-2 rounded-lg border border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
                      title="Editar este produto"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>

                    {/* Delete button */}
                    <button
                      onClick={async () => {
                        if (confirm(`Deseja remover "${product.title}" permanentemente do banco de dados?`)) {
                          try { await handleDeleteProduct(product.id); } catch (err) { alert(err instanceof Error ? err.message : 'Não foi possível excluir o achadinho.'); }
                        }
                      }}
                      className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                      title="Excluir este produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
