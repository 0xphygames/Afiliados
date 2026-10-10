'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAdmin } from '@/lib/AdminContext';
import { CustomLandingPage, PlatformId } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import {
  Layers,
  PlusCircle,
  ExternalLink,
  Trash2,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Power,
  Globe,
  Upload,
  Copy,
  Check,
  ImageIcon,
  Eye,
} from 'lucide-react';
import { optimizeImageFile } from '@/lib/image-compress';

const BANNER_PRESETS = [
  {
    name: 'Vitrine Principal Looks',
    url: '/images/hero_achadinhos_looks_1791404026649.jpg',
  },
  {
    name: 'Vestuário & Moda Elegance',
    url: '/images/product_vestuario_conjunto_1791404036584.jpg',
  },
  {
    name: 'Suplementos & Musculação',
    url: '/images/product_suplemento_whey_1791404045349.jpg',
  },
  {
    name: 'Especial Natal & Festas',
    url: '/images/product_natal_decoracao_1791404054900.jpg',
  },
  {
    name: 'Guloseimas & Kids',
    url: '/images/product_guloseimas_doces_1791404064852.jpg',
  },
];

export default function PainelCampanhasPage() {
  const { landingPages, handleSaveLandingPage, handleDeleteLandingPage } = useAdmin();

  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New page form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [headline, setHeadline] = useState('');
  const [subheading, setSubheading] = useState('');
  const [platform, setPlatform] = useState<PlatformId | 'all'>('shopee');
  const [category, setCategory] = useState('');
  const [badge, setBadge] = useState('Especial');
  const [bannerImageUrl, setBannerImageUrl] = useState('/images/hero_achadinhos_looks_1791404026649.jpg');

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(val));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimized = await optimizeImageFile(file, 900, 0.72);
      setBannerImageUrl(optimized);
    } catch (err) {
      console.error('Erro ao otimizar banner da campanha:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setBannerImageUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyLink = (pageSlug: string) => {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      const url = `${window.location.origin}/campanha/${pageSlug}`;
      navigator.clipboard.writeText(url);
      setCopiedSlug(pageSlug);
      setTimeout(() => setCopiedSlug(null), 2500);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const cleanSlug = generateSlug(slug.trim() || title.trim());
    if (!cleanSlug) return;

    setSaving(true);
    const newPage: CustomLandingPage = {
      id: `page-${Date.now()}`,
      title: title.trim(),
      slug: cleanSlug,
      headline: headline.trim() || title.trim(),
      subheading: subheading.trim(),
      platform,
      category: category.trim() || undefined,
      badge: badge.trim() || undefined,
      bannerImageUrl: bannerImageUrl.trim() || '/images/hero_achadinhos_looks_1791404026649.jpg',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    try {
      await handleSaveLandingPage(newPage);
      setShowCreateForm(false);
      setSuccessToast(`Página "/campanha/${cleanSlug}" criada com sucesso!`);
      setTimeout(() => setSuccessToast(null), 5000);
      setTitle('');
      setSlug('');
      setHeadline('');
      setSubheading('');
      setCategory('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (page: CustomLandingPage) => {
    await handleSaveLandingPage({
      ...page,
      isActive: !page.isActive,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Toast */}
      {successToast && (
        <div className="p-4 bg-emerald-900 text-white rounded-2xl flex items-center justify-between shadow-lg animate-fade-in border border-emerald-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span className="text-xs font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-xs text-emerald-200 hover:text-white"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-purple-600" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Páginas & Campanhas (Landing Pages)
            </h1>
          </div>
          <p className="text-xs text-stone-500 max-w-xl">
            Crie páginas promocionais personalizadas com URL própria (ex: /campanha/looks-femininos, /campanha/natal) para compartilhar nos stories do Instagram e grupos VIP.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto justify-center"
        >
          <PlusCircle className="w-4 h-4 text-amber-300" />
          <span>{showCreateForm ? 'Fechar Formulário' : 'Nova Campanha'}</span>
        </button>
      </div>

      {/* Collapsible Responsive Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200 shadow-md space-y-5 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h2 className="font-serif font-bold text-base text-stone-900">
                Criar Nova Página de Campanha
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-xs text-stone-500 hover:text-stone-900"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">
                Título da Campanha *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: Looks Femininos Elegantes"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">
                Slug da URL Pública *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-stone-100 text-stone-500 border border-r-0 border-stone-200 rounded-l-xl text-xs font-mono shrink-0">
                  /campanha/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  placeholder="looks-femininos"
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">
                Frase de Destaque (Headline)
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ex: Peças virais que valorizam com caimento impecável"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">
                Subtítulo Explicativo
              </label>
              <input
                type="text"
                value={subheading}
                onChange={(e) => setSubheading(e.target.value)}
                placeholder="Ex: Seleção testada e aprovada pela Tamires Santos com cupons oficiais."
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">Loja Parceira</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformId | 'all')}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900 font-medium"
              >
                <option value="all">✨ Todas as Lojas</option>
                <option value="shopee">🧡 Shopee</option>
                <option value="shein">🖤 Shein</option>
                <option value="mercadolivre">💛 Mercado Livre</option>
                <option value="amazon">📦 Amazon Prime</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">Filtrar por Categoria</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Vestuário, Suplementos..."
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">Selo da Campanha</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex: Tendência 2026, Especial"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              />
            </div>
          </div>

          {/* Banner Image Customizer */}
          <div className="p-4 bg-stone-50/90 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-stone-700" />
                  <span>Foto de Capa do Banner</span>
                </label>
                <p className="text-[11px] text-stone-500">
                  Suba uma imagem do seu celular/computador ou use uma pré-definida.
                </p>
              </div>

              <label className="cursor-pointer py-1.5 px-3 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-stone-600" />
                <span>Subir Imagem</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={bannerImageUrl}
                onChange={(e) => setBannerImageUrl(e.target.value)}
                placeholder="URL da imagem..."
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900"
              />

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {BANNER_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setBannerImageUrl(preset.url)}
                    className="px-2.5 py-1 bg-white hover:bg-stone-200 border border-stone-200 rounded-lg text-[10px] font-semibold text-stone-700 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Banner Preview */}
            {bannerImageUrl && (
              <div className="relative h-28 w-full rounded-xl overflow-hidden border border-stone-200 mt-2">
                <Image
                  src={bannerImageUrl}
                  alt="Pré-visualização do banner"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
                <div className="absolute inset-0 bg-stone-950/40 flex items-center px-4">
                  <div className="text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-stone-900 px-2 py-0.5 rounded">
                      {badge || 'Especial'}
                    </span>
                    <h4 className="font-serif font-bold text-sm sm:text-base drop-shadow-sm mt-1">
                      {title || 'Título da Sua Campanha'}
                    </h4>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>{saving ? 'Publicando...' : 'Publicar Campanha no Site'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Existing Landing Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {landingPages.map((page) => {
          const storeConfig = page.platform && page.platform !== 'all' ? PLATFORMS[page.platform] : null;
          const isCopied = copiedSlug === page.slug;

          return (
            <div
              key={page.id}
              className={`bg-white rounded-3xl border overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                page.isActive ? 'border-stone-200' : 'border-stone-200 opacity-60'
              }`}
            >
              <div>
                {/* Banner Header */}
                <div className="relative h-36 w-full bg-stone-100 overflow-hidden">
                  {page.bannerImageUrl ? (
                    <Image
                      src={page.bannerImageUrl}
                      alt={page.title}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs ${
                        page.isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-stone-700 text-stone-300'
                      }`}
                    >
                      {page.isActive ? 'Ativa no Site' : 'Pausada'}
                    </span>

                    {storeConfig && (
                      <span
                        style={{ backgroundColor: storeConfig.color }}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs"
                      >
                        {storeConfig.name}
                      </span>
                    )}
                  </div>

                  {/* Bottom title on image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-serif font-bold text-base leading-tight drop-shadow-sm">
                      {page.title}
                    </h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between gap-1.5 text-xs text-stone-600 font-mono bg-stone-50 p-2 rounded-xl border border-stone-200">
                    <div className="flex items-center gap-1.5 truncate">
                      <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">/campanha/{page.slug}</span>
                    </div>

                    <button
                      onClick={() => handleCopyLink(page.slug)}
                      className="px-2 py-1 bg-white hover:bg-stone-200 border border-stone-200 rounded text-[11px] font-sans font-bold flex items-center gap-1 text-stone-700 shrink-0 cursor-pointer"
                      title="Copiar link completo da campanha"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-500" />}
                      <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {page.headline || page.subheading}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between gap-2 mt-2">
                <Link
                  href={`/campanha/${page.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="Abrir página pública"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ver Página</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleActive(page)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                      page.isActive
                        ? 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                    title={page.isActive ? 'Pausar campanha' : 'Ativar campanha'}
                  >
                    <Power className="w-3 h-3" />
                    <span>{page.isActive ? 'Pausar' : 'Ativar'}</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm(`Remover campanha "${page.title}"?`)) {
                        await handleDeleteLandingPage(page.id);
                      }
                    }}
                    className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Excluir campanha"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
