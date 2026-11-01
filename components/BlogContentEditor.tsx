'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ARTICLE_PRODUCT_OBJECTIVES,
  ARTICLE_PRODUCT_STYLES,
  articleProductLayoutId,
  type ArticleProductFields,
  type ArticleProductObjective,
  type ArticleProductStyle,
} from '@/lib/article-product-layouts';
import { ProductLayoutPreview } from './BlogContentRenderer';
import { subscribeTaxonomy, type TaxMacro } from '@/lib/taxonomy-db';
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

const emptyProduct = {
  name: '',
  price: '',
  originalPrice: '',
  rating: '',
  url: '',
  image: '',
  badge: '',
  position: '',
  forWho: '',
  highlights: '',
};

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [objective, setObjective] = useState<ArticleProductObjective>('lista');
  const [style, setStyle] = useState<ArticleProductStyle>('descricao');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerMacro, setPickerMacro] = useState('');
  const [pickerMicro, setPickerMicro] = useState('');
  const [taxTree, setTaxTree] = useState<TaxMacro[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Keep the insertion point while focus moves into the portal modal.
  const selectionRef = useRef({ start: 0, end: 0 });

  // The macro and micro filter of the product picker come from the taxonomy table
  useEffect(() => subscribeTaxonomy((t) => setTaxTree(t)), []);

  const setProductField = (key: keyof typeof emptyProduct, value: string) =>
    setProductForm((prev) => ({ ...prev, [key]: value }));

  const money = (n: number) => `R$ ${n.toFixed(2).replace('.', ',')}`;

  // Catalog product as the fields of one product line
  const catalogFields = (p: Product): ArticleProductFields => ({
    name: p.title,
    price: p.price ? money(p.price) : '',
    originalPrice: p.originalPrice ? money(p.originalPrice) : '',
    rating: p.rating ? String(p.rating) : '',
    url: p.affiliateUrl,
    image: p.imageUrl,
    badge: p.badge || '',
    position: '',
    forWho: '',
    highlights: '',
  });

  const layoutValue = articleProductLayoutId(objective, style);
  const microOptions = taxTree.find((m) => m.node.name === pickerMacro)?.micros ?? [];
  const pickerSearchTerm = pickerSearch.trim().toLowerCase();
  const pickerProducts = products
    .filter((p) => (!pickerMacro || p.department === pickerMacro) && (!pickerMicro || p.subcategory === pickerMicro))
    .filter((p) => !pickerSearchTerm || p.title.toLowerCase().includes(pickerSearchTerm))
    .slice(0, 60);
  const selectedProducts = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
  // Catalog picks win; the manual form is used only when nothing is picked
  const manualReady = Boolean(productForm.name.trim() && productForm.url.trim());
  const itemsToInsert: ArticleProductFields[] =
    selectedProducts.length > 0 ? selectedProducts.map(catalogFields) : manualReady ? [productForm] : [];

  const togglePick = (id: string) =>
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      // The single-card objective holds one product at a time
      return objective === 'unico' ? [id] : [...prev, id];
    });

  const chooseObjective = (next: ArticleProductObjective) => {
    setObjective(next);
    if (next === 'unico') setSelectedIds((prev) => prev.slice(0, 1));
  };

  const optionClass = (active: boolean) =>
    `px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-colors ${
      active ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
    }`;

  const fieldClass = 'w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm';

  const handleOpenProductModal = () => {
    setProductForm(emptyProduct);
    setSelectedIds([]);
    setPickerSearch('');
    setPickerMacro('');
    setPickerMicro('');
    setShowProductModal(true);
  };

  // One line per product; consecutive lines with the same layout form one block in the article
  const handleInsertProduct = () => {
    if (itemsToInsert.length === 0) return;
    const lines = itemsToInsert.map((item) => {
      const fields = [
        item.name,
        item.price,
        item.originalPrice,
        item.rating,
        item.url,
        item.image,
        item.badge,
        item.position,
        item.forWho,
        item.highlights,
        layoutValue,
      ].map((f) => f.replace(/[|[\]\n]/g, ' ').trim());
      return `[[produto|${fields.join('|')}]]`;
    });
    insertAtCursor(`\n${lines.join('\n')}\n`);
    setShowProductModal(false);
    setProductForm(emptyProduct);
    setSelectedIds([]);
  };

  // Open link modal and capture current selected text
  const handleOpenLinkModal = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      selectionRef.current = { start: textarea.selectionStart, end: textarea.selectionEnd };
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
  const handleInsertLink = () => {
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

  const insertAtCursor = (textToInsert: string, range = selectionRef.current) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + (value ? '\n' : '') + textToInsert);
      return;
    }

    const start = Math.max(0, Math.min(range.start, value.length));
    const end = Math.max(start, Math.min(range.end, value.length));
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);

    const newValue = textBefore + textToInsert + textAfter;
    onChange(newValue);
    const newCursorPos = start + textToInsert.length;

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
    selectionRef.current = { start: newCursorPos, end: newCursorPos };
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

          <button
            type="button"
            onClick={() => insertAtCursor('\n[[aviso]]\n')}
            title="Inserir aviso de links de afiliado"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
          >
            <span>Aviso de afiliado</span>
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
      {showProductModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 space-y-5 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">Inserir produtos</h3>

            <section className="space-y-3">
              <p className="text-xs font-bold text-stone-700">1. Escolha os produtos do catálogo</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  className={fieldClass}
                  placeholder="Buscar pelo nome"
                  value={pickerSearch}
                  onChange={(ev) => setPickerSearch(ev.target.value)}
                />
                <select
                  className={fieldClass}
                  value={pickerMacro}
                  onChange={(ev) => {
                    setPickerMacro(ev.target.value);
                    setPickerMicro('');
                  }}
                >
                  <option value="">Todas as macros</option>
                  {taxTree.map((m) => (
                    <option key={m.node.id} value={m.node.name}>{m.node.name}</option>
                  ))}
                </select>
                <select className={fieldClass} value={pickerMicro} onChange={(ev) => setPickerMicro(ev.target.value)}>
                  <option value="">Todas as micros</option>
                  {microOptions.map((mi) => (
                    <option key={mi.id} value={mi.name}>{mi.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {pickerProducts.map((p) => {
                  const picked = selectedIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePick(p.id)}
                      className={`text-left rounded-xl border p-2 flex gap-3 transition-colors ${
                        picked ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200' : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-16 h-16 shrink-0 object-contain rounded-lg bg-stone-50" />
                      ) : (
                        <div className="w-16 h-16 shrink-0 rounded-lg bg-stone-100" />
                      )}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-xs font-semibold text-stone-900 line-clamp-2">{p.title}</p>
                        <p className="text-[11px] text-stone-500">★ {p.rating ? p.rating.toFixed(1) : '—'}</p>
                        <p className="text-xs font-bold text-stone-900">{money(p.price)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {pickerProducts.length === 0 && <p className="text-xs text-stone-500">Nenhum produto para este filtro.</p>}
            </section>

            <section className="space-y-2">
              <p className="text-xs font-bold text-stone-700">2. Objetivo</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ARTICLE_PRODUCT_OBJECTIVES.map((o) => (
                  <button key={o.id} type="button" onClick={() => chooseObjective(o.id)} className={optionClass(objective === o.id)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <p className="text-xs font-bold text-stone-700">3. Estilo de exibição</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ARTICLE_PRODUCT_STYLES.map((s) => (
                  <button key={s.id} type="button" onClick={() => setStyle(s.id)} className={optionClass(style === s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <p className="text-xs font-bold text-stone-700">Prévia no artigo</p>
              <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-3">
                {itemsToInsert.length > 0 ? (
                  <ProductLayoutPreview layout={layoutValue} items={itemsToInsert} />
                ) : (
                  <p className="py-6 text-center text-xs text-stone-500">Escolha um produto para ver a prévia.</p>
                )}
              </div>
            </section>

            <details className="rounded-xl border border-stone-200 p-3">
              <summary className="cursor-pointer text-xs font-bold text-stone-700">
                Produto fora do catálogo (preencher manualmente)
              </summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input className={fieldClass} placeholder="Nome do produto" value={productForm.name} onChange={(ev) => setProductField('name', ev.target.value)} />
                <input className={fieldClass} placeholder="Link de afiliado" value={productForm.url} onChange={(ev) => setProductField('url', ev.target.value)} />
                <input className={fieldClass} placeholder="Preço (ex: R$ 99,90)" value={productForm.price} onChange={(ev) => setProductField('price', ev.target.value)} />
                <input className={fieldClass} placeholder="Preço original" value={productForm.originalPrice} onChange={(ev) => setProductField('originalPrice', ev.target.value)} />
                <input className={fieldClass} placeholder="Nota (ex: 4.8)" value={productForm.rating} onChange={(ev) => setProductField('rating', ev.target.value)} />
                <input className={fieldClass} placeholder="URL da imagem" value={productForm.image} onChange={(ev) => setProductField('image', ev.target.value)} />
                <input className={fieldClass} placeholder="Selo (ex: Mais vendido)" value={productForm.badge} onChange={(ev) => setProductField('badge', ev.target.value)} />
                <input className={fieldClass} placeholder="Posição (1, 2...)" value={productForm.position} onChange={(ev) => setProductField('position', ev.target.value)} />
                <input className={`${fieldClass} sm:col-span-2`} placeholder="Para quem é (ex: iniciantes em casa)" value={productForm.forWho} onChange={(ev) => setProductField('forWho', ev.target.value)} />
                <input className={`${fieldClass} sm:col-span-2`} placeholder="Destaques (separe por ;)" value={productForm.highlights} onChange={(ev) => setProductField('highlights', ev.target.value)} />
              </div>
            </details>

            <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
              <span className="text-xs text-stone-500">{itemsToInsert.length} produto(s) pronto(s) para inserir</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleInsertProduct}
                  disabled={itemsToInsert.length === 0}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold disabled:opacity-40"
                >
                  Inserir no artigo
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showLinkModal && createPortal(
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

            <div className="space-y-3.5">
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
                  type="button"
                  onClick={handleInsertLink}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-amber-300" />
                  <span>Inserir Link no Post</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
