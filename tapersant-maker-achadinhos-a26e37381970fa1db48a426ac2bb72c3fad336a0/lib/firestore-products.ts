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
import { db, auth, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { Product, Article, SiteSettings, CustomLandingPage, CustomCategory } from './types';
import { INITIAL_PRODUCTS } from './constants';

export { INITIAL_PRODUCTS } from './constants';

export const ADMIN_EMAIL = 'taper.sant@gmail.com';

export const INITIAL_LANDING_PAGES: CustomLandingPage[] = [
  {
    id: 'page-looks-moda',
    title: 'Especial Looks & Moda Feminina',
    slug: 'looks-femininos',
    headline: 'Looks que viralizaram e vestem perfeito no corpo',
    subheading: 'Seleção especial da Tamires: conjuntos canelados, alfaiataria e vestidos confortáveis com desconto.',
    platform: 'shopee',
    category: 'Vestuário',
    badge: 'Tendência 2026',
    bannerImageUrl: '/images/product_vestuario_conjunto_1791404036584.jpg',
    isActive: true,
    createdAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'page-fitness-suplementos',
    title: 'Desafio Fitness & Suplementação',
    slug: 'fitness-e-treino',
    headline: 'Whey Protein, Creatina e Acessórios com Selo de Procedência',
    subheading: 'Dicas de suplementação e achadinhos de academia testados e aprovados para o seu resultado.',
    platform: 'all',
    category: 'Suplementos',
    badge: '100% Originais',
    bannerImageUrl: '/images/product_suplemento_whey_1791404045349.jpg',
    isActive: true,
    createdAt: '2026-10-05T10:00:00Z',
  },
  {
    id: 'page-natal-festas',
    title: 'Especial Natal & Fim de Ano',
    slug: 'natal-e-festas',
    headline: 'Decoração aconchegante, pisca-pisca e presentes criativos',
    subheading: 'Enfeites de pinheiro, guirlandas com iluminação quente e ideias baratas para transformar a sua casa.',
    platform: 'shopee',
    category: 'Natal',
    badge: 'Festas 2026',
    bannerImageUrl: '/images/product_natal_decoracao_1791404054900.jpg',
    isActive: true,
    createdAt: '2026-10-04T10:00:00Z',
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

1. **Conjunto Canelado Modal**: Tecido encorpado que não fica transparente. Comprei no tamanho M e o caimento foi perfeito tanto com tênis quanto com salto.
2. **Faixas Elásticas de Musculação**: O kit com 5 níveis de intensidade é super resistente e não enrola durante o treino de pernas e glúteos.
3. **Câmera Infantil Retrô**: Ótima opção de presente para o Dia das Crianças ou aniversários, com fotos reais e jogos divertidos.

Sempre confira os comentários com fotos reais antes de comprar e aproveite os cupons de frete grátis que libero nos grupos VIP!`,
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
- **Vestidos Canelados e Alfaiataria**: São as categorias com melhor custo-benefício da plataforma.
- **Acessórios Banhados**: Sempre passo uma camada fina de verniz protetor para bijuterias para manter o brilho dourado por mais de 6 meses.`,
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

// Check if user is authenticated admin
export function isUserAdmin(user: User | null): boolean {
  if (!user) return false;
  // Any logged-in user with Google account or Tamires' email
  return true;
}

// Subscribe to real-time products collection in Firestore
export function subscribeFirestoreProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (err: Error) => void
): () => void {
  const productsCol = collection(db, 'products');

  const unsubscribe = onSnapshot(
    productsCol,
    (snapshot) => {
      // If collection is empty, return default products in memory without unauthorized writes
      if (snapshot.empty) {
        onSuccess(INITIAL_PRODUCTS);
        return;
      }

      const list: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || '',
          platform: data.platform || 'shopee',
          category: data.category || 'Geral',
          imageUrl: data.imageUrl || '',
          affiliateUrl: data.affiliateUrl || '',
          price: Number(data.price) || 0,
          originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
          rating: Number(data.rating) || 5.0,
          reviewCount: Number(data.reviewCount) || 1,
          badge: data.badge || undefined,
          tamiresTip: data.tamiresTip || undefined,
          isFeatured: Boolean(data.isFeatured),
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });

      // Sort by createdAt descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSuccess(list);
    },
    (error) => {
      console.warn('Leitura do Firestore (usando fallback seguro):', error);
      onSuccess(INITIAL_PRODUCTS);
      onError?.(error as Error);
    }
  );

  return unsubscribe;
}

// Subscribe to real-time articles collection in Firestore
export function subscribeFirestoreArticles(
  onSuccess: (articles: Article[]) => void,
  onError?: (err: Error) => void
): () => void {
  const articlesCol = collection(db, 'articles');

  const unsubscribe = onSnapshot(
    articlesCol,
    (snapshot) => {
      if (snapshot.empty) {
        onSuccess(INITIAL_ARTICLES);
        return;
      }

      const list: Article[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || '',
          category: data.category || 'Geral',
          summary: data.summary || '',
          content: data.content || '',
          coverImageUrl: data.coverImageUrl || '',
          author: data.author || 'Tamires Santos',
          featured: Boolean(data.featured),
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSuccess(list);
    },
    (error) => {
      console.warn('Leitura de artigos do Firestore (fallback):', error);
      onSuccess(INITIAL_ARTICLES);
      onError?.(error as Error);
    }
  );

  return unsubscribe;
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
  const path = `products/${product.id}`;
  try {
    const docRef = doc(db, 'products', product.id);
    await setDoc(
      docRef,
      {
        id: product.id,
        title: product.title,
        platform: product.platform,
        category: product.category,
        imageUrl: product.imageUrl,
        affiliateUrl: product.affiliateUrl,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        rating: Number(product.rating || 5.0),
        reviewCount: Number(product.reviewCount || 10),
        badge: product.badge || null,
        tamiresTip: product.tamiresTip || null,
        isFeatured: Boolean(product.isFeatured),
        createdAt: product.createdAt || new Date().toISOString(),
        authorEmail: auth.currentUser?.email || ADMIN_EMAIL,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Add or update article in Firestore
export async function saveArticleToFirestore(article: Article): Promise<void> {
  const path = `articles/${article.id}`;
  try {
    const docRef = doc(db, 'articles', article.id);
    await setDoc(
      docRef,
      {
        ...article,
        authorEmail: auth.currentUser?.email || ADMIN_EMAIL,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
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
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete product from Firestore
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
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
        });
      });

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSuccess(list);
    },
    (error) => {
      console.warn('Leitura de páginas do Firestore (fallback):', error);
      onSuccess(INITIAL_LANDING_PAGES);
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
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete custom landing page
export async function deleteLandingPageFromFirestore(pageId: string): Promise<void> {
  const path = `pages/${pageId}`;
  try {
    const docRef = doc(db, 'pages', pageId);
    await deleteDoc(docRef);
  } catch (error) {
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
  const path = `articles/${articleId}`;
  try {
    const docRef = doc(db, 'articles', articleId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Login via Google
export async function loginWithGoogle(): Promise<User> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  } catch (err) {
    console.error('Erro no login Google:', err);
    throw err;
  }
}

// Logout
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Subscribe to auth state changes
export function subscribeAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
