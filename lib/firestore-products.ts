import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { supabase, SUPABASE_STORAGE_BUCKET } from './supabase';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { Product, Article, SiteSettings, CustomLandingPage, CustomCategory } from './types';
import { INITIAL_PRODUCTS } from './constants';
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
      const pageSize = 20;
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
    const articles = list.length ? list : INITIAL_ARTICLES;
    saveStoredArticles(articles);
    onSuccess(articles);
  });
  return () => undefined;
}

// Subscribe to site settings in Firestore
export function subscribeFirestoreSettings(
  onSuccess: (settings: SiteSettings) => void,
  onError?: (err: Error) => void
): () => void {
  const settingsDoc = doc(db, 'settings', 'main');

  const unsubscribe = onSnapshot(
    settingsDoc,
    (docSnap) => {
      if (!docSnap.exists()) {
        onSuccess(INITIAL_SETTINGS);
        return;
      }
      const data = docSnap.data();
      onSuccess({
        heroHeadline: data.heroHeadline || INITIAL_SETTINGS.heroHeadline,
        heroSubheading: data.heroSubheading || INITIAL_SETTINGS.heroSubheading,
        topBannerNotice: data.topBannerNotice || INITIAL_SETTINGS.topBannerNotice,
        whatsappUrl: data.whatsappUrl || INITIAL_SETTINGS.whatsappUrl,
        updatedAt: data.updatedAt,
      });
    },
    (error) => {
      console.warn('Leitura de configurações do Firestore (fallback):', error);
      onSuccess(INITIAL_SETTINGS);
      onError?.(error as Error);
    }
  );

  return unsubscribe;
}

// Seed default products to Firestore
export async function seedDefaultProducts(): Promise<void> {
  const batch = writeBatch(db);
  for (const item of INITIAL_PRODUCTS) {
    const docRef = doc(db, 'products', item.id);
    batch.set(docRef, {
      ...item,
      updatedAt: new Date().toISOString(),
    });
  }
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
  }
}

// Seed default articles to Firestore
export async function seedDefaultArticles(): Promise<void> {
  const batch = writeBatch(db);
  for (const item of INITIAL_ARTICLES) {
    const docRef = doc(db, 'articles', item.id);
    batch.set(docRef, {
      ...item,
      updatedAt: new Date().toISOString(),
    });
  }
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'articles');
  }
}

// Seed all initial data to Firestore
export async function seedInitialDataToFirestore(): Promise<void> {
  await seedDefaultProducts();
  await seedDefaultArticles();
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
  const path = 'settings/main';
  try {
    const docRef = doc(db, 'settings', 'main');
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    saveStoredSettings(settings);
  } catch (error) {
    saveStoredSettings(settings);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete product from Firestore
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
  invalidateProductsCache();
}

// Subscribe to landing pages collection in Firestore
export function subscribeFirestoreLandingPages(
  onSuccess: (pages: CustomLandingPage[]) => void,
  onError?: (err: Error) => void
): () => void {
  const pagesCol = collection(db, 'pages');

  const unsubscribe = onSnapshot(
    pagesCol,
    (snapshot) => {
      if (snapshot.empty) {
        const local = getStoredLandingPages();
        if (local && local.length > 0) {
          onSuccess(local);
          return;
        }
        onSuccess(INITIAL_LANDING_PAGES);
        return;
      }

      const list: CustomLandingPage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || '',
          slug: data.slug || docSnap.id,
          headline: data.headline || '',
          subheading: data.subheading || '',
          platform: data.platform || 'all',
          category: data.category || '',
          badge: data.badge || '',
          bannerImageUrl: data.bannerImageUrl || '',
          isActive: data.isActive !== false,
          createdAt: data.createdAt || new Date().toISOString(),
          countdownActive: Boolean(data.countdownActive),
          countdownEnd: data.countdownEnd || '',
          scarcityText: data.scarcityText || '',
          guaranteeText: data.guaranteeText || '',
          ratingScore: typeof data.ratingScore === 'number' ? data.ratingScore : 4.9,
          testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
          faqs: Array.isArray(data.faqs) ? data.faqs : [],
          stickyMobileCta: Boolean(data.stickyMobileCta),
          ctaText: data.ctaText || '',
          ctaUrl: data.ctaUrl || '',
          facebookPixelId: data.facebookPixelId || '',
          googleAnalyticsId: data.googleAnalyticsId || '',
          customTrackingCode: data.customTrackingCode || '',
        });
      });

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveStoredLandingPages(list);
      onSuccess(list);
    },
    (error) => {
      console.warn('Leitura de páginas do Firestore (fallback):', error);
      const local = getStoredLandingPages();
      if (local && local.length > 0) {
        onSuccess(local);
      } else {
        onSuccess(INITIAL_LANDING_PAGES);
      }
      onError?.(error as Error);
    }
  );

  return unsubscribe;
}

// Save or update custom landing page
export async function saveLandingPageToFirestore(page: CustomLandingPage): Promise<void> {
  const path = `pages/${page.id}`;
  try {
    const docRef = doc(db, 'pages', page.id);
    await setDoc(
      docRef,
      {
        ...page,
        authorEmail: auth.currentUser?.email || ADMIN_EMAIL,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    const existing = getStoredLandingPages();
    const updated = [page, ...existing.filter((p) => p.id !== page.id)];
    saveStoredLandingPages(updated);
  } catch (error) {
    const existing = getStoredLandingPages();
    const updated = [page, ...existing.filter((p) => p.id !== page.id)];
    saveStoredLandingPages(updated);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete custom landing page
export async function deleteLandingPageFromFirestore(pageId: string): Promise<void> {
  const path = `pages/${pageId}`;
  try {
    const docRef = doc(db, 'pages', pageId);
    await deleteDoc(docRef);
    const existing = getStoredLandingPages();
    saveStoredLandingPages(existing.filter((p) => p.id !== pageId));
  } catch (error) {
    const existing = getStoredLandingPages();
    saveStoredLandingPages(existing.filter((p) => p.id !== pageId));
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to custom categories in Firestore
export function subscribeFirestoreCategories(
  onSuccess: (cats: CustomCategory[]) => void,
  onError?: (err: Error) => void
): () => void {
  const catsCol = collection(db, 'categories');

  const unsubscribe = onSnapshot(
    catsCol,
    (snapshot) => {
      if (snapshot.empty) {
        onSuccess(INITIAL_CUSTOM_CATEGORIES);
        return;
      }

      const list: CustomCategory[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || '',
          platform: data.platform || 'all',
          icon: data.icon || 'Tag',
          color: data.color || '',
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });

      onSuccess(list);
    },
    (error) => {
      console.warn('Leitura de categorias do Firestore (fallback):', error);
      onSuccess(INITIAL_CUSTOM_CATEGORIES);
      onError?.(error as Error);
    }
  );

  return unsubscribe;
}

// Save or update category
export async function saveCategoryToFirestore(category: CustomCategory): Promise<void> {
  const path = `categories/${category.id}`;
  try {
    const docRef = doc(db, 'categories', category.id);
    await setDoc(
      docRef,
      {
        ...category,
        authorEmail: auth.currentUser?.email || ADMIN_EMAIL,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete category
export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  const path = `categories/${categoryId}`;
  try {
    const docRef = doc(db, 'categories', categoryId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
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
    return (await supabase.auth.getUser()).data.user as unknown as User;
  } catch (err) {
    console.error('Erro no login Google:', err);
    throw err;
  }
}

export async function loginWithPassword(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user as unknown as User;
}

// Logout
export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut();
}

// Subscribe to auth state changes
export function subscribeAuth(callback: (user: User | null) => void): () => void {
  void supabase.auth.getUser().then(({ data }) => callback(data.user as unknown as User | null));
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user as unknown as User | null);
  });
  return () => data.subscription.unsubscribe();
}
