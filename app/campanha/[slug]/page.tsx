'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useParams } from 'next/navigation';
import { CustomLandingPage, Product, SiteSettings, PlatformId } from '@/lib/types';
import { PLATFORMS, INITIAL_PRODUCTS } from '@/lib/constants';
import {
  subscribeFirestoreLandingPages,
  subscribeFirestoreProducts,
  subscribeFirestoreSettings,
  INITIAL_LANDING_PAGES,
  INITIAL_SETTINGS,
} from '@/lib/firestore-products';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { Footer } from '@/components/Footer';
import {
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Flame,
  AlertTriangle,
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lock,
  Truck,
  RotateCcw,
  Zap,
} from 'lucide-react';

export default function PublicCampaignPage() {
  const params = useParams();
  const rawSlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const slug = decodeURIComponent(String(rawSlug || ''));

  const [pages, setPages] = useState<CustomLandingPage[]>(INITIAL_LANDING_PAGES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Real-time Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const unsubPages = subscribeFirestoreLandingPages((list) => {
      if (list && list.length > 0) setPages(list);
    });
    const unsubProds = subscribeFirestoreProducts((list) => {
      if (list && list.length > 0) setProducts(list);
    });
    const unsubSettings = subscribeFirestoreSettings((cfg) => {
      if (cfg) setSettings(cfg);
    });
    return () => {
      unsubPages();
      unsubProds();
      unsubSettings();
    };
  }, []);

  const campaign = useMemo(() => {
    return pages.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
  }, [pages, slug]);

  // Urgency Timer Tick
  useEffect(() => {
    if (!campaign?.countdownActive || !campaign.countdownEnd) return;

    const calculateTimeLeft = () => {
      const targetDate = new Date(campaign.countdownEnd!).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [campaign?.countdownActive, campaign?.countdownEnd]);

  const campaignProducts = useMemo(() => {
    if (!campaign) return products;
    return products.filter((p) => {
      if (campaign.platform && campaign.platform !== 'all' && p.platform !== campaign.platform) {
        return false;
      }
      if (campaign.category && campaign.category.trim()) {
        const matchesCat = p.category.toLowerCase().includes(campaign.category.toLowerCase());
        const matchesTitle = p.title.toLowerCase().includes(campaign.category.toLowerCase());
        if (!matchesCat && !matchesTitle) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [campaign, products, searchQuery]);

  const platformConfig =
    campaign?.platform && campaign.platform !== 'all' ? PLATFORMS[campaign.platform] : null;

  const defaultTestimonials = [
    {
      name: 'Camila Ribeiro',
      role: 'Compradora Verificada',
      rating: 5,
      text: 'O look veste perfeito! Tecido de alta qualidade que não fica transparente. A dica da Tamires foi certeira.',
    },
    {
      name: 'Mariana Duarte',
      role: 'Seguidora VIP',
      rating: 5,
      text: 'Economizei com o cupom aplicado automaticamente e o produto chegou antes do prazo previsto!',
    },
    {
      name: 'Bruna Fernandes',
      role: 'Compradora Verificada',
      rating: 5,
      text: 'Super confiável! Links 100% seguros diretamente no app oficial.',
    },
  ];

  const testimonials = campaign?.testimonials && campaign.testimonials.length > 0
    ? campaign.testimonials
    : defaultTestimonials;

  const defaultFaqs = [
    {
      question: 'O link direciona para a loja oficial com segurança?',
      answer: 'Sim! Todos os links de compra são verificados pela curadoria de Tamires Santos e direcionam diretamente para os aplicativos ou sites oficiais de parceiros credenciados (Shopee, Shein, Mercado Livre e Amazon).',
    },
    {
      question: 'Como funciona a garantia de 7 dias?',
      answer: 'Conforme o Código de Defesa do Consumidor e as políticas de proteção ao comprador das plataformas parceiras, você tem até 7 dias corridos após o recebimento para solicitar devolução ou troca gratuita com reembolso integral.',
    },
    {
      question: 'Os cupons são aplicados automaticamente?',
      answer: 'Sim, ao clicar em qualquer botão de compra você é redirecionado já com o cupom de desconto ou link promocional ativado na sacola.',
    },
    {
      question: 'Qual o prazo de envio e rastreamento?',
      answer: 'A entrega varia conforme a sua região e a loja parceira (compras pelo Mercado Livre FULL costumam chegar em até 24h, e pedidos nacionais de Shopee/Shein entre 3 e 7 dias úteis). O código de rastreio é enviado imediatamente no seu e-mail.',
    },
  ];

  const faqs = campaign?.faqs && campaign.faqs.length > 0 ? campaign.faqs : defaultFaqs;

  const mainCtaTarget = campaign?.ctaUrl || (campaignProducts.length > 0 ? campaignProducts[0].affiliateUrl : '#produtos');

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* Dynamic Pixel and Tracking Scripts */}
      {campaign?.facebookPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${campaign.facebookPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {campaign?.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${campaign.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${campaign.googleAnalyticsId}');
            `}
          </Script>
        </>
      )}

      {/* Top Navbar */}
      <Navbar
        activePlatform={campaign?.platform || 'all'}
        onSelectPlatform={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        productCount={campaignProducts.length}
        bannerNotice={settings.topBannerNotice}
      />

      <main className="flex-1 bg-white pb-24">
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center justify-between">
          <Link
            href="/campanha"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors py-1.5 px-3 rounded-lg hover:bg-stone-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ver todas as campanhas</span>
          </Link>

          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 hidden sm:inline">
            Curadoria Oficial Tamires Santos
          </span>
        </div>

        {/* Campaign Hero Banner (Bottom-of-Funnel Conversion Core) */}
        {campaign ? (
          <section className="bg-stone-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-4 border border-stone-800 shadow-xl overflow-hidden relative">
            <div className="relative max-w-7xl mx-auto px-6 py-8 sm:py-12 lg:py-14 flex flex-col lg:flex-row items-center justify-between gap-8 z-10">
              <div className="flex-1 space-y-4">
                {/* Badges & Urgency Tag */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-amber-400 text-stone-950 rounded-full text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-stone-950" />
                    <span>{campaign.badge || 'PROMOÇÃO IMPERDÍVEL'}</span>
                  </span>

                  {platformConfig && (
                    <span
                      style={{ backgroundColor: platformConfig.color }}
                      className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs uppercase tracking-wider"
                    >
                      {platformConfig.name}
                    </span>
                  )}

                  <span className="px-3 py-1 bg-stone-800 text-stone-300 rounded-full text-xs font-medium">
                    {campaign.category || 'Curadoria Especial'}
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  {campaign.headline || campaign.title}
                </h1>

                {/* Objection Breaker Subtitle */}
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
                  {campaign.subheading ||
                    'Garantia de originalidade ou seu dinheiro de volta + Frete Grátis para todo o Brasil.'}
                </p>

                {/* Scarcity Trigger */}
                {campaign.scarcityText && (
                  <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{campaign.scarcityText}</span>
                  </div>
                )}

                {/* Urgency Countdown Timer Component */}
                {campaign.countdownActive && !timeLeft.isExpired && (
                  <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl space-y-2 max-w-md">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                        <span>Oferta termina em:</span>
                      </span>
                      <span className="text-[11px] text-rose-400 font-mono">Últimas Horas</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-stone-900/90 rounded-xl p-2 border border-stone-800">
                        <span className="block text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
                          {String(timeLeft.days).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-stone-400">Dias</span>
                      </div>
                      <div className="bg-stone-900/90 rounded-xl p-2 border border-stone-800">
                        <span className="block text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
                          {String(timeLeft.hours).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-stone-400">Horas</span>
                      </div>
                      <div className="bg-stone-900/90 rounded-xl p-2 border border-stone-800">
                        <span className="block text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
                          {String(timeLeft.minutes).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-stone-400">Minutos</span>
                      </div>
                      <div className="bg-stone-900/90 rounded-xl p-2 border border-stone-800">
                        <span className="block text-xl sm:text-2xl font-black text-amber-300 font-mono tabular-nums">
                          {String(timeLeft.seconds).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-amber-400">Segundos</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trust Seals and Guarantees below Headline */}
                <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-stone-300 border-t border-stone-800/80">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{campaign.guaranteeText || 'Garantia Incondicional de 7 Dias'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Links 100% Verificados</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Compra 100% Blindada</span>
                  </div>
                </div>

                {/* Action CTA Button in Hero */}
                <div className="pt-2 flex items-center gap-3">
                  <a
                    href={mainCtaTarget}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 transform active:scale-98"
                  >
                    <span>{campaign.ctaText || 'Garantir Oferta Agora com Desconto'}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <a
                    href="#produtos"
                    className="py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold rounded-xl border border-stone-700"
                  >
                    Ver Produtos Selecionados
                  </a>
                </div>
              </div>

              {/* Framed Lifestyle Showcase Photo (Responsive aspect ratio, no cuts) */}
              {campaign.bannerImageUrl && (
                <div className="w-full lg:w-96 aspect-16/10 rounded-2xl overflow-hidden relative border border-stone-700 shadow-xl bg-stone-900 shrink-0">
                  <Image
                    src={campaign.bannerImageUrl}
                    alt={campaign.title}
                    fill
                    className="object-cover object-center"
                    priority
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300">Curadoria Verificada</span>
                    <span className="text-stone-300">Estoque Monitorado</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="max-w-2xl mx-auto p-12 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
            <h1 className="font-serif text-2xl font-bold text-stone-900">Campanha não encontrada</h1>
            <p className="text-xs text-stone-500">
              A campanha que você está procurando pode ter expirado ou foi desativada pela curadora.
            </p>
            <Link
              href="/campanha"
              className="inline-flex items-center gap-2 py-2.5 px-4 bg-stone-900 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Ver todas as campanhas
            </Link>
          </div>
        )}

        {/* Campaign Products Grid */}
        <section id="produtos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Achadinhos Selecionados desta Campanha
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Exibindo {campaignProducts.length} itens com curadoria especial de Tamires Santos
              </p>
            </div>

            {/* Quick search inside campaign */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar nesta campanha..."
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          {campaignProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {campaignProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 max-w-md mx-auto">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="font-serif text-base font-bold text-stone-900">
                Nenhum produto cadastrado nesta seleção ainda
              </h3>
              <p className="text-xs text-stone-500 mt-1 mb-4">
                Tamires está preparando as melhores ofertas para esta campanha.
              </p>
              <Link
                href="/achadinhos"
                className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
              >
                Explorar vitrine completa
              </Link>
            </div>
          )}
        </section>

        {/* Social Proof (Testimonials / Depoimentos de Clientes) */}
        <section className="bg-stone-50/70 border-y border-stone-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/70 text-amber-900 rounded-full text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Prova Social & Experiências Reais</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                O que quem comprou está dizendo
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Mais de 10.000 seguidores já aproveitaram os garimpos da Tamires com economia comprovada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-900">{t.name}</p>
                      <p className="text-[11px] text-stone-500">{t.role || 'Compradora Verificada'}</p>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section (Perguntas Frequentes de Fundo de Funil) */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center space-y-2 mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Perguntas Frequentes
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Tire todas as suas dúvidas antes de finalizar sua compra
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
                  >
                    <span className="font-serif text-sm sm:text-base font-bold text-stone-900">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-stone-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Sticky Mobile CTA Bar (Fixed Bottom on Mobile for Max Conversion) */}
      {campaign?.stickyMobileCta !== false && campaign && (
        <aside
          aria-label="Ação rápida da campanha"
          className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 sm:hidden shadow-2xl flex items-center justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider truncate">
              {campaign.badge || 'Últimas Unidades'}
            </span>
            <span className="block text-xs font-black text-stone-900 truncate">
              {campaign.title}
            </span>
          </div>

          <a
            href={mainCtaTarget}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-transform"
          >
            <span>{campaign.ctaText ? 'Garantir Agora' : 'Comprar Agora'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
          </a>
        </aside>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Footer */}
      <Footer
        onSelectPlatform={() => {}}
        onOpenAdmin={() => {}}
        onOpenAuth={() => {}}
        currentUser={null}
        isAdmin={false}
      />
    </div>
  );
}
