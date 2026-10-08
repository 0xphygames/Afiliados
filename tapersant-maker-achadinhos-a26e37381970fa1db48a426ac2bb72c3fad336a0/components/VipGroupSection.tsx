'use client';

import React, { useState } from 'react';
import { MessageCircle, Bell, Check, Copy, Sparkles } from 'lucide-react';

export function VipGroupSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyChannel = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="mx-4 sm:mx-6 lg:mx-8 my-10 bg-white text-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm relative overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 rounded-full text-xs font-semibold border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Alerta de Cupons Relâmpago & Bugs</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 text-balance">
            Entre nos Grupos VIP da Tamires Santos
          </h2>

          <p className="text-stone-600 text-xs sm:text-sm max-w-xl leading-relaxed">
            Receba em primeira mão cupons secretos, promoções relâmpago e os looks mais desejados da Shopee e Shein antes que esgotem!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <a
            href="https://whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 group"
          >
            <MessageCircle className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
            <span>Grupo VIP no WhatsApp</span>
          </a>

          <button
            onClick={handleCopyChannel}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs border border-stone-300 transition-all flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Link do Site Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Compartilhar Este Site</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
