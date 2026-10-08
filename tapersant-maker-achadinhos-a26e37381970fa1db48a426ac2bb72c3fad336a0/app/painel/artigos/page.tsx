'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export default function PainelArtigosPage() {
  const { articles, handleSaveArticle, handleDeleteArticle } = useAdmin();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Guia de Compras');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('/images/hero_achadinhos_looks_1791404026649.jpg');
  const [saving, setSaving] = useState(false);

  const startCreate = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Guia de Compras');
    setSummary('');
    setContent('');
    setCoverImageUrl('/images/hero_achadinhos_looks_1791404026649.jpg');
    setIsEditing(true);
  };

  const startEdit = (art: Article) => {
    setEditingId(art.id);
    setTitle(art.title);
    setCategory(art.category);
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
      category: category.trim() || 'Guia de Compras',
      summary: summary.trim() || title.trim(),
      content: content.trim(),
      coverImageUrl: coverImageUrl.trim() || '/images/hero_achadinhos_looks_1791404026649.jpg',
      author: 'Tamires Santos',
      featured: true,
      createdAt: editingId
        ? articles.find((a) => a.id === editingId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    try {
      await handleSaveArticle(newArt);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
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
              <label className="text-xs font-bold text-stone-900">Categoria do Post</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Guia de Compras, Dicas de Moda, Fitness..."
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
              />
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900">URL da Imagem de Capa</label>
            <input
              type="text"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900">Conteúdo do Artigo</label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva seu artigo completo aqui com dicas, tamanhos, conselhos sinceros e links..."
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900 leading-relaxed font-sans"
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
                      await handleDeleteArticle(art.id);
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
