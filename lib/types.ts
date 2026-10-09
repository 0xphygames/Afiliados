export type PlatformId = 'shopee' | 'shein' | 'mercadolivre' | 'amazon';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  tagline: string;
  color: string;
  bgLight: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  iconName: string;
  defaultCategories: string[];
}

export interface Product {
  id: string;
  title: string;
  platform: PlatformId;
  category: string;
  imageUrl: string;
  images?: string[];
  affiliateUrl: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  tamiresTip?: string;
  isFeatured?: boolean;
  bottomFunnelKeywords?: string[];
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  coverImageUrl?: string;
  author: string;
  featured?: boolean;
  bottomFunnelKeywords?: string[];
  createdAt: string;
}

export interface SiteSettings {
  heroHeadline: string;
  heroSubheading: string;
  topBannerNotice: string;
  whatsappUrl: string;
  updatedAt?: string;
}

export interface CustomLandingPage {
  id: string;
  title: string;
  slug: string;
  headline?: string;
  subheading?: string;
  platform?: PlatformId | 'all';
  category?: string;
  badge?: string;
  bannerImageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  platform?: PlatformId | 'all';
  icon?: string;
  color?: string;
  createdAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  discount: string;
  platform: PlatformId;
  description: string;
  minSpend?: string;
  expirationDate?: string;
  affiliateUrl: string;
  isVerified: boolean;
  category: string;
}

export type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'discount' | 'rating';
