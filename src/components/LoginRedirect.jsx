// src/components/LoginRedirect.jsx - VERSÃO SIMPLES
import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-relevo-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EAD60] mx-auto mb-4"></div>
          <p className="text-relevo-text font-sans">Conectando com o Portal...</p>
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
            Bem-vindo ao Sistema de Orçamentos!
          </h2>
          <p className="text-relevo-text mb-6 font-sans">
            Logado como: <strong>{user.email}</strong>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#2EAD60] hover:bg-[#3CC373] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🚀 Acessar Sistema
          </button>
        </div>
      </div>
    );
  }

  // Se não está logado
  return (
    <div className="min-h-screen bg-relevo-background flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-relevo-green mb-4 font-heading">
          Sistema de Orçamentos
        </h2>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
          <p className="text-sm text-yellow-800 font-sans">
            <strong>Para acessar:</strong><br/>
            1. Abra o <a href="https://portal.relevo.eco.br" target="_blank" className="text-[#2EAD60] underline font-bold">Portal Relevo</a><br/>
            2. Faça login com sua conta<br/>
            3. Volte aqui e clique em "Já fiz login"
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => window.open('https://portal.relevo.eco.br', '_blank')}
            className="w-full bg-[#2EAD60] hover:bg-[#3CC373] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🔗 Abrir Portal Relevo
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            ✅ Já fiz login, entrar no sistema
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRedirect;
