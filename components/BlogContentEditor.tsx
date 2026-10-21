'use client';

import React, { useState, useRef } from 'react';
import {
  Link as LinkIcon,
  Bold,
  Heading2,
  Heading3,
  List,
  Sparkles,
  Eye,
  Edit3,
  Check,
  X,
  ExternalLink,
  HelpCircle,
  ShoppingBag,
} from 'lucide-react';
import { BlogContentRenderer } from './BlogContentRenderer';
import type { Product } from '@/lib/types';

interface BlogContentEditorProps {
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
  products?: Product[];
}

const emptyProduct = { name: '', price: '', originalPrice: '', rating: '', url: '', image: '', badge: '' };

export function BlogContentEditor({
  value,
  onChange,
  rows = 10,
  placeholder = 'Escreva seu artigo completo aqui com dicas, tamanhos, conselhos sinceros e links...',
  products = [],
}: BlogContentEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [pickedProductId, setPickedProductId] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const setProductField = (key: keyof typeof emptyProduct, value: string) =>
    setProductForm((prev) => ({ ...prev, [key]: value }));

  const handleOpenProductModal = () => {
    setProductForm(emptyProduct);
    setPickedProductId('');
    setShowProductModal(true);
  };

  // Fill the form from a catalog product so the admin does not retype it
  const handlePickProduct = (id: string) => {
    setPickedProductId(id);
    const p = products.find((item) => item.id === id);
    if (!p) return;
    const money = (n: number) => `R$ ${n.toFixed(2).replace('.', ',')}`;
    setProductForm({
      name: p.title,
      price: p.price ? money(p.price) : '',
      originalPrice: p.originalPrice ? money(p.originalPrice) : '',
      rating: p.rating ? String(p.rating) : '',
      url: p.affiliateUrl,
      image: p.imageUrl,
      badge: p.badge || '',
    });
  };

  // Insert one line: [[produto|Nome|Preço|Preço original|Nota|Link|Imagem|Destaque]]
  const handleInsertProduct = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!productForm.name.trim() || !productForm.url.trim()) return;
    const fields = [
      productForm.name,
      productForm.price,
      productForm.originalPrice,
      productForm.rating,
      productForm.url,
      productForm.image,
      productForm.badge,
    ].map((f) => f.replace(/[|[\]\n]/g, ' ').trim());
    insertAtCursor(`\n[[produto|${fields.join('|')}]]\n`);
    setShowProductModal(false);
    setProductForm(emptyProduct);
    setPickedProductId('');
  };

  // Open link modal and capture current selected text
  const handleOpenLinkModal = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      if (selected.trim()) {
        setLinkText(selected.trim());
      } else {
        setLinkText('');
      }
    }
    setLinkUrl('');
    setShowLinkModal(true);
  };

  // Insert markdown hyperlink [text](url) into textarea
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    let cleanUrl = linkUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const displayText = linkText.trim() || cleanUrl;
    const markdownLink = `[${displayText}](${cleanUrl})`;

    insertAtCursor(markdownLink);
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
  };

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + (value ? '\n' : '') + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);

    const newValue = textBefore + textToInsert + textAfter;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Quick insertion helpers
  const handleInsertBold = () => {
    const textarea = textareaRef.current;
    const selected = textarea
      ? textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
      : '';
    insertAtCursor(`**${selected || 'texto em destaque'}**`);
  };

  const handleInsertH2 = () => {
    insertAtCursor('\n## Título da Seção\n');
  };

  const handleInsertH3 = () => {
    insertAtCursor('\n### Subtítulo\n');
  };

  const handleInsertList = () => {
    insertAtCursor('\n- Item da lista\n- Segundo item\n');
  };

  const handleInsertTip = () => {
    insertAtCursor('\n> 💡 Dica da Curadora: Verifique o tamanho na tabela antes de comprar!\n');
  };

  return (
    <div className="space-y-2">
      {/* Editor & Preview Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-stone-100 rounded-xl border border-stone-200">
        {/* Quick Format Buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={handleOpenLinkModal}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Inserir Hiperlink / Link Clicável"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Inserir Link</span>
          </button>

          <button
            type="button"
            onClick={handleOpenProductModal}
            title="Inserir card de produto com botão de oferta"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Produto</span>
          </button>

          <div className="h-4 w-px bg-stone-300 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={handleInsertBold}
            className="p-1.5 bg-white hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold border border-stone-200 flex items-center gap-1 transition-colors"
            title="Negrito (**texto**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleInsertH2}
            className="px-2 py-1 bg-white hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold border border-stone-200 transition-colors"
            title="Título (## Título)"
          >
            H2
          </button>

          <button
            type="button"
            onClick={handleInsertH3}
            className="px-2 py-1 bg-white hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold border border-stone-200 transition-colors"
            title="Subtítulo (### Subtítulo)"
          >
            H3
          </button>

          <button
            type="button"
            onClick={handleInsertList}
            className="p-1.5 bg-white hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold border border-stone-200 transition-colors"
            title="Lista com marcadores (- Item)"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleInsertTip}
            className="px-2 py-1 bg-white hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium border border-stone-200 flex items-center gap-1 transition-colors"
            title="Destaque de Dica da Curadora"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="text-[11px]">Dica</span>
          </button>
        </div>

        {/* View Toggle (Edit vs Preview) */}
        <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Eye className="w-3 h-3 text-amber-600" />
            <span>Ver Links Clicáveis ({value ? 'Ativo' : 'Vazio'})</span>
          </button>
        </div>
      </div>

      {/* Helper message explaining hyperlinks */}
      <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3 h-3 text-amber-600 shrink-0" />
          <span>
            Para criar hiperlinks, use o botão <strong>&quot;Inserir Link&quot;</strong> ou escreva{' '}
            <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800 font-mono">
              [Texto do Link](https://seulink.com)
            </code>
            . Links diretos como <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800 font-mono">https://...</code> também ficam clicáveis automaticamente!
          </span>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'edit' ? (
        <textarea
          ref={textareaRef}
          rows={rows}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all text-stone-900 leading-relaxed font-sans"
        />
      ) : (
        <div className="p-4 bg-white border border-stone-200 rounded-xl min-h-[160px] max-h-[400px] overflow-y-auto">
          {value.trim() ? (
            <BlogContentRenderer content={value} />
          ) : (
            <div className="text-center py-8 text-xs text-stone-400">
              Nenhum conteúdo digitado ainda. Volte para &quot;Editar&quot; para escrever e adicionar hiperlinks.
            </div>
          )}
        </div>
      )}

      {/* Hyperlink Inserter Modal / Dialog */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleInsertProduct}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">Inserir produto</h3>
            {products.length > 0 && (
              <label className="block space-y-1">
                <span className="text-xs font-bold text-stone-700">Preencher a partir do catálogo</span>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm"
                  value={pickedProductId}
                  onChange={(ev) => handlePickProduct(ev.target.value)}
                >
                  <option value="">Escolher um achadinho</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <input
              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm"
              placeholder="Nome do produto"
              value={productForm.name}
              onChange={(ev) => setProductField('name', ev.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm"
                placeholder="Preço (R$ 99,90)"
                value={productForm.price}
                onChange={(ev) => setProductField('price', ev.target.value)}
              />
              <input
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm"
                placeholder="Preço original"
                value={productForm.originalPrice}
                onChange={(ev) => setProductField('originalPrice', ev.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm"
                placeholder="Nota (ex: 4.8)"
                value={productForm.rating}
                onChange={(ev) => setProductField('rating', ev.target.value)}
              />
              <input
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm"
                placeholder="Destaque (ex: Melhor custo)"
                value={productForm.badge}
                onChange={(ev) => setProductField('badge', ev.target.value)}
              />
            </div>
            <input
              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm"
              placeholder="Link da oferta (https://...)"
              value={productForm.url}
              onChange={(ev) => setProductField('url', ev.target.value)}
            />
            <input
              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm"
              placeholder="URL da imagem"
              value={productForm.image}
              onChange={(ev) => setProductField('image', ev.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900"
              >
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold">
                Inserir
              </button>
            </div>
          </form>
        </div>
      )}

      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Inserir Hiperlink no Post</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertLink} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800">
                  Texto visível do link <span className="text-stone-400 font-normal">(O que o leitor vai ler)</span>
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Ex: Ver Vestido Elegante na Shopee"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800">
                  Endereço / URL do Link <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://shope.ee/... ou https://amzn.to/..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white text-stone-900 font-mono"
                />
              </div>

              {/* Live Preview of the link */}
              {linkUrl.trim() && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                  <span className="text-[10px] font-bold text-amber-900 uppercase block mb-1">
                    Como o link vai aparecer:
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-900 underline decoration-amber-500 underline-offset-2">
                    {linkText.trim() || linkUrl.trim()}
                    <ExternalLink className="w-3 h-3 inline text-amber-700" />
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-amber-300" />
                  <span>Inserir Link no Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
