'use client';
import { useEffect, useState } from 'react';

function updateGoogleConsent(granted: boolean) {
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.('consent', 'update', { ad_storage: granted ? 'granted' : 'denied', analytics_storage: granted ? 'granted' : 'denied', ad_user_data: granted ? 'granted' : 'denied', ad_personalization: granted ? 'granted' : 'denied' });
}

export function ConsentBanner() {
  const [consent, setConsent] = useState<string | null>(null);
  useEffect(() => setConsent(window.localStorage.getItem('google-consent')), []);
  const choose = (value: 'granted' | 'denied') => { window.localStorage.setItem('google-consent', value); updateGoogleConsent(value === 'granted'); setConsent(value); };
  if (consent) return null;
  return <aside className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-white p-4 shadow-xl" role="dialog" aria-label="Preferências de privacidade">
    <p className="text-sm font-semibold text-stone-900">Privacidade e experiência</p>
    <p className="mt-1 text-xs leading-relaxed text-stone-600">Usamos cookies e tecnologias semelhantes para medir visitas e melhorar campanhas. Você pode aceitar ou recusar cookies de marketing.</p>
    <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => choose('denied')} className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700">Recusar</button><button type="button" onClick={() => choose('granted')} className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white">Aceitar</button></div>
  </aside>;
}
