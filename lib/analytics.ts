export function trackEvent(event: string, params: Record<string, string | number | boolean | undefined> = {}) {
  if (typeof window === 'undefined') return;
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.('event', event, params);
}

export function trackAffiliateClick(platform: string, productId: string, productTitle: string) {
  trackEvent('affiliate_click', { platform, product_id: productId, product_title: productTitle });
}
