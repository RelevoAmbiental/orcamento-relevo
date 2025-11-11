// src/context/AuthContext.jsx - VERSÃO CORRIGIDA
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithCustomToken 
} from 'firebase/auth';
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
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token && !user && !processingToken) {
      console.log('🎫 Token encontrado na URL, processando...');
      setProcessingToken(true);
      
      try {
        // Remover token da URL para segurança
        window.history.replaceState({}, '', window.location.pathname);
        
        // Fazer login com o token customizado
        const userCredential = await signInWithCustomToken(auth, token);
        console.log('✅ Login com token customizado bem-sucedido:', userCredential.user.email);
        
        setUser(userCredential.user);
        setProcessingToken(false);
        return true;
      } catch (error) {
        console.error('❌ Erro ao fazer login com token:', error);
        setProcessingToken(false);
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    console.log('🔄 AuthContext: Iniciando verificação de autenticação...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 AuthStateChanged chamado:', user);
      
      // Se não há usuário, verificar se há token na URL
      if (!user) {
        console.log('👤 Nenhum usuário logado, verificando token na URL...');
        const tokenProcessado = await processarTokenDaURL();
        
        if (!tokenProcessado) {
          console.log('❌ Nenhum token válido encontrado na URL');
          setUser(null);
          setLoading(false);
        }
      } else {
        // Usuário já está autenticado
        console.log('✅ Usuário autenticado:', user.email);
        setUser(user);
        setLoading(false);
      }
    }, (error) => {
      console.error('❌ Erro no onAuthStateChanged:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
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
