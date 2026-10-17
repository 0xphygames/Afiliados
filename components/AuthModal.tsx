'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { User } from '@/lib/firestore-products';
import { loginWithGoogle, logoutUser, ADMIN_EMAIL, isUserAdmin } from '@/lib/firestore-products';
import {
  X,
  Lock,
  LogIn,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSuccessLogin?: () => void;
}

export function AuthModal({ isOpen, onClose, currentUser, onSuccessLogin }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await loginWithGoogle();
      if (user) {
        onSuccessLogin?.();
        onClose();
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Erro ao autenticar com o Google. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = isUserAdmin(currentUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="text-center space-y-3 pb-4 border-b border-stone-100">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-sm">
            <Lock className="w-7 h-7 text-amber-300" />
          </div>

          <h3 className="font-serif text-2xl font-bold text-stone-900">
            Painel da Administradora
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Área de login exclusiva de Tamires Santos para gerenciar achadinhos, fotos, links e comissões.
          </p>
        </div>

        {/* Current State Content */}
        <div className="py-6 space-y-4">
          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
                {currentUser.photoURL ? (
                  <Image
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Usuário'}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full border border-stone-200 object-cover"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm">
                    TS
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-stone-900 truncate">
                      {currentUser.displayName || 'Tamires Santos'}
                    </p>
                    {isAdmin && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                </div>
              </div>

              {isAdmin ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Você está autenticada como administradora oficial!</span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-900 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Acesso como visitante ({currentUser.email}). O e-mail oficial é {ADMIN_EMAIL}.</span>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onSuccessLogin?.();
                    onClose();
                  }}
                  className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Abrir Painel de Conteúdos
                </button>

                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged out state */
            <div className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs text-stone-600">
                <div className="flex items-center gap-2 font-semibold text-stone-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Banco de Dados em Nuvem Ativo</span>
                </div>
                <p>
                  Suas alterações (novos achadinhos, fotos, links de afiliado) são salvas em tempo real no banco de dados e sincronizadas para todas as suas clientes.
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 group"
              >
                <LogIn className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                <span>{loading ? 'Conectando...' : 'Entrar com Conta Google'}</span>
              </button>

              <p className="text-[11px] text-center text-stone-400">
                Acesso liberado para a conta administradora da Tamires ({ADMIN_EMAIL})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
