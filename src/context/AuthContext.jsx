// src/context/AuthContext.jsx - VERSÃO COM URL PARAMETERS
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, signInWithCustomToken } from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingToken, setProcessingToken] = useState(false);

  // Função para processar token da URL
  const processarTokenDaURL = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('authToken');
      
      console.log('🔍 Verificando token na URL...', token ? `Token encontrado (${token.length} chars)` : 'Nenhum token');
      
      if (token && !processingToken) {
        console.log('🎫 Token encontrado na URL, processando...');
        setProcessingToken(true);
        
        try {
          // Fazer login com o token customizado
          console.log('🔄 Iniciando signInWithCustomToken...');
          const userCredential = await signInWithCustomToken(auth, token);
          console.log('✅ Login com token bem-sucedido:', userCredential.user.email);
          
          // Remover token da URL para segurança
          window.history.replaceState({}, '', window.location.pathname);
          
          setUser(userCredential.user);
          setProcessingToken(false);
          return true;
          
        } catch (error) {
          console.error('❌ Erro ao fazer login com token:', error);
          console.error('🔧 Detalhes do erro:', error.code, error.message);
          
          // Remover token inválido da URL
          window.history.replaceState({}, '', window.location.pathname);
          setProcessingToken(false);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao processar token da URL:', error);
      setProcessingToken(false);
      return false;
    }
  };

  useEffect(() => {
  console.log('🔄 AuthContext: Iniciando monitoramento de autenticação...');
  console.log('🔍 URL atual completa:', window.location.href);
  
  // Debug detalhado dos parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  console.log('🔍 Parâmetros da URL:', Object.fromEntries(urlParams.entries()));
  console.log('🔍 authToken parameter:', urlParams.get('authToken') ? `SIM (${urlParams.get('authToken').length} chars)` : 'NÃO');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 AuthStateChanged:', user ? `Logado: ${user.email}` : 'Deslogado');
      
      if (user) {
        // Usuário já está autenticado
        setUser(user);
        setLoading(false);
        setProcessingToken(false);
      } else {
        // Não há usuário autenticado, verificar token na URL
        console.log('🔍 Nenhum usuário logado, verificando token na URL...');
        const tokenProcessado = await processarTokenDaURL();
        
        if (!tokenProcessado) {
          console.log('❌ Nenhum token válido encontrado na URL');
          setUser(null);
          setLoading(false);
        }
      }
    }, (error) => {
      console.error('❌ Erro no AuthStateChanged:', error);
      setLoading(false);
      setProcessingToken(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('👋 Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading: loading || processingToken,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
