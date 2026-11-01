'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import type { Product, PlatformId } from '@/lib/types';

// Product card written on one line as:
// [[produto|Nome|Preço|Preço original|Nota|Link da oferta|URL da imagem|Destaque|Posição|Para quem é|Destaques]]
// Affiliate disclosure box, on its own line: [[aviso]]
// Turns the one-line article syntax into a catalog Product and renders the same card as the Achadinhos grid
const platformFromUrl = (url: string): PlatformId => {
  const u = url.toLowerCase();
  if (u.includes('shopee')) return 'shopee';
  if (u.includes('shein')) return 'shein';
  if (u.includes('mercadolivre') || u.includes('mercadolibre') || u.includes('meli.la')) return 'mercadolivre';
  if (u.includes('amazon') || u.includes('amzn')) return 'amazon';
  return 'shopee';
};

const parseMoney = (value: string) => {
  const cleaned = value.replace(/[^0-9,.-]/g, '').trim();
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  const normalized = lastComma > lastDot
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned.replace(/,/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

interface ProductLineProps {
  name: string;
  price: string;
  originalPrice: string;
  rating: string;
  url: string;
  image: string;
  badge: string;
  position: string;
  forWho: string;
  highlights: string;
  index: number;
}

function ArticleProductCard({ name, price, originalPrice, rating, url, image, badge, position, forWho, highlights, index }: ProductLineProps) {
  // Same expanded view as the Achadinhos grid; the modal is portalled to body so the article layout cannot clip it
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const category = highlights.match(/(?:^|;\s*)Categoria:\s*([^;]+)/i)?.[1]?.trim() || 'Achadinho';
  const editorialTip = [
    forWho ? `Para quem é: ${forWho}` : '',
    highlights ? `Destaques: ${highlights}` : '',
  ].filter(Boolean).join(' · ');
  const product: Product = {
    id: `article-product-${index}`,
    title: name,
    platform: platformFromUrl(url),
    category,
    imageUrl: image,
    images: image ? [image] : [],
    affiliateUrl: url,
    price: parseMoney(price),
    originalPrice: originalPrice ? parseMoney(originalPrice) : undefined,
    rating: Number(rating.replace(',', '.')) || 5,
    reviewCount: 1,
    badge: [position && `${position}.`, badge].filter(Boolean).join(' ') || undefined,
    tamiresTip: editorialTip || undefined,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  };
  return (
    <div className="h-full">
      <ProductCard product={product} onOpenDetails={setDetailProduct} />
      {detailProduct &&
        createPortal(<ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} />, document.body)}
    </div>
  );
}

function AffiliateDisclosure() {
  return (
    <div className="my-4 rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs text-stone-600">
      Este artigo contém links de afiliado. Se você comprar pelos nossos links, recebemos uma comissão sem custo adicional para você.
    </div>
  );
}

interface BlogContentRendererProps {
  content: string;
  className?: string;
}

/**
 * Parses inline formatting:
 * - Markdown links: [Texto do Link](https://...)
 * - Bare URLs: https://... or http://...
 * - Bold text: **texto em destaque**
 */
function parseInlineFormattedText(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match: [link text](url) OR bare url OR **bold**
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)|(\*\*[^*]+\*\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      // Markdown link [text](url)
      const linkText = match[1];
      const linkUrl = match[2];
      nodes.push(
        <a
          key={`md-link-${match.index}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline decoration-amber-400 hover:decoration-amber-700 decoration-2 underline-offset-2 transition-colors bg-amber-50/80 hover:bg-amber-100/90 px-1.5 py-0.5 rounded-md"
        >
          <span>{linkText}</span>
          <ExternalLink className="w-3 h-3 text-amber-700 inline-block shrink-0" aria-hidden="true" />
        </a>
      );
    } else if (match[3]) {
      // Bare URL
      const rawUrl = match[3];
      // Clean trailing punctuation if accidentally caught
      const cleanUrl = rawUrl.replace(/[.,;!?)]+$/, '');
      const trailingPunct = rawUrl.slice(cleanUrl.length);

      nodes.push(
        <a
          key={`bare-link-${match.index}`}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline decoration-amber-400 hover:decoration-amber-700 decoration-2 underline-offset-2 transition-colors bg-amber-50/80 hover:bg-amber-100/90 px-1.5 py-0.5 rounded-md break-all"
        >
          <span>{cleanUrl}</span>
          <ExternalLink className="w-3 h-3 text-amber-700 inline-block shrink-0" aria-hidden="true" />
        </a>
      );
      if (trailingPunct) {
        nodes.push(trailingPunct);
      }
    } else if (match[4]) {
      // Bold text **bold**
      const boldText = match[4].slice(2, -2);
      nodes.push(
        <strong key={`bold-${match.index}`} className="font-bold text-stone-950">
          {boldText}
        </strong>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function BlogContentRenderer({ content, className = '' }: BlogContentRendererProps) {
  if (!content) return null;

  // Split content into blocks by double newlines or single newlines
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inList = false;
  let currentListItems: React.ReactNode[] = [];
  let productGroup: React.ReactNode[] = [];

  const flushProductGroup = () => {
    if (productGroup.length > 0) {
      renderedElements.push(
        <div key={`products-${renderedElements.length}`} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 my-5 items-stretch">
          {productGroup}
        </div>,
      );
      productGroup = [];
    }
  };

  const flushList = () => {
    if (inList && currentListItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${renderedElements.length}`} className="list-disc list-inside space-y-1.5 my-3 pl-2 text-stone-800">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      return;
    }

    // Affiliate disclosure: [[aviso]]
    if (trimmed === '[[aviso]]') {
      flushList();
      flushProductGroup();
      renderedElements.push(<AffiliateDisclosure key={`aviso-${index}`} />);
      return;
    }

    // Product card: [[produto|Nome|Preço|Preço original|Nota|Link|Imagem|Destaque|Posição|Para quem é|Destaques]]
    if (trimmed.startsWith('[[produto|') && trimmed.endsWith(']]')) {
      flushList();
      const [
        name = '',
        price = '',
        originalPrice = '',
        rating = '',
        url = '',
        image = '',
        badge = '',
        position = '',
        forWho = '',
        highlights = '',
      ] = trimmed.slice(10, -2).split('|').map((field) => field.trim());
      productGroup.push(
        <ArticleProductCard
          index={index}
          key={`product-${index}`}
          name={name}
          price={price}
          originalPrice={originalPrice}
          rating={rating}
          url={url}
          image={image}
          badge={badge}
          position={position}
          forWho={forWho}
          highlights={highlights}
        />
      );
      return;
    }

    // Heading 2 (## Title)
    if (trimmed.startsWith('## ')) {
      flushList();
      flushProductGroup();
      renderedElements.push(
        <h2
          key={`h2-${index}`}
          className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-6 mb-2 pt-2 border-b border-stone-100 pb-1"
        >
          {parseInlineFormattedText(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    // Heading 3 (### Subtitle)
    if (trimmed.startsWith('### ')) {
      flushList();
      flushProductGroup();
      renderedElements.push(
        <h3
          key={`h3-${index}`}
          className="font-serif text-lg font-bold text-stone-900 mt-4 mb-2"
        >
          {parseInlineFormattedText(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    // Blockquote or Curator Tip (> Dica)
    if (trimmed.startsWith('> ')) {
      flushList();
      flushProductGroup();
      renderedElements.push(
        <div
          key={`quote-${index}`}
          className="p-4 my-4 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-2xl text-stone-900 text-sm italic shadow-2xs"
        >
          <div className="flex items-start gap-2 not-italic font-sans">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block not-italic">
                Dica da Curadoria
              </span>
              <p className="text-stone-800 leading-relaxed font-normal not-italic">
                {parseInlineFormattedText(trimmed.slice(2))}
              </p>
            </div>
          </div>
        </div>
      );
      return;
    }

    // Bullet list item (- Item, * Item, • Item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      flushProductGroup();
      inList = true;
      const bulletContent = trimmed.slice(2);
      currentListItems.push(
        <li key={`li-${index}`} className="leading-relaxed">
          {parseInlineFormattedText(bulletContent)}
        </li>
      );
      return;
    }

    // Standard paragraph
    flushList();
    flushProductGroup();
    renderedElements.push(
      <p key={`p-${index}`} className="leading-relaxed text-stone-800 my-2">
        {parseInlineFormattedText(trimmed)}
      </p>
    );
  });

  flushList();
  flushProductGroup();

  return (
    <div className={`space-y-2 text-stone-800 font-sans leading-relaxed ${className}`}>
      {renderedElements}
    </div>
  );
}
