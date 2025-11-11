// src/context/AuthContext.jsx - VERSÃO SIMPLIFICADA
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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

  useEffect(() => {
    console.log('🔄 AuthContext: Iniciando monitoramento de autenticação...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 AuthStateChanged:', user ? `Logado: ${user.email}` : 'Deslogado');
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('❌ Erro no AuthStateChanged:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('👋 Logout realizado com sucesso');
      // Não precisa setar user como null - o AuthStateChanged vai detectar
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
