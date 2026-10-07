'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CustomLandingPage, PlatformId } from '@/lib/types';
import { Sparkles, ArrowRight, Tag, Layers, ShoppingBag } from 'lucide-react';
import { PLATFORMS } from '@/lib/constants';

interface LandingPagesSectionProps {
  pages: CustomLandingPage[];
  onSelectCampaign?: (page: CustomLandingPage) => void;
  activeCampaignSlug?: string | null;
  onClearCampaign?: () => void;
}

export function LandingPagesSection({
  pages,
  onSelectCampaign,
  activeCampaignSlug,
  onClearCampaign,
}: LandingPagesSectionProps) {
  const activePages = pages.filter((p) => p.isActive);

  if (activePages.length === 0) return null;

  return (
    <section id="cupons" className="w-full bg-white border-b border-stone-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-900 rounded-lg">
              <Sparkles className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Cupons de Desconto, Campanhas & Achados Similares
              </h3>
              <p className="text-xs text-stone-500">
                Seleções temáticas com cupons verificados, ofertas similares e garimpos com super desconto
              </p>
            </div>
          </div>
        </div>

        {/* Carousel / Grid of Landing Page Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activePages.map((page) => {
            const platformConfig = page.platform && page.platform !== 'all' ? PLATFORMS[page.platform] : null;

            return (
              <Link
                key={page.id}
                href={`/campanha/${page.slug}`}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-stone-200 hover:border-stone-400 hover:shadow-md bg-stone-50 transition-all duration-200 block"
              >
                {/* Banner Background */}
                <div className="relative h-36 w-full bg-stone-100 overflow-hidden">
                  {page.bannerImageUrl ? (
                    <Image
                      src={page.bannerImageUrl}
                      alt={page.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    {page.badge ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-stone-950 shadow-xs">
                        {page.badge}
                      </span>
                    ) : <span />}

                    {platformConfig && (
                      <span
                        style={{ backgroundColor: platformConfig.color }}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs"
                      >
                        {platformConfig.name}
                      </span>
                    )}
                  </div>

                  {/* Bottom Text Over Image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-serif text-sm sm:text-base font-bold leading-tight drop-shadow-sm">
                      {page.title}
                    </h4>
                  </div>
                </div>

                {/* Subtitle & CTA bar */}
                <div className="p-3 bg-white flex items-center justify-between gap-2">
                  <p className="text-[11px] text-stone-600 line-clamp-1">
                    {page.headline || page.subheading || 'Clique para ver os achadinhos selecionados'}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-900 shrink-0 group-hover:translate-x-0.5 transition-transform">
                    <span>Ver Campanha</span>
                    <ArrowRight className="w-3 h-3 text-amber-600" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
