'use client';

import React from 'react';
import Link from 'next/link';
import { PlatformId } from '@/lib/types';
import { ShieldCheck, Heart, Lock, KeyRound, LogOut, CheckCircle2 } from 'lucide-react';
import { User } from 'firebase/auth';

interface FooterProps {
  onSelectPlatform?: (platform: PlatformId | 'all') => void;
  onOpenAdmin?: () => void;
  onOpenAuth?: () => void;
  currentUser?: User | null;
  isAdmin?: boolean;
}

export function Footer({
  onSelectPlatform,
  onOpenAdmin,
  onOpenAuth,
  currentUser,
  isAdmin,
}: FooterProps) {
  const handlePlatformClick = (platform: PlatformId | 'all') => {
    if (onSelectPlatform) {
      onSelectPlatform(platform);
    } else if (typeof window !== 'undefined') {
      window.location.href = `/achadinhos?loja=${platform}`;
    }
  };
  return (
    <footer className="bg-white text-stone-600 border-t border-stone-200 mt-16 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-200">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <h3 className="font-serif text-xl font-bold text-stone-900 tracking-tight">
              Achadinhos & Looks
            </h3>
            <p className="text-xs text-stone-500 max-w-md leading-relaxed">
              Curadoria de compras inteligentes criada por <strong>Tamires Santos</strong>. Reunindo os melhores
              achados de vestuário, suplementos, musculação, presentes de datas comemorativas e utilidades 
              da Shopee, Shein, Mercado Livre e Amazon.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-stone-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Compras 100% protegidas diretamente nas plataformas oficiais</span>
            </div>
          </div>

          {/* Lojas Nav */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Lojas Parceiras
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600">
              <li>
                <button
                  onClick={() => handlePlatformClick('shopee')}
                  className="hover:text-stone-950 transition-colors font-medium text-left cursor-pointer"
                >
                  🧡 Shopee (Setores & Achados)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePlatformClick('shein')}
                  className="hover:text-stone-950 transition-colors font-medium text-left cursor-pointer"
                >
                  🖤 Shein (Looks & Tendências)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePlatformClick('mercadolivre')}
                  className="hover:text-stone-950 transition-colors font-medium text-left cursor-pointer"
                >
                  💛 Mercado Livre (Entrega Rápida FULL)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePlatformClick('amazon')}
                  className="hover:text-stone-950 transition-colors font-medium text-left cursor-pointer"
                >
                  📦 Amazon (Prime & Importados)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePlatformClick('all')}
                  className="hover:text-stone-950 transition-colors font-medium text-left cursor-pointer"
                >
                  ✨ Todos os Achadinhos
                </button>
              </li>
            </ul>
          </div>

          {/* Área Restrita / Admin no Rodapé (Discreto conforme solicitado) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link href="/" className="hover:text-stone-950 transition-colors block">
                  Home (Vitrine Principal)
                </Link>
              </li>
              <li>
                <Link href="/achadinhos" className="hover:text-stone-950 transition-colors block">
                  Todos os Achadinhos
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-stone-950 transition-colors block">
                  Blog & Dicas da Tamires
                </Link>
              </li>
              <li>
                <Link href="/cupons" className="hover:text-stone-950 transition-colors block">
                  Cupons & Descontos Verificados
                </Link>
              </li>
              <li>
                <Link href="/campanha" className="hover:text-stone-950 transition-colors block font-semibold text-amber-700">
                  Campanhas & Páginas Especiais
                </Link>
              </li>
              <li>
                <Link href="/busca" className="hover:text-stone-950 transition-colors block">
                  Busca Geral no Site
                </Link>
              </li>

              {/* Discreet login & management area */}
              <li className="pt-2 border-t border-stone-100">
                {currentUser ? (
                  <div className="space-y-1.5">
                    <Link
                      href="/painel"
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold text-xs transition-colors flex items-center gap-1.5"
                      title="Abrir painel administrativo"
                    >
                      <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Painel da Administradora</span>
                    </Link>
                    <p className="text-[11px] text-stone-400 pl-1 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="text-stone-400 hover:text-stone-700 transition-colors text-[11px] flex items-center gap-1.5 py-1"
                    title="Acesso exclusivo da administradora"
                  >
                    <Lock className="w-3 h-3 text-stone-400" />
                    <span>Acesso Restrito (Login)</span>
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure & Legal Notice */}
        <div className="pt-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p className="max-w-3xl leading-relaxed">
            <strong>Transparência de Afiliado:</strong> O Achadinhos & Looks participa dos programas de afiliados
            oficiais da Shopee, Shein, Mercado Livre e Amazon. Ao comprar através dos links recomendados por Tamires Santos,
            podemos receber uma comissão sem qualquer acréscimo no valor final pago por você. Todos os preços, cupons
            e disponibilidade são geridos diretamente pelos respectivos marketplaces.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2 text-stone-400 text-[11px]">
            <span>© {new Date().getFullYear()} Achadinhos & Looks · Tamires Santos.</span>
            {!currentUser && (
              <Link
                href="/login"
                className="hover:text-stone-600 transition-colors flex items-center gap-1"
                title="Login da administradora"
              >
                <span>·</span>
                <Lock className="w-2.5 h-2.5" />
                <span>Administração</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
