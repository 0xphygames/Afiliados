'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import {
  ExternalLink,
  Copy,
  Check,
  Star,
  Sparkles,
  ShoppingBag,
  Pencil,
  Heart,
  Share2,
  Tag,
  ShieldCheck,
  Camera,
  Flame,
} from 'lucide-react';
import { SocialShare } from './SocialShare';

interface ProductCardProps {
  product: Product;
  onEditProduct?: (product: Product) => void;
  onOpenDetails?: (product: Product) => void;
}

export function ProductCard({ product, onEditProduct, onOpenDetails }: ProductCardProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const platform = PLATFORMS[product.platform] || PLATFORMS.shopee;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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

  // Bottom of funnel keywords (fundo de funil)
  const defaultFunnelKeywords = [
    'Cupom Verificado',
    'Menor Preço 2026',
    'Link Oficial',
  ];
  const funnelKeywords = product.bottomFunnelKeywords && product.bottomFunnelKeywords.length > 0
    ? product.bottomFunnelKeywords
    : defaultFunnelKeywords;

  return (
    <div
      onClick={() => onOpenDetails?.(product)}
      className="group cursor-pointer bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:border-stone-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
    >
      {/* Top Media Container: Proportional fashion container with non-cropping presentation */}
      <div className="relative aspect-square sm:aspect-[4/5] w-full bg-stone-50/80 overflow-hidden border-b border-stone-100 flex items-center justify-center">
        {!imgError && product.imageUrl ? (
          <>
            {/* Subtle ambient backdrop to avoid letterbox voids */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <Image
                src={product.imageUrl}
                alt=""
                fill
                sizes="100px"
                className="object-cover filter blur-xl opacity-25 scale-125"
                referrerPolicy="no-referrer"
                unoptimized={isUnoptimizedImage}
                aria-hidden="true"
              />
            </div>

            {/* Main full product image (zero cropping of clothes, shoes and details) */}
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-2 group-hover:scale-104 transition-transform duration-300 relative z-1"
              referrerPolicy="no-referrer"
              unoptimized={isUnoptimizedImage}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-50 text-stone-500">
            <ShoppingBag className="w-10 h-10 text-stone-400 mb-2" />
            <span className="text-xs font-semibold text-stone-700 line-clamp-1">{product.title}</span>
            <span className="text-[11px] text-stone-400 mt-0.5">Foto do Achadinho</span>
          </div>
        )}

        {/* Top Badges overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between pointer-events-none">
          {/* Store Badge and Photos count */}
          <div className="flex items-center gap-1.5">
            <span
              style={{ backgroundColor: platform.color }}
              className="px-2.5 py-1 text-[11px] font-bold text-white rounded-md shadow-xs flex items-center gap-1 uppercase tracking-wider"
            >
              {platform.name}
            </span>

            {product.images && product.images.length > 1 && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-stone-900/80 backdrop-blur-xs text-stone-100 rounded-md shadow-xs flex items-center gap-1">
                <Camera className="w-3 h-3 text-amber-300" />
                <span>{product.images.length} fotos</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Quick Share to Social */}
            <div onClick={(e) => e.stopPropagation()}>
              <SocialShare
                compact
                title={product.title}
                url={product.affiliateUrl}
                price={product.price}
              />
            </div>

            {/* Quick Edit (for Tamires) */}
            {onEditProduct && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProduct(product);
                }}
                className="w-7 h-7 rounded-full bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-100 shadow-xs flex items-center justify-center transition-all border border-stone-200"
                title="Editar este achadinho"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Favorite heart */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLiked(!liked);
              }}
              className="w-7 h-7 rounded-full bg-white text-stone-600 hover:text-rose-500 hover:bg-stone-100 shadow-xs flex items-center justify-center transition-all border border-stone-200"
              title="Salvar nos favoritos"
            >
              <Heart
                className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500 text-rose-500' : 'text-stone-600'}`}
              />
            </button>
          </div>
        </div>

        {/* Promotional Tag or Discount overlay */}
        {discountPercent && discountPercent > 0 && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="px-2 py-0.5 text-xs font-black bg-rose-600 text-white rounded-md shadow-xs flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>-{discountPercent}% OFF</span>
            </span>
          </div>
        )}

        {product.badge && (
          <div className="absolute bottom-2.5 right-2.5">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-stone-900 text-amber-300 rounded-md shadow-xs">
              {product.badge}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div className="space-y-2">
          {/* Metadata: Category and Rating */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold text-stone-600 truncate max-w-[150px]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-stone-800 font-semibold tabular-nums">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-stone-400 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 group-hover:text-stone-950 transition-colors">
            {product.title}
          </h3>

          {/* Tamires' Tip Quote */}
          {product.tamiresTip && (
            <div className="bg-stone-50 border-l-2 border-amber-400 p-2.5 rounded-r-md text-xs text-stone-700 italic border border-stone-150">
              <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold uppercase not-italic mb-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                <span>Dica da Tamires</span>
              </div>
              <p className="line-clamp-2">&ldquo;{product.tamiresTip}&rdquo;</p>
            </div>
          )}

          {/* KEYWORDS DE FUNDO DE FUNIL (Alta Intenção de Compra) */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            {funnelKeywords.slice(0, 2).map((kw, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
              >
                <Tag className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                <span className="truncate">{kw}</span>
              </span>
            ))}
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-md border border-stone-200">
              <ShieldCheck className="w-2.5 h-2.5 text-stone-500" />
              <span>Link Seguro</span>
            </span>
          </div>
        </div>

        {/* Pricing block & CTA */}
        <div className="pt-3 mt-3 border-t border-stone-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-stone-900 tabular-nums">
                {formattedPrice}
              </span>
              {formattedOriginalPrice && (
                <span className="text-xs text-stone-400 line-through tabular-nums">
                  {formattedOriginalPrice}
                </span>
              )}
            </div>

            <button
              onClick={handleCopyLink}
              className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
              }`}
              title="Copiar link de indicação"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] font-semibold">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">Copiar Link</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Affiliate Action */}
          <a
            href={product.affiliateUrl || '#'}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: platform.color,
            }}
            className="w-full py-2.5 px-3 text-xs font-bold text-white rounded-xl shadow-xs hover:brightness-110 active:brightness-95 transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
          >
            <span>Ir para o Produto na {platform.name}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}
