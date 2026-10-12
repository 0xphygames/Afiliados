import { Product, Article, CustomLandingPage, SiteSettings } from './types';
import { INITIAL_PRODUCTS } from './constants';

const STORAGE_KEY = 'achadinhos_looks_tamires_products_v1';
const ARTICLES_KEY = 'achadinhos_looks_tamires_articles_v1';
const PAGES_KEY = 'achadinhos_looks_tamires_pages_v1';
const SETTINGS_KEY = 'achadinhos_looks_tamires_settings_v1';

let cachedProducts: Product[] | null = null;
let cachedArticles: Article[] | null = null;
let cachedLandingPages: CustomLandingPage[] | null = null;
let cachedSettings: SiteSettings | null = null;
const listeners = new Set<() => void>();

// --- IndexedDB for unlimited capacity storage (preserves full images & ads) ---
function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open('achadinhos_tamires_db', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('keyval')) {
          db.createObjectStore('keyval');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction('keyval', 'readonly');
      const store = tx.objectStore('keyval');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction('keyval', 'readwrite');
      const store = tx.objectStore('keyval');
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Graceful silent fallback
  }
}

// Automatically load from IndexedDB on startup in browser
if (typeof window !== 'undefined') {
  queueMicrotask(async () => {
    try {
      const dbProds = await idbGet<Product[]>(STORAGE_KEY);
      if (dbProds && Array.isArray(dbProds) && dbProds.length > 0) {
        cachedProducts = dbProds;
        notify();
      }
      const dbArts = await idbGet<Article[]>(ARTICLES_KEY);
      if (dbArts && Array.isArray(dbArts) && dbArts.length > 0) {
        cachedArticles = dbArts;
      }
      const dbPages = await idbGet<CustomLandingPage[]>(PAGES_KEY);
      if (dbPages && Array.isArray(dbPages) && dbPages.length > 0) {
        cachedLandingPages = dbPages;
      }
    } catch {
      // Safe ignore
    }
  });
}

// Safe localStorage setter with QuotaExceededError protection
function safeLocalStorageSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (err) {
    // If quota exceeded, sanitize heavy base64 strings and try again
    try {
      if (Array.isArray(value)) {
        const sanitized = value.map((item) => {
          if (item && typeof item === 'object') {
            const copy = { ...item };
            if (typeof copy.imageUrl === 'string' && copy.imageUrl.startsWith('data:') && copy.imageUrl.length > 500) {
              copy.imageUrl = '';
            }
            if (typeof copy.bannerImageUrl === 'string' && copy.bannerImageUrl.startsWith('data:') && copy.bannerImageUrl.length > 500) {
              copy.bannerImageUrl = '';
            }
            if (typeof copy.coverImageUrl === 'string' && copy.coverImageUrl.startsWith('data:') && copy.coverImageUrl.length > 500) {
              copy.coverImageUrl = '';
            }
            return copy;
          }
          return item;
        });
        localStorage.setItem(key, JSON.stringify(sanitized));
      }
    } catch {
      // If still exceeding or unable, ignore gracefully since IndexedDB and RAM hold the full data
      console.warn(`LocalStorage cota atingida para ${key}; dados preservados em memória e IndexedDB.`);
    }
  }
}

export function subscribeProducts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') {
    return INITIAL_PRODUCTS;
  }
  if (cachedProducts && cachedProducts.length > 0) {
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
      cachedProducts = parsed;
      return parsed;
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
  idbSet(STORAGE_KEY, products);
  notify();
}

export function getStoredArticles(): Article[] {
  if (typeof window === 'undefined') return [];
  if (cachedArticles && cachedArticles.length > 0) return cachedArticles;
  try {
    const raw = localStorage.getItem(ARTICLES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedArticles = parsed;
        return parsed;
      }
    }
  } catch {
    // Safe ignore
  }
  return [];
}

export function saveStoredArticles(articles: Article[]): void {
  cachedArticles = articles;
  safeLocalStorageSet(ARTICLES_KEY, articles);
  idbSet(ARTICLES_KEY, articles);
}

export function getStoredLandingPages(): CustomLandingPage[] {
  if (typeof window === 'undefined') return [];
  if (cachedLandingPages && cachedLandingPages.length > 0) return cachedLandingPages;
  try {
    const raw = localStorage.getItem(PAGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedLandingPages = parsed;
        return parsed;
      }
    }
  } catch {
    // Safe ignore
  }
  return [];
}

export function saveStoredLandingPages(pages: CustomLandingPage[]): void {
  cachedLandingPages = pages;
  safeLocalStorageSet(PAGES_KEY, pages);
  idbSet(PAGES_KEY, pages);
}

export function getStoredSettings(): SiteSettings | null {
  if (typeof window === 'undefined') return null;
  if (cachedSettings) return cachedSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      cachedSettings = parsed;
      return parsed;
    }
  } catch {
    // Safe ignore
  }
  return null;
}

export function saveStoredSettings(settings: SiteSettings): void {
  cachedSettings = settings;
  safeLocalStorageSet(SETTINGS_KEY, settings);
  idbSet(SETTINGS_KEY, settings);
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

