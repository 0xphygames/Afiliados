'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Product, PlatformId } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import { exportProductsJson } from '@/lib/storage';
import { User } from 'firebase/auth';
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
} from 'lucide-react';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetToDefault: () => void;
  onImportProducts: (products: Product[]) => void;
  editingProduct?: Product | null;
  currentUser: User | null;
  isAdmin: boolean;
  onOpenAuth: () => void;
}

const COMMON_CATEGORIES = [
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

interface FormProps {
  initialProduct?: Product | null;
  onSave: (product: Product) => void;
  onCancel?: () => void;
}

function ProductForm({ initialProduct, onSave, onCancel }: FormProps) {
  const isEditing = Boolean(initialProduct);

  const [title, setTitle] = useState(() => initialProduct?.title || '');
  const [platform, setPlatform] = useState<PlatformId>(() => initialProduct?.platform || 'shopee');
  const [category, setCategory] = useState(() => {
    if (!initialProduct) return 'Vestuário';
    return COMMON_CATEGORIES.includes(initialProduct.category) ? initialProduct.category : 'Outro';
  });
  const [customCategory, setCustomCategory] = useState(() => {
    if (!initialProduct) return '';
    return COMMON_CATEGORIES.includes(initialProduct.category) ? '' : initialProduct.category;
  });
  const [imageUrl, setImageUrl] = useState(
    () => initialProduct?.imageUrl || '/images/product_vestuario_conjunto_1791404036584.jpg'
  );
  const [affiliateUrl, setAffiliateUrl] = useState(
    () => initialProduct?.affiliateUrl || 'https://shopee.com.br/'
  );
  const [price, setPrice] = useState<number>(() => initialProduct?.price ?? 49.9);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(
    () => initialProduct?.originalPrice ?? 89.9
  );
  const [badge, setBadge] = useState(() => initialProduct?.badge || 'Destaque');
  const [tamiresTip, setTamiresTip] = useState(
    () =>
      initialProduct?.tamiresTip ||
      'Aprovado pela Tamires: acabamento impecável e envio super rápido!'
  );
  const [rating, setRating] = useState(() => initialProduct?.rating ?? 4.9);
  const [reviewCount, setReviewCount] = useState(() => initialProduct?.reviewCount ?? 350);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !affiliateUrl.trim()) {
      alert('Por favor, preencha o título e o link de afiliado do produto.');
      return;
    }

    const finalCategory =
      category === 'Outro' && customCategory.trim()
        ? customCategory.trim()
        : category;

    const prodToSave: Product = {
      id: initialProduct ? initialProduct.id : `prod-${Date.now()}`,
      title: title.trim(),
      platform,
      category: finalCategory,
      imageUrl: imageUrl.trim() || '/images/hero_achadinhos_looks_1791404026649.jpg',
      affiliateUrl: affiliateUrl.trim(),
      price: Number(price) || 0,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      badge: badge.trim() || undefined,
      tamiresTip: tamiresTip.trim() || undefined,
      rating: Number(rating) || 4.9,
      reviewCount: Number(reviewCount) || 1,
      createdAt: initialProduct ? initialProduct.createdAt : new Date().toISOString(),
    };

    onSave(prodToSave);
  };

  const isUnoptimizedPreview =
    imageUrl.startsWith('data:') ||
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://');

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white">
      {/* Platform Selector */}
      <div>
        <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
          1. Em qual loja o cliente vai comprar?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['shopee', 'shein', 'mercadolivre', 'amazon'] as PlatformId[]).map((pId) => {
            const cfg = PLATFORMS[pId];
            const isSelected = platform === pId;
            return (
              <button
                type="button"
                key={pId}
                onClick={() => setPlatform(pId)}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                }`}
              >
                <span>{cfg.name}</span>
                <span
                  className={`text-[10px] font-normal ${
                    isSelected ? 'text-amber-300' : 'text-stone-500'
                  }`}
                >
                  {pId === 'shopee' ? 'Principal' : cfg.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category / Sector */}
      <div>
        <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
          2. Setor / Categoria (ex: Vestuário, Suplementos, Natal...)
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {COMMON_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => {
                setCategory(cat);
                setCustomCategory('');
              }}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                category === cat
                  ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCategory('Outro')}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
              category === 'Outro'
                ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            + Outro Setor
          </button>
        </div>

        {category === 'Outro' && (
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Digite o nome do novo setor (ex: Papelaria, Utilidades...)"
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none bg-white text-stone-900"
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Conjunto Modal Canelado Premium 2 Peças"
          className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-none bg-white text-stone-900"
          required
        />
      </div>

      {/* Affiliate Link */}
      <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
            <span>4. Seu Link de Afiliado (Gera sua Comissão)</span>
          </label>
          {affiliateUrl && (
            <a
              href={affiliateUrl}
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
          value={affiliateUrl}
          onChange={(e) => setAffiliateUrl(e.target.value)}
          placeholder="Cole seu link de afiliada: https://s.shopee.com.br/... ou https://..."
          className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-none font-mono text-stone-900"
          required
        />
        <p className="text-[11px] text-amber-900">
          Quando o cliente clicar no botão de compra, ele será levado diretamente por este link e sua comissão é registrada na sua conta oficial!
        </p>
      </div>

      {/* Image Input Options */}
      <div>
        <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
          5. Foto do Produto (Link ou Foto do Celular/PC)
        </label>
        <div className="space-y-2.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Cole o link da foto (URL) ou clique em Upload ao lado"
              className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none bg-white text-stone-900"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1.5 text-stone-800 transition-colors shadow-xs"
              title="Subir foto do seu computador ou celular"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Foto</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Quick Preset Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] text-stone-500 whitespace-nowrap">Exemplos rápidos:</span>
            {PRESET_IMAGES.map((preset) => (
              <button
                type="button"
                key={preset.label}
                onClick={() => setImageUrl(preset.url)}
                className={`text-[10px] px-2 py-0.5 rounded border whitespace-nowrap transition-colors ${
                  imageUrl === preset.url
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="relative aspect-16/9 w-full max-w-xs rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
              <Image
                src={imageUrl}
                alt="Pré-visualização"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                unoptimized={isUnoptimizedPreview}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
            Preço com Desconto (Por R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            placeholder="49.90"
            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none tabular-nums font-semibold bg-white text-stone-900"
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
            value={originalPrice ?? ''}
            onChange={(e) =>
              setOriginalPrice(e.target.value ? parseFloat(e.target.value) : undefined)
            }
            placeholder="89.90"
            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none tabular-nums bg-white text-stone-900"
          />
        </div>
      </div>

      {/* Badge & Rating */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
            Selo de Destaque
          </label>
          <input
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="Ex: Mais Vendido, Frete Grátis..."
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:outline-none bg-white text-stone-900"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
            Nota e Avaliações
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value) || 5.0)}
              className="w-16 px-2 py-2 text-xs border border-stone-300 rounded-lg text-center bg-white text-stone-900"
            />
            <input
              type="number"
              value={reviewCount}
              onChange={(e) => setReviewCount(parseInt(e.target.value) || 1)}
              placeholder="Avaliações"
              className="flex-1 px-2 py-2 text-xs border border-stone-300 rounded-lg bg-white text-stone-900"
            />
          </div>
        </div>
      </div>

      {/* Tamires' Personal Tip */}
      <div>
        <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Dica Pessoal da Tamires (Avaliação Sincera)</span>
        </label>
        <textarea
          rows={2}
          value={tamiresTip}
          onChange={(e) => setTamiresTip(e.target.value)}
          placeholder="Ex: Veste super bem, recomendo pegar o tamanho M!"
          className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:outline-none bg-white text-stone-900"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex items-center gap-3">
        <button
          type="submit"
          className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>{isEditing ? 'Salvar Alterações no Banco' : 'Salvar no Banco de Dados'}</span>
        </button>

        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors border border-stone-200"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export function AdminDrawer({
  isOpen,
  onClose,
  products,
  onSaveProduct,
  onDeleteProduct,
  onResetToDefault,
  onImportProducts,
  editingProduct,
  currentUser,
  isAdmin,
  onOpenAuth,
}: AdminDrawerProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [currentEditing, setCurrentEditing] = useState<Product | null>(editingProduct || null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = (prod: Product) => {
    onSaveProduct(prod);
    setSuccessNotice(
      currentEditing ? 'Achadinho atualizado com sucesso no banco de dados!' : 'Novo achadinho salvo com sucesso no banco de dados!'
    );
    setCurrentEditing(null);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleStartEdit = (prod: Product) => {
    setCurrentEditing(prod);
    setActiveTab('form');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportProducts(parsed);
            alert(`Sucesso! ${parsed.length} achadinhos foram importados.`);
          }
        } catch {
          alert('Arquivo JSON inválido.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden text-stone-900 border-l border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              TS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Painel de Conteúdos da Tamires
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Database className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Nuvem Firestore</span>
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Gerencie fotos, links de afiliada e postagens no banco de dados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth status banner inside drawer */}
        <div className="px-5 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-stone-700">
                Conectada como <strong>{currentUser.email}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-900">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Faça login para salvar alterações com segurança no banco em nuvem.</span>
            </div>
          )}

          {!currentUser && (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-md text-[11px] flex items-center gap-1 transition-colors"
            >
              <LogIn className="w-3 h-3" />
              <span>Login Admin</span>
            </button>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-5 pt-2">
          <button
            onClick={() => {
              setActiveTab('form');
            }}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'form'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{currentEditing ? 'Editar Post / Achadinho' : 'Criar Post / Achadinho'}</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'list'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Todos os Posts ({products.length})</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {successNotice && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white">
          {activeTab === 'form' ? (
            <ProductForm
              key={currentEditing ? currentEditing.id : 'new-form-instance'}
              initialProduct={currentEditing}
              onSave={handleSave}
              onCancel={() => {
                setCurrentEditing(null);
                onClose();
              }}
            />
          ) : (
            /* Tab: Product Management List */
            <div className="space-y-4 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <span className="text-xs text-stone-600 font-medium">
                  {products.length} itens salvos no banco
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportProductsJson(products)}
                    className="px-2.5 py-1 text-xs font-semibold bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg flex items-center gap-1 border border-stone-300 transition-colors"
                    title="Baixar backup dos produtos"
                  >
                    <Download className="w-3 h-3" />
                    <span>Backup JSON</span>
                  </button>

                  <button
                    onClick={() => importFileRef.current?.click()}
                    className="px-2.5 py-1 text-xs font-semibold bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg flex items-center gap-1 border border-stone-300 transition-colors"
                    title="Restaurar backup JSON"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Restaurar</span>
                  </button>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="divide-y divide-stone-100 space-y-2">
                {products.map((item) => {
                  const pCfg = PLATFORMS[item.platform];
                  const isUnoptimizedItem =
                    item.imageUrl.startsWith('data:') ||
                    item.imageUrl.startsWith('http://') ||
                    item.imageUrl.startsWith('https://');

                  return (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50 p-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                              unoptimized={isUnoptimizedItem}
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
                            <span className="text-stone-500 truncate">{item.category}</span>
                          </div>
                          <p className="text-xs font-semibold text-stone-900 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs font-bold text-stone-800 tabular-nums">
                            R$ {item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-200 rounded-lg transition-colors"
                          title="Editar este achado"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja remover "${item.title}" do banco de dados?`)) {
                              onDeleteProduct(item.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reset to initial seeds button */}
              <div className="pt-6 border-t border-stone-200 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        'Deseja recarregar o catálogo padrão de exemplos no banco de dados?'
                      )
                    ) {
                      onResetToDefault();
                    }
                  }}
                  className="text-xs text-stone-500 hover:text-rose-600 inline-flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar catálogo inicial padrão</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
