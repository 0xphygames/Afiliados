'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginWithGoogle, subscribeAuth, isUserAdmin, ADMIN_EMAIL } from '@/lib/firestore-products';
import {
  Lock,
  LogIn,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAuth((user) => {
      setCurrentUser(user);
      setCheckingAuth(false);
      if (user) {
        // Automatically redirect to /painel if already authenticated
        router.push('/painel');
      }
    });
    return () => unsub();
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await loginWithGoogle();
      if (user) {
        router.push('/painel');
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Erro ao conectar com o Google. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between selection:bg-stone-900 selection:text-white">
      {/* Top Header */}
      <header className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors py-2 px-3 rounded-xl hover:bg-stone-200/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a vitrine</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Ambiente Seguro</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          {/* Brand header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-stone-900 text-white flex items-center justify-center shadow-md">
              <Lock className="w-8 h-8 text-amber-300" />
            </div>

            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                Painel da Administradora
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Acesso exclusivo para <strong>Tamires Santos</strong> gerenciar achadinhos, fotos, links e páginas.
              </p>
            </div>
          </div>

          {/* Features info */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs text-stone-600">
            <div className="flex items-center gap-2 font-semibold text-stone-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sincronização em Tempo Real</span>
            </div>
            <p className="leading-relaxed">
              Tudo o que você alterar ou cadastrar no painel sobe automaticamente para o banco de dados oficial e atualiza o site na hora.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleLogin}
              disabled={loading || checkingAuth}
              className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 group cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>
                {checkingAuth
                  ? 'Verificando acesso...'
                  : loading
                  ? 'Conectando ao Google...'
                  : 'Entrar com Conta Google'}
              </span>
            </button>

            <p className="text-[11px] text-center text-stone-400">
              Acesso seguro autorizado para <strong>{ADMIN_EMAIL}</strong>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} Achadinhos & Looks · Tamires Santos. Todos os direitos reservados.
      </footer>
    </div>
  );
}
