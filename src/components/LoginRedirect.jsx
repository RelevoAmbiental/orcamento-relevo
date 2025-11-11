// src/components/LoginRedirect.jsx - VERSÃO COM DEBUG DE URL
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginRedirect = () => {
  const { user, loading } = useAuth();
  const [urlInfo, setUrlInfo] = useState('');

  useEffect(() => {
    // Verificar parâmetros da URL quando componente montar
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('authToken');
    
    console.log('🔍 LoginRedirect - URL atual:', window.location.href);
    console.log('🔍 LoginRedirect - Token na URL:', token ? `SIM (${token.length} chars)` : 'NÃO');
    
    if (token) {
      setUrlInfo(`Token detectado na URL (${token.length} caracteres)`);
    } else {
      setUrlInfo('Nenhum token encontrado na URL');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-relevo-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EAD60] mx-auto mb-4"></div>
          <p className="text-relevo-text font-sans">Processando autenticação...</p>
          <p className="text-sm text-relevo-text/70 mt-2 font-sans">
            {urlInfo || 'Verificando credenciais...'}
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

        {urlInfo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800 font-sans">
              <strong>🔍 Debug Info:</strong> {urlInfo}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => window.open('https://portal.relevo.eco.br', '_blank')}
            className="w-full bg-[#2EAD60] hover:bg-[#3CC373] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🔗 Fazer Login no Portal
          </button>
          
          <button
            onClick={() => {
              const urlParams = new URLSearchParams(window.location.search);
              const token = urlParams.get('authToken');
              alert(`URL: ${window.location.href}\nToken: ${token ? `Presente (${token.length} chars)` : 'Ausente'}`);
            }}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
          >
            🔍 Verificar URL Atual
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRedirect;
