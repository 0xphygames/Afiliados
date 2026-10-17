'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/lib/firestore-products';
import { Product, Article, SiteSettings, CustomLandingPage, CustomCategory, Coupon } from './types';
import {
  subscribeFirestoreProducts,
  subscribeFirestoreArticles,
  subscribeFirestoreSettings,
  subscribeFirestoreLandingPages,
  subscribeFirestoreCategories,
  subscribeFirestoreCoupons,
  saveCouponToFirestore,
  deleteCouponFromFirestore,
  subscribeAuth,
  isUserAdmin,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  saveLandingPageToFirestore,
  deleteLandingPageFromFirestore,
  saveArticleToFirestore,
  deleteArticleFromFirestore,
  saveSettingsToFirestore,
  logoutUser,
  INITIAL_ARTICLES,
  INITIAL_SETTINGS,
  INITIAL_LANDING_PAGES,
  INITIAL_CUSTOM_CATEGORIES,
} from './firestore-products';

import {
  getStoredArticles,
  getStoredLandingPages,
  getStoredSettings,
} from './storage';

interface AdminContextType {
  currentUser: User | null;
  isAdmin: boolean;
  authLoading: boolean;
  products: Product[];
  articles: Article[];
  settings: SiteSettings;
  landingPages: CustomLandingPage[];
  categories: CustomCategory[];
  coupons: Coupon[];
  handleSaveCoupon: (coupon: Coupon) => Promise<void>;
  handleDeleteCoupon: (id: string) => Promise<void>;
  handleSaveProduct: (product: Product) => Promise<void>;
  handleDeleteProduct: (id: string) => Promise<void>;
  handleSaveCategory: (category: CustomCategory) => Promise<void>;
  handleDeleteCategory: (id: string) => Promise<void>;
  handleSaveLandingPage: (page: CustomLandingPage) => Promise<void>;
  handleDeleteLandingPage: (id: string) => Promise<void>;
  handleSaveArticle: (article: Article) => Promise<void>;
  handleDeleteArticle: (id: string) => Promise<void>;
  handleSaveSettings: (settings: SiteSettings) => Promise<void>;
  handleLogout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [landingPages, setLandingPages] = useState<CustomLandingPage[]>(INITIAL_LANDING_PAGES);
  const [categories, setCategories] = useState<CustomCategory[]>(INITIAL_CUSTOM_CATEGORIES);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    // Instant hydration from local cache
    queueMicrotask(() => {
      const localArts = getStoredArticles();
      if (localArts && localArts.length > 0) setArticles(localArts);
      const localPages = getStoredLandingPages();
      if (localPages && localPages.length > 0) setLandingPages(localPages);
      const localSettings = getStoredSettings();
      if (localSettings) setSettings(localSettings);
    });

    const unsubAuth = subscribeAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    const unsubProducts = subscribeFirestoreProducts((list) => {
      if (list && list.length > 0) setProducts(list);
    });

    const unsubArticles = subscribeFirestoreArticles((list) => {
      if (list && list.length > 0) setArticles(list);
    });

    const unsubSettings = subscribeFirestoreSettings((cfg) => {
      if (cfg) setSettings(cfg);
    });

    const unsubPages = subscribeFirestoreLandingPages((list) => {
      if (list && list.length > 0) setLandingPages(list);
    });

    const unsubCats = subscribeFirestoreCategories((list) => {
      if (list && list.length > 0) setCategories(list);
    });

    const unsubCoupons = subscribeFirestoreCoupons((list) => setCoupons(list));

    return () => {
      unsubCoupons();
      unsubAuth();
      unsubProducts();
      unsubArticles();
      unsubSettings();
      unsubPages();
      unsubCats();
    };
  }, []);

  const handleSaveProduct = async (product: Product) => {
    await saveProductToFirestore(product);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProductFromFirestore(id);
  };

  const handleSaveCategory = async (category: CustomCategory) => {
    await saveCategoryToFirestore(category);
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategoryFromFirestore(id);
  };

  const handleSaveCoupon = async (coupon: Coupon) => {
    await saveCouponToFirestore(coupon);
  };

  const handleDeleteCoupon = async (id: string) => {
    await deleteCouponFromFirestore(id);
  };

  const handleSaveLandingPage = async (page: CustomLandingPage) => {
    await saveLandingPageToFirestore(page);
  };

  const handleDeleteLandingPage = async (id: string) => {
    await deleteLandingPageFromFirestore(id);
  };

  const handleSaveArticle = async (article: Article) => {
    await saveArticleToFirestore(article);
  };

  const handleDeleteArticle = async (id: string) => {
    await deleteArticleFromFirestore(id);
  };

  const handleSaveSettings = async (newSettings: SiteSettings) => {
    await saveSettingsToFirestore(newSettings);
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        isAdmin: isUserAdmin(currentUser),
        authLoading,
        products,
        articles,
        settings,
        landingPages,
        categories,
        coupons,
        handleSaveCoupon,
        handleDeleteCoupon,
        handleSaveProduct,
        handleDeleteProduct,
        handleSaveCategory,
        handleDeleteCategory,
        handleSaveLandingPage,
        handleDeleteLandingPage,
        handleSaveArticle,
        handleDeleteArticle,
        handleSaveSettings,
        handleLogout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
