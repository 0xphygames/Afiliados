import { NextResponse } from 'next/server';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://achadinhoselooks.com.br').replace(/\/$/, '');

export function GET() {
  return new NextResponse(`# Achadinhos & Looks

> Curadoria de achadinhos, looks, cupons e guias de compra por Tamires Santos. O site participa de programas oficiais de afiliados; preços e disponibilidade pertencem às lojas parceiras.

## Conteúdo

- [Página inicial](${SITE_URL}/): vitrine principal de produtos e curadoria.
- [Achadinhos](${SITE_URL}/achadinhos): catálogo de produtos por loja e categoria.
- [Blog](${SITE_URL}/blog): guias, comparativos e recomendações.
- [Cupons](${SITE_URL}/cupons): cupons e descontos disponíveis.
- [Campanhas](${SITE_URL}/campanha): páginas especiais e campanhas.

## Informações institucionais

- [Sobre](${SITE_URL}/sobre)
- [Contato](${SITE_URL}/contato)
- [Termos e transparência](${SITE_URL}/termos)

## Descoberta

- [Sitemap](${SITE_URL}/sitemap.xml)
- [Robots](${SITE_URL}/robots.txt)
`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
