'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MenuArea, MenuItem, MENU_ICONS, saveMenuItem, deleteMenuItem, subscribeMenuItems } from '@/lib/menu';
import { Layers, PlusCircle, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';

const COLOR_OPTIONS = [
  { label: 'Cinza', value: 'text-stone-500' },
  { label: 'Laranja', value: 'text-[#EE4D2D]' },
  { label: 'Âmbar', value: 'text-amber-600' },
  { label: 'Verde', value: 'text-emerald-600' },
  { label: 'Rosa', value: 'text-rose-500' },
  { label: 'Azul', value: 'text-sky-600' },
];

const emptyForm = {
  area: 'public' as MenuArea,
  label: '',
  href: '/',
  icon: 'Tag',
  colorClass: 'text-stone-500',
  isVisible: true,
};

export default function PainelMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => subscribeMenuItems('public', (list) => setItems((prev) => [...prev.filter((i) => i.area !== 'public'), ...list])), []);
  useEffect(() => subscribeMenuItems('admin', (list) => setItems((prev) => [...prev.filter((i) => i.area !== 'admin'), ...list])), []);

  const set = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const byArea = useMemo(
    () => ({
      public: items.filter((i) => i.area === 'public').sort((a, b) => a.position - b.position),
      admin: items.filter((i) => i.area === 'admin').sort((a, b) => a.position - b.position),
    }),
    [items],
  );

  const nextPosition = (area: MenuArea) =>
    (byArea[area].reduce((max, i) => Math.max(max, i.position), 0) || 0) + 1;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const href = form.href.trim();
    if (!form.label.trim() || !href.startsWith('/')) {
      setMessage('Informe o nome e um endereço começando com /.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await saveMenuItem({
        id: `${form.area === 'public' ? 'pub' : 'adm'}-${Date.now()}`,
        area: form.area,
        label: form.label,
        href,
        icon: form.icon,
        colorClass: form.colorClass,
        exact: false,
        position: nextPosition(form.area),
        isVisible: form.isVisible,
      });
      setForm((prev) => ({ ...emptyForm, area: prev.area }));
      setMessage('Item criado.');
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível criar o item.');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (item: MenuItem) => {
    try {
      await saveMenuItem({ ...item, isVisible: !item.isVisible });
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível alterar o item.');
    }
  };

  // Swap positions with the neighbour in the same menu
  const move = async (item: MenuItem, direction: -1 | 1) => {
    const list = byArea[item.area];
    const index = list.findIndex((i) => i.id === item.id);
    const other = list[index + direction];
    if (!other) return;
    try {
      await saveMenuItem({ ...item, position: other.position });
      await saveMenuItem({ ...other, position: item.position });
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível reordenar.');
    }
  };

  const handleDelete = async (item: MenuItem) => {
    const note =
      item.area === 'admin'
        ? '\nO item some do menu do painel. Você ainda consegue abrir a página pelo endereço.'
        : '\nO item some do menu do site. A página continua existindo.';
    if (!window.confirm(`Remover "${item.label}" do menu?${note}`)) return;
    try {
      await deleteMenuItem(item.id);
      setMessage('Item removido.');
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível remover o item.');
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400';

  const renderList = (area: MenuArea, title: string) => (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-3">
      <h2 className="font-serif text-lg font-bold text-stone-900 pb-2 border-b border-stone-100">{title}</h2>
      {byArea[area].length === 0 ? (
        <p className="text-sm text-stone-500 py-4 text-center">Nenhum item.</p>
      ) : (
        <ul className="space-y-2">
          {byArea[area].map((item, index, list) => {
            const Icon = MENU_ICONS[item.icon] ?? Layers;
            return (
              <li key={item.id} className="flex items-center justify-between gap-2 rounded-2xl border border-stone-200 p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${item.colorClass}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-900 truncate">
                      {item.label}
                      {!item.isVisible && (
                        <span className="ml-2 text-[10px] font-bold uppercase text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          Oculto
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-stone-500 font-mono truncate">{item.href}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => move(item, -1)}
                    disabled={index === 0}
                    className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                    aria-label={`Subir ${item.label}`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(item, 1)}
                    disabled={index === list.length - 1}
                    className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                    aria-label={`Descer ${item.label}`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleVisible(item)}
                    className="p-2 rounded-xl text-stone-600 hover:bg-stone-100"
                    aria-label={item.isVisible ? `Ocultar ${item.label}` : `Mostrar ${item.label}`}
                  >
                    {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50"
                    aria-label={`Remover ${item.label}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-amber-600" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">Menu & Rotas</h1>
        </div>
        <p className="text-xs text-stone-500 max-w-xl">
          Crie, ordene, oculte e remova os itens do menu do site público e do menu do painel. Para criar um item que
          leva a uma página, use o mesmo endereço da página em Páginas do Site.
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
            <h2 className="font-serif text-lg font-bold text-stone-900">Novo item de menu</h2>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-stone-700">Onde aparece</span>
            <select className={inputClass} value={form.area} onChange={(e) => set('area', e.target.value as MenuArea)}>
              <option value="public">Menu do site público</option>
              <option value="admin">Menu do painel admin</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-stone-700">Nome</span>
            <input className={inputClass} value={form.label} onChange={(e) => set('label', e.target.value)} placeholder="Sobre" />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-stone-700">Endereço</span>
            <input className={inputClass} value={form.href} onChange={(e) => set('href', e.target.value)} placeholder="/sobre" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-bold text-stone-700">Ícone</span>
              <select className={inputClass} value={form.icon} onChange={(e) => set('icon', e.target.value)}>
                {Object.keys(MENU_ICONS).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold text-stone-700">Cor</span>
              <select className={inputClass} value={form.colorClass} onChange={(e) => set('colorClass', e.target.value)}>
                {COLOR_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex items-center gap-2 text-xs text-stone-700">
            <input type="checkbox" checked={form.isVisible} onChange={(e) => set('isVisible', e.target.checked)} />
            Mostrar no menu
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-stone-900 text-white text-sm font-bold disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Criar item'}
          </button>
        </form>

        <div className="lg:col-span-7 space-y-6">
          {renderList('public', 'Menu do site público')}
          {renderList('admin', 'Menu do painel admin')}
        </div>
      </div>
    </div>
  );
}
