'use client';

import { subscribeTaxonomy, TaxMacro } from '@/lib/taxonomy-db';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAdmin } from '@/lib/AdminContext';
import { Article } from '@/lib/types';
import {
  BookOpen,
  PlusCircle,
  Pencil,
  Trash2,
  ExternalLink,
  Save,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { optimizeImageFile } from '@/lib/image-compress';
import { supabase, SUPABASE_STORAGE_BUCKET } from '@/lib/supabase';
import { BlogContentEditor } from '@/components/BlogContentEditor';

const PRESET_ARTICLE_COVERS = [
  {
    label: 'Looks & Tendências',
    url: '/images/hero_achadinhos_looks_1791404026649.jpg',
  },
  {
    label: 'Vestuário & Moda',
    url: '/images/product_vestuario_conjunto_1791404036584.jpg',
  },
  {
    label: 'Suplementos & Fitness',
    url: '/images/product_suplemento_whey_1791404045349.jpg',
  },
  {
    label: 'Natal & Decoração',
    url: '/images/product_natal_decoracao_1791404054900.jpg',
  },
  {
    label: 'Doces & Gourmet',
    url: '/images/product_guloseimas_doces_1791404064852.jpg',
  },
];

export default function PainelArtigosPage() {
  const { articles, products, handleSaveArticle, handleDeleteArticle } = useAdmin();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [tree, setTree] = useState<TaxMacro[]>([]);
  useEffect(() => subscribeTaxonomy((t) => setTree(t)), []);
  const [platform, setPlatform] = useState<string>('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('/images/hero_achadinhos_looks_1791404026649.jpg');
  const [saving, setSaving] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimized = await optimizeImageFile(file, 800, 0.72);
      const blob = await (await fetch(optimized)).blob();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `articles/${Date.now()}-${safeName.replace(/\.[^.]+$/, '')}.jpg`;
      const { error } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false, cacheControl: '31536000' });
      if (error) throw error;
      setCoverImageUrl(supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(path).data.publicUrl);
    } catch (err) {
      console.error('Erro ao otimizar imagem do artigo:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCoverImageUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCreate = () => {
    setEditingId(null);
    setTitle('');
    setDepartment('');
    setSubcategory('');
    setSummary('');
    setContent('');
    setCoverImageUrl('/images/hero_achadinhos_looks_1791404026649.jpg');
    setIsEditing(true);
  };

  const startEdit = (art: Article) => {
    setEditingId(art.id);
    setTitle(art.title);
    setDepartment(art.department || '');
    setSubcategory(art.subcategory || '');
    setPlatform(art.platform || '');
    setSummary(art.summary);
    setContent(art.content);
    setCoverImageUrl(art.coverImageUrl || '/images/hero_achadinhos_looks_1791404026649.jpg');
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    const newArt: Article = {
      id: editingId || `art-${Date.now()}`,
      title: title.trim(),
      category: subcategory || department || 'Guia de Compras',
      department: department || undefined,
      subcategory: subcategory || undefined,
      summary: summary.trim() || title.trim(),
      content: content.trim(),
      coverImageUrl: coverImageUrl.trim() || '/images/hero_achadinhos_looks_1791404026649.jpg',
      author: 'Tamires Santos',
      featured: true,
      platform: (platform || null) as Article['platform'],
      createdAt: editingId
        ? articles.find((a) => a.id === editingId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    try {
      await handleSaveArticle(newArt);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert(
        'Não foi possível publicar o artigo. ' +
          (err instanceof Error ? err.message : 'Verifique as permissões de escrita no banco (migração 202610140002).')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Blog & Artigos da Curadora
            </h1>
          </div>
          <p className="text-xs text-stone-500 max-w-xl">
            Escreva resenhas completas, dicas de tamanho e alertas de promoções. Seus artigos ajudam suas seguidoras a comprar com mais confiança.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={startCreate}
            className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Escrever Novo Post</span>
          </button>
        )}
      </div>

      {/* Form View */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md space-y-5 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h2 className="font-serif font-bold text-base text-stone-900">
              {editingId ? 'Editar Post do Blog' : 'Criar Novo Post no Blog'}
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-stone-500 hover:text-stone-900"
            >
              Fechar formulário
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">Título do Post</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Top 5 Achadinhos da Shopee que valem cada centavo"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">Loja</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              >
                <option value="">Nenhuma loja específica</option>
                <option value="shopee">Shopee</option>
                <option value="shein">Shein</option>
                <option value="mercadolivre">Mercado Livre</option>
                <option value="amazon">Amazon</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-900">Classificação</label>
              <div className="grid grid-cols-2 gap-3">
                <select value={department} onChange={(e) => { setDepartment(e.target.value); setSubcategory(''); }} className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900">
                  <option value="">Escolha a macro</option>
                  {tree.map((m) => (
                    <option key={m.node.id} value={m.node.name}>{m.node.name}</option>
                  ))}
                </select>
                <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900">
                  <option value="">Escolha a micro</option>
                  {(tree.find((m) => m.node.name === department)?.micros ?? []).map((mi) => (
                    <option key={mi.id} value={mi.name}>{mi.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900">Resumo Curto (chamada)</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ex: Testei as peças mais famosas das redes sociais: conjunto modal e acessórios..."
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
            />
          </div>

          {/* Rich Cover Image Section */}
          <div className="space-y-3 p-4 bg-stone-50/80 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-stone-700" />
                  <span>Foto de Capa do Post</span>
                </label>
                <p className="text-[11px] text-stone-500">
                  A imagem que aparece em destaque no topo do artigo e nos cards do blog.
                </p>
              </div>

              <label className="cursor-pointer py-1.5 px-3 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 transition-colors flex items-center gap-1.5 shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-stone-600" />
                <span>Subir do Dispositivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Live Preview of Cover Image */}
            {coverImageUrl ? (
              <div className="relative aspect-16/7 w-full rounded-2xl overflow-hidden border-2 border-amber-300 bg-stone-100 shadow-xs">
                <Image
                  src={coverImageUrl}
                  alt="Prévia da Capa"
                  fill
                  className="object-cover"
                  unoptimized
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent flex items-end p-4">
                  <span className="text-white text-xs font-semibold drop-shadow-md">
                    {title || 'Título do seu artigo aparecerá aqui...'}
                  </span>
                </div>
                <span className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Foto de Capa Ativa
                </span>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-stone-300 rounded-2xl text-center text-stone-400 text-xs">
                Nenhuma foto de capa selecionada. Escolha uma das opções abaixo:
              </div>
            )}

            {/* Custom URL Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700">
                Ou cole a URL direta de uma imagem:
              </label>
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://exemplo.com/foto-de-capa.jpg"
                className="w-full px-3.5 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900"
              />
            </div>

            {/* Presets Cards */}
            <div className="pt-1 border-t border-stone-200/60">
              <span className="text-[11px] text-stone-500 font-semibold block mb-2">
                Fotos de capa prontas (1 clique para aplicar):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PRESET_ARTICLE_COVERS.map((preset) => {
                  const isSelected = coverImageUrl === preset.url;
                  return (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setCoverImageUrl(preset.url)}
                      className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 text-left transition-all group ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400/30'
                          : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <Image
                        src={preset.url}
                        alt={preset.label}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        unoptimized
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-stone-950/40 flex items-end p-1.5">
                        <span className="text-[10px] font-bold text-white leading-tight drop-shadow-xs">
                          {preset.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900">
                Conteúdo do Artigo com Hiperlinks e Dicas
              </label>
              <span className="text-[11px] text-amber-700 font-medium">
                Dica: clique em &quot;Inserir Link&quot; para adicionar links de produtos
              </span>
            </div>
            <BlogContentEditor
              products={products}
              value={content}
              onChange={setContent}
              rows={10}
              placeholder="Escreva seu artigo completo aqui com dicas, tamanhos, conselhos sinceros e links de afiliados..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{saving ? 'Publicando...' : 'Publicar Artigo'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between hover:border-stone-300 transition-all"
          >
            <div>
              <div className="relative aspect-16/10 w-full bg-stone-100 overflow-hidden">
                {art.coverImageUrl ? (
                  <Image
                    src={art.coverImageUrl}
                    alt={art.title}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-stone-900 text-white rounded-md shadow-xs">
                    {art.category}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <span className="text-[11px] font-semibold text-stone-400">
                  Por {art.author || 'Tamires Santos'}
                </span>
                <h3 className="font-serif font-bold text-stone-900 text-base leading-snug line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {art.summary}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between gap-2 mt-2">
              <Link
                href={`/artigo/${art.id}`}
                target="_blank"
                className="text-xs font-bold text-stone-900 hover:text-stone-700 flex items-center gap-1"
              >
                <span>Ver no site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(art)}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors"
                  title="Editar post"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`Excluir artigo "${art.title}"?`)) {
                      try { await handleDeleteArticle(art.id); } catch (err) { alert(err instanceof Error ? err.message : 'Não foi possível excluir o artigo.'); }
                    }
                  }}
                  className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Excluir post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
