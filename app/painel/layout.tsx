'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from '@/lib/AdminContext';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Tag,
  Layers,
  BookOpen,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Lock,
  LogIn,
  ChevronRight,
  Database,
} from 'lucide-react';

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAdmin, authLoading, handleLogout } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: 'Visão Geral',
      href: '/painel',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Achadinhos & Produtos',
      href: '/painel/produtos',
      icon: ShoppingBag,
    },
    {
      label: 'Novo Achadinho',
      href: '/painel/produtos/novo',
      icon: PlusCircle,
      badge: 'Adicionar',
    },
    {
      label: 'Categorias & Setores',
      href: '/painel/categorias',
      icon: Tag,
    },
    {
      label: 'Páginas & Campanhas',
      href: '/painel/campanhas',
      icon: Layers,
    },
    {
      label: 'Blog & Posts',
      href: '/painel/artigos',
      icon: BookOpen,
    },
    {
      label: 'Textos & Configurações',
      href: '/painel/configuracoes',
      icon: Settings,
    },
  ];

  const isActive = (itemHref: string, exact?: boolean) => {
    if (exact) return pathname === itemHref;
    return pathname === itemHref || pathname?.startsWith(`${itemHref}/`);
  };

  const onSignOut = async () => {
    await handleLogout();
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 text-center max-w-sm w-full space-y-3">
          <div className="w-10 h-10 border-3 border-stone-900 border-t-amber-400 rounded-full animate-spin mx-auto" />
          <h2 className="font-serif font-bold text-stone-900 text-base">Carregando painel...</h2>
          <p className="text-xs text-stone-500">Conectando ao banco de dados e verificando permissões.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-md border border-stone-200 text-center max-w-md w-full space-y-4">
          <div className="w-14 h-14 bg-stone-900 text-white rounded-2xl mx-auto flex items-center justify-center shadow-xs">
            <Lock className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="font-serif font-bold text-stone-900 text-xl">Acesso Restrito</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Você precisa estar logada com a conta Google autorizada de Tamires Santos para gerenciar este ambiente.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>Fazer Login com Google</span>
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Voltar ao Site Público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col md:flex-row antialiased selection:bg-stone-900 selection:text-white">
      {/* Mobile Header */}
      <header className="md:hidden bg-stone-900 text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 border-b border-stone-800 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <span className="font-serif font-bold text-sm text-stone-100 block leading-tight">
              Achadinhos & Looks
            </span>
            <span className="text-[10px] text-amber-400 font-medium">Painel da Curadora</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-xs flex items-center gap-1"
            title="Ver site público em nova aba"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={onSignOut}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950 text-stone-300 hover:text-rose-300 transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col animate-fade-in">
          <div className="w-4/5 max-w-xs bg-stone-900 h-full flex flex-col justify-between p-5 text-white shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-lg">Painel Admin</h3>
                  <p className="text-[11px] text-stone-400 truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-stone-800 text-stone-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-white text-stone-900 shadow-sm'
                          : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-amber-600' : 'text-stone-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded-md font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-stone-800 space-y-2">
              <Link
                href="/"
                target="_blank"
                className="w-full py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <span>Ver Loja Pública</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={onSignOut}
                className="w-full py-2 px-3 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-stone-900 text-stone-100 flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen border-r border-stone-800 shadow-xl">
        <div className="p-5 lg:p-6 space-y-6 overflow-y-auto no-scrollbar">
          {/* Logo / Brand Header */}
          <div className="space-y-1">
            <Link href="/painel" className="block group">
              <h1 className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                Achadinhos & Looks
              </h1>
              <span className="text-[11px] font-medium tracking-wider uppercase text-stone-400">
                Painel da Administradora
              </span>
            </Link>

            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Firestore Conectado</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-white text-stone-900 shadow-md font-bold translate-x-1'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-600' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="text-[10px] bg-amber-400 text-stone-950 font-bold px-1.5 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  ) : active ? (
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer of Sidebar */}
        <div className="p-5 border-t border-stone-800 space-y-3 bg-stone-950/40">
          {/* User profile card */}
          <div className="flex items-center gap-3">
            {currentUser.photoURL ? (
              <Image
                src={currentUser.photoURL}
                alt="Foto"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover border border-stone-700"
                referrerPolicy="no-referrer"
                unoptimized
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-stone-800 text-amber-300 font-bold text-xs flex items-center justify-center border border-stone-700">
                TS
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {currentUser.displayName || 'Tamires Santos'}
              </p>
              <p className="text-[10px] text-stone-400 truncate">{currentUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/"
              target="_blank"
              className="py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
              title="Abrir vitrine pública em nova aba"
            >
              <span>Ver Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={onSignOut}
              className="py-1.5 px-2 bg-stone-800 hover:bg-rose-900 text-stone-300 hover:text-rose-200 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
              title="Sair do painel administrativo"
            >
              <LogOut className="w-3 h-3" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
