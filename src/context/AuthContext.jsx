// src/context/AuthContext.jsx - VERSÃO COM localStorage
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

  // Verificar se há sessão compartilhada do portal
  const verificarSessaoPortal = async () => {
    try {
      const portalToken = localStorage.getItem('portal-auth-token');
      const portalUser = localStorage.getItem('portal-auth-user');
      
      console.log('🔍 Verificando sessão do portal...', {
        token: portalToken ? `SIM (${portalToken.length} chars)` : 'NÃO',
        user: portalUser ? 'SIM' : 'NÃO'
      });

      if (portalToken && portalUser) {
        const userData = JSON.parse(portalUser);
        
        // Verificar se o token não expirou (menos de 10 minutos)
        const isTokenFresh = Date.now() - userData.timestamp < 10 * 60 * 1000;
        
        if (isTokenFresh) {
          console.log('🎫 Token do portal encontrado e válido, fazendo login...');
          
          try {
            // Fazer login com o token do portal
            const userCredential = await signInWithCustomToken(auth, portalToken);
            console.log('✅ Login automático com token do portal:', userCredential.user.email);
            
            // Limpar dados do localStorage após uso bem-sucedido
            localStorage.removeItem('portal-auth-token');
            localStorage.removeItem('portal-auth-user');
            
            return userCredential.user;
          } catch (error) {
            console.error('❌ Erro ao fazer login com token do portal:', error);
            // Limpar dados inválidos
            localStorage.removeItem('portal-auth-token');
            localStorage.removeItem('portal-auth-user');
          }
        } else {
          console.log('⏰ Token do portal expirado, limpando...');
          localStorage.removeItem('portal-auth-token');
          localStorage.removeItem('portal-auth-user');
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao verificar sessão do portal:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🔄 AuthContext: Iniciando monitoramento de autenticação...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuário já está autenticado no Firebase
        console.log('🔥 AuthStateChanged: Logado:', user.email);
        setUser(user);
        setLoading(false);
      } else {
        // Não há usuário autenticado, verificar sessão do portal
        console.log('🔥 AuthStateChanged: Deslogado, verificando sessão do portal...');
        
        const portalUser = await verificarSessaoPortal();
        
        if (portalUser) {
          // Login automático bem-sucedido
          setUser(portalUser);
        } else {
          // Nenhuma sessão disponível
          setUser(null);
        }
        
        setLoading(false);
      }
    }, (error) => {
      console.error('❌ Erro no AuthStateChanged:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      // Limpar sessão do portal também
      localStorage.removeItem('portal-auth-token');
      localStorage.removeItem('portal-auth-user');
      
      await signOut(auth);
      console.log('👋 Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
