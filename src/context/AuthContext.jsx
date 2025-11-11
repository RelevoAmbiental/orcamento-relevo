// src/context/AuthContext.jsx - VERSÃO COM DEBUG
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
    console.log('🔄 AuthContext: Iniciando verificação de autenticação...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 AuthStateChanged chamado:', user);
      console.log('📧 Email do usuário:', user?.email);
      console.log('🔑 UID do usuário:', user?.uid);
      console.log('✅ Token disponível:', user ? 'SIM' : 'NÃO');
      
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('❌ Erro no onAuthStateChanged:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ... resto do código igual
};
