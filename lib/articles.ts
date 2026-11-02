import type { Article, PlatformId, Product } from './types';
import { LEGACY_MAP } from './taxonomy';

// Product cards in an article are written as [[produto|Nome|Preço|Preço original|Nota|Link|...]].
// The link identifies the catalog product, so an article's store and departments come from its products.
const PRODUCT_LINE = /\[\[produto\|([^\]]*)\]\]/g;

export function platformFromUrl(url: string): PlatformId | null {
  const u = url.toLowerCase();
  if (u.includes('shopee')) return 'shopee';
  if (u.includes('shein')) return 'shein';
  if (u.includes('mercadolivre') || u.includes('mercadolibre') || u.includes('meli.la')) return 'mercadolivre';
  if (u.includes('amazon') || u.includes('amzn')) return 'amazon';
  return null;
}

export interface ArticleLinkMeta {
  stores: Set<PlatformId>;
  departments: Set<string>;
}

// Stores and departments an article covers. Departments (macro and micro) come only from the products
// cited in the article, so the blog classifies it the way its products are classified.
export function articleLinkMeta(article: Article, products: Product[]): ArticleLinkMeta {
  const byUrl = new Map(products.map((p) => [p.affiliateUrl, p]));
  const stores = new Set<PlatformId>();
  const cited = new Set<string>();
  let hasProductLines = false;

  for (const match of article.content.matchAll(PRODUCT_LINE)) {
    hasProductLines = true;
    const fields = match[1].split('|').map((field) => field.trim());
    // Current cards store the URL after the rating; older cards may have a
    // different number of optional fields, so find the first URL instead of
    // relying on a fixed position.
    const url = fields.find((field) => /^https?:\/\//i.test(field)) ?? '';
    const product = byUrl.get(url);
    const store = product?.platform ?? platformFromUrl(url);
    if (store) stores.add(store);
    const mapped = product ? LEGACY_MAP[product.category] : undefined;
    const macro = product?.department || mapped?.[0];
    const micro = product?.subcategory || mapped?.[1];
    if (macro) cited.add(macro);
    if (micro) cited.add(micro);
  }

  const departments = new Set<string>();
  if (hasProductLines) {
    cited.forEach((name) => departments.add(name));
  } else {
    // Articles without product cards keep the sector they were saved with
    const articleMapped = LEGACY_MAP[article.category];
    if (article.department) departments.add(article.department);
    if (article.subcategory) departments.add(article.subcategory);
    if (articleMapped) {
      departments.add(articleMapped[0]);
      departments.add(articleMapped[1]);
    }
    // Articles with no sector at all stay visible under Outros
    if (departments.size === 0) departments.add('Outros');
  }

  // The store chosen in the editor counts too, even before any card is added
  if (article.platform) stores.add(article.platform);
  return { stores, departments };
}
