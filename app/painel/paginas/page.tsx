'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SitePage } from '@/lib/types';
import { subscribeSitePages, saveSitePage, deleteSitePage } from '@/lib/firestore-products';
import { FileText, PlusCircle, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';

const emptyForm = {
  title: '',
  slug: '',
  parentId: '' as string,
  body: '',
  showInMenu: false,
  isActive: true,
};

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function PainelPaginasPage() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => subscribeSitePages((list) => setPages(list)), []);

  const set = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Parents are listed before their children; children are indented under them
  const rows = useMemo(() => {
    const byParent = (parent: string | null) => pages.filter((p) => (p.parentId || null) === parent);
    const out: { page: SitePage; depth: number }[] = [];
    const walk = (parent: string | null, depth: number) => {
      for (const page of byParent(parent)) {
        out.push({ page, depth });
        walk(page.id, depth + 1);
      }
    };
    walk(null, 0);
    return out;
  }, [pages]);

  const pathOf = (page: SitePage) => {
    const parts = [page.slug];
    let parent = page.parentId ? pages.find((p) => p.id === page.parentId) : undefined;
    while (parent) {
      parts.unshift(parent.slug);
      parent = parent.parentId ? pages.find((p) => p.id === parent!.parentId) : undefined;
    }
    return '/' + parts.join('/');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = slugify(form.slug || form.title);
    if (!form.title.trim() || !slug) {
      setMessage('Informe um título.');
      return;
    }
    if (pages.some((p) => p.slug === slug && (p.parentId || '') === form.parentId)) {
      setMessage('Já existe uma página com esse endereço neste nível.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await saveSitePage({
        id: `page-${Date.now()}`,
        slug,
        title: form.title,
        body: form.body,
        parentId: form.parentId || null,
        showInMenu: form.showInMenu,
        isActive: form.isActive,
        createdAt: new Date().toISOString(),
      });
      setForm(emptyForm);
      setMessage('Página criada.');
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível salvar a página.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (page: SitePage) => {
    try {
      await saveSitePage({ ...page, isActive: !page.isActive });
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível alterar a página.');
    }
  };

  const handleDelete = async (page: SitePage) => {
    const subpages = pages.filter((p) => p.parentId === page.id).length;
    const warning = subpages
      ? `Excluir "${page.title}" e suas ${subpages} subpágina(s)?`
      : `Excluir "${page.title}"?`;
    if (!window.confirm(warning)) return;
    try {
      await deleteSitePage(page.id);
      setMessage('Página excluída.');
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível excluir a página.');
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-amber-600" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">Páginas do Site</h1>
        </div>
        <p className="text-xs text-stone-500 max-w-xl">
          Crie páginas com endereço próprio (ex: /sobre) e subpáginas (ex: /sobre/equipe). Exclua qualquer uma delas aqui.
        </p>
      </div>

      {message && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-2xl px-4 py-3">{message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleCreate}
          className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <h2 className="font-serif text-lg font-bold text-stone-900">Nova Página</h2>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-stone-700">Título</span>
            <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Sobre mim" />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-bold text-stone-700">Endereço</span>
              <input
                className={inputClass}
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder={slugify(form.title) || 'sobre'}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold text-stone-700">Subpágina de</span>
              <select className={inputClass} value={form.parentId} onChange={(e) => set('parentId', e.target.value)}>
                <option value="">Nenhuma (página principal)</option>
                {pages
                  .filter((p) => !p.parentId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-stone-700">Texto</span>
            <textarea
              className={inputClass}
              rows={8}
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              placeholder="Escreva o conteúdo. Pule uma linha para criar um novo parágrafo."
            />
          </label>

          <div className="flex flex-wrap gap-4 text-xs text-stone-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.showInMenu} onChange={(e) => set('showInMenu', e.target.checked)} />
              Mostrar no menu do site
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
              Publicada
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-stone-900 text-white text-sm font-bold disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Criar página'}
          </button>
        </form>

        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900 pb-2 border-b border-stone-100">
            Páginas ({pages.length})
          </h2>

          {rows.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-10">Nenhuma página criada ainda.</p>
          ) : (
            <ul className="space-y-2">
              {rows.map(({ page, depth }) => (
                <li
                  key={page.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 p-3 sm:p-4"
                  style={{ marginLeft: depth * 16 }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-900 truncate">
                      {depth > 0 && <span className="text-stone-400 mr-1">↳</span>}
                      {page.title}
                      {!page.isActive && (
                        <span className="ml-2 text-[10px] font-bold uppercase text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          Rascunho
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-stone-500 truncate font-mono">{pathOf(page)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={pathOf(page)}
                      target="_blank"
                      className="p-2 rounded-xl text-stone-600 hover:bg-stone-100"
                      aria-label={`Abrir ${page.title}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleActive(page)}
                      className="p-2 rounded-xl text-stone-600 hover:bg-stone-100"
                      aria-label={page.isActive ? `Despublicar ${page.title}` : `Publicar ${page.title}`}
                    >
                      {page.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(page)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50"
                      aria-label={`Excluir ${page.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
