import { pgTable, serial, text, timestamp, doublePrecision, integer, boolean } from 'drizzle-orm/pg-core';

// Users table (linked with Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  platform: text('platform').notNull(), // 'shopee' | 'shein' | 'mercadolivre' | 'amazon'
  category: text('category').notNull(),
  imageUrl: text('image_url').notNull(),
  affiliateUrl: text('affiliate_url').notNull(),
  price: doublePrecision('price').notNull(),
  originalPrice: doublePrecision('original_price'),
  rating: doublePrecision('rating').default(5.0),
  reviewCount: integer('review_count').default(100),
  badge: text('badge'),
  tamiresTip: text('tamires_tip'),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Articles / Blog table
export const articles = pgTable('articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  coverImageUrl: text('cover_image_url'),
  author: text('author').default('Tamires Santos'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Coupons table
export const coupons = pgTable('coupons', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  discount: text('discount').notNull(),
  platform: text('platform').notNull(),
  description: text('description').notNull(),
  minSpend: text('min_spend'),
  expirationDate: text('expiration_date'),
  affiliateUrl: text('affiliate_url').notNull(),
  isVerified: boolean('is_verified').default(true),
  category: text('category').default('Geral'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Custom Landing Pages table
export const landingPages = pgTable('landing_pages', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  headline: text('headline').notNull(),
  subheading: text('subheading').notNull(),
  platform: text('platform'),
  category: text('category'),
  badge: text('badge'),
  bannerImageUrl: text('banner_image_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
