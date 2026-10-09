'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import {
  X,
  ExternalLink,
  Check,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  Share2,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-react';
import { SocialShare } from './SocialShare';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onEdit?: (product: Product) => void;
}

export function ProductDetailModal({ product, onClose, onEdit }: ProductDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const platform = PLATFORMS[product.platform] || PLATFORMS.shopee;

  const allImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(Boolean)
      : [product.imageUrl].filter(Boolean);

  const currentDisplayImage =
    allImages[activeImageIndex] || product.imageUrl || '/images/hero_achadinhos_looks_1791404026649.jpg';

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(product.affiliateUrl || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  const formattedOriginalPrice = product.originalPrice
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(product.originalPrice)
    : null;

  const isUnoptimizedImage =
    product.imageUrl.startsWith('data:') ||
    product.imageUrl.startsWith('http://') ||
    product.imageUrl.startsWith('https://');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white text-stone-700 hover:text-stone-950 flex items-center justify-center shadow-xs transition-colors border border-stone-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media Column with Gallery */}
        <div className="relative w-full md:w-1/2 flex flex-col bg-stone-100">
          <div className="relative flex-1 min-h-[280px] sm:min-h-[340px] aspect-square md:aspect-auto">
            {currentDisplayImage ? (
              <Image
                src={currentDisplayImage}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                referrerPolicy="no-referrer"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                Sem foto
              </div>
            )}

            {/* Store Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5">
              <span
                style={{ backgroundColor: platform.color }}
                className="px-3 py-1 text-xs font-bold text-white rounded-md uppercase tracking-wider shadow-xs"
              >
                {platform.name}
              </span>
              {allImages.length > 1 && (
                <span className="px-2 py-1 text-[11px] font-bold bg-black/70 backdrop-blur-xs text-white rounded-md shadow-xs">
                  {activeImageIndex + 1} de {allImages.length} fotos
                </span>
              )}
            </div>

            {/* Discount Badge */}
            {discountPercent && (
              <div className="absolute bottom-4 left-4 z-10">
                <span className="px-3 py-1 text-xs font-black bg-rose-600 text-white rounded-md shadow-xs">
                  -{discountPercent}% OFF
                </span>
              </div>
            )}

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2.5 z-10 pointer-events-none">
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev > 0 ? prev - 1 : allImages.length - 1
                    )
                  }
                  className="p-1.5 rounded-full bg-white/90 hover:bg-white text-stone-900 shadow-md transition-all pointer-events-auto"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev < allImages.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="p-1.5 rounded-full bg-white/90 hover:bg-white text-stone-900 shadow-md transition-all pointer-events-auto"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="p-2.5 bg-stone-900/90 backdrop-blur-xs border-t border-stone-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {allImages.map((thumbUrl, idx) => (
                <button
                  key={`${thumbUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    idx === activeImageIndex
                      ? 'border-amber-400 scale-105 shadow-xs ring-2 ring-amber-400/30'
                      : 'border-white/20 hover:border-white/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={thumbUrl}
                    alt={`Miniatura ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto bg-white">
          <div className="space-y-4">
            {/* Category and Rating */}
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold text-stone-700 uppercase tracking-wider">
                {product.category}
              </span>
              <div className="flex items-center gap-1 font-semibold text-stone-800">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="tabular-nums">{product.rating.toFixed(1)}</span>
                <span className="text-stone-400 font-normal">({product.reviewCount} avaliações)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="font-serif text-xl font-bold text-stone-900 leading-snug">
              {product.title}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline gap-3 py-2 border-y border-stone-100">
              <span className="text-2xl font-bold text-stone-900 tabular-nums">
                {formattedPrice}
              </span>
              {formattedOriginalPrice && (
                <span className="text-sm text-stone-400 line-through tabular-nums">
                  {formattedOriginalPrice}
                </span>
              )}
              {product.badge && (
                <span className="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Tamires' Tip Highlight */}
            {product.tamiresTip && (
              <div className="bg-stone-50 border-l-4 border-amber-400 p-3.5 rounded-r-xl space-y-1 border border-stone-200">
                <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dica de Ouro da Tamires Santos</span>
                </div>
                <p className="text-xs text-stone-700 italic leading-relaxed">
                  &ldquo;{product.tamiresTip}&rdquo;
                </p>
              </div>
            )}

            {/* Trust Indicators & Bottom of Funnel Conversion Details */}
            <div className="space-y-2 pt-1 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Link oficial de afiliado protegido com compra 100% segura</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Consulte frete grátis e cupons ativos na {platform.name}</span>
              </div>
            </div>

            {/* Fundo de Funil: Palavras-chave de Decisão de Compra */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/90 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block">
                Termos de Busca & Intenção de Compra (Fundo de Funil):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(product.bottomFunnelKeywords && product.bottomFunnelKeywords.length > 0
                  ? product.bottomFunnelKeywords
                  : [
                      'Vale a pena comprar em 2026?',
                      `Cupom ${platform.name} ativo`,
                      'Menor preço garantido',
                      'Review sincero e testado',
                      'Onde comprar com frete grátis',
                    ]
                ).map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium text-stone-800 bg-white border border-stone-300 px-2 py-0.5 rounded-md"
                  >
                    🔍 {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Share integrado para as principais redes sociais */}
            <SocialShare
              title={product.title}
              url={product.affiliateUrl}
              price={product.price}
            />
          </div>

          {/* Action CTAs */}
          <div className="pt-4 space-y-2.5">
            <a
              href={product.affiliateUrl || '#'}
              target="_blank"
              rel="noopener noreferrer sponsored"
              style={{ backgroundColor: platform.color }}
              className="w-full py-3 px-4 text-xs font-bold text-white rounded-xl shadow-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Ir para a Loja Oficial ({platform.name})</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-2 px-3 border border-stone-300 text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartilhar Link</span>
                  </>
                )}
              </button>

              {onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(product);
                  }}
                  className="py-2 px-3 border border-stone-300 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl text-xs font-semibold transition-colors"
                >
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
