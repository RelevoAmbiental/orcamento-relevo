import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-relevo-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EAD60] mx-auto mb-4"></div>
          <p className="text-relevo-text font-sans">Verificando acesso ao sistema...</p>
          <p className="text-sm text-relevo-text/70 mt-2 font-sans">
            Conectando com autenticação compartilhada
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    // Usuário autenticado - o App principal já renderiza o conteúdo
    return null;
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
          <p className="text-sm text-blue-800 font-sans">
            <strong>Para acessar o sistema de orçamentos:</strong>
          </p>
          <p className="text-sm text-blue-800 mt-2 font-sans">
            1. Faça login no <a href="https://portal.relevo.eco.br" target="_blank" className="text-[#2EAD60] underline font-bold">Portal Relevo</a><br/>
            2. Volte aqui e recarregue a página
          </p>
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
            🔄 Já fiz login, recarregar página
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRedirect;
