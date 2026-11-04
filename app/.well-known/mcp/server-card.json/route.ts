import { NextResponse } from 'next/server';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://achadinhoselooks.com.br').replace(/\/$/, '');

export function GET() {
  return NextResponse.json({
    name: 'Achadinhos & Looks',
    version: '1.0.0',
    description: 'Curadoria de produtos, cupons e artigos de compras.',
    homepage: SITE_URL,
    endpoint: `${SITE_URL}/.well-known/mcp/server-card.json`,
    capabilities: { tools: true, resources: false, prompts: false },
    tools: [{ name: 'get_site_info', description: 'Retorna informações públicas e links principais do site.' }],
  }, { headers: { 'cache-control': 'public, max-age=3600' } });
}
