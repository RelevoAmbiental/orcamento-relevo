// src/components/LoginRedirect.jsx - VERSÃO MELHORADA
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginRedirect = () => {
  const { user, loading } = useAuth();
  const [tentativaRecarregamento, setTentativaRecarregamento] = useState(false);

  // Verificar se há token na URL quando o componente montar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token && !user && !loading) {
      console.log('🔄 Token detectado, aguardando processamento...');
    }
  }, [user, loading]);

  const handleRecarregar = () => {
    setTentativaRecarregamento(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-relevo-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EAD60] mx-auto mb-4"></div>
          <p className="text-relevo-text font-sans">Verificando acesso ao sistema...</p>
          <p className="text-sm text-relevo-text/70 mt-2 font-sans">
            {tentativaRecarregamento ? 'Processando token...' : 'Conectando com o Portal Relevo'}
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
            Autenticação Bem-sucedida!
          </h2>
          <p className="text-relevo-text mb-4 font-sans">
            Logado como: <strong>{user.email}</strong>
          </p>
          <p className="text-sm text-relevo-text/70 mb-6 font-sans">
            Redirecionando para o sistema de orçamentos...
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#2EAD60] hover:bg-[#3CC373] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🚀 Entrar Agora
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
          <p className="text-sm text-blue-800 font-sans">
            <strong>Para acessar o sistema:</strong>
          </p>
          <ol className="text-sm text-blue-800 text-left mt-2 space-y-2 font-sans">
            <li>1. Abra o <a href="https://portal.relevo.eco.br" target="_blank" className="text-[#2EAD60] underline font-bold">Portal Relevo</a></li>
            <li>2. Faça login com sua conta corporativa</li>
            <li>3. Clique em "Sistema de Orçamentos" no portal</li>
            <li>4. Você será redirecionado automaticamente</li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-6">
          <p className="text-sm text-yellow-800 font-sans">
            <strong>Problemas de acesso?</strong><br/>
            Se você já fez login no portal mas não consegue acessar, tente recarregar esta página.
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
            onClick={handleRecarregar}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🔄 Já fiz login, recarregar página
          </button>

          <button
            onClick={() => {
              const urlParams = new URLSearchParams(window.location.search);
              const token = urlParams.get('token');
              console.log('Token atual na URL:', token ? 'SIM' : 'NÃO');
              alert(`Token na URL: ${token ? 'Presente' : 'Ausente'}\nVerifique o console para detalhes.`);
            }}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
          >
            🔍 Debug: Verificar Token
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRedirect;
