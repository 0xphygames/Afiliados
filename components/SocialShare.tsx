'use client';

import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

interface SocialShareProps {
  title: string;
  url?: string;
  description?: string;
  price?: number;
  compact?: boolean;
  className?: string;
}

export function SocialShare({
  title,
  url,
  description,
  price,
  compact = false,
  className = '',
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const currentUrl =
    url ||
    (typeof window !== 'undefined' ? window.location.href : 'https://achadinhoselooks.ai.studio');

  const formattedPrice =
    price !== undefined
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
      : null;

  const shareText = `Olha esse achadinho incrível que a Tamires Santos selecionou no Achadinhos & Looks: ${title}${
    formattedPrice ? ` por apenas ${formattedPrice}` : ''
  }! Confira aqui: ${currentUrl}`;

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(shareText);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`${shareText}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleShareWindow = (e: React.MouseEvent, shareLink: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.open(shareLink, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {/* WhatsApp */}
        <button
          onClick={(e) => handleShareWindow(e, whatsappUrl)}
          className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 flex items-center justify-center transition-colors shadow-2xs"
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </button>

        {/* Telegram */}
        <button
          onClick={(e) => handleShareWindow(e, telegramUrl)}
          className="w-7 h-7 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white border border-sky-200 flex items-center justify-center transition-colors shadow-2xs"
          title="Compartilhar no Telegram"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
        {/* Facebook */}
        <button
          onClick={(e) => handleShareWindow(e, `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
          className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 flex items-center justify-center transition-colors shadow-2xs"
          title="Compartilhar no Facebook"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {/* X / Twitter */}
        <button
          onClick={(e) => handleShareWindow(e, `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`)}
          className="w-7 h-7 rounded-full bg-stone-100 text-stone-800 hover:bg-stone-900 hover:text-white border border-stone-300 flex items-center justify-center transition-colors shadow-2xs"
          title="Compartilhar no X (Twitter)"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {/* Copy */}
        <button
          onClick={handleCopy}
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors shadow-2xs ${
            copied
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-stone-50 text-stone-700 hover:bg-stone-200 border-stone-200'
          }`}
          title={copied ? 'Copiado!' : 'Copiar link para redes'}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-stone-50/90 rounded-2xl border border-stone-200/80 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 uppercase tracking-wider">
          <Share2 className="w-3.5 h-3.5 text-amber-600" />
          <span>Compartilhar nas Redes Sociais</span>
        </div>
        {copied && (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 animate-fade-in">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Link copiado!</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* WhatsApp */}
        <button
          onClick={(e) => handleShareWindow(e, whatsappUrl)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-emerald-800 hover:text-white font-semibold text-xs border border-emerald-300 transition-all duration-150 shadow-2xs"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </button>

        {/* Telegram */}
        <button
          onClick={(e) => handleShareWindow(e, telegramUrl)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc] text-sky-800 hover:text-white font-semibold text-xs border border-sky-300 transition-all duration-150 shadow-2xs"
        >
          <Send className="w-4 h-4" />
          <span>Telegram</span>
        </button>
        {/* Facebook */}
        <button
          onClick={(e) => handleShareWindow(e, facebookUrl)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-blue-800 hover:text-white font-semibold text-xs border border-blue-300 transition-all duration-150 shadow-2xs"
          title="Compartilhar no Facebook"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Facebook</span>
        </button>

        {/* X / Twitter */}
        <button
          onClick={(e) => handleShareWindow(e, twitterUrl)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-900 text-stone-800 hover:text-white font-semibold text-xs border border-stone-300 transition-all duration-150 shadow-2xs"
          title="Compartilhar no X (Twitter)"
        >
          <Share2 className="w-4 h-4" />
          <span>X (Twitter)</span>
        </button>

        {/* Copiar Link */}
        <button
          onClick={handleCopy}
          className={`col-span-2 sm:col-span-4 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold text-xs border transition-all duration-150 shadow-2xs ${
            copied
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white hover:bg-stone-900 text-stone-800 hover:text-white border-stone-300'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
        </button>
      </div>
    </div>
  );
}

