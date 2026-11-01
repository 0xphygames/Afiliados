'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { PLATFORMS } from '@/lib/constants';
import {
  LEGACY_ARTICLE_PRODUCT_LAYOUT,
  parseArticleProductLayout,
  type ArticleProductFields,
  type ArticleProductStyle,
} from '@/lib/article-product-layouts';
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
  layout: string;
  index: number;
}

function toArticleProduct({ name, price, originalPrice, rating, url, image, badge, position, forWho, highlights, index }: ProductLineProps): Product {
  const category = highlights.match(/(?:^|;\s*)Categoria:\s*([^;]+)/i)?.[1]?.trim() || 'Achadinho';
  const editorialTip = [
    forWho ? `Para quem é: ${forWho}` : '',
    highlights ? `Destaques: ${highlights}` : '',
  ].filter(Boolean).join(' · ');
  return {
    id: `article-product-${index}`,
    title: name,
    platform: platformFromUrl(url),
    category,
    imageUrl: image,
    images: image ? [image] : [],
    affiliateUrl: url,
    price: parseMoney(price),
    originalPrice: originalPrice ? parseMoney(originalPrice) : undefined,
    rating: Number(rating.replace(',', '.')) || 0,
    reviewCount: 1,
    badge: [position && `${position}.`, badge].filter(Boolean).join(' ') || undefined,
    tamiresTip: editorialTip || undefined,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  };
}

// Same expanded view as the Achadinhos grid; the modal is portalled to body so the article layout cannot clip it
function ArticleProductCard(props: ProductLineProps) {
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const product = toArticleProduct(props);
  return (
    <div className="h-full">
      <ProductCard product={product} onOpenDetails={setDetailProduct} />
      {detailProduct &&
        createPortal(<ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} />, document.body)}
    </div>
  );
}

const formatBRL = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const buyButtonClass = 'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white whitespace-nowrap';

// Detailed rows: photo, description and a buy button
// Compact rows: one line per product, no photo, a plain text link
function ArticleProductRows({ products, detailed }: { products: Product[]; detailed: boolean }) {
  if (!detailed) {
    return (
      <ul className="my-5 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
            <span className="min-w-0 flex-1 truncate text-stone-800">{p.title}</span>
            <span className="shrink-0 font-bold tabular-nums text-stone-900">{formatBRL(p.price)}</span>
            <a
              href={p.affiliateUrl || '#'}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="shrink-0 text-xs font-bold text-stone-900 underline underline-offset-4"
            >
              Ver oferta
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="my-5 space-y-3">
      {products.map((p) => (
        <div key={p.id} className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-3 sm:p-4">
          {p.imageUrl && (
            <img src={p.imageUrl} alt={p.title} className="w-24 h-24 shrink-0 object-contain rounded-xl bg-stone-50" />
          )}
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="font-semibold text-stone-900 text-sm leading-snug">{p.title}</p>
            {p.tamiresTip && <p className="text-xs text-stone-600 leading-relaxed">{p.tamiresTip}</p>}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="font-bold text-stone-900 tabular-nums">{formatBRL(p.price)}</span>
              <a
                href={p.affiliateUrl || '#'}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={buyButtonClass}
                style={{ backgroundColor: PLATFORMS[p.platform]?.color }}
              >
                Ver oferta <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// One card of the horizontal strip; click opens the same expanded view as the Achadinhos grid
function ArticleProductHorizontalItem({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-white p-2 hover:border-stone-300 hover:shadow-sm transition-all"
      >
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.title} className="w-full h-28 object-contain rounded-lg bg-stone-50" />
        ) : (
          <div className="w-full h-28 rounded-lg bg-stone-100" />
        )}
        <p className="font-semibold text-stone-900 text-xs leading-snug line-clamp-2">{product.title}</p>
        <p className="text-sm font-bold text-stone-900 tabular-nums">{formatBRL(product.price)}</p>
        <span
          className="mt-auto inline-flex w-fit items-center rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-white"
          style={{ backgroundColor: PLATFORMS[product.platform]?.color }}
        >
          Ver detalhes
        </span>
      </button>
      {open && createPortal(<ProductDetailModal product={product} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

// Cards side by side, wrapping onto the next line when there is no room; no scrollbar
function ArticleProductHorizontal({ products }: { products: Product[] }) {
  return (
    <div className="my-5 grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
      {products.map((p) => (
        <ArticleProductHorizontalItem key={p.id} product={p} />
      ))}
    </div>
  );
}

// Comparison table. Descrição: one row per product with its highlight.
// Simplificada: name and price only. Horizontal: products side by side, attributes as rows.
function ArticleProductTable({ products, style }: { products: Product[]; style: ArticleProductStyle }) {
  if (style === 'horizontal') {
    const rows: { label: string; render: (p: Product) => React.ReactNode }[] = [
      {
        label: 'Produto',
        render: (p) => (
          <div className="space-y-2">
            {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-24 h-24 object-contain rounded-lg bg-stone-50" />}
            <span className="block font-semibold text-stone-900">{p.title}</span>
          </div>
        ),
      },
      { label: 'Preço', render: (p) => <span className="font-bold text-stone-900 tabular-nums">{formatBRL(p.price)}</span> },
      { label: 'Nota', render: (p) => (p.rating > 0 ? `${p.rating.toFixed(1)} ★` : '—') },
      { label: 'Destaque', render: (p) => p.tamiresTip || '—' },
      {
        label: 'Oferta',
        render: (p) => (
          <a
            href={p.affiliateUrl || '#'}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={buyButtonClass}
            style={{ backgroundColor: PLATFORMS[p.platform]?.color }}
          >
            Ver oferta <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ),
      },
    ];
    return (
      <div className="my-5 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="text-left text-sm">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-stone-100 first:border-t-0">
                <th scope="row" className="sticky left-0 bg-stone-50 p-3 align-top text-[11px] font-bold uppercase tracking-wide text-stone-500 whitespace-nowrap">
                  {row.label}
                </th>
                {products.map((p) => (
                  <td key={p.id} className="min-w-[11rem] p-3 align-top text-stone-800">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const detailed = style === 'descricao';
  return (
    <div className="my-5 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <table className={`w-full min-w-[24rem] text-left ${detailed ? 'text-sm' : 'text-xs'}`}>
        <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-wide text-stone-500">
          <tr>
            <th className="p-3">Produto</th>
            {detailed && <th className="p-3">Destaque</th>}
            <th className="p-3">Preço</th>
            {detailed && <th className="p-3">Nota</th>}
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-stone-100 align-middle">
              <td className="p-3">
                <div className="flex items-center gap-3">
                  {detailed && p.imageUrl && (
                    <img src={p.imageUrl} alt={p.title} className="w-12 h-12 shrink-0 object-contain rounded-lg bg-stone-50" />
                  )}
                  <span className="font-semibold text-stone-900">{p.title}</span>
                </div>
              </td>
              {detailed && <td className="p-3 text-xs text-stone-600 leading-relaxed">{p.tamiresTip || '—'}</td>}
              <td className="p-3 font-bold text-stone-900 tabular-nums whitespace-nowrap">{formatBRL(p.price)}</td>
              {detailed && <td className="p-3 text-stone-700 whitespace-nowrap">{p.rating > 0 ? `${p.rating.toFixed(1)} ★` : '—'}</td>}
              <td className="p-3">
                {detailed ? (
                  <a
                    href={p.affiliateUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className={buyButtonClass}
                    style={{ backgroundColor: PLATFORMS[p.platform]?.color }}
                  >
                    Ver oferta <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <a href={p.affiliateUrl || '#'} target="_blank" rel="noopener noreferrer sponsored" className="text-xs font-bold text-stone-900 underline underline-offset-4">
                    Ver oferta
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Renders one run of product lines according to the objective and style chosen in the editor
function renderProductLayout(layout: string, items: ProductLineProps[], key: string) {
  const { objective, style } = parseArticleProductLayout(layout);
  const products = items.map((item) => toArticleProduct(item));

  if (objective === 'tabela') {
    return <ArticleProductTable key={key} products={products} style={style} />;
  }

  if (objective === 'unico') {
    return (
      <div key={key} className="my-5 space-y-5">
        {items.map((item) => {
          if (style === 'horizontal') return <ArticleProductHorizontal key={item.index} products={[toArticleProduct(item)]} />;
          if (style === 'simplificada') return <ArticleProductRows key={item.index} products={[toArticleProduct(item)]} detailed={false} />;
          return (
            <div key={item.index} className="mx-auto max-w-sm">
              <ArticleProductCard {...item} />
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'horizontal') {
    return (
      <div key={key}>
        <ArticleProductHorizontal products={products} />
      </div>
    );
  }
  return <ArticleProductRows key={key} products={products} detailed={style === 'descricao'} />;
}

// Preview used by the editor: the same blocks the article will show
export function ProductLayoutPreview({ layout, items }: { layout: string; items: ArticleProductFields[] }) {
  return <>{renderProductLayout(layout, items.map((item, index) => ({ ...item, index, layout })), 'preview')}</>;
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
  let productGroup: { layout: string; item: ProductLineProps }[] = [];

  const flushProductGroup = () => {
    if (productGroup.length > 0) {
      renderedElements.push(renderProductLayout(productGroup[0].layout, productGroup.map((g) => g.item), `products-${renderedElements.length}`));
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
        layout = '',
      ] = trimmed.slice(10, -2).split('|').map((field) => field.trim());
      const groupLayout = layout || LEGACY_ARTICLE_PRODUCT_LAYOUT;
      // A new layout starts a new block of products
      if (productGroup.length > 0 && productGroup[0].layout !== groupLayout) flushProductGroup();
      productGroup.push({
        layout: groupLayout,
        item: { index, name, price, originalPrice, rating, url, image, badge, position, forWho, highlights, layout: groupLayout },
      });
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
