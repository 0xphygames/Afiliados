import { NextRequest, NextResponse } from 'next/server';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://achadinhoselooks.com.br').replace(/\/$/, '');

const HOME_MARKDOWN = `# Achadinhos & Looks

> Curadoria de achadinhos, looks, cupons e guias de compra por Tamires Santos.

## Páginas principais

- [Página inicial](${SITE_URL}/)
- [Achadinhos](${SITE_URL}/achadinhos)
- [Blog](${SITE_URL}/blog)
- [Cupons](${SITE_URL}/cupons)
- [Campanhas](${SITE_URL}/campanha)
- [Sobre](${SITE_URL}/sobre)
- [Contato](${SITE_URL}/contato)
- [Termos e transparência](${SITE_URL}/termos)
`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/robots.txt') {
    return new NextResponse(
      `User-agent: *\nAllow: /\nDisallow: /painel\nDisallow: /login\n\nContent-Signal: search=yes, ai-train=no\nHost: ${SITE_URL}\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }

  if (pathname === '/' && request.headers.get('accept')?.toLowerCase().includes('text/markdown')) {
    return new NextResponse(HOME_MARKDOWN, {
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        Link: `<${SITE_URL}/llms.txt>; rel="describedby"; type="text/plain", <${SITE_URL}/>; rel="canonical"`,
        'cache-control': 'public, max-age=300, s-maxage=3600',
      },
    });
  }

  if (pathname === '/') {
    const response = NextResponse.next();
    response.headers.set('Link', `<${SITE_URL}/llms.txt>; rel="describedby"; type="text/plain"`);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/robots.txt', '/', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
