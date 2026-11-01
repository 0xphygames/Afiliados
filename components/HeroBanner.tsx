'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlatformId, SiteSettings } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import {
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  Flame,
  ArrowRight,
  Tag,
} from 'lucide-react';

interface HeroBannerProps {
  activePlatform: PlatformId | 'all';
  onSelectPlatform: (platform: PlatformId | 'all') => void;
  settings?: SiteSettings;
  onFocusSearch?: () => void;
}

export function HeroBanner({
  activePlatform,
  onSelectPlatform,
  settings,
  onFocusSearch,
}: HeroBannerProps) {
  const currentPlatform = activePlatform !== 'all' ? PLATFORMS[activePlatform] : null;

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Platform dynamic text for consistent experience
  const getBannerDetails = () => {
    switch (activePlatform) {
      case 'shopee':
        return {
          title: 'Achadinhos da Shopee',
          subtitle:
            'A curadoria oficial da Tamires Santos na Shopee! Confira nossos setores especiais de Vestuário, Suplementos, Musculação, Natal, Dia das Crianças e Guloseimas.',
          tag: 'Shopee Brasil · Cupons e Frete Grátis',
          accentColor: '#EE4D2D',
          badgeText: 'Loja em Destaque',
        };
      case 'shein':
        return {
          title: 'Looks & Tendências Shein',
          subtitle:
            'Vestidos elegantes, conjuntos confortáveis e acessórios da moda garimpados por Tamires Santos com avaliações reais de caimento e qualidade.',
          tag: 'Shein · Looks & Moda',
          accentColor: '#111827',
          badgeText: 'Looks da Moda',
        };
      case 'mercadolivre':
        return {
          title: 'Achadinhos do Mercado Livre',
          subtitle:
            'Suplementação original, equipamentos de musculação e eletrônicos com a entrega mais rápida do Brasil pelo Mercado Livre FULL.',
          tag: 'Mercado Livre FULL · Entrega Rápida',
          accentColor: '#2D3277',
          badgeText: 'Entrega 24 Horas',
        };
      case 'amazon':
        return {
          title: 'Achadinhos da Amazon Prime',
          subtitle:
            'Produtos de alta qualidade para sua casa, suplementação, snacks e utilidades com frete grátis Prime e garantia total.',
          tag: 'Amazon Brasil · Entrega Prime',
          accentColor: '#D97706',
          badgeText: 'Amazon Prime',
        };
      default:
        return {
          title: settings?.heroHeadline || 'Achadinhos & Looks Selecionados',
          subtitle:
            settings?.heroSubheading ||
            'A curadoria oficial da Tamires Santos reunindo os melhores achados da Shopee, Shein, Mercado Livre e Amazon em um só lugar.',
          tag: 'Todas as Lojas Parceiras',
          accentColor: '#1c1917',
          badgeText: 'Curadoria Completa',
        };
    }
  };

  const details = getBannerDetails();

  return (
    <section className="bg-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 border border-stone-200 shadow-sm overflow-hidden transition-all">
      <div className="max-w-[1600px] mx-auto px-6 py-8 sm:py-12 lg:py-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* Left Column: Editorial Information */}
        <div className="flex-1 space-y-4 sm:space-y-5">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-4xl font-bold tracking-tight text-stone-900 leading-tight text-balance">
            {details.title}
          </h1>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            {details.subtitle}
          </p>

          {/* Trust Guarantees */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Links Oficiais</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cupons Verificados</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Testado por Tamires</span>
            </div>
          </div>

          {/* Campanhas & Páginas Especiais Callout in Hero */}
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <Link
              href="/campanha"
              className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 group"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
              <span>Ver Campanhas & Páginas Especiais</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/cupons"
              className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl border border-stone-200 transition-all flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cupons Relâmpago</span>
            </Link>
          </div>

          {/* Quick Platform Switcher */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-500 font-medium mr-1">Navegar por loja:</span>
            <button
              onClick={() => onSelectPlatform('shopee')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                activePlatform === 'shopee'
                  ? 'bg-[#EE4D2D] text-white border-[#EE4D2D] shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              🧡 Shopee
            </button>
            <button
              onClick={() => onSelectPlatform('shein')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                activePlatform === 'shein'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              🖤 Shein
            </button>
            <button
              onClick={() => onSelectPlatform('mercadolivre')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                activePlatform === 'mercadolivre'
                  ? 'bg-[#FFE600] text-stone-900 font-bold border-[#EAB308] shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              💛 Mercado Livre
            </button>
            <button
              onClick={() => onSelectPlatform('amazon')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                activePlatform === 'amazon'
                  ? 'bg-[#232F3E] text-white border-[#232F3E] shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              📦 Amazon
            </button>
            <button
              onClick={() => onSelectPlatform('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                activePlatform === 'all'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              ✨ Todas as Lojas
            </button>
          </div>
        </div>

        {/* Right Column: Hero Visual + Curator Bio Card */}
        <div className="w-full lg:w-96 shrink-0 space-y-4">
          {/* Framed Lifestyle Showcase Photo */}
          <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-stone-200 shadow-xs bg-stone-100">
            <Image
              src={settings?.heroImageUrl || '/images/hero_achadinhos_looks_1791404026649.jpg'}
              alt="Curadoria Tamires Santos Achadinhos e Looks"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 384px"
              className="object-cover object-top"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                Curadoria Oficial
              </span>
              <p className="text-xs font-semibold leading-tight line-clamp-1">
                Achadinhos & Looks por Tamires Santos
              </p>
            </div>
          </div>

          {/* Curator Card */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                TS
              </div>
              <div>
                <p className="font-bold text-xs text-stone-900">Tamires Santos</p>
                <p className="text-[11px] text-stone-500">Curadora & Afiliada Verificada</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verificada</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
