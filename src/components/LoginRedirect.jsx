// src/components/LoginRedirect.jsx - VERSÃO COM DEBUG
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginRedirect = () => {
  const [countdown, setCountdown] = useState(5);
  const { user, loading } = useAuth(); // ⬅️ ADICIONAR

  useEffect(() => {
    console.log('🔍 LoginRedirect - Status:');
    console.log('👤 User:', user);
    console.log('⏳ Loading:', loading);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = 'https://portal.relevo.eco.br';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, loading]); // ⬅️ ADICIONAR DEPENDÊNCIAS

  return (
    <div className="min-h-screen bg-relevo-background flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-relevo-green mb-4 font-heading">
          Acesso Restrito
        </h2>
        
        {/* ⬅️ ADICIONAR INFO DE DEBUG */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-left">
          <p className="text-sm text-yellow-800 font-sans">
            <strong>Debug Info:</strong><br/>
            Usuário: {user ? user.email : 'null'}<br/>
            Loading: {loading ? 'sim' : 'não'}
          </p>
        </div>
        
        <p className="text-relevo-text mb-4 font-sans">
          Você precisa estar logado no <strong>Portal Relevo</strong>.
        </p>
        <p className="text-relevo-text/70 font-sans">
          Redirecionando em <strong>{countdown}</strong>s...
        </p>
        <div className="mt-6 space-y-3">
          <button
            onClick={() => window.location.href = 'https://portal.relevo.eco.br'}
            className="w-full bg-[#2EAD60] hover:bg-[#3CC373] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Ir para o Portal
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
          >
            Já fiz login, continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRedirect;
