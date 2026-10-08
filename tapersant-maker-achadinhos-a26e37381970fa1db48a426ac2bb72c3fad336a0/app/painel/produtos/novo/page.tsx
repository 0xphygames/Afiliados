'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/AdminContext';
import { Product, PlatformId } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import {
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Star,
  Check,
  AlertCircle,
  Save,
  Image as ImageIcon,
} from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Look Elegante / Vestuário', url: '/images/product_vestuario_conjunto_1791404036584.jpg' },
  { label: 'Suplemento Whey / Treino', url: '/images/product_suplemento_whey_1791404045349.jpg' },
  { label: 'Decoração Natalina', url: '/images/product_natal_decoracao_1791404054900.jpg' },
  { label: 'Guloseimas Gourmet / Doces', url: '/images/product_guloseimas_doces_1791404064852.jpg' },
  { label: 'Lifestyle / Acessórios', url: '/images/hero_achadinhos_looks_1791404026649.jpg' },
];

export default function NovoAchadinhoPage() {
  const router = useRouter();
  const { categories, handleSaveProduct } = useAdmin();

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<PlatformId>('shopee');
  const [category, setCategory] = useState('Vestuário');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/product_vestuario_conjunto_1791404036584.jpg');
  const [badge, setBadge] = useState('');
  const [tamiresTip, setTamiresTip] = useState('');
  const [rating, setRating] = useState('5.0');
  const [reviewCount, setReviewCount] = useState('240');

  const numPrice = parseFloat(price.replace(',', '.')) || 0;
  const numOrigPrice = parseFloat(originalPrice.replace(',', '.')) || 0;
  const discountPercent =
    numOrigPrice > numPrice && numPrice > 0
      ? Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100)
      : null;

  const currentPlatformConfig = PLATFORMS[platform] || PLATFORMS.shopee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Por favor, digite o título do produto.');
      return;
    }
    if (!numPrice || numPrice <= 0) {
      setErrorMsg('Por favor, informe o preço válido do produto.');
      return;
    }
    if (!affiliateUrl.trim()) {
      setErrorMsg('Por favor, insira o link de afiliado oficial.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      title: title.trim(),
      platform,
      category: category.trim() || 'Geral',
      price: numPrice,
      originalPrice: numOrigPrice > numPrice ? numOrigPrice : undefined,
      affiliateUrl: affiliateUrl.trim(),
      imageUrl: imageUrl.trim() || '/images/hero_achadinhos_looks_1791404026649.jpg',
      badge: badge.trim() || undefined,
      tamiresTip: tamiresTip.trim() || undefined,
      rating: parseFloat(rating) || 5.0,
      reviewCount: parseInt(reviewCount) || 120,
      createdAt: new Date().toISOString(),
    };

    try {
      await handleSaveProduct(newProduct);
      router.push('/painel/produtos');
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao salvar no banco de dados. Tente novamente.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/painel/produtos"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
              Cadastrar Novo Achadinho
            </h1>
            <p className="text-xs text-stone-500">
              Preencha as informações do produto. As alterações sobem direto para a vitrine.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900">
              Título do Produto <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Conjunto Canelado Modal Premium Feminino - Elegance"
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
            />
          </div>

          {/* Platform and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">
                Loja Parceira <span className="text-rose-500">*</span>
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformId)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900 font-medium"
              >
                <option value="shopee">🧡 Shopee</option>
                <option value="shein">🖤 Shein</option>
                <option value="mercadolivre">💛 Mercado Livre</option>
                <option value="amazon">📦 Amazon Prime</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">
                Categoria / Setor
              </label>
              <input
                type="text"
                list="cats-list"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Vestuário, Suplementos, Natal..."
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              />
              <datalist id="cats-list">
                {categories.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">
                Preço Promocional (R$) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 69.90"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">
                Preço Original De (R$) <span className="text-stone-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="Ex: 119.90"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              />
            </div>
          </div>

          {/* Affiliate URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900">
                Link de Afiliado Oficial <span className="text-rose-500">*</span>
              </label>
              {affiliateUrl && (
                <a
                  href={affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-amber-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Testar link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="url"
              required
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              placeholder="https://shope.ee/... ou seu link gerado do marketplace"
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
            />
          </div>

          {/* Image URL & Preset Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-900">
              URL da Foto do Produto
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... ou escolha um dos presets abaixo"
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
            />

            <div className="pt-1">
              <span className="text-[11px] text-stone-500 font-semibold block mb-1.5">
                Fotos rápidas de demonstração:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                      imageUrl === p.url
                        ? 'bg-stone-900 text-white border-stone-900 font-bold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tamires Tip */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Dica de Ouro da Tamires Santos (Opcional)</span>
            </label>
            <textarea
              rows={2}
              value={tamiresTip}
              onChange={(e) => setTamiresTip(e.target.value)}
              placeholder="Ex: O tecido é super macio e não marca no quadril. Recomendo comprar o tamanho de sempre!"
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900 leading-relaxed"
            />
          </div>

          {/* Badge & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-stone-900">
                Selo Especial
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex: Mais Vendido"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-stone-900">
                Avaliação (0 a 5)
              </label>
              <input
                type="text"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-stone-900">
                Nº de Avaliações
              </label>
              <input
                type="text"
                value={reviewCount}
                onChange={(e) => setReviewCount(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <Link
              href="/painel/produtos"
              className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>{saving ? 'Salvando no Banco...' : 'Salvar e Publicar'}</span>
            </button>
          </div>
        </form>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 sticky top-8 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Live Preview na Vitrine
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden max-w-sm mx-auto">
            {/* Card Media Container */}
            <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden border-b border-stone-100">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title || 'Prévia do Produto'}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-stone-400">
                  <ShoppingBag className="w-10 h-10 mb-2" />
                  <span className="text-xs">Foto do Produto</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between">
                <span
                  style={{ backgroundColor: currentPlatformConfig.color }}
                  className="px-2.5 py-1 text-[11px] font-bold text-white rounded-md uppercase tracking-wider shadow-xs"
                >
                  {currentPlatformConfig.name}
                </span>

                {badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-stone-950 rounded-md shadow-xs">
                    {badge}
                  </span>
                )}
              </div>

              {discountPercent && discountPercent > 0 && (
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="px-2 py-0.5 text-xs font-black bg-rose-600 text-white rounded-md shadow-xs">
                    -{discountPercent}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold text-stone-600">{category || 'Categoria'}</span>
                <div className="flex items-center gap-1 font-semibold text-stone-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{rating}</span>
                  <span className="text-stone-400">({reviewCount})</span>
                </div>
              </div>

              <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2">
                {title || 'Nome do seu achadinho aparecerá aqui...'}
              </h3>

              {tamiresTip && (
                <div className="bg-stone-50 border-l-2 border-amber-400 p-2.5 rounded-r-md text-xs text-stone-700 italic border border-stone-150">
                  <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold uppercase not-italic mb-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                    <span>Dica da Tamires</span>
                  </div>
                  <p className="line-clamp-2">&ldquo;{tamiresTip}&rdquo;</p>
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-stone-900 tabular-nums">
                    {numPrice > 0
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numPrice)
                      : 'R$ 0,00'}
                  </span>
                  {numOrigPrice > numPrice && (
                    <span className="text-xs text-stone-400 line-through tabular-nums">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numOrigPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{ backgroundColor: currentPlatformConfig.color }}
                className="w-full py-2.5 px-3 text-xs font-bold text-white rounded-xl shadow-xs text-center flex items-center justify-center gap-1.5"
              >
                <span>Ir para o Produto na {currentPlatformConfig.name}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
