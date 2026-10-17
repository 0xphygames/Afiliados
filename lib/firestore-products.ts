import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, SUPABASE_STORAGE_BUCKET } from './supabase';
import { Product, Article, SiteSettings, CustomLandingPage, CustomCategory, Coupon } from './types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS } from './constants';
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredArticles,
  saveStoredArticles,
  getStoredLandingPages,
  saveStoredLandingPages,
  getStoredSettings,
  saveStoredSettings,
} from './storage';

export { INITIAL_PRODUCTS, INITIAL_COUPONS } from './constants';

export const PRIMARY_ADMIN_EMAIL = 'taper.sant@gmail.com';
export const ALLOWED_ADMIN_EMAILS = [
  'taper.sant@gmail.com',
  '0xphy.games@gmail.com',
];

export const ADMIN_EMAIL = PRIMARY_ADMIN_EMAIL;

// User shape used by the UI; name and avatar come from the Google profile metadata
export type User = SupabaseUser & { displayName?: string | null; photoURL?: string | null };

const toAppUser = (user: SupabaseUser | null | undefined): User | null => {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  return {
    ...user,
    displayName: meta.full_name || meta.name || null,
    photoURL: meta.avatar_url || meta.picture || null,
  };
};

// Products are requested by several pages (home, catalog, search and admin).
// Share the in-flight request so navigation does not create one Supabase
// request per component, while keeping the curated catalog available instantly.
let productsCache: Product[] | null = null;
let productsRequest: Promise<Product[]> | null = null;

export const INITIAL_LANDING_PAGES: CustomLandingPage[] = [
  {
    id: 'page-looks-moda',
    title: 'Especial Looks & Moda Feminina',
    slug: 'looks-femininos',
    headline: 'Looks que viralizaram e vestem perfeito no corpo',
    subheading: 'Garantia de originalidade ou seu dinheiro de volta + Frete Grátis e Cupons Exclusivos para todo o Brasil.',
    platform: 'shopee',
    category: 'Vestuário',
    badge: 'ÚLTIMAS UNIDADES',
    bannerImageUrl: '/images/product_vestuario_conjunto_1791404036584.jpg',
    isActive: true,
    createdAt: '2026-10-06T10:00:00Z',
    countdownActive: true,
    countdownEnd: '2026-10-31T23:59:59',
    scarcityText: 'Restam apenas 9 conjuntos com cupom de R$ 20 OFF ativo!',
    guaranteeText: 'Garantia Incondicional de 7 Dias · Compra 100% Protegida · Troca Fácil',
    ratingScore: 4.9,
    testimonials: [
      {
        name: 'Camila Ribeiro',
        role: 'Compradora Verificada',
        rating: 5,
        text: 'Meninas, o conjunto canelado veste surreal de bem! Tecido grosso, não marca nada e chegou em 3 dias com a dica da Tamires.',
      },
      {
        name: 'Mariana Duarte',
        role: 'Seguidora VIP',
        rating: 5,
        text: 'Achei o link por aqui e usei o cupom. Economizei quase 40 reais na compra! Melhor curadoria de looks da Shopee.',
      },
      {
        name: 'Bruna Fernandes',
        role: 'Compradora Verificada',
        rating: 5,
        text: 'Super indico! O vestido serviu certinho na tabela que a Tamires indicou. Vale cada centavo.',
      },
    ],
    faqs: [
      {
        question: 'O link direciona para a loja oficial com segurança?',
        answer: 'Sim! Todos os links são testados diretamente nos aplicativos oficiais da Shopee e Shein, garantindo sua compra protegida e com rastreamento.',
      },
      {
        question: 'Como faço para aplicar o cupom de frete grátis?',
        answer: 'Ao clicar no botão "Garantir Oferta", o link já abre com os cupons disponíveis aplicados direto na sua sacola de compras.',
      },
      {
        question: 'E se o tamanho não der certo?',
        answer: 'Você tem garantia incondicional de 7 dias para devolução gratuita com reembolso integral garantido pela plataforma.',
      },
    ],
    stickyMobileCta: true,
    ctaText: 'Garantir Looks com Frete Grátis e Desconto',
    ctaUrl: 'https://shopee.com.br',
  },
  {
    id: 'page-fitness-suplementos',
    title: 'Desafio Fitness & Suplementação',
    slug: 'fitness-e-treino',
    headline: 'Whey Protein, Creatina e Acessórios com Selo de Procedência',
    subheading: 'Garantia de originalidade com laudo laboratorial aprovado + Envio Imediato FULL.',
    platform: 'all',
    category: 'Suplementos',
    badge: 'MENOR PREÇO DO ANO',
    bannerImageUrl: '/images/product_suplemento_whey_1791404045349.jpg',
    isActive: true,
    createdAt: '2026-10-05T10:00:00Z',
    countdownActive: true,
    countdownEnd: '2026-11-15T23:59:59',
    scarcityText: 'Lote promocional com menos de 15 potes restantes no estoque FULL!',
    guaranteeText: 'Selo de Autenticidade Comprovado · Lacre Inviolado · Envio em 24h',
    ratingScore: 5.0,
    testimonials: [
      {
        name: 'Rodrigo Silva',
        role: 'Atleta Amador',
        rating: 5,
        text: 'Whey 100% original, conferi o lote no QR Code do fabricante e bateu tudo certinho. Preço imbatível!',
      },
      {
        name: 'Carla Souza',
        role: 'Compradora Verificada',
        rating: 5,
        text: 'As faixas elásticas não enrolam e a creatina dissolve perfeitamente. Entrega muito rápida!',
      },
    ],
    faqs: [
      {
        question: 'Os suplementos são originais de fábrica?',
        answer: 'Sim, somente indicamos lojas oficiais credenciadas e vendedores MercadoLíder Platinum com laudo verificado.',
      },
      {
        question: 'Qual o prazo de entrega?',
        answer: 'Para produtos com envio FULL, a entrega costuma chegar em 24 horas úteis na maioria das capitais.',
      },
    ],
    stickyMobileCta: true,
    ctaText: 'Aproveitar Lote Promocional de Suplementos',
    ctaUrl: 'https://mercadolivre.com.br',
  },
  {
    id: 'page-natal-festas',
    title: 'Especial Natal & Fim de Ano',
    slug: 'natal-e-festas',
    headline: 'Decoração aconchegante, pisca-pisca e presentes criativos',
    subheading: 'Garantia de originalidade ou seu dinheiro de volta + Envio Rápido antes do esgotamento sazonal.',
    platform: 'shopee',
    category: 'Natal',
    badge: 'PROMOÇÃO IMPERDÍVEL',
    bannerImageUrl: '/images/product_natal_decoracao_1791404054900.jpg',
    isActive: true,
    createdAt: '2026-10-04T10:00:00Z',
    countdownActive: true,
    countdownEnd: '2026-12-24T23:59:59',
    scarcityText: 'Alta demanda sazonal: itens decorativos esgotando rapidamente!',
    guaranteeText: 'Garantia de Entrega no Prazo · Itens Testados e Aprovados',
    ratingScore: 4.8,
    testimonials: [
      {
        name: 'Juliana Castro',
        role: 'Compradora Verificada',
        rating: 5,
        text: 'Os enfeites chegaram perfeitos e a iluminação quente é linda demais. Casa pronta pro Natal!',
      },
    ],
    faqs: [
      {
        question: 'Chega antes do Natal?',
        answer: 'Sim! Compre pelos links selecionados com envio nacional para receber bem antes das festas.',
      },
    ],
    stickyMobileCta: true,
    ctaText: 'Ver Seleção de Natal com Super Desconto',
    ctaUrl: 'https://shopee.com.br',
  },
];

export const INITIAL_CUSTOM_CATEGORIES: CustomCategory[] = [
  { id: 'cat-vestuario', name: 'Vestuário', platform: 'all', icon: 'Shirt' },
  { id: 'cat-suplementos', name: 'Suplementos', platform: 'all', icon: 'Pill' },
  { id: 'cat-musculacao', name: 'Musculação', platform: 'all', icon: 'Dumbbell' },
  { id: 'cat-natal', name: 'Natal', platform: 'all', icon: 'TreePine' },
  { id: 'cat-criancas', name: 'Dia das Crianças', platform: 'all', icon: 'Baby' },
  { id: 'cat-guloseimas', name: 'Guloseimas', platform: 'all', icon: 'Cookie' },
  { id: 'cat-casa', name: 'Casa & Decoração', platform: 'all', icon: 'Home' },
  { id: 'cat-beleza', name: 'Beleza & Skincare', platform: 'all', icon: 'Sparkles' },
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Top 5 Achadinhos da Shopee que Viralizaram no TikTok e Valem Cada Centavo',
    category: 'Guia de Compras',
    summary: 'Testei as peças mais famosas das redes sociais: conjunto modal, faixas elásticas e câmera retrô.',
    content: `Quem me acompanha no Instagram sabe que eu testo de tudo antes de postar! A Shopee tem milhares de produtos, mas alguns se destacam pela qualidade surpreendente:

1. **Conjunto Canelado Modal**: Tecido encorpado que não fica transparente. Comprei no tamanho M e o caimento foi perfeito. Confira aqui o [Link Oficial do Conjunto na Shopee](https://shopee.com.br) com cupom ativo!
2. **Faixas Elásticas de Musculação**: O kit com 5 níveis de intensidade é super resistente e não enrola durante o treino de pernas e glúteos.
3. **Câmera Infantil Retrô**: Ótima opção de presente com fotos reais e jogos divertidos. Veja os detalhes em [Garimpo de Brinquedos e Câmeras](https://shopee.com.br).

> 💡 Dica da Tamires: Sempre confira os comentários com fotos reais antes de comprar e aproveite os cupons de frete grátis liberados nos nossos grupos!`,
    coverImageUrl: '/images/product_vestuario_conjunto_1791404036584.jpg',
    author: 'Tamires Santos',
    featured: true,
    createdAt: '2026-10-06T12:00:00Z',
  },
  {
    id: 'art-2',
    title: 'Guia de Looks da Shein: Como Acertar no Tamanho e no Tecido sem Erro',
    category: 'Dicas de Moda',
    summary: 'Minhas dicas de ouro para você nunca mais se decepcionar com caimento ou tecido transparente.',
    content: `Comprar looks na Shein virou um vício bom, mas exige atenção aos detalhes para não errar no pedido! Aqui estão as minhas 4 regras essenciais:

- **Meça com fita métrica**: Não se guie apenas por P, M ou G. Olhe a tabela de medidas em centímetros de cada peça individualmente.
- **Filtre por composição**: Peças com viscose, modal ou algodão com elastano vestem muito melhor do que 100% poliéster fino.
- **Vestidos Canelados e Alfaiataria**: São as categorias com melhor custo-benefício. Acesse nossa seleção em [Vitrine Oficial de Moda Shein](https://br.shein.com).
- **Acessórios Banhados**: Sempre passo uma camada fina de verniz protetor para bijuterias para manter o brilho dourado por meses.`,
    coverImageUrl: '/images/hero_achadinhos_looks_1791404026649.jpg',
    author: 'Tamires Santos',
    featured: true,
    createdAt: '2026-10-05T14:00:00Z',
  },
  {
    id: 'art-3',
    title: 'Suplementos no Mercado Livre: Como Garantir que o Whey e a Creatina são 100% Originais',
    category: 'Fitness & Treino',
    summary: 'Aprenda a identificar selos de procedência, envio FULL e laudos laboratoriais das melhores marcas.',
    content: `Com saúde não se brinca! Na hora de economizar comprando creatina e whey protein pela internet, siga este checklist básico:

1. **Compre em Lojas Oficiais ou Vendedores MercadoLíder Platinum**: Verifique a medalha de verificação na página do produto.
2. **Priorize Entrega FULL**: O produto sai direto do centro de distribuição do Mercado Livre, garantindo entrega em menos de 24 horas e lacre inviolado.
3. **QR Code e Lote**: Ao receber em casa, verifique o selo holográfico ou o QR Code do fabricante que confirma a autenticidade do lote.`,
    coverImageUrl: '/images/product_suplemento_whey_1791404045349.jpg',
    author: 'Tamires Santos',
    featured: false,
    createdAt: '2026-10-04T16:00:00Z',
  },
];

export const INITIAL_SETTINGS: SiteSettings = {
  heroHeadline: 'Achadinhos que valem cada centavo e looks irresistíveis.',
  heroSubheading: 'A curadoria oficial de Tamires Santos reunindo as melhores promoções, cupons e achados da Shopee, Shein, Mercado Livre e Amazon com links 100% seguros!',
  topBannerNotice: 'Curadoria oficial de Tamires Santos · Links com cupons verificados e compras 100% seguras',
  whatsappUrl: 'https://whatsapp.com',
  updatedAt: new Date().toISOString(),
};

// Check if user is authenticated admin - exclusively authorized emails
export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  const userEmail = user.email.trim().toLowerCase();
  return ALLOWED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userEmail);
}

// Subscribe to real-time products collection in Firestore
export function subscribeFirestoreProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (err: Error) => void
): () => void {
  // Do not paint the bundled/template catalog before Supabase responds. That
  // caused the public page to flash the old catalog and then replace it.
  if (productsCache) onSuccess(productsCache);

  if (!productsRequest) {
    productsRequest = (async () => {
      // Product images are currently stored as Base64 in older rows. Fetching
      // all 149 rows in one response can exceed the Data API/proxy payload
      // limit, so page the catalog into smaller responses.
      const pageSize = 100;
      const fetchPage = async (from: number, size: number) => {
        const { data, error } = await supabase
          .from('products')
          .select('id,title,platform,category,image_url,images,affiliate_url,price,original_price,rating,review_count,badge,tamires_tip,is_featured,created_at')
          // id as a tie-breaker keeps pages stable when rows share created_at
          .order('created_at', { ascending: false })
          .order('id', { ascending: true })
          .range(from, from + size - 1);
        if (error) throw error;
        return data ?? [];
      };
      const rows: any[] = [];
      let from = 0;
      for (;;) {
        // If a page is too large for the proxy (Base64 images), halve it and retry.
        let size = pageSize;
        let data: any[] = [];
        for (;;) {
          try {
            data = await fetchPage(from, size);
            break;
          } catch (error) {
            if (size <= 1) throw error;
            size = Math.max(1, Math.floor(size / 2));
          }
        }
        rows.push(...data);
        if (data.length < size) break;
        from += data.length;
      }

      const normalizeImageUrl = (value: unknown): string => {
        const raw = typeof value === 'string' ? value.trim() : '';
        if (!raw) return '';
        if (/^(https?:|data:|blob:|\/)/i.test(raw)) return raw;
        return supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(raw).data.publicUrl;
      };

      const list = rows.map((row) => {
        const rowImages = Array.isArray(row.images) ? row.images : [];
        const images = rowImages.map(normalizeImageUrl).filter(Boolean);
        const imageUrl = normalizeImageUrl(row.image_url) || images[0] || '';
        return ({
        id: row.id, title: row.title, platform: row.platform, category: row.category,
        imageUrl, images: images.length ? images : imageUrl ? [imageUrl] : [],
        affiliateUrl: row.affiliate_url, price: Number(row.price) || 0,
        originalPrice: row.original_price == null ? undefined : Number(row.original_price),
        rating: Number(row.rating) || 5, reviewCount: Number(row.review_count) || 1,
        badge: row.badge || undefined, tamiresTip: row.tamires_tip || undefined,
        isFeatured: Boolean(row.is_featured), createdAt: row.created_at,
        } satisfies Product);
      });
      const merged = new Map<string, Product>();
      INITIAL_PRODUCTS.forEach((product) => merged.set(product.id, product));
      // Preserve products created in this browser if the API is temporarily
      // unavailable or the deployed project is pointing at an empty database.
      getStoredProducts().forEach((product) => merged.set(product.id, product));
      list.forEach((product) => merged.set(product.id, product));
      productsCache = Array.from(merged.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      saveStoredProducts(productsCache);
      return productsCache;
    })();
  }

  const request = productsRequest;
  void request.then(onSuccess).catch((error: Error) => {
    console.error('Falha ao carregar produtos do Supabase:', error);
    productsRequest = null;
    onError?.(error);
    onSuccess(getStoredProducts());
  });
  return () => undefined;
}

function invalidateProductsCache() {
  productsCache = null;
  productsRequest = null;
}

// Subscribe to real-time articles collection in Firestore
export function subscribeFirestoreArticles(
  onSuccess: (articles: Article[]) => void,
  onError?: (err: Error) => void
): () => void {
  void supabase.from('articles').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
    if (error) { onError?.(error); onSuccess(getStoredArticles().length ? getStoredArticles() : INITIAL_ARTICLES); return; }
    const list = (data ?? []).map((row) => ({
      id: row.id, title: row.title, category: row.category, summary: row.summary,
      content: row.content, coverImageUrl: row.cover_image_url || '',
      author: row.author || 'Tamires Santos', featured: Boolean(row.featured), createdAt: row.created_at,
    } satisfies Article));
    const articles = list;
    saveStoredArticles(articles);
    onSuccess(articles);
  });
  return () => undefined;
}

// Load site settings (single row, id 'main') from Supabase
export function subscribeFirestoreSettings(
  onSuccess: (settings: SiteSettings) => void,
  onError?: (err: Error) => void
): () => void {
  void supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'main')
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) {
        console.warn('Leitura de configurações (fallback):', error);
        onSuccess(INITIAL_SETTINGS);
        onError?.(error as unknown as Error);
        return;
      }
      if (!data) {
        onSuccess(INITIAL_SETTINGS);
        return;
      }
      onSuccess({
        heroHeadline: data.hero_headline || INITIAL_SETTINGS.heroHeadline,
        heroSubheading: data.hero_subheading || INITIAL_SETTINGS.heroSubheading,
        topBannerNotice: data.top_banner_notice || INITIAL_SETTINGS.topBannerNotice,
        whatsappUrl: data.whatsapp_url || INITIAL_SETTINGS.whatsappUrl,
        updatedAt: data.updated_at,
      });
    });
  return () => undefined;
}

// Seed the bundled products and articles into Supabase (manual admin action)
export async function seedInitialDataToFirestore(): Promise<void> {
  for (const item of INITIAL_PRODUCTS) await saveProductToFirestore(item);
  for (const item of INITIAL_ARTICLES) await saveArticleToFirestore(item);
}

// Add or update product in Firestore
export async function saveProductToFirestore(product: Product): Promise<void> {
  const images = (product.images?.filter(Boolean) || [product.imageUrl]).map((image) => image.trim()).filter(Boolean);
  const { error } = await supabase.from('products').upsert({
    id: product.id,
    title: product.title.trim(),
    platform: product.platform,
    category: (product.category || 'Geral').trim(),
    image_url: (product.imageUrl || images[0] || '').trim(),
    images,
    affiliate_url: product.affiliateUrl.trim(),
    price: Math.max(0, Number(product.price) || 0),
    original_price: product.originalPrice ?? null,
    rating: Number(product.rating) || 5,
    review_count: Math.max(1, Number(product.reviewCount) || 1),
    badge: product.badge?.trim() || null,
    tamires_tip: product.tamiresTip?.trim() || null,
    is_featured: Boolean(product.isFeatured),
    created_at: product.createdAt || new Date().toISOString(),
  });
  if (error) throw error;
  invalidateProductsCache();
}

// Add or update article in Firestore
export async function saveArticleToFirestore(article: Article): Promise<void> {
  const { error } = await supabase.from('articles').upsert({
    id: article.id, title: article.title.trim(), category: article.category.trim(),
    summary: article.summary.trim(), content: article.content, cover_image_url: article.coverImageUrl || null,
    author: article.author || 'Tamires Santos', featured: Boolean(article.featured),
    created_at: article.createdAt || new Date().toISOString(),
  });
  if (error) throw error;
}

// Save site settings in Firestore
export async function saveSettingsToFirestore(settings: SiteSettings): Promise<void> {
  saveStoredSettings(settings);
  const { error } = await supabase.from('site_settings').upsert({
    id: 'main',
    hero_headline: settings.heroHeadline,
    hero_subheading: settings.heroSubheading,
    top_banner_notice: settings.topBannerNotice,
    whatsapp_url: settings.whatsappUrl,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// Delete product from Firestore
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
  invalidateProductsCache();
}

// Campaign fields that are not real columns live in the `content` jsonb column
const landingPageFromRow = (row: any): CustomLandingPage => {
  const c = row.content && typeof row.content === 'object' ? row.content : {};
  return {
    id: row.id,
    title: row.title || '',
    slug: row.slug || row.id,
    headline: row.headline || '',
    subheading: row.subheading || '',
    platform: row.platform || 'all',
    category: row.category || '',
    badge: row.badge || '',
    bannerImageUrl: row.banner_image_url || '',
    isActive: row.is_active !== false,
    createdAt: row.created_at || new Date().toISOString(),
    countdownActive: Boolean(c.countdownActive),
    countdownEnd: c.countdownEnd || '',
    scarcityText: c.scarcityText || '',
    guaranteeText: c.guaranteeText || '',
    ratingScore: typeof c.ratingScore === 'number' ? c.ratingScore : 4.9,
    testimonials: Array.isArray(c.testimonials) ? c.testimonials : [],
    faqs: Array.isArray(c.faqs) ? c.faqs : [],
    stickyMobileCta: Boolean(c.stickyMobileCta),
    ctaText: c.ctaText || '',
    ctaUrl: c.ctaUrl || '',
    facebookPixelId: c.facebookPixelId || '',
    googleAnalyticsId: c.googleAnalyticsId || '',
    customTrackingCode: c.customTrackingCode || '',
  };
};

// Load campaign pages from Supabase (public sees only active ones; admins see all)
export function subscribeFirestoreLandingPages(
  onSuccess: (pages: CustomLandingPage[]) => void,
  onError?: (err: Error) => void
): () => void {
  const fallback = () => {
    const local = getStoredLandingPages();
    onSuccess(local && local.length > 0 ? local : INITIAL_LANDING_PAGES);
  };

  void supabase
    .from('landing_pages')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        console.warn('Leitura de páginas (fallback):', error);
        fallback();
        onError?.(error as unknown as Error);
        return;
      }
      if (!data || data.length === 0) {
        onSuccess([]);
        return;
      }
      const list = data.map(landingPageFromRow);
      saveStoredLandingPages(list);
      onSuccess(list);
    });
  return () => undefined;
}

// Save or update custom landing page
export async function saveLandingPageToFirestore(page: CustomLandingPage): Promise<void> {
  const existing = getStoredLandingPages();
  saveStoredLandingPages([page, ...existing.filter((p) => p.id !== page.id)]);
  const { error } = await supabase.from('landing_pages').upsert({
    id: page.id,
    title: page.title,
    slug: page.slug,
    headline: page.headline,
    subheading: page.subheading,
    platform: page.platform || 'all',
    category: page.category || null,
    badge: page.badge || null,
    banner_image_url: page.bannerImageUrl || null,
    is_active: page.isActive !== false,
    content: {
      countdownActive: page.countdownActive,
      countdownEnd: page.countdownEnd,
      scarcityText: page.scarcityText,
      guaranteeText: page.guaranteeText,
      ratingScore: page.ratingScore,
      testimonials: page.testimonials,
      faqs: page.faqs,
      stickyMobileCta: page.stickyMobileCta,
      ctaText: page.ctaText,
      ctaUrl: page.ctaUrl,
      facebookPixelId: page.facebookPixelId,
      googleAnalyticsId: page.googleAnalyticsId,
      customTrackingCode: page.customTrackingCode,
    },
    created_at: page.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// Delete custom landing page
export async function deleteLandingPageFromFirestore(pageId: string): Promise<void> {
  const existing = getStoredLandingPages();
  saveStoredLandingPages(existing.filter((p) => p.id !== pageId));
  const { error } = await supabase.from('landing_pages').delete().eq('id', pageId);
  if (error) throw error;
}

// Load custom categories from Supabase
export function subscribeFirestoreCategories(
  onSuccess: (cats: CustomCategory[]) => void,
  onError?: (err: Error) => void
): () => void {
  void supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })
    .then(({ data, error }) => {
      if (error) {
        console.warn('Leitura de categorias (fallback):', error);
        onSuccess(INITIAL_CUSTOM_CATEGORIES);
        onError?.(error as unknown as Error);
        return;
      }
      if (!data || data.length === 0) {
        onSuccess([]);
        return;
      }
      onSuccess(
        data.map((row) => ({
          id: row.id,
          name: row.name || '',
          platform: row.platform || 'all',
          icon: row.icon || 'Tag',
          color: row.color || '',
          createdAt: row.created_at || new Date().toISOString(),
        })),
      );
    });
  return () => undefined;
}

// Save or update category
export async function saveCategoryToFirestore(category: CustomCategory): Promise<void> {
  const { error } = await supabase.from('categories').upsert({
    id: category.id,
    name: category.name.trim(),
    platform: category.platform || 'all',
    icon: category.icon || 'Tag',
    color: category.color || null,
    created_at: category.createdAt || new Date().toISOString(),
  });
  if (error) throw error;
}

// Delete category
export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', categoryId);
  if (error) throw error;
}

// Delete article from Firestore
export async function deleteArticleFromFirestore(articleId: string): Promise<void> {
  const { error } = await supabase.from('articles').delete().eq('id', articleId);
  if (error) throw error;
}

// Login via Google
export async function loginWithGoogle(): Promise<User> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    });
    if (error) throw error;
    if (data.url && typeof window !== 'undefined') window.location.assign(data.url);
    return toAppUser((await supabase.auth.getUser()).data.user) as User;
  } catch (err) {
    console.error('Erro no login Google:', err);
    throw err;
  }
}

export async function loginWithPassword(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return toAppUser(data.user) as User;
}

// Logout
export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut();
}

// Subscribe to auth state changes
export function subscribeAuth(callback: (user: User | null) => void): () => void {
  void supabase.auth.getUser().then(({ data }) => callback(toAppUser(data.user)));
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(toAppUser(session?.user));
  });
  return () => data.subscription.unsubscribe();
}

// Coupons live in Supabase `coupons`; the bundled list is only used if the request fails
const couponFromRow = (row: any): Coupon => ({
  id: row.id,
  code: row.code || '',
  title: row.title || '',
  discount: row.discount || '',
  platform: row.platform,
  description: row.description || '',
  minSpend: row.min_spend || undefined,
  expirationDate: row.expiration_date || undefined,
  affiliateUrl: row.affiliate_url || '',
  isVerified: row.is_verified !== false,
  category: row.category || 'Geral',
});

export function subscribeFirestoreCoupons(
  onSuccess: (coupons: Coupon[]) => void,
  onError?: (err: Error) => void
): () => void {
  void supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        console.warn('Leitura de cupons (fallback):', error);
        onSuccess(INITIAL_COUPONS);
        onError?.(error as unknown as Error);
        return;
      }
      onSuccess((data ?? []).map(couponFromRow));
    });
  return () => undefined;
}

export async function saveCouponToFirestore(coupon: Coupon): Promise<void> {
  const { error } = await supabase.from('coupons').upsert({
    id: coupon.id,
    code: coupon.code.trim(),
    title: coupon.title.trim(),
    discount: coupon.discount.trim(),
    platform: coupon.platform,
    description: coupon.description.trim(),
    min_spend: coupon.minSpend?.trim() || null,
    expiration_date: coupon.expirationDate?.trim() || null,
    affiliate_url: coupon.affiliateUrl.trim(),
    is_verified: coupon.isVerified,
    category: coupon.category || 'Geral',
  });
  if (error) throw error;
}

export async function deleteCouponFromFirestore(couponId: string): Promise<void> {
  const { error } = await supabase.from('coupons').delete().eq('id', couponId);
  if (error) throw error;
}

// Copy the bundled example coupons into Supabase (manual admin action)
export async function seedInitialCoupons(): Promise<void> {
  for (const coupon of INITIAL_COUPONS) await saveCouponToFirestore(coupon);
}
