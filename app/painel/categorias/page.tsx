'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/lib/AdminContext';
import { Layers, PlusCircle, Pencil, Trash2, Tag } from 'lucide-react';
import {
  TaxMacro,
  TaxNode,
  subscribeTaxonomy,
  addMacro,
  addMicro,
  renameNode,
  deleteNode,
} from '@/lib/taxonomy-db';

// Macros e micros são editadas aqui. Os produtos são contados pelo nome de cada item.
export default function PainelCategoriasPage() {
  const { products } = useAdmin();
  const [tree, setTree] = useState<TaxMacro[]>([]);
  const [macroName, setMacroName] = useState('');
  const [microName, setMicroName] = useState('');
  const [microParent, setMicroParent] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () => {
    subscribeTaxonomy((t) => {
      setTree(t);
      if (!microParent && t[0]) setMicroParent(t[0].node.id);
    });
  };

  useEffect(() => subscribeTaxonomy((t) => setTree(t)), []);

  const run = async (action: () => Promise<void>, ok: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage(ok);
      reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Não foi possível concluir a ação.');
    } finally {
      setBusy(false);
    }
  };

  const countOf = (node: TaxNode) =>
    node.kind === 'macro'
      ? products.filter((p) => p.department === node.name).length
      : products.filter((p) => p.subcategory === node.name).length;

  const handleAddMacro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!macroName.trim()) return;
    run(async () => {
      await addMacro(macroName, tree.length + 1);
      setMacroName('');
    }, 'Macro criada.');
  };

  const handleAddMicro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!microName.trim() || !microParent) return;
    const parent = tree.find((m) => m.node.id === microParent);
    run(async () => {
      await addMicro(microParent, microName, (parent?.micros.length ?? 0) + 1);
      setMicroName('');
    }, 'Micro criada.');
  };

  const handleRename = (node: TaxNode) => {
    const next = window.prompt(`Novo nome para "${node.name}":`, node.name);
    if (!next || next.trim() === node.name) return;
    run(() => renameNode(node, next), 'Renomeado. Os produtos foram atualizados.');
  };

  const handleDelete = (node: TaxNode, siblings: number) => {
    if (!window.confirm(`Excluir "${node.name}"?`)) return;
    run(() => deleteNode(node, siblings), 'Excluído.');
  };

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white text-stone-900';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Tag className="w-5 h-5 text-amber-600" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">Categorias & Setores</h1>
        </div>
        <p className="text-xs text-stone-500 max-w-xl">
          Macros e micros usadas nos achadinhos, nos artigos e na lateral da vitrine. Renomear atualiza os produtos; excluir só é
          permitido quando nenhum produto usa o nome.
        </p>
      </div>

      {message && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-2xl px-4 py-3">{message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleAddMacro} className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
            <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-600" /> Nova macro
            </h2>
            <input className={inputClass} value={macroName} onChange={(e) => setMacroName(e.target.value)} placeholder="Ex: Acessórios de treino" />
            <button type="submit" disabled={busy} className="w-full py-2.5 rounded-2xl bg-stone-900 text-white text-sm font-bold disabled:opacity-60">
              Criar macro
            </button>
          </form>

          <form onSubmit={handleAddMicro} className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
            <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-600" /> Nova micro
            </h2>
            <select className={inputClass} value={microParent} onChange={(e) => setMicroParent(e.target.value)}>
              {tree.map((m) => (
                <option key={m.node.id} value={m.node.id}>
                  {m.node.name}
                </option>
              ))}
            </select>
            <input className={inputClass} value={microName} onChange={(e) => setMicroName(e.target.value)} placeholder="Ex: Caneleiras" />
            <button type="submit" disabled={busy || tree.length === 0} className="w-full py-2.5 rounded-2xl bg-stone-900 text-white text-sm font-bold disabled:opacity-60">
              Criar micro
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-5">
          <h2 className="font-serif text-lg font-bold text-stone-900">Árvore ({tree.length} macros)</h2>
          {tree.map((m) => (
            <div key={m.node.id} className="rounded-2xl border border-stone-200 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold text-stone-900 truncate">{m.node.name}</span>
                  <span className="text-[11px] font-semibold text-stone-500">{countOf(m.node)} produtos</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => handleRename(m.node)} className="p-2 rounded-xl text-stone-600 hover:bg-stone-100" aria-label={`Renomear ${m.node.name}`}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(m.node, m.micros.length)} className="p-2 rounded-xl text-rose-600 hover:bg-rose-50" aria-label={`Excluir ${m.node.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <ul className="ml-6 space-y-1.5">
                {m.micros.map((mi) => (
                  <li key={mi.id} className="flex items-center justify-between gap-2 text-sm text-stone-700">
                    <span className="truncate">
                      {mi.name} <span className="text-[11px] text-stone-500">({countOf(mi)})</span>
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => handleRename(mi)} className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100" aria-label={`Renomear ${mi.name}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => handleDelete(mi, 0)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50" aria-label={`Excluir ${mi.name}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
