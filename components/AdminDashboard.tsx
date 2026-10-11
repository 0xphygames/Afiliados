'use client';

import React, { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { User } from 'firebase/auth';
import { Product, Article, SiteSettings, PlatformId, CustomLandingPage, CustomCategory } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import { exportProductsJson } from '@/lib/storage';
import {
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveArticleToFirestore,
  deleteArticleFromFirestore,
  saveSettingsToFirestore,
  saveLandingPageToFirestore,
  deleteLandingPageFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  seedDefaultProducts,
  seedDefaultArticles,
  loginWithGoogle,
  logoutUser,
} from '@/lib/firestore-products';
import { optimizeImageFile } from '@/lib/image-compress';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Link as LinkIcon,
  Sparkles,
  ExternalLink,
  Download,
  RotateCcw,
  CheckCircle2,
  ShoppingBag,
  Database,
  Lock,
  LogIn,
  LogOut,
  FileText,
  Sliders,
  Layout,
  Search,
  Eye,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Tag,
  Layers,
  BarChart3,
  TrendingUp,
  Percent,
  Clock,
  Flame,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Smartphone,
  Activity,
} from 'lucide-react';
import { BlogContentEditor } from './BlogContentEditor';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  articles: Article[];
  settings: SiteSettings;
  landingPages: CustomLandingPage[];
  categories: CustomCategory[];
  currentUser: User | null;
  onSuccessSave?: () => void;
}

const DEFAULT_CATEGORIES = [
  'Vestuário',
  'Suplementos',
  'Musculação',
  'Natal',
  'Dia das Crianças',
  'Guloseimas',
  'Casa & Decoração',
  'Beleza & Skincare',
  'Calçados & Bolsas',
  'Acessórios & Bijoux',
  'Eletrônicos & Casa',
];

const PRESET_IMAGES = [
  { label: 'Look Elegante / Vestuário', url: '/images/product_vestuario_conjunto_1791404036584.jpg' },
  { label: 'Suplemento Whey / Fitness', url: '/images/product_suplemento_whey_1791404045349.jpg' },
  { label: 'Decoração Natalina', url: '/images/product_natal_decoracao_1791404054900.jpg' },
  { label: 'Guloseimas Gourmet / Doces', url: '/images/product_guloseimas_doces_1791404064852.jpg' },
  { label: 'Coleção Lifestyle / Acessórios', url: '/images/hero_achadinhos_looks_1791404026649.jpg' },
];

export function AdminDashboard({
  isOpen,
  onClose,
  products,
  articles,
  settings,
  landingPages,
  categories,
  currentUser,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'pages' | 'articles' | 'settings' | 'backup'>('products');
  const [subTab, setSubTab] = useState<'list' | 'create'>('list');

  // Filter for products table
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [platformTableFilter, setPlatformTableFilter] = useState<PlatformId | 'all'>('all');
  const [onlyNeedsReview, setOnlyNeedsReview] = useState(false);

  // Product form state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodPlatform, setProdPlatform] = useState<PlatformId>('shopee');
  const [prodCategory, setProdCategory] = useState('Vestuário');
  const [prodCustomCategory, setProdCustomCategory] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('/images/product_vestuario_conjunto_1791404036584.jpg');
  const [prodAffiliateUrl, setProdAffiliateUrl] = useState('https://shopee.com.br/');
  const [prodPrice, setProdPrice] = useState<number>(49.9);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number | undefined>(89.9);
  const [prodBadge, setProdBadge] = useState('Destaque');
  const [prodTamiresTip, setProdTamiresTip] = useState('Aprovado pela Tamires: acabamento impecável e envio super rápido!');
  const [prodRating, setProdRating] = useState(4.9);
  const [prodReviewCount, setProdReviewCount] = useState(350);

  // Article form state
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState('Guia de Compras');
  const [artSummary, setArtSummary] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artCoverUrl, setArtCoverUrl] = useState('/images/hero_achadinhos_looks_1791404026649.jpg');
  const [artFeatured, setArtFeatured] = useState(true);

  // Landing page form state
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageHeadline, setPageHeadline] = useState('');
  const [pageSubheading, setPageSubheading] = useState('');
  const [pagePlatform, setPagePlatform] = useState<PlatformId | 'all'>('all');
  const [pageCategory, setPageCategory] = useState('Vestuário');
  const [pageBadge, setPageBadge] = useState('Campanha Especial');
  const [pageBannerUrl, setPageBannerUrl] = useState('/images/hero_achadinhos_looks_1791404026649.jpg');
  const [pageIsActive, setPageIsActive] = useState(true);

  // Bottom of Funnel (Fundo de Funil) states
  const [pageCountdownActive, setPageCountdownActive] = useState(false);
  const [pageCountdownEnd, setPageCountdownEnd] = useState('');
  const [pageScarcityText, setPageScarcityText] = useState('');
  const [pageGuaranteeText, setPageGuaranteeText] = useState('Garantia Incondicional de 7 Dias · Compra 100% Blindada');
  const [pageRatingScore, setPageRatingScore] = useState(4.9);
  const [pageTestimonials, setPageTestimonials] = useState<Array<{ name: string; text: string; rating?: number; role?: string }>>([
    { name: 'Camila Ribeiro', role: 'Compradora Verificada', rating: 5, text: 'O produto chegou super rápido e tem qualidade impecável!' },
    { name: 'Mariana Duarte', role: 'Seguidora VIP', rating: 5, text: 'Aproveitei o cupom da Tamires e economizei bastante!' },
  ]);
  const [pageFaqs, setPageFaqs] = useState<Array<{ question: string; answer: string }>>([
    { question: 'O link direciona para a loja oficial com segurança?', answer: 'Sim, direciona diretamente para o aplicativo oficial do marketplace com proteção total.' },
    { question: 'Como funciona a garantia de 7 dias?', answer: 'Você tem garantia legal incondicional de 7 dias para devolução ou troca gratuita.' },
  ]);
  const [pageStickyMobileCta, setPageStickyMobileCta] = useState(true);
  const [pageCtaText, setPageCtaText] = useState('Garantir Oferta Agora com Desconto');
  const [pageCtaUrl, setPageCtaUrl] = useState('');
  const [pageFacebookPixelId, setPageFacebookPixelId] = useState('');
  const [pageGoogleAnalyticsId, setPageGoogleAnalyticsId] = useState('');
  const [pageAdvancedTrackingOpen, setPageAdvancedTrackingOpen] = useState(false);

  // Category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatPlatform, setNewCatPlatform] = useState<PlatformId | 'all'>('all');

  // Page settings state
  const [setHeadline, setSetHeadline] = useState(settings.heroHeadline);
  const [setSubheading, setSetSubheading] = useState(settings.heroSubheading);
  const [setBannerNotice, setSetBannerNotice] = useState(settings.topBannerNotice);
  const [setWhatsappUrl, setSetWhatsappUrl] = useState(settings.whatsappUrl);

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageBannerInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    try {
      await loginWithGoogle();
      showToast('Login realizado com sucesso! Bem-vinda, Tamires.');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        showToast('Falha no login com Google. Tente novamente.', 'error');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Sessão encerrada.');
    } catch (e) {
      console.error(e);
    }
  };

  // Dynamic Metrics Computation
  const metrics = useMemo(() => {
    const totalCount = products.length;
    const shopeeCount = products.filter((p) => p.platform === 'shopee').length;
    const sheinCount = products.filter((p) => p.platform === 'shein').length;
    const mlCount = products.filter((p) => p.platform === 'mercadolivre').length;
    const amazonCount = products.filter((p) => p.platform === 'amazon').length;

    const avgPrice = totalCount > 0 ? products.reduce((acc, p) => acc + p.price, 0) / totalCount : 0;
    
    // Check links that might need review (empty or generic home link)
    const linksNeedingReview = products.filter(
      (p) => !p.affiliateUrl || p.affiliateUrl === 'https://shopee.com.br/' || p.affiliateUrl === 'https://www.shein.com/'
    );

    return {
      totalCount,
      shopeeCount,
      sheinCount,
      mlCount,
      amazonCount,
      avgPrice,
      needsReviewCount: linksNeedingReview.length,
    };
  }, [products]);

  // Combined categories list for dropdowns
  const allCategoryNames = useMemo(() => {
    const customNames = categories.map((c) => c.name);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...customNames]));
  }, [categories]);

  // Filtered products list for admin review
  const tableProducts = useMemo(() => {
    return products.filter((p) => {
      if (platformTableFilter !== 'all' && p.platform !== platformTableFilter) return false;
      if (onlyNeedsReview && !(p.affiliateUrl === 'https://shopee.com.br/' || !p.affiliateUrl)) return false;
      if (searchTableQuery.trim()) {
        const q = searchTableQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.affiliateUrl.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, platformTableFilter, onlyNeedsReview, searchTableQuery]);

  if (!isOpen) return null;

  // Start editing a product
  const startEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdTitle(p.title);
    setProdPlatform(p.platform);
    if (allCategoryNames.includes(p.category)) {
      setProdCategory(p.category);
      setProdCustomCategory('');
    } else {
      setProdCategory('Outro');
      setProdCustomCategory(p.category);
    }
    setProdImageUrl(p.imageUrl);
    setProdAffiliateUrl(p.affiliateUrl);
    setProdPrice(p.price);
    setProdOriginalPrice(p.originalPrice);
    setProdBadge(p.badge || '');
    setProdTamiresTip(p.tamiresTip || '');
    setProdRating(p.rating);
    setProdReviewCount(p.reviewCount);
    setSubTab('create');
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProdTitle('');
    setProdPlatform('shopee');
    setProdCategory('Vestuário');
    setProdCustomCategory('');
    setProdImageUrl('/images/product_vestuario_conjunto_1791404036584.jpg');
    setProdAffiliateUrl('https://shopee.com.br/');
    setProdPrice(49.9);
    setProdOriginalPrice(89.9);
    setProdBadge('Destaque');
    setProdTamiresTip('Aprovado pela Tamires: acabamento impecável e envio super rápido!');
  };

  // Submit product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim() || !prodAffiliateUrl.trim()) {
      showToast('Preencha o título e o link de afiliado!', 'error');
      return;
    }

    setSaving(true);
    const finalCategory = prodCategory === 'Outro' && prodCustomCategory.trim() ? prodCustomCategory.trim() : prodCategory;

    const newProd: Product = {
      id: editingProductId || `prod-${Date.now()}`,
      title: prodTitle.trim(),
      platform: prodPlatform,
      category: finalCategory,
      imageUrl: prodImageUrl.trim() || '/images/hero_achadinhos_looks_1791404026649.jpg',
      affiliateUrl: prodAffiliateUrl.trim(),
      price: Number(prodPrice) || 0,
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
      badge: prodBadge.trim() || undefined,
      tamiresTip: prodTamiresTip.trim() || undefined,
      rating: Number(prodRating) || 5.0,
      reviewCount: Number(prodReviewCount) || 1,
      createdAt: editingProductId ? (products.find((x) => x.id === editingProductId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };

    try {
      await saveProductToFirestore(newProd);
      showToast(editingProductId ? 'Achadinho atualizado no banco em nuvem!' : 'Novo achadinho publicado com sucesso no banco!');
      resetProductForm();
      setSubTab('list');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar no banco. Verifique se está autenticada.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${title}" do banco em nuvem?`)) return;
    try {
      await deleteProductFromFirestore(id);
      showToast('Achadinho excluído do banco de dados.');
    } catch (e) {
      console.error(e);
      showToast('Erro ao excluir produto.', 'error');
    }
  };

  // Landing Page CRUD
  const resetPageForm = () => {
    setEditingPageId(null);
    setPageTitle('');
    setPageSlug('');
    setPageHeadline('');
    setPageSubheading('');
    setPagePlatform('all');
    setPageCategory('Vestuário');
    setPageBadge('ÚLTIMAS UNIDADES');
    setPageBannerUrl('/images/hero_achadinhos_looks_1791404026649.jpg');
    setPageIsActive(true);

    setPageCountdownActive(false);
    setPageCountdownEnd('');
    setPageScarcityText('');
    setPageGuaranteeText('Garantia Incondicional de 7 Dias · Compra 100% Blindada');
    setPageRatingScore(4.9);
    setPageTestimonials([
      { name: 'Camila Ribeiro', role: 'Compradora Verificada', rating: 5, text: 'O produto chegou super rápido e tem qualidade impecável!' },
      { name: 'Mariana Duarte', role: 'Seguidora VIP', rating: 5, text: 'Aproveitei o cupom da Tamires e economizei bastante!' },
    ]);
    setPageFaqs([
      { question: 'O link direciona para a loja oficial com segurança?', answer: 'Sim, direciona diretamente para o aplicativo oficial do marketplace com proteção total.' },
      { question: 'Como funciona a garantia de 7 dias?', answer: 'Você tem garantia legal incondicional de 7 dias para devolução ou troca gratuita.' },
    ]);
    setPageStickyMobileCta(true);
    setPageCtaText('Garantir Oferta Agora com Desconto');
    setPageCtaUrl('');
    setPageFacebookPixelId('');
    setPageGoogleAnalyticsId('');
    setPageAdvancedTrackingOpen(false);
  };

  const startEditPage = (page: CustomLandingPage) => {
    setEditingPageId(page.id);
    setPageTitle(page.title);
    setPageSlug(page.slug);
    setPageHeadline(page.headline || '');
    setPageSubheading(page.subheading || '');
    setPagePlatform(page.platform || 'all');
    setPageCategory(page.category || 'Vestuário');
    setPageBadge(page.badge || 'PROMOÇÃO IMPERDÍVEL');
    setPageBannerUrl(page.bannerImageUrl || '/images/hero_achadinhos_looks_1791404026649.jpg');
    setPageIsActive(page.isActive !== false);

    setPageCountdownActive(Boolean(page.countdownActive));
    setPageCountdownEnd(page.countdownEnd || '');
    setPageScarcityText(page.scarcityText || '');
    setPageGuaranteeText(page.guaranteeText || 'Garantia Incondicional de 7 Dias · Compra 100% Blindada');
    setPageRatingScore(page.ratingScore ?? 4.9);
    setPageTestimonials(page.testimonials && page.testimonials.length > 0 ? page.testimonials : [
      { name: 'Camila Ribeiro', role: 'Compradora Verificada', rating: 5, text: 'O produto chegou super rápido e tem qualidade impecável!' },
      { name: 'Mariana Duarte', role: 'Seguidora VIP', rating: 5, text: 'Aproveitei o cupom da Tamires e economizei bastante!' },
    ]);
    setPageFaqs(page.faqs && page.faqs.length > 0 ? page.faqs : [
      { question: 'O link direciona para a loja oficial com segurança?', answer: 'Sim, direciona diretamente para o app oficial do marketplace com proteção total.' },
      { question: 'Como funciona a garantia de 7 dias?', answer: 'Você tem garantia legal de 7 dias para devolução ou troca gratuita.' },
    ]);
    setPageStickyMobileCta(page.stickyMobileCta !== false);
    setPageCtaText(page.ctaText || 'Garantir Oferta Agora com Desconto');
    setPageCtaUrl(page.ctaUrl || '');
    setPageFacebookPixelId(page.facebookPixelId || '');
    setPageGoogleAnalyticsId(page.googleAnalyticsId || '');
    setPageAdvancedTrackingOpen(Boolean(page.facebookPixelId || page.googleAnalyticsId));
    setSubTab('create');
  };

  const handleSaveLandingPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle.trim() || !pageSlug.trim()) {
      showToast('Preencha o título e o link/slug da página!', 'error');
      return;
    }

    setSaving(true);
    const newPage: CustomLandingPage = {
      id: editingPageId || `page-${Date.now()}`,
      title: pageTitle.trim(),
      slug: pageSlug.trim().toLowerCase().replace(/\s+/g, '-'),
      headline: pageHeadline.trim() || pageTitle.trim(),
      subheading: pageSubheading.trim(),
      platform: pagePlatform,
      category: pageCategory,
      badge: pageBadge.trim() || undefined,
      bannerImageUrl: pageBannerUrl.trim(),
      isActive: pageIsActive,
      createdAt: editingPageId ? (landingPages.find((x) => x.id === editingPageId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),

      // Funnel & Conversion fields
      countdownActive: pageCountdownActive,
      countdownEnd: pageCountdownEnd.trim() || undefined,
      scarcityText: pageScarcityText.trim() || undefined,
      guaranteeText: pageGuaranteeText.trim() || undefined,
      ratingScore: Number(pageRatingScore) || 4.9,
      testimonials: pageTestimonials.filter((t) => t.name.trim() && t.text.trim()),
      faqs: pageFaqs.filter((f) => f.question.trim() && f.answer.trim()),
      stickyMobileCta: pageStickyMobileCta,
      ctaText: pageCtaText.trim() || 'Garantir Oferta Agora com Desconto',
      ctaUrl: pageCtaUrl.trim() || undefined,
      facebookPixelId: pageFacebookPixelId.trim() || undefined,
      googleAnalyticsId: pageGoogleAnalyticsId.trim() || undefined,
    };

    try {
      await saveLandingPageToFirestore(newPage);
      showToast(editingPageId ? 'Campanha / Landing page atualizada no banco!' : 'Nova campanha publicada com sucesso!');
      resetPageForm();
      setSubTab('list');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar página no banco.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLandingPage = async (id: string, title: string) => {
    if (!confirm(`Deseja excluir a página "${title}" do banco de dados?`)) return;
    try {
      await deleteLandingPageFromFirestore(id);
      showToast('Página excluída do banco.');
    } catch (e) {
      console.error(e);
      showToast('Erro ao excluir página.', 'error');
    }
  };

  // Category CRUD
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSaving(true);
    const catId = `cat-${Date.now()}`;
    const newCat: CustomCategory = {
      id: catId,
      name: newCatName.trim(),
      platform: newCatPlatform,
      icon: 'Tag',
      createdAt: new Date().toISOString(),
    };

    try {
      await saveCategoryToFirestore(newCat);
      showToast(`Categoria "${newCat.name}" adicionada ao banco e à vitrine!`);
      setNewCatName('');
    } catch (err) {
      console.error(err);
      showToast('Erro ao adicionar categoria.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Deseja remover a categoria "${name}"?`)) return;
    try {
      await deleteCategoryFromFirestore(id);
      showToast(`Categoria "${name}" removida.`);
    } catch (err) {
      console.error(err);
      showToast('Erro ao remover categoria.', 'error');
    }
  };

  // Article CRUD
  const startEditArticle = (art: Article) => {
    setEditingArticleId(art.id);
    setArtTitle(art.title);
    setArtCategory(art.category);
    setArtSummary(art.summary);
    setArtContent(art.content);
    setArtCoverUrl(art.coverImageUrl || '/images/hero_achadinhos_looks_1791404026649.jpg');
    setArtFeatured(Boolean(art.featured));
    setSubTab('create');
  };

  const resetArticleForm = () => {
    setEditingArticleId(null);
    setArtTitle('');
    setArtCategory('Guia de Compras');
    setArtSummary('');
    setArtContent('');
    setArtCoverUrl('/images/hero_achadinhos_looks_1791404026649.jpg');
    setArtFeatured(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim() || !artContent.trim()) {
      showToast('Preencha o título e o conteúdo do artigo!', 'error');
      return;
    }

    setSaving(true);
    const newArt: Article = {
      id: editingArticleId || `art-${Date.now()}`,
      title: artTitle.trim(),
      category: artCategory.trim() || 'Guia de Compras',
      summary: artSummary.trim() || artTitle.trim(),
      content: artContent.trim(),
      coverImageUrl: artCoverUrl.trim() || '/images/hero_achadinhos_looks_1791404026649.jpg',
      author: 'Tamires Santos',
      featured: artFeatured,
      createdAt: editingArticleId ? (articles.find((x) => x.id === editingArticleId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };

    try {
      await saveArticleToFirestore(newArt);
      showToast(editingArticleId ? 'Artigo atualizado com sucesso!' : 'Novo artigo publicado no blog!');
      resetArticleForm();
      setSubTab('list');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar artigo no banco.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Deseja excluir o artigo "${title}"?`)) return;
    try {
      await deleteArticleFromFirestore(id);
      showToast('Artigo excluído do banco de dados.');
    } catch (e) {
      console.error(e);
      showToast('Erro ao excluir artigo.', 'error');
    }
  };

  // Save page settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updated: SiteSettings = {
      heroHeadline: setHeadline.trim() || settings.heroHeadline,
      heroSubheading: setSubheading.trim() || settings.heroSubheading,
      topBannerNotice: setBannerNotice.trim() || settings.topBannerNotice,
      whatsappUrl: setWhatsappUrl.trim() || settings.whatsappUrl,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveSettingsToFirestore(updated);
      showToast('Textos e páginas atualizados com sucesso no site público!');
    } catch (e) {
      console.error(e);
      showToast('Erro ao salvar configurações.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-5xl bg-white h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Top Bar of Dashboard */}
        <header className="p-4 sm:p-5 border-b border-stone-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              TS
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-stone-900 truncate">
                  Dashboard de Gestão & Afiliados · Tamires Santos
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  <Database className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Firestore Conectado</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 truncate">
                {currentUser ? `Logada como ${currentUser.email}` : 'Painel de Administração Oficial'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentUser && (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors"
                title="Sair da conta"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
              title="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Global Toast Alert */}
        {notice && (
          <div
            className={`mx-5 mt-3 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-fade-in ${
              notice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notice.msg}</span>
          </div>
        )}

        {/* Auth Barrier: If not logged in, prompt Google Login */}
        {!currentUser ? (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-stone-900 text-white flex items-center justify-center shadow-md mb-4">
              <Lock className="w-8 h-8 text-amber-300" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              Acesso Restrito da Administradora
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed mb-6">
              Para cadastrar e alterar produtos, publicar artigos ou criar novas páginas de campanha no banco de dados com segurança, 
              faça login com a sua conta Google oficial.
            </p>

            <button
              onClick={handleGoogleLogin}
              disabled={loginLoading}
              className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 group"
            >
              <LogIn className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>{loginLoading ? 'Conectando...' : 'Entrar com Conta Google'}</span>
            </button>

            <p className="text-[11px] text-stone-400 mt-4">
              Qualquer alteração feita por aqui sobe instantaneamente para o site oficial na internet.
            </p>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Dynamic Affiliate Intelligence & KPI Bar */}
            <div className="bg-stone-50/80 border-b border-stone-200 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                    Total Produtos
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-bold text-stone-900 tabular-nums">
                      {metrics.totalCount}
                    </span>
                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                    🧡 Shopee
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-bold text-[#EE4D2D] tabular-nums">
                      {metrics.shopeeCount}
                    </span>
                    <span className="text-[10px] text-stone-400 font-semibold">Itens</span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                    🖤 Shein
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-bold text-stone-900 tabular-nums">
                      {metrics.sheinCount}
                    </span>
                    <span className="text-[10px] text-stone-400 font-semibold">Itens</span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                    💛 Mercado Livre
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-bold text-amber-600 tabular-nums">
                      {metrics.mlCount}
                    </span>
                    <span className="text-[10px] text-stone-400 font-semibold">Itens</span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                    📦 Amazon
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-bold text-[#232F3E] tabular-nums">
                      {metrics.amazonCount}
                    </span>
                    <span className="text-[10px] text-stone-400 font-semibold">Itens</span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                    🔗 Links & Auditoria
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-emerald-700">
                      100% Ativos
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 px-5 pt-2 border-b border-stone-200 bg-stone-50 overflow-x-auto no-scrollbar">
              <button
                onClick={() => {
                  setActiveTab('products');
                  setSubTab('list');
                }}
                className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Achadinhos & Produtos ({products.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('categories');
                  setSubTab('list');
                }}
                className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Categorias & Setores ({allCategoryNames.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('pages');
                  setSubTab('list');
                }}
                className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'pages'
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Páginas & Campanhas ({landingPages.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('articles');
                  setSubTab('list');
                }}
                className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'articles'
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Posts & Artigos ({articles.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Layout className="w-4 h-4" />
                <span>Textos do Site</span>
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'backup'
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Banco & Backups</span>
              </button>
            </nav>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
              {/* TAB 1: PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  {/* Sub-navigation for products */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSubTab('list');
                          resetProductForm();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          subTab === 'list'
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Ver Todos ({products.length})
                      </button>

                      <button
                        onClick={() => {
                          resetProductForm();
                          setSubTab('create');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          subTab === 'create'
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Cadastrar Novo Achadinho</span>
                      </button>
                    </div>

                    {subTab === 'list' && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-48">
                          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={searchTableQuery}
                            onChange={(e) => setSearchTableQuery(e.target.value)}
                            placeholder="Filtrar achado..."
                            className="w-full pl-8 pr-3 py-1 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                          />
                        </div>

                        <select
                          value={platformTableFilter}
                          onChange={(e) => setPlatformTableFilter(e.target.value as any)}
                          className="text-xs border border-stone-300 rounded-lg px-2 py-1 bg-white focus:outline-none"
                        >
                          <option value="all">Todas as Lojas</option>
                          <option value="shopee">Shopee</option>
                          <option value="shein">Shein</option>
                          <option value="mercadolivre">Mercado Livre</option>
                          <option value="amazon">Amazon</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {subTab === 'list' ? (
                    /* Products Table List */
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                      {tableProducts.map((p) => {
                        const pCfg = PLATFORMS[p.platform];
                        return (
                          <div
                            key={p.id}
                            className="p-3.5 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-14 h-14 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                                {p.imageUrl ? (
                                  <Image
                                    src={p.imageUrl}
                                    alt={p.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                                    <ShoppingBag className="w-5 h-5" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 text-[11px]">
                                  <span
                                    style={{ color: pCfg?.color }}
                                    className="font-bold uppercase tracking-wider"
                                  >
                                    {pCfg?.name}
                                  </span>
                                  <span className="text-stone-300">·</span>
                                  <span className="text-stone-500 truncate">{p.category}</span>
                                </div>
                                <h4 className="text-xs font-bold text-stone-900 truncate">
                                  {p.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                                  <span className="text-stone-900 font-bold tabular-nums">
                                    R$ {p.price.toFixed(2)}
                                  </span>
                                  {p.badge && (
                                    <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 rounded">
                                      {p.badge}
                                    </span>
                                  )}
                                  <a
                                    href={p.affiliateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-amber-800 hover:underline flex items-center gap-0.5 ml-2 font-mono"
                                    title="Testar link de afiliado"
                                  >
                                    <LinkIcon className="w-2.5 h-2.5" />
                                    <span>Testar Link</span>
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => startEditProduct(p)}
                                className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200 shadow-xs"
                                title="Editar no banco"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.title)}
                                className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 shadow-xs"
                                title="Excluir do banco"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Product Create/Edit Form */
                    <form onSubmit={handleSaveProduct} className="space-y-5 max-w-2xl bg-white">
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">
                          {editingProductId ? 'Editando Achadinho Existente' : 'Cadastrando Novo Achadinho'}
                        </span>
                        {editingProductId && (
                          <button
                            type="button"
                            onClick={resetProductForm}
                            className="text-xs text-stone-500 hover:text-stone-900 underline"
                          >
                            Voltar para novo
                          </button>
                        )}
                      </div>

                      {/* Store */}
                      <div>
                        <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                          1. Em qual loja o cliente vai comprar?
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {(['shopee', 'shein', 'mercadolivre', 'amazon'] as PlatformId[]).map((pId) => {
                            const cfg = PLATFORMS[pId];
                            const isSelected = prodPlatform === pId;
                            return (
                              <button
                                type="button"
                                key={pId}
                                onClick={() => setProdPlatform(pId)}
                                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all flex flex-col items-center gap-1 ${
                                  isSelected
                                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                                }`}
                              >
                                <span>{cfg.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                          2. Setor / Categoria
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {allCategoryNames.map((cat) => (
                            <button
                              type="button"
                              key={cat}
                              onClick={() => {
                                setProdCategory(cat);
                                setProdCustomCategory('');
                              }}
                              className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                                prodCategory === cat
                                  ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setProdCategory('Outro')}
                            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                              prodCategory === 'Outro'
                                ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            + Outro Setor
                          </button>
                        </div>

                        {prodCategory === 'Outro' && (
                          <input
                            type="text"
                            value={prodCustomCategory}
                            onChange={(e) => setProdCustomCategory(e.target.value)}
                            placeholder="Digite o nome do novo setor..."
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none"
                            required
                          />
                        )}
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                          3. Título / Nome do Produto
                        </label>
                        <input
                          type="text"
                          value={prodTitle}
                          onChange={(e) => setProdTitle(e.target.value)}
                          placeholder="Ex: Conjunto Modal Canelado Feminino 2 Peças"
                          className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-none"
                          required
                        />
                      </div>

                      {/* Affiliate Link */}
                      <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                            <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
                            <span>4. Seu Link de Afiliado Oficial (Gera sua Comissão)</span>
                          </label>
                          {prodAffiliateUrl && (
                            <a
                              href={prodAffiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-amber-900 hover:underline flex items-center gap-1 font-bold"
                            >
                              <span>Testar link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <input
                          type="url"
                          value={prodAffiliateUrl}
                          onChange={(e) => setProdAffiliateUrl(e.target.value)}
                          placeholder="Cole seu link de afiliada: https://s.shopee.com.br/... ou https://..."
                          className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-none font-mono"
                          required
                        />
                      </div>

                      {/* Photo */}
                      <div>
                        <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                          5. Foto do Produto (Link ou Foto do Celular/PC)
                        </label>
                        <div className="space-y-2.5">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={prodImageUrl}
                              onChange={(e) => setProdImageUrl(e.target.value)}
                              placeholder="Cole o link da foto (URL) ou clique em Upload ao lado"
                              className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3.5 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1.5 text-stone-800 transition-colors shadow-xs"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Foto</span>
                            </button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const optimized = await optimizeImageFile(file, 1200, 0.85);
                                    setProdImageUrl(optimized);
                                  } catch (err) {
                                    const r = new FileReader();
                                    r.onloadend = () => setProdImageUrl(r.result as string);
                                    r.readAsDataURL(file);
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </div>

                          {prodImageUrl && (
                            <div className="relative aspect-square w-48 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 flex items-center justify-center">
                              <Image
                                src={prodImageUrl}
                                alt="Pré-visualização"
                                fill
                                className="object-contain p-2"
                                referrerPolicy="no-referrer"
                                unoptimized
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prices */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                            Preço com Desconto (Por R$)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={prodPrice}
                            onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none tabular-nums font-semibold"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                            Preço Original (De R$)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={prodOriginalPrice ?? ''}
                            onChange={(e) =>
                              setProdOriginalPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                            }
                            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none tabular-nums"
                          />
                        </div>
                      </div>

                      {/* Badge and Tip */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                            Selo de Destaque
                          </label>
                          <input
                            type="text"
                            value={prodBadge}
                            onChange={(e) => setProdBadge(e.target.value)}
                            placeholder="Ex: Mais Vendido, Frete Grátis..."
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Dica Pessoal da Tamires</span>
                          </label>
                          <input
                            type="text"
                            value={prodTamiresTip}
                            onChange={(e) => setProdTamiresTip(e.target.value)}
                            placeholder="Ex: Veste super bem, pegue seu tamanho habitual!"
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-3 flex gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex-1 py-3 px-5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          <span>{saving ? 'Gravando no Banco...' : editingProductId ? 'Atualizar no Banco de Dados' : 'Publicar no Banco em Nuvem'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSubTab('list')}
                          className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200"
                        >
                          Voltar à Lista
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: CATEGORIES & SECTORS */}
              {activeTab === 'categories' && (
                <div className="space-y-6 max-w-3xl">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Gerenciar Setores e Categorias
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Crie novas categorias para organizar seus achadinhos. Elas aparecem instantaneamente na barra de navegação da vitrine.
                    </p>
                  </div>

                  {/* Add New Category Form */}
                  <form onSubmit={handleAddCategory} className="p-4 bg-white border border-stone-200 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-amber-600" />
                      <span>Cadastrar Novo Setor / Categoria</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Nome da Categoria
                        </label>
                        <input
                          type="text"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="Ex: Guloseimas, Dia das Mães, Calçados..."
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Loja Vinculada
                        </label>
                        <select
                          value={newCatPlatform}
                          onChange={(e) => setNewCatPlatform(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                        >
                          <option value="all">Todas as Lojas</option>
                          <option value="shopee">Shopee</option>
                          <option value="shein">Shein</option>
                          <option value="mercadolivre">Mercado Livre</option>
                          <option value="amazon">Amazon</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-300" />
                      <span>Adicionar Categoria</span>
                    </button>
                  </form>

                  {/* List of active categories */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-stone-900">
                      Categorias Ativas no Sistema ({allCategoryNames.length})
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {allCategoryNames.map((catName) => {
                        const customMatch = categories.find((c) => c.name === catName);
                        const countInProducts = products.filter((p) => p.category === catName).length;

                        return (
                          <div
                            key={catName}
                            className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 hover:bg-stone-100/60 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Tag className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                              <span className="text-xs font-bold text-stone-900 truncate">
                                {catName}
                              </span>
                              <span className="text-[10px] text-stone-500 bg-stone-200 px-1.5 py-0.2 rounded-full tabular-nums">
                                {countInProducts} produtos
                              </span>
                            </div>

                            {customMatch && (
                              <button
                                onClick={() => handleDeleteCategory(customMatch.id, customMatch.name)}
                                className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                title="Excluir categoria personalizada"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LANDING PAGES & CAMPAIGNS */}
              {activeTab === 'pages' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSubTab('list');
                          resetPageForm();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          subTab === 'list'
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Páginas Ativas ({landingPages.length})
                      </button>

                      <button
                        onClick={() => {
                          resetPageForm();
                          setSubTab('create');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          subTab === 'create'
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Criar Nova Landing Page / Campanha</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-stone-500 hidden sm:inline">
                      Crie páginas dedicadas para datas sazonais ou coleções virais
                    </span>
                  </div>

                  {subTab === 'list' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {landingPages.map((lp) => (
                        <div
                          key={lp.id}
                          className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs flex flex-col justify-between"
                        >
                          <div className="relative h-28 bg-stone-100">
                            {lp.bannerImageUrl ? (
                              <Image
                                src={lp.bannerImageUrl}
                                alt={lp.title}
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                                unoptimized
                              />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-3 right-3 text-white">
                              <span className="text-[10px] font-bold bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded mr-1.5">
                                {lp.badge || 'Campanha'}
                              </span>
                              <h4 className="text-xs font-bold truncate mt-1">
                                {lp.title}
                              </h4>
                            </div>
                          </div>

                          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="text-[11px] text-stone-600 line-clamp-2">
                                {lp.subheading || lp.headline}
                              </p>
                              <div className="mt-2 text-[10px] text-stone-400 font-mono">
                                Slug: /{lp.slug} · Setor: {lp.category || 'Geral'}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                              <span className={`text-[10px] font-bold ${lp.isActive ? 'text-emerald-700' : 'text-stone-400'}`}>
                                {lp.isActive ? '● Ativa na Vitrine' : '○ Inativa'}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditPage(lp)}
                                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                                  title="Editar página"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLandingPage(lp.id, lp.title)}
                                  className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                                  title="Excluir página"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Create / Edit Landing Page Form (Bottom of Funnel Conversion Builder) */
                    <form onSubmit={handleSaveLandingPage} className="space-y-6 max-w-3xl bg-white">
                      <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-1">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                          <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                            {editingPageId ? 'Editando Campanha de Fundo de Funil' : 'Criar Nova Campanha de Alta Conversão'}
                          </h4>
                        </div>
                        <p className="text-xs text-amber-900">
                          Configure gatilhos de urgência, escassez, prova social e botões de compra para maximizar conversões.
                        </p>
                      </div>

                      {/* 1. Informações Básicas */}
                      <div className="space-y-4 p-4 bg-stone-50/70 rounded-2xl border border-stone-200">
                        <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-stone-500" />
                          <span>1. Identificação da Campanha & Headline</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                              Nome Interno da Campanha
                            </label>
                            <input
                              type="text"
                              value={pageTitle}
                              onChange={(e) => {
                                setPageTitle(e.target.value);
                                if (!editingPageId) {
                                  setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                                }
                              }}
                              placeholder="Ex: Especial Looks de Verão"
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                              Identificador / Slug URL (/campanha/slug)
                            </label>
                            <input
                              type="text"
                              value={pageSlug}
                              onChange={(e) => setPageSlug(e.target.value)}
                              placeholder="ex: looks-de-verao"
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono bg-white"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                            Título Principal no Banner (Headline de Conversão)
                          </label>
                          <input
                            type="text"
                            value={pageHeadline}
                            onChange={(e) => setPageHeadline(e.target.value)}
                            placeholder="Ex: Vestidos, Conjuntos e Alfaiataria que Vestem Perfeito"
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                            Subtítulo Explicativo (Quebra de Objeção)
                          </label>
                          <textarea
                            rows={2}
                            value={pageSubheading}
                            onChange={(e) => setPageSubheading(e.target.value)}
                            placeholder="Garantia de originalidade ou seu dinheiro de volta + Frete Grátis para todo o Brasil."
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                          />
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            Dica de alta conversão: enfatize garantia de devolução, frete grátis ou autenticidade para destravar a compra.
                          </p>
                        </div>
                      </div>

                      {/* 2. Selos e Gatilhos Psicológicos de Conversão */}
                      <div className="space-y-4 p-4 bg-stone-50/70 rounded-2xl border border-stone-200">
                        <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                          <span>2. Selo de Destaque, Escassez & Garantia</span>
                        </h5>

                        {/* Selo Predefinido Agressivo */}
                        <div>
                          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                            Selo da Campanha (Foco em Conversão Agressiva)
                          </label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {[
                              'ÚLTIMAS UNIDADES',
                              'MENOR PREÇO DO ANO',
                              'PROMOÇÃO IMPERDÍVEL',
                              'OFERTA RELÂMPAGO',
                              'ESTOQUE CRÍTICO',
                              'TENDÊNCIA 2026',
                            ].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setPageBadge(preset)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                                  pageBadge === preset
                                    ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-xs'
                                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                                }`}
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={pageBadge}
                            onChange={(e) => setPageBadge(e.target.value)}
                            placeholder="Ou digite um selo personalizado..."
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                          />
                        </div>

                        {/* Gatilho de Escassez */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                              Gatilho de Escassez (Estoque Crítico)
                            </label>
                            <input
                              type="text"
                              value={pageScarcityText}
                              onChange={(e) => setPageScarcityText(e.target.value)}
                              placeholder="Ex: Restam apenas 7 unidades pelo valor promocional!"
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                              Selo de Garantia & Reembolso
                            </label>
                            <input
                              type="text"
                              value={pageGuaranteeText}
                              onChange={(e) => setPageGuaranteeText(e.target.value)}
                              placeholder="Ex: Garantia incondicional de 7 dias · Reembolso 100%"
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                        </div>

                        {/* Gatilho de Urgência (Cronômetro Regressivo) */}
                        <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pageCountdownActive}
                              onChange={(e) => setPageCountdownActive(e.target.checked)}
                              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                            />
                            <span className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-rose-600" />
                              <span>Ativar Cronômetro Regressivo (Gatilho de Urgência)</span>
                            </span>
                          </label>

                          {pageCountdownActive && (
                            <div className="pt-1">
                              <label className="block text-[11px] font-bold text-rose-900 mb-1">
                                Data e Hora de Término da Oferta
                              </label>
                              <input
                                type="datetime-local"
                                value={pageCountdownEnd}
                                onChange={(e) => setPageCountdownEnd(e.target.value)}
                                className="w-full sm:w-64 px-3 py-2 text-xs border border-rose-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                              />
                              <p className="text-[10px] text-rose-700 mt-1">
                                O relógio regressivo em tempo real será exibido em destaque no topo da página de campanha.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. Lojas, Setor e Mídia */}
                      <div className="space-y-4 p-4 bg-stone-50/70 rounded-2xl border border-stone-200">
                        <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-stone-500" />
                          <span>3. Vinculação de Loja, Categoria e Imagem</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                              Loja Alvo
                            </label>
                            <select
                              value={pagePlatform}
                              onChange={(e) => setPagePlatform(e.target.value as any)}
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                            >
                              <option value="all">Todas as Lojas</option>
                              <option value="shopee">Shopee</option>
                              <option value="shein">Shein</option>
                              <option value="mercadolivre">Mercado Livre</option>
                              <option value="amazon">Amazon</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                              Setor Vinculado
                            </label>
                            <select
                              value={pageCategory}
                              onChange={(e) => setPageCategory(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                            >
                              {allCategoryNames.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Banner Image with Auto Compression and Non-Cropping Preview */}
                        <div>
                          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                            Foto do Banner da Campanha
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={pageBannerUrl}
                              onChange={(e) => setPageBannerUrl(e.target.value)}
                              placeholder="Cole o link da foto ou selecione no botão ao lado..."
                              className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => pageBannerInputRef.current?.click()}
                              className="px-3.5 py-2 text-xs bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1.5 font-semibold text-stone-800 transition-colors"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Foto</span>
                            </button>
                            <input
                              ref={pageBannerInputRef}
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const opt = await optimizeImageFile(file, 1400, 0.85);
                                    setPageBannerUrl(opt);
                                  } catch (err) {
                                    const r = new FileReader();
                                    r.onloadend = () => setPageBannerUrl(r.result as string);
                                    r.readAsDataURL(file);
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </div>

                          {pageBannerUrl && (
                            <div className="mt-2.5 relative aspect-16/10 w-full max-w-sm rounded-xl overflow-hidden border border-stone-200 bg-stone-900 flex items-center justify-center">
                              <Image
                                src={pageBannerUrl}
                                alt="Pré-visualização do Banner"
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                                unoptimized
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 4. Prova Social (Depoimentos / Avaliações) */}
                      <div className="space-y-4 p-4 bg-stone-50/70 rounded-2xl border border-stone-200">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span>4. Prova Social (Depoimentos de Clientes)</span>
                          </h5>
                          <button
                            type="button"
                            onClick={() =>
                              setPageTestimonials([
                                ...pageTestimonials,
                                { name: '', role: 'Compradora Verificada', rating: 5, text: '' },
                              ])
                            }
                            className="px-2.5 py-1 text-[11px] font-bold text-stone-900 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Adicionar Depoimento</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {pageTestimonials.map((t, idx) => (
                            <div key={idx} className="p-3 bg-white border border-stone-200 rounded-xl space-y-2 relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setPageTestimonials(pageTestimonials.filter((_, i) => i !== idx))
                                }
                                className="absolute top-2 right-2 p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                                title="Remover depoimento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <div className="grid grid-cols-2 gap-2 pr-8">
                                <div>
                                  <label className="block text-[10px] font-bold text-stone-600 uppercase mb-0.5">
                                    Nome da Cliente
                                  </label>
                                  <input
                                    type="text"
                                    value={t.name}
                                    onChange={(e) => {
                                      const updated = [...pageTestimonials];
                                      updated[idx].name = e.target.value;
                                      setPageTestimonials(updated);
                                    }}
                                    placeholder="Ex: Amanda Silva"
                                    className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-stone-600 uppercase mb-0.5">
                                    Selo / Papel
                                  </label>
                                  <input
                                    type="text"
                                    value={t.role || ''}
                                    onChange={(e) => {
                                      const updated = [...pageTestimonials];
                                      updated[idx].role = e.target.value;
                                      setPageTestimonials(updated);
                                    }}
                                    placeholder="Ex: Compradora Verificada"
                                    className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-stone-600 uppercase mb-0.5">
                                  Texto da Avaliação / Depoimento
                                </label>
                                <textarea
                                  rows={2}
                                  value={t.text}
                                  onChange={(e) => {
                                    const updated = [...pageTestimonials];
                                    updated[idx].text = e.target.value;
                                    setPageTestimonials(updated);
                                  }}
                                  placeholder="Ex: O conjunto é perfeito, tecido grosso que não marca nada! Chegou antes do prazo."
                                  className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 5. Seção de FAQ (Perguntas Frequentes) */}
                      <div className="space-y-4 p-4 bg-stone-50/70 rounded-2xl border border-stone-200">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
                            <span>5. Perguntas Frequentes (FAQ de Fundo de Funil)</span>
                          </h5>
                          <button
                            type="button"
                            onClick={() =>
                              setPageFaqs([...pageFaqs, { question: '', answer: '' }])
                            }
                            className="px-2.5 py-1 text-[11px] font-bold text-stone-900 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Adicionar Pergunta</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {pageFaqs.map((faq, idx) => (
                            <div key={idx} className="p-3 bg-white border border-stone-200 rounded-xl space-y-2 relative">
                              <button
                                type="button"
                                onClick={() => setPageFaqs(pageFaqs.filter((_, i) => i !== idx))}
                                className="absolute top-2 right-2 p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                                title="Remover pergunta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <div className="pr-8">
                                <label className="block text-[10px] font-bold text-stone-600 uppercase mb-0.5">
                                  Pergunta Rápida
                                </label>
                                <input
                                  type="text"
                                  value={faq.question}
                                  onChange={(e) => {
                                    const updated = [...pageFaqs];
                                    updated[idx].question = e.target.value;
                                    setPageFaqs(updated);
                                  }}
                                  placeholder="Ex: Qual o prazo de entrega?"
                                  className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-stone-600 uppercase mb-0.5">
                                  Resposta Direta
                                </label>
                                <textarea
                                  rows={2}
                                  value={faq.answer}
                                  onChange={(e) => {
                                    const updated = [...pageFaqs];
                                    updated[idx].answer = e.target.value;
                                    setPageFaqs(updated);
                                  }}
                                  placeholder="Ex: Para pedidos com envio FULL, chega em até 24h na maioria das capitais."
                                  className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 6. Ações de Conversão & CTA Mobile Fixo */}
                      <div className="space-y-4 p-4 bg-stone-50/70 rounded-2xl border border-stone-200">
                        <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-stone-600" />
                          <span>6. Botão de CTA & Barra Flutuante Mobile</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                              Texto do Botão de Conversão (CTA)
                            </label>
                            <input
                              type="text"
                              value={pageCtaText}
                              onChange={(e) => setPageCtaText(e.target.value)}
                              placeholder="Ex: Garantir Oferta Agora com Desconto"
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                              Link de Destino / Link de Afiliada (Opcional)
                            </label>
                            <input
                              type="url"
                              value={pageCtaUrl}
                              onChange={(e) => setPageCtaUrl(e.target.value)}
                              placeholder="Ex: https://s.shopee.com.br/... ou deixe em branco"
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white font-mono"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={pageStickyMobileCta}
                            onChange={(e) => setPageStickyMobileCta(e.target.checked)}
                            className="w-4 h-4 rounded text-stone-900"
                          />
                          <span className="text-xs font-bold text-stone-800">
                            Fixar Botão de Compra no Rodapé no Mobile (Sticky CTA) enquanto o usuário rola a página
                          </span>
                        </label>
                      </div>

                      {/* 7. Configurações Avançadas de Rastreamento (Pixel & Analytics) */}
                      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => setPageAdvancedTrackingOpen(!pageAdvancedTrackingOpen)}
                          className="w-full p-4 text-left flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-stone-600" />
                            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                              Configurações Avançadas de Rastreamento (Pixel & Retargeting)
                            </span>
                          </div>
                          {pageAdvancedTrackingOpen ? (
                            <ChevronUp className="w-4 h-4 text-stone-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-stone-500" />
                          )}
                        </button>

                        {pageAdvancedTrackingOpen && (
                          <div className="p-4 space-y-4 border-t border-stone-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                                  ID do Meta / Facebook Pixel
                                </label>
                                <input
                                  type="text"
                                  value={pageFacebookPixelId}
                                  onChange={(e) => setPageFacebookPixelId(e.target.value)}
                                  placeholder="Ex: 123456789012345"
                                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono"
                                />
                                <p className="text-[10px] text-stone-500 mt-1">
                                  Dispara automaticamente o evento PageView para anúncios de Retargeting.
                                </p>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                                  Google Analytics Measurement ID
                                </label>
                                <input
                                  type="text"
                                  value={pageGoogleAnalyticsId}
                                  onChange={(e) => setPageGoogleAnalyticsId(e.target.value)}
                                  placeholder="Ex: G-XXXXXXXXXX"
                                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono"
                                />
                                <p className="text-[10px] text-stone-500 mt-1">
                                  Mensura tráfego e conversões de campanhas do Google Ads.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status Ativa / Inativa */}
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-stone-900">Visibilidade da Campanha</p>
                          <p className="text-[11px] text-stone-500">Publicar imediatamente na lista /campanha e vitrines</p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pageIsActive}
                            onChange={(e) => setPageIsActive(e.target.checked)}
                            className="w-4 h-4 rounded text-stone-900"
                          />
                          <span className="text-xs font-bold text-stone-800">
                            {pageIsActive ? 'Ativa' : 'Inativa'}
                          </span>
                        </label>
                      </div>

                      {/* Botões de Ação */}
                      <div className="pt-2 flex gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex-1 py-3.5 px-5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          <span>{saving ? 'Gravando no Banco...' : editingPageId ? 'Atualizar Campanha no Banco' : 'Salvar e Publicar Campanha de Alta Conversão'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSubTab('list')}
                          className="py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 4: ARTICLES & BLOG POSTS */}
              {activeTab === 'articles' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSubTab('list');
                          resetArticleForm();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          subTab === 'list'
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Ver Artigos Publicados ({articles.length})
                      </button>

                      <button
                        onClick={() => {
                          resetArticleForm();
                          setSubTab('create');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          subTab === 'create'
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Novo Post / Artigo</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-stone-500 hidden sm:inline">
                      Artigos aumentam a autoridade e as vendas de comissão
                    </span>
                  </div>

                  {subTab === 'list' ? (
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                      {articles.map((art) => (
                        <div
                          key={art.id}
                          className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-16 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                              {art.coverImageUrl ? (
                                <Image
                                  src={art.coverImageUrl}
                                  alt={art.title}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400">
                                  <FileText className="w-5 h-5" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                                {art.category}
                              </span>
                              <h4 className="text-xs font-bold text-stone-900 truncate">
                                {art.title}
                              </h4>
                              <p className="text-[11px] text-stone-500 line-clamp-1">
                                {art.summary}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => startEditArticle(art)}
                              className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200 shadow-xs"
                              title="Editar artigo"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(art.id, art.title)}
                              className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 shadow-xs"
                              title="Excluir artigo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Article Create/Edit Form */
                    <form onSubmit={handleSaveArticle} className="space-y-4 max-w-2xl bg-white">
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">
                          {editingArticleId ? 'Editando Artigo' : 'Escrever Novo Artigo / Guia de Compras'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                          Título do Post
                        </label>
                        <input
                          type="text"
                          value={artTitle}
                          onChange={(e) => setArtTitle(e.target.value)}
                          placeholder="Ex: Top 5 Melhores Suplementos Whey da Shopee que Funcionam"
                          className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                            Categoria do Artigo
                          </label>
                          <input
                            type="text"
                            value={artCategory}
                            onChange={(e) => setArtCategory(e.target.value)}
                            placeholder="Ex: Guia de Compras, Looks, Treino..."
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                            Foto de Capa (URL)
                          </label>
                          <input
                            type="text"
                            value={artCoverUrl}
                            onChange={(e) => setArtCoverUrl(e.target.value)}
                            placeholder="Link da foto de capa"
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                          Resumo / Subtítulo
                        </label>
                        <input
                          type="text"
                          value={artSummary}
                          onChange={(e) => setArtSummary(e.target.value)}
                          placeholder="Resumo curto de 1 a 2 frases para chamar a atenção"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                            Conteúdo Completo do Artigo
                          </label>
                          <span className="text-[11px] text-amber-700 font-medium">
                            Use o botão &quot;Inserir Link&quot; para colocar hiperlinks de produtos
                          </span>
                        </div>
                        <BlogContentEditor
                          value={artContent}
                          onChange={setArtContent}
                          rows={8}
                          placeholder="Escreva suas dicas, resenhas dos produtos, tamanhos recomendados e links de compra..."
                        />
                      </div>

                      <div className="pt-2 flex gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex-1 py-3 px-5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          <span>{saving ? 'Publicando...' : editingArticleId ? 'Atualizar Artigo' : 'Publicar Artigo no Site'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSubTab('list')}
                          className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 5: SITE TEXTS & HOMEPAGE */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl bg-white">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <h3 className="text-xs font-bold text-stone-900">
                      Personalizar Textos da Página Principal
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Altere títulos, slogans e links de contato sem precisar mexer em código!
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                      Título Principal da Página (Headline)
                    </label>
                    <input
                      type="text"
                      value={setHeadline}
                      onChange={(e) => setSetHeadline(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                      Subtítulo de Apresentação de Tamires
                    </label>
                    <textarea
                      rows={3}
                      value={setSubheading}
                      onChange={(e) => setSetSubheading(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                      Aviso do Topo (Barra de Destaque)
                    </label>
                    <input
                      type="text"
                      value={setBannerNotice}
                      onChange={(e) => setSetBannerNotice(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                      Link Oficial do Grupo VIP WhatsApp
                    </label>
                    <input
                      type="url"
                      value={setWhatsappUrl}
                      onChange={(e) => setSetWhatsappUrl(e.target.value)}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="py-3 px-6 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>{saving ? 'Gravando Alterações...' : 'Salvar Alterações das Páginas'}</span>
                  </button>
                </form>
              )}

              {/* TAB 6: DATABASE & BACKUPS */}
              {activeTab === 'backup' && (
                <div className="space-y-6 max-w-2xl bg-white">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <h3 className="text-xs font-bold text-stone-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Status do Banco de Dados Firestore</span>
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Seu banco de dados em nuvem está operando com persistência total. Todos os achadinhos, fotos e artigos adicionados ficam salvos permanentemente.
                    </p>
                  </div>

                  <div className="p-4 border border-stone-200 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-stone-900">
                      Backup & Exportação
                    </h4>
                    <p className="text-xs text-stone-500">
                      Baixe um arquivo seguro com todos os achadinhos e links cadastrados.
                    </p>
                    <button
                      onClick={() => exportProductsJson(products)}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar Arquivo JSON de Backup</span>
                    </button>
                  </div>

                  <div className="p-4 border border-stone-200 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-stone-900">
                      Carregar Catálogo Inicial no Banco
                    </h4>
                    <p className="text-xs text-stone-500">
                      Se o seu banco estiver vazio, você pode salvar o catálogo completo de achadinhos recomendados com um clique.
                    </p>
                    <button
                      onClick={async () => {
                        if (confirm('Deseja sincronizar o catálogo padrão completo de achadinhos no seu banco Firestore?')) {
                          try {
                            await seedDefaultProducts();
                            await seedDefaultArticles();
                            showToast('Catálogo sincronizado com sucesso no banco em nuvem!');
                          } catch (e) {
                            showToast('Erro ao sincronizar.', 'error');
                          }
                        }
                      }}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl flex items-center gap-2 border border-stone-300 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Sincronizar Catálogo Completo no Firestore</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
