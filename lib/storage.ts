import { Product, Article, CustomLandingPage, SiteSettings } from './types';
import { INITIAL_PRODUCTS } from './constants';

const STORAGE_KEY = 'achadinhos_looks_tamires_products_v1';

let cachedProducts: Product[] | null = null;
const listeners = new Set<() => void>();

export function subscribeProducts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function safeLocalStorageSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // If quota exceeded, sanitize heavy base64 strings and save
    try {
      if (Array.isArray(value)) {
        const sanitized = value.map((item) => {
          if (item && typeof item === 'object') {
            const copy = { ...item };
            if (typeof copy.imageUrl === 'string' && copy.imageUrl.startsWith('data:') && copy.imageUrl.length > 500) {
              copy.imageUrl = '';
            }
            return copy;
          }
          return item;
        });
        localStorage.setItem(key, JSON.stringify(sanitized));
      }
    } catch {
      // Gracefully ignore since in-memory cache holds the items
    }
  }
}

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') {
    return INITIAL_PRODUCTS;
  }
  if (cachedProducts && cachedProducts.length >= INITIAL_PRODUCTS.length) {
    return cachedProducts;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      safeLocalStorageSet(STORAGE_KEY, INITIAL_PRODUCTS);
      cachedProducts = INITIAL_PRODUCTS;
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with INITIAL_PRODUCTS to guarantee none of the 55 products are missing
      const mergedMap = new Map<string, Product>();
      INITIAL_PRODUCTS.forEach((p) => mergedMap.set(p.id, p));
      parsed.forEach((p) => mergedMap.set(p.id, p));
      const mergedList = Array.from(mergedMap.values());
      cachedProducts = mergedList;
      return mergedList;
    }
    cachedProducts = INITIAL_PRODUCTS;
    return INITIAL_PRODUCTS;
  } catch {
    cachedProducts = INITIAL_PRODUCTS;
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  cachedProducts = products;
  safeLocalStorageSet(STORAGE_KEY, products);
  notify();
}

export function getStoredArticles(): Article[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('achadinhos_looks_tamires_articles_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Erro ao ler artigos do localStorage:', err);
  }
  return [];
}

export function saveStoredArticles(articles: Article[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('achadinhos_looks_tamires_articles_v1', JSON.stringify(articles));
  } catch (err) {
    console.error('Erro ao salvar artigos no localStorage:', err);
  }
}

export function getStoredLandingPages(): CustomLandingPage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('achadinhos_looks_tamires_pages_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Erro ao ler campanhas do localStorage:', err);
  }
  return [];
}

export function saveStoredLandingPages(pages: CustomLandingPage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('achadinhos_looks_tamires_pages_v1', JSON.stringify(pages));
  } catch (err) {
    console.error('Erro ao salvar campanhas no localStorage:', err);
  }
}

export function getStoredSettings(): SiteSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('achadinhos_looks_tamires_settings_v1');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Erro ao ler configurações do localStorage:', err);
  }
  return null;
}

export function saveStoredSettings(settings: SiteSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('achadinhos_looks_tamires_settings_v1', JSON.stringify(settings));
  } catch (err) {
    console.error('Erro ao salvar configurações no localStorage:', err);
  }
}

export function exportProductsJson(products: Product[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `achadinhos_looks_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

