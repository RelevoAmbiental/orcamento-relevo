import React from 'react';
import { OrcamentoProvider } from './context/OrcamentoContext';

// Componentes principais
import Header from './components/Header';
import IdentificacaoOrcamento from './components/IdentificacaoOrcamento';
import CustosGerais from './components/CustosGerais';
import Coordenacao from './components/Coordenacao';
import Profissionais from './components/Profissionais';
import ValoresUnicos from './components/ValoresUnicos';
import Logistica from './components/Logistica';
import ResumoTotal from './components/ResumoTotal';

function App() {
  return (
    <OrcamentoProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Cabeçalho com logo e botões */}
        <Header />

        {/* Conteúdo principal */}
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Identificação do orçamento */}
          <IdentificacaoOrcamento />

          {/* Seções principais */}
          <CustosGerais />
          <Coordenacao />
          <Profissionais />
          <ValoresUnicos />
          <Logistica />

          {/* Resumo com total e desconto */}
          <ResumoTotal />
        </div>
      </div>
    </OrcamentoProvider>
  );
}

export default App;
