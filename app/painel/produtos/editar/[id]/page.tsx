'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/lib/AdminContext';
import { Product, PlatformId, CustomCategory } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import {
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Star,
  AlertCircle,
  Save,
  Trash2,
  Image as ImageIcon,
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Look Elegante / Vestuário', url: '/images/product_vestuario_conjunto_1791404036584.jpg' },
  { label: 'Suplemento Whey / Treino', url: '/images/product_suplemento_whey_1791404045349.jpg' },
  { label: 'Decoração Natalina', url: '/images/product_natal_decoracao_1791404054900.jpg' },
  { label: 'Guloseimas Gourmet / Doces', url: '/images/product_guloseimas_doces_1791404064852.jpg' },
  { label: 'Lifestyle / Acessórios', url: '/images/hero_achadinhos_looks_1791404026649.jpg' },
];

function EditProductForm({
  product,
  categories,
  onSave,
  onDelete,
}: {
  product: Product;
  categories: CustomCategory[];
  onSave: (p: Product) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states initialized with product
  const [title, setTitle] = useState(product.title || '');
  const [platform, setPlatform] = useState<PlatformId>(product.platform || 'shopee');
  const [category, setCategory] = useState(product.category || 'Geral');
  const [price, setPrice] = useState(product.price ? String(product.price) : '');
  const [originalPrice, setOriginalPrice] = useState(
    product.originalPrice ? String(product.originalPrice) : ''
  );
  const [affiliateUrl, setAffiliateUrl] = useState(product.affiliateUrl || '');

  // Multiple images state
  const initialImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(Boolean)
      : [product.imageUrl || '/images/hero_achadinhos_looks_1791404026649.jpg'];
  const [images, setImages] = useState<string[]>(initialImages);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  const [badge, setBadge] = useState(product.badge || '');
  const [tamiresTip, setTamiresTip] = useState(product.tamiresTip || '');
  const [rating, setRating] = useState(product.rating ? String(product.rating) : '5.0');
  const [reviewCount, setReviewCount] = useState(product.reviewCount ? String(product.reviewCount) : '240');

  const handleAddImage = (urlToAdd?: string) => {
    const url = (urlToAdd || newImageUrl).trim();
    if (!url) return;
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
    }
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (images.length <= 1) {
      alert('O produto precisa ter pelo menos 1 imagem.');
      return;
    }
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (activePreviewIndex >= images.length - 1) {
      setActivePreviewIndex(0);
    }
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    setImages((prev) => {
      const selected = prev[indexToPrimary];
      const rest = prev.filter((_, idx) => idx !== indexToPrimary);
      return [selected, ...rest];
    });
    setActivePreviewIndex(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

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
      setErrorMsg('Por favor, informe o título do produto.');
      return;
    }
    if (!numPrice || numPrice <= 0) {
      setErrorMsg('Por favor, informe um preço válido.');
      return;
    }
    if (!affiliateUrl.trim()) {
      setErrorMsg('Por favor, insira o link de afiliado oficial.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const validImages = images.filter((img) => img.trim().length > 0);
    const primaryImg = validImages[0] || '/images/hero_achadinhos_looks_1791404026649.jpg';

    const updatedProduct: Product = {
      id: product.id,
      title: title.trim(),
      platform,
      category: category.trim() || 'Geral',
      price: numPrice,
      originalPrice: numOrigPrice > numPrice ? numOrigPrice : undefined,
      affiliateUrl: affiliateUrl.trim(),
      imageUrl: primaryImg,
      images: validImages.length > 0 ? validImages : [primaryImg],
      badge: badge.trim() || undefined,
      tamiresTip: tamiresTip.trim() || undefined,
      rating: parseFloat(rating) || 5.0,
      reviewCount: parseInt(reviewCount) || 120,
      createdAt: product.createdAt,
    };

    try {
      await onSave(updatedProduct);
      router.push('/painel/produtos');
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao atualizar produto no banco de dados.');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Deseja realmente excluir "${title}"?`)) {
      setSaving(true);
      await onDelete(product.id);
      router.push('/painel/produtos');
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
              Editar Achadinho
            </h1>
            <p className="text-xs text-stone-500">
              Modifique informações, valores e links. Salva instantaneamente no Firestore.
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          type="button"
          className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Excluir achadinho"
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>Excluir Produto</span>
        </button>
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
                list="cats-list-edit"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              />
              <datalist id="cats-list-edit">
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
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
            />
          </div>

          {/* Multiple Images Gallery Manager */}
          <div className="space-y-3 p-4 bg-stone-50/80 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-stone-700" />
                  <span>Galeria de Fotos do Produto ({images.length} adicionada{images.length !== 1 ? 's' : ''})</span>
                </label>
                <p className="text-[11px] text-stone-500">
                  Adicione ou remova fotos do achadinho. A primeira foto é a capa da vitrine.
                </p>
              </div>

              <label className="cursor-pointer py-1.5 px-3 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 transition-colors flex items-center gap-1.5 shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-stone-600" />
                <span>Subir do Dispositivo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Added Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {images.map((img, idx) => (
                <div
                  key={`${img}-${idx}`}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-stone-100 group shadow-2xs ${
                    idx === 0 ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-stone-200'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Foto ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                    referrerPolicy="no-referrer"
                  />

                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-amber-400 text-stone-900 text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs">
                      Principal
                    </span>
                  )}

                  <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="w-full py-1 px-1.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-[10px] rounded shadow-xs transition-colors"
                      >
                        Tornar Capa
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="py-1 px-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Input to add another image URL */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
                placeholder="Cole a URL de mais uma foto (ex: https://...)"
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900"
              />
              <button
                type="button"
                onClick={() => handleAddImage()}
                className="py-2 px-3.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Adicionar Foto</span>
              </button>
            </div>

            {/* Preset quick buttons */}
            <div className="pt-1 border-t border-stone-200/60">
              <span className="text-[11px] text-stone-500 font-semibold block mb-1.5">
                Fotos pré-selecionadas de demonstração (clique para acrescentar):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => handleAddImage(p.url)}
                    className="px-2.5 py-1 text-[11px] rounded-lg border bg-white hover:bg-stone-100 text-stone-700 border-stone-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-stone-400" />
                    <span>{p.label}</span>
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
              <span>{saving ? 'Atualizando...' : 'Atualizar e Publicar'}</span>
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
              {images.length > 0 && images[activePreviewIndex] ? (
                <Image
                  src={images[activePreviewIndex]}
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

              {/* Photo navigation if multiple */}
              {images.length > 1 && (
                <>
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
                    <button
                      type="button"
                      onClick={() =>
                        setActivePreviewIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                      }
                      className="p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors pointer-events-auto"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePreviewIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                      }
                      className="p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors pointer-events-auto"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {activePreviewIndex + 1}/{images.length} fotos
                  </div>
                </>
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
                {title || 'Nome do produto...'}
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

export default function EditarAchadinhoPage() {
  const params = useParams();
  const productId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { products, categories, handleSaveProduct, handleDeleteProduct } = useAdmin();

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-stone-200">
        <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
        <h2 className="font-serif text-lg font-bold text-stone-900">Buscando produto no banco...</h2>
        <p className="text-xs text-stone-500">
          Se o produto foi removido ou não existe, retorne à listagem.
        </p>
        <Link
          href="/painel/produtos"
          className="inline-block px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
        >
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <EditProductForm
      key={product.id}
      product={product}
      categories={categories}
      onSave={handleSaveProduct}
      onDelete={handleDeleteProduct}
    />
  );
}
