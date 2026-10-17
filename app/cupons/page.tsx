'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PLATFORMS } from '@/lib/constants';
import { subscribeFirestoreCoupons } from '@/lib/firestore-products';
import { PlatformId, Coupon } from '@/lib/types';
import {
  Tag,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Flame,
  Gift,
} from 'lucide-react';

export default function CuponsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  useEffect(() => subscribeFirestoreCoupons((list) => setCoupons(list)), []);

  const filteredCoupons = selectedPlatform === 'all'
    ? coupons
    : coupons.filter((c) => c.platform === selectedPlatform);

  const handleCopy = (code: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-stone-900 selection:text-white">
      <Navbar activePlatform={selectedPlatform} onSelectPlatform={setSelectedPlatform} />

      <main className="flex-1 bg-stone-50/60 pb-16">
        {/* Breadcrumb & Hero */}
        <section className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para a Vitrine</span>
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cupons Atualizados & Testados em 2026</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
                  Cupons de Desconto & Ofertas Exclusivas
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Garanta os melhores descontos na Shopee, Shein, Mercado Livre e Amazon. Copie o código verificado e aplique diretamente na finalização da sua compra.
                </p>
              </div>

              {/* Quick tip badge */}
              <div className="bg-stone-900 text-stone-100 p-4 sm:p-5 rounded-2xl max-w-sm w-full shadow-md space-y-2 border border-stone-800">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                  <Flame className="w-4 h-4" />
                  <span>Dica de Ouro da Tamires</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Na Shopee e Shein, você pode combinar o cupom da loja parceira com os cupons de frete grátis do aplicativo no carrinho!
                </p>
              </div>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex items-center gap-2 pt-8 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedPlatform('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedPlatform === 'all'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                ✨ Todos os Cupons ({coupons.length})
              </button>

              <button
                onClick={() => setSelectedPlatform('shopee')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedPlatform === 'shopee'
                    ? 'bg-[#EE4D2D] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                🧡 Shopee
              </button>

              <button
                onClick={() => setSelectedPlatform('shein')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedPlatform === 'shein'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                🖤 Shein
              </button>

              <button
                onClick={() => setSelectedPlatform('mercadolivre')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedPlatform === 'mercadolivre'
                    ? 'bg-[#2D3277] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                💛 Mercado Livre
              </button>

              <button
                onClick={() => setSelectedPlatform('amazon')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedPlatform === 'amazon'
                    ? 'bg-[#D97706] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                📦 Amazon Prime
              </button>
            </div>
          </div>
        </section>

        {/* Coupons Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((coupon) => {
              const platformConfig = PLATFORMS[coupon.platform] || PLATFORMS.shopee;
              const isCopied = copiedCode === coupon.code;

              return (
                <div
                  key={coupon.id}
                  className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    {/* Header: Platform & Validity */}
                    <div className="flex items-center justify-between">
                      <span
                        style={{ backgroundColor: platformConfig.color }}
                        className="px-2.5 py-1 text-[11px] font-bold text-white rounded-md uppercase tracking-wider shadow-2xs"
                      >
                        {platformConfig.name}
                      </span>

                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Verificado</span>
                      </div>
                    </div>

                    {/* Discount Headline */}
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                        {coupon.discount}
                      </div>
                      <h3 className="font-serif font-bold text-base text-stone-800 mt-0.5 line-clamp-1">
                        {coupon.title}
                      </h3>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {coupon.description}
                    </p>

                    {/* Conditions */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>Mínimo: <strong className="text-stone-800">{coupon.minSpend}</strong></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{coupon.expirationDate || 'Ativo'}</span>
                      </span>
                    </div>

                    {/* Coupon Code Block */}
                    <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-3 flex items-center justify-between gap-2">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Código do Cupom
                        </span>
                        <span className="font-mono font-black text-sm text-stone-900 tracking-wider">
                          {coupon.code}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-900 text-white hover:bg-stone-800'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Footer Action Button */}
                  <div className="p-6 pt-0">
                    <a
                      href={coupon.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-stone-200"
                    >
                      <span>Usar Cupom no Site Oficial</span>
                      <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guide Section */}
          <div className="mt-16 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm max-w-4xl mx-auto space-y-4">
            <div className="flex items-center gap-2 text-stone-900">
              <Gift className="w-5 h-5 text-amber-600" />
              <h2 className="font-serif font-bold text-lg sm:text-xl">
                Como aplicar cupons de desconto nas lojas parceiras
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-xs font-black text-amber-600">PASSO 1</span>
                <h4 className="text-xs font-bold text-stone-900">Copie o Código</h4>
                <p className="text-[11px] text-stone-600">
                  Clique no botão &ldquo;Copiar&rdquo; do cupom desejado nesta página para copiar o código para a sua área de transferência.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-xs font-black text-amber-600">PASSO 2</span>
                <h4 className="text-xs font-bold text-stone-900">Acesse o Link Oficial</h4>
                <p className="text-[11px] text-stone-600">
                  Clique em &ldquo;Usar Cupom no Site Oficial&rdquo; para abrir a loja parceira com as ofertas elegíveis ativadas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-xs font-black text-amber-600">PASSO 3</span>
                <h4 className="text-xs font-bold text-stone-900">Cole no Carrinho</h4>
                <p className="text-[11px] text-stone-600">
                  Cole o código no campo de cupom antes de finalizar a compra e veja o desconto ser aplicado imediatamente!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onSelectPlatform={setSelectedPlatform} />
    </div>
  );
}
