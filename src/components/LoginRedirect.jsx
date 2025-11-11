// src/components/LoginRedirect.jsx - ARQUIVO NOVO
import React, { useEffect, useState } from 'react';

const LoginRedirect = () => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen bg-relevo-background flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-relevo-green mb-4 font-heading">
          Acesso Restrito ao Sistema de Orçamentos
        </h2>
        <p className="text-relevo-text mb-4 font-sans">
          Você precisa estar logado no <strong>Portal Relevo</strong> para acessar esta aplicação.
        </p>
        <p className="text-relevo-text/70 font-sans">
          Redirecionando para o portal em <strong>{countdown}</strong> segundos...
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
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
          >
            🔄 Já fiz login, continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRedirect;
