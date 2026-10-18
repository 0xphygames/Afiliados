import type { LucideIcon } from 'lucide-react';
import {
  Home,
  ShoppingBag,
  BookOpen,
  Tag,
  Flame,
  LayoutDashboard,
  PlusCircle,
  Layers,
  FileText,
  Settings,
  Star,
  Gift,
  Megaphone,
  Heart,
  Info,
  Sparkles,
} from 'lucide-react';
import { supabase } from './supabase';

export type MenuArea = 'public' | 'admin';

export interface MenuItem {
  id: string;
  area: MenuArea;
  label: string;
  href: string;
  icon: string;
  colorClass: string;
  exact: boolean;
  position: number;
  isVisible: boolean;
}

// Icons the admin can pick from; the stored value is the key
export const MENU_ICONS: Record<string, LucideIcon> = {
  Home,
  ShoppingBag,
  BookOpen,
  Tag,
  Flame,
  LayoutDashboard,
  PlusCircle,
  Layers,
  FileText,
  Settings,
  Star,
  Gift,
  Megaphone,
  Heart,
  Info,
  Sparkles,
};

// Used only if the request to Supabase fails; matches the seed in migration 202610170004
export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'pub-home', area: 'public', label: 'Home', href: '/', icon: 'Home', colorClass: 'text-stone-500', exact: true, position: 1, isVisible: true },
  { id: 'pub-achadinhos', area: 'public', label: 'Achadinhos', href: '/achadinhos', icon: 'ShoppingBag', colorClass: 'text-[#EE4D2D]', exact: false, position: 2, isVisible: true },
  { id: 'pub-blog', area: 'public', label: 'Blog', href: '/blog', icon: 'BookOpen', colorClass: 'text-amber-600', exact: false, position: 3, isVisible: true },
  { id: 'pub-cupons', area: 'public', label: 'Cupons', href: '/cupons', icon: 'Tag', colorClass: 'text-emerald-600', exact: false, position: 4, isVisible: true },
  { id: 'pub-campanhas', area: 'public', label: 'Campanhas', href: '/campanha', icon: 'Flame', colorClass: 'text-rose-500', exact: false, position: 5, isVisible: true },
];

const menuItemFromRow = (row: any): MenuItem => ({
  id: row.id,
  area: row.area,
  label: row.label || '',
  href: row.href || '/',
  icon: row.icon || 'Tag',
  colorClass: row.color_class || 'text-stone-500',
  exact: Boolean(row.exact),
  position: Number(row.position) || 0,
  isVisible: row.is_visible !== false,
});

// Loads all items of one menu area ordered by position. On failure, returns the defaults for public menu.
export function subscribeMenuItems(
  area: MenuArea,
  onSuccess: (items: MenuItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  void supabase
    .from('site_menu_items')
    .select('*')
    .eq('area', area)
    .order('position', { ascending: true })
    .then(({ data, error }) => {
      if (error) {
        console.warn('Leitura do menu (fallback):', error);
        onSuccess(area === 'public' ? DEFAULT_MENU_ITEMS : []);
        onError?.(error as unknown as Error);
        return;
      }
      onSuccess((data ?? []).map(menuItemFromRow));
    });
  return () => undefined;
}

export async function saveMenuItem(item: MenuItem): Promise<void> {
  const { error } = await supabase.from('site_menu_items').upsert({
    id: item.id,
    area: item.area,
    label: item.label.trim(),
    href: item.href.trim(),
    icon: item.icon,
    color_class: item.colorClass,
    exact: item.exact,
    position: item.position,
    is_visible: item.isVisible,
  });
  if (error) throw error;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from('site_menu_items').delete().eq('id', id);
  if (error) throw error;
}
