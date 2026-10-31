'use client';
import Script from 'next/script';

const tagId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;

export function GoogleTag() {
  if (!tagId) return null;
  return <>
    <Script id="google-consent-default" strategy="beforeInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`}</Script>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`} strategy="afterInteractive" />
    <Script id="google-tag-config" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${tagId}',{anonymize_ip:true});`}</Script>
  </>;
}
