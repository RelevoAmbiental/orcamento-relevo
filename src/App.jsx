// src/App.jsx - ARQUIVO ATUALIZADO
import React from 'react';
import { OrcamentoProvider } from './context/OrcamentoContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Header from './components/Header';
import CustosGerais from './components/CustosGerais';
import Coordenacao from './components/Coordenacao';
import Profissionais from './components/Profissionais';
import ValoresUnicos from './components/ValoresUnicos';
import Logistica from './components/Logistica';

import CardCustosDiretos from './components/CardCustosDiretos';   // ✅ NOVO
import ResumoTotal from './components/ResumoTotal'; 

import LoginRedirect from './components/LoginRedirect';
import LoadingScreen from './components/LoadingScreen';


// Controle de autenticação
const ProtectedApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginRedirect />;
  }

  return (
    <OrcamentoProvider>
      <div className="min-h-screen bg-relevo-background">
        
        <Header />

        <main className="container mx-auto px-4 py-6">
          
          {/* Blocos de dados */}
          <CustosGerais />
          <Coordenacao />
          <Profissionais />
          <ValoresUnicos />
          <Logistica />

          {/* 💚 RESUMOS – agora visíveis no final da página */}
          <CardCustosDiretos />   {/* Card executivo de custos diretos */}

        </main>
      </div>
    </OrcamentoProvider>
  );
};


// App principal
function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
}

export default App;
