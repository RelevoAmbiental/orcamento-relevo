// src/components/LoginRedirect.jsx - VERSÃO MELHORADA
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../firebase/config';

const LoginRedirect = () => {
  const [countdown, setCountdown] = useState(5);
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('🔍 LoginRedirect - Status:');
    console.log('👤 User:', user);
    console.log('⏳ Loading:', loading);
    
    // Verificar se veio do portal com token na URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      console.log('🎫 Token detectado na URL, fazendo login...');
      signInWithCustomToken(auth, token)
        .then((userCredential) => {
          console.log('✅ Login automático realizado:', userCredential.user.email);
          // Limpar a URL
          window.history.replaceState({}, '', window.location.pathname);
        })
        .catch((error) => {
          console.error('❌ Erro no login automático:', error);
        });
    }
    
    // Só redireciona se realmente não tem usuário E não está carregando
    if (!loading && !user && !token) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Redirecionar para o portal
            window.location.href = 'https://portal.relevo.eco.br';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-relevo-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EAD60] mx-auto mb-4"></div>
          <p className="text-relevo-text font-sans">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-relevo-background flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-relevo-green mb-4 font-heading">
            Acesso Concedido!
          </h2>
          <p className="text-relevo-text mb-4 font-sans">
            Logado como: <strong>{user.email}</strong>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#2EAD60] hover:bg-[#3CC373] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🚀 Entrar no Sistema de Orçamentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-relevo-background flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-relevo-green mb-4 font-heading">
          Acesso ao Sistema de Orçamentos
        </h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          <p className="text-sm text-blue-800 font-sans">
            <strong>Como acessar:</strong><br/>
            1. Clique no botão abaixo para ir ao Portal<br/>
            2. Faça login no Portal Relevo<br/>
            3. Volte para esta página automaticamente
          </p>
        </div>
        
        <p className="text-relevo-text/70 font-sans mb-4">
          Redirecionando para o portal em <strong>{countdown}</strong>s...
        </p>
        
        <div className="mt-6 space-y-3">
          <button
            onClick={() => window.location.href = 'https://portal.relevo.eco.br'}
            className="w-full bg-[#2EAD60] hover:bg-[#3CC373] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🔗 Ir para o Portal Relevo
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
          >
            🔄 Já fiz login, entrar no sistema
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRedirect;
