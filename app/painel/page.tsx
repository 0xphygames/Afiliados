'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAdmin } from '@/lib/AdminContext';
import { PLATFORMS } from '@/lib/constants';
import {
  ShoppingBag,
  PlusCircle,
  Tag,
  Layers,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Percent,
  TrendingUp,
  Sparkles,
  Pencil,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export default function PainelOverviewPage() {
  const { products, articles, landingPages, categories, handleDeleteProduct } = useAdmin();

  // Metrics
  const metrics = useMemo(() => {
    const totalCount = products.length;
    const shopeeCount = products.filter((p) => p.platform === 'shopee').length;
    const sheinCount = products.filter((p) => p.platform === 'shein').length;
    const mlCount = products.filter((p) => p.platform === 'mercadolivre').length;
    const amazonCount = products.filter((p) => p.platform === 'amazon').length;

    const totalPrice = products.reduce((acc, p) => acc + (p.price || 0), 0);
    const avgPrice = totalCount > 0 ? totalPrice / totalCount : 0;

    const discountedProducts = products.filter((p) => p.originalPrice && p.originalPrice > p.price);
    const avgDiscount =
      discountedProducts.length > 0
        ? discountedProducts.reduce(
            (acc, p) => acc + ((p.originalPrice! - p.price) / p.originalPrice!) * 100,
            0
          ) / discountedProducts.length
        : 0;

    const activeCampaigns = landingPages.filter((p) => p.isActive).length;

    return {
      totalCount,
      shopeeCount,
      sheinCount,
      mlCount,
      amazonCount,
      avgPrice,
      avgDiscount,
      activeCampaigns,
    };
  }, [products, landingPages]);

  const recentProducts = products.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Painel de Controle em Tempo Real</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Visão Geral da Curadoria
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
            Aqui você acompanha os números da sua vitrine de achadinhos, cadastra novos produtos com links de afiliado e gerencia suas campanhas de forma estratégica.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/painel/produtos/novo"
            className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 group cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
            <span>Cadastrar Achadinho</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs rounded-xl border border-stone-300 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>Ver Loja</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Products */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Total Produtos
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {metrics.totalCount}
            </span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block">100% no Supabase</span>
        </div>

        {/* Shopee */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#EE4D2D]">
            Shopee
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {metrics.shopeeCount}
            </span>
            <span className="text-xs text-stone-400">itens</span>
          </div>
          <span className="text-[10px] text-stone-500 block">Principal canal</span>
        </div>

        {/* Shein */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-900">
            Shein
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {metrics.sheinCount}
            </span>
            <span className="text-xs text-stone-400">itens</span>
          </div>
          <span className="text-[10px] text-stone-500 block">Moda & Tendências</span>
        </div>

        {/* Mercado Livre */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            Mercado Livre
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {metrics.mlCount}
            </span>
            <span className="text-xs text-stone-400">itens</span>
          </div>
          <span className="text-[10px] text-stone-500 block">Entrega FULL</span>
        </div>

        {/* Amazon */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#232F3E]">
            Amazon Prime
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {metrics.amazonCount}
            </span>
            <span className="text-xs text-stone-400">itens</span>
          </div>
          <span className="text-[10px] text-stone-500 block">Frete Grátis</span>
        </div>

        {/* Links Ativos */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Links Afiliados
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">100%</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block">Auditados & Seguros</span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/painel/produtos/novo"
          className="bg-white hover:bg-stone-50 p-5 rounded-2xl border border-stone-200 shadow-2xs transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">Novo Achadinho</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Suba fotos, defina preços e cadastre seu link de afiliado oficial.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-stone-900 group-hover:translate-x-1 transition-transform">
            <span>Cadastrar produto</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/painel/categorias"
          className="bg-white hover:bg-stone-50 p-5 rounded-2xl border border-stone-200 shadow-2xs transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center">
              <Tag className="w-5 h-5 text-stone-700" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">Categorias & Setores</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Gerencie os setores (Vestuário, Suplementos, Natal, etc.) e filtros.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-stone-900 group-hover:translate-x-1 transition-transform">
            <span>Ver categorias ({categories.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/painel/campanhas"
          className="bg-white hover:bg-stone-50 p-5 rounded-2xl border border-stone-200 shadow-2xs transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-700" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">Páginas & Campanhas</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Crie landing pages com slugs personalizados para promoções sazonais.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-stone-900 group-hover:translate-x-1 transition-transform">
            <span>Gerenciar páginas ({landingPages.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/painel/artigos"
          className="bg-white hover:bg-stone-50 p-5 rounded-2xl border border-stone-200 shadow-2xs transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">Blog & Artigos</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Publique resenhas sinceras, dicas de compras e guias de moda para suas seguidoras.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-stone-900 group-hover:translate-x-1 transition-transform">
            <span>Ver artigos ({articles.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Recent Products Table / Overview */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-stone-100">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Achadinhos Recentes na Vitrine
            </h2>
            <p className="text-xs text-stone-500">
              Exibindo os últimos produtos sincronizados com o banco de dados.
            </p>
          </div>

          <Link
            href="/painel/produtos"
            className="text-xs font-bold text-stone-900 hover:text-stone-700 flex items-center gap-1"
          >
            <span>Ver todos ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-stone-100">
          {recentProducts.map((product) => {
            const platformConfig = PLATFORMS[product.platform] || PLATFORMS.shopee;
            return (
              <div
                key={product.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
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
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        style={{ backgroundColor: platformConfig.color }}
                        className="text-[10px] font-bold text-white px-1.5 py-0.2 rounded-md uppercase tracking-wider"
                      >
                        {platformConfig.name}
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {product.category}
                      </span>
                      {product.badge && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-stone-900 text-xs sm:text-sm truncate">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-xs text-stone-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[11px] text-stone-400 line-through">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  {product.affiliateUrl && (
                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      title="Testar link de afiliado em nova aba"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Testar Link</span>
                    </a>
                  )}

                  <Link
                    href={`/painel/produtos/editar/${product.id}`}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors"
                    title="Editar este produto"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={async () => {
                      if (confirm(`Deseja remover "${product.title}" do banco de dados?`)) {
                        try { await handleDeleteProduct(product.id); } catch (err) { alert(err instanceof Error ? err.message : 'Não foi possível excluir o achadinho.'); }
                      }
                    }}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                    title="Excluir este produto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
