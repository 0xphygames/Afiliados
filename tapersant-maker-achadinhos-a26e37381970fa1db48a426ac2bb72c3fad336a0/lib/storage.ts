import { Product } from './types';
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

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') {
    return INITIAL_PRODUCTS;
  }
  if (cachedProducts) {
    return cachedProducts;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
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
  } catch (err) {
    console.error('Erro ao ler produtos do localStorage:', err);
    cachedProducts = INITIAL_PRODUCTS;
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  cachedProducts = products;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (err) {
      console.error('Erro ao salvar produtos no localStorage:', err);
    }
  }
  notify();
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

