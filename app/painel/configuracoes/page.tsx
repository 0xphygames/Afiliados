'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/AdminContext';
import { SiteSettings } from '@/lib/types';
import { seedInitialDataToFirestore } from '@/lib/firestore-products';
import {
  Settings,
  Save,
  CheckCircle2,
  Database,
  RotateCcw,
  MessageCircle,
} from 'lucide-react';

function ConfiguracoesForm({
  settings,
  onSave,
}: {
  settings: SiteSettings;
  onSave: (cfg: SiteSettings) => Promise<void>;
}) {
  const [heroHeadline, setHeroHeadline] = useState(settings?.heroHeadline || '');
  const [heroSubheading, setHeroSubheading] = useState(settings?.heroSubheading || '');
  const [topBannerNotice, setTopBannerNotice] = useState(settings?.topBannerNotice || '');
  const [whatsappUrl, setWhatsappUrl] = useState(settings?.whatsappUrl || '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);

    const updated: SiteSettings = {
      heroHeadline: heroHeadline.trim(),
      heroSubheading: heroSubheading.trim(),
      topBannerNotice: topBannerNotice.trim(),
      whatsappUrl: whatsappUrl.trim(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSave(updated);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm('Deseja recarregar os dados iniciais recomendados para o banco de dados?')) return;
    setSeeding(true);
    try {
      await seedInitialDataToFirestore();
      alert('Dados de demonstração salvos no Firestore com sucesso!');
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-amber-600" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Textos do Site & Configurações
          </h1>
        </div>
        <p className="text-xs text-stone-500 max-w-xl">
          Personalize as mensagens principais da página inicial, avisos de topo sobre cupons e frete, e o link do seu grupo VIP no WhatsApp.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configurações atualizadas e sincronizadas no banco de dados com sucesso!</span>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900">
              Frase Principal da Página Inicial (Hero Headline)
            </label>
            <input
              type="text"
              required
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900">
              Subtítulo Descritivo da Página Inicial
            </label>
            <textarea
              rows={3}
              required
              value={heroSubheading}
              onChange={(e) => setHeroSubheading(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900 leading-relaxed font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900">
              Aviso do Topo da Página (Barra Escura Superior)
            </label>
            <input
              type="text"
              required
              value={topBannerNotice}
              onChange={(e) => setTopBannerNotice(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Link do Grupo VIP (WhatsApp ou Telegram)</span>
            </label>
            <input
              type="url"
              value={whatsappUrl}
              onChange={(e) => setWhatsappUrl(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900"
            />
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>

        {/* Database & System Info Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Database className="w-4 h-4 text-emerald-600" />
              <h2 className="font-serif font-bold text-sm text-stone-900">
                Banco de Dados & Nuvem
              </h2>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex items-center justify-between">
                <span>Status da Conexão:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ativo e Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Provedor:</span>
                <span className="font-semibold text-stone-900">Google Cloud Firestore</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Modo de sincronização:</span>
                <span className="font-semibold text-stone-900">Tempo Real (Live)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={handleSeed}
                disabled={seeding}
                className="w-full py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
                <span>{seeding ? 'Carregando...' : 'Restaurar Dados Iniciais'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PainelConfiguracoesPage() {
  const { settings, handleSaveSettings } = useAdmin();
  return (
    <ConfiguracoesForm
      key={settings?.updatedAt || 'cfg-init'}
      settings={settings}
      onSave={handleSaveSettings}
    />
  );
}
