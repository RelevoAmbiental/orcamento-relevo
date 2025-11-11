import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthContext: Iniciando com persistência...');
    
    // ✅ CONFIGURAR PERSISTÊNCIA DO FIREBASE AUTH
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('✅ Persistência configurada com sucesso');
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log('🔥 AuthStateChanged:', user ? `Logado: ${user.email}` : 'Deslogado');
          
          if (user) {
            console.log('✅ Usuário autenticado detectado via Firebase Auth');
            setUser(user);
          } else {
            console.log('🔒 Nenhum usuário autenticado');
            setUser(null);
          }
          setLoading(false);
        });

        return unsubscribe;
      })
      .catch((error) => {
        console.error('❌ Erro na persistência do Firebase:', error);
        setLoading(false);
      });
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
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
