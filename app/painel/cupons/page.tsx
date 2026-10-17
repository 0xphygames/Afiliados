'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/AdminContext';
import { seedInitialCoupons } from '@/lib/firestore-products';
import { Coupon, PlatformId } from '@/lib/types';
import { PLATFORMS } from '@/lib/constants';
import { Tag, PlusCircle, Trash2, Copy, Upload } from 'lucide-react';

const PLATFORM_IDS = Object.keys(PLATFORMS) as PlatformId[];

const emptyForm = {
  code: '',
  title: '',
  discount: '',
  platform: 'shopee' as PlatformId,
  description: '',
  minSpend: '',
  expirationDate: '',
  affiliateUrl: '',
  category: 'Geral',
  isVerified: true,
};

export default function PainelCuponsPage() {
  const { coupons, handleSaveCoupon, handleDeleteCoupon } = useAdmin();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const set = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.title.trim() || !form.affiliateUrl.trim()) {
      setMessage('Preencha código, título e link de afiliado.');
      return;
    }
    setSaving(true);
    setMessage(null);
    const coupon: Coupon = {
      id: `coupon-${Date.now()}`,
      code: form.code,
      title: form.title,
      discount: form.discount,
      platform: form.platform,
      description: form.description,
      minSpend: form.minSpend || undefined,
      expirationDate: form.expirationDate || undefined,
      affiliateUrl: form.affiliateUrl,
      isVerified: form.isVerified,
      category: form.category || 'Geral',
    };
    try {
      await handleSaveCoupon(coupon);
      setForm(emptyForm);
      setMessage('Cupom criado.');
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível salvar o cupom.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!window.confirm(`Excluir o cupom ${coupon.code}?`)) return;
    try {
      await handleDeleteCoupon(coupon.id);
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível excluir o cupom.');
    }
  };

  const handleSeed = async () => {
    if (!window.confirm('Copiar os cupons de exemplo para o banco de dados?')) return;
    try {
      await seedInitialCoupons();
      setMessage('Cupons de exemplo copiados.');
    } catch (err) {
      console.error(err);
      setMessage('Não foi possível copiar os cupons de exemplo.');
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Tag className="w-5 h-5 text-amber-600" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">Cupons</h1>
        </div>
        <p className="text-xs text-stone-500 max-w-xl">
          Crie e exclua cupons. Os cupons salvos aparecem na página de cupons, na home e na busca.
        </p>
      </div>

      {message && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-2xl px-4 py-3">{message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleCreate}
          className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <h2 className="font-serif text-lg font-bold text-stone-900">Novo Cupom</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-bold text-stone-700">Código</span>
              <input className={inputClass} value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="LOOKS20" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold text-stone-700">Desconto</span>
              <input className={inputClass} value={form.discount} onChange={(e) => set('discount', e.target.value)} placeholder="R$ 20 OFF" />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-stone-700">Título</span>
            <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-stone-700">Descrição</span>
            <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-bold text-stone-700">Loja</span>
              <select className={inputClass} value={form.platform} onChange={(e) => set('platform', e.target.value as PlatformId)}>
                {PLATFORM_IDS.map((id) => (
                  <option key={id} value={id}>
                    {PLATFORMS[id].name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold text-stone-700">Categoria</span>
              <input className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value)} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-bold text-stone-700">Compra mínima</span>
              <input className={inputClass} value={form.minSpend} onChange={(e) => set('minSpend', e.target.value)} placeholder="R$ 99" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold text-stone-700">Validade</span>
              <input className={inputClass} value={form.expirationDate} onChange={(e) => set('expirationDate', e.target.value)} placeholder="31/12/2026" />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-stone-700">Link de afiliado</span>
            <input className={inputClass} value={form.affiliateUrl} onChange={(e) => set('affiliateUrl', e.target.value)} placeholder="https://" />
          </label>

          <label className="flex items-center gap-2 text-xs text-stone-700">
            <input type="checkbox" checked={form.isVerified} onChange={(e) => set('isVerified', e.target.checked)} />
            Cupom verificado
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-stone-900 text-white text-sm font-bold disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Criar cupom'}
          </button>
        </form>

        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-stone-100">
            <h2 className="font-serif text-lg font-bold text-stone-900">Cupons salvos ({coupons.length})</h2>
            <button
              type="button"
              onClick={handleSeed}
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-900"
            >
              <Upload className="w-3.5 h-3.5" /> Copiar exemplos
            </button>
          </div>

          {coupons.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-10">Nenhum cupom cadastrado.</p>
          ) : (
            <ul className="space-y-3">
              {coupons.map((coupon) => (
                <li key={coupon.id} className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-900 truncate">
                      <span className="inline-flex items-center gap-1 font-mono text-xs bg-stone-100 px-2 py-0.5 rounded mr-2">
                        <Copy className="w-3 h-3" /> {coupon.code}
                      </span>
                      {coupon.title}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {PLATFORMS[coupon.platform]?.name} · {coupon.discount}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(coupon)}
                    className="shrink-0 p-2 rounded-xl text-rose-600 hover:bg-rose-50"
                    aria-label={`Excluir cupom ${coupon.code}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
