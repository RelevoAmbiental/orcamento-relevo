// src/components/LoginRedirect.jsx - VERSÃO SIMPLIFICADA
import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-relevo-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EAD60] mx-auto mb-4"></div>
          <p className="text-relevo-text font-sans">Verificando autenticação...</p>
          <p className="text-sm text-relevo-text/70 mt-2 font-sans">
            Conectando com o Portal Relevo
          </p>
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
            Autenticação Confirmada!
          </h2>
          <p className="text-relevo-text mb-4 font-sans">
            Logado como: <strong>{user.email}</strong>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#2EAD60] hover:bg-[#3CC373] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🚀 Acessar Sistema de Orçamentos
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
        
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <p className="text-sm text-blue-800 font-sans font-semibold mb-2">
            📋 Para acessar o sistema:
          </p>
          <ol className="text-sm text-blue-800 text-left space-y-2 font-sans">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">1</span>
              Faça login no <a href="https://portal.relevo.eco.br" target="_blank" className="text-[#2EAD60] underline font-bold mx-1">Portal Relevo</a>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">2</span>
              Clique em "Sistema de Orçamentos"
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">3</span>
              Você será conectado automaticamente
            </li>
          </ol>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.open('https://portal.relevo.eco.br', '_blank')}
            className="w-full bg-[#2EAD60] hover:bg-[#3CC373] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🔗 Fazer Login no Portal
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🔄 Já fiz login, verificar novamente
          </button>
        </div>

        <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
          <strong>💡 Dica:</strong> Use a mesma aba do portal para acesso instantâneo
        </div>
      </div>
    </div>
  );
};

export default LoginRedirect;
