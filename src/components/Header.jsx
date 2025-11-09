import React, { useState, useEffect } from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import GerenciadorOrcamentos from './GerenciadorOrcamentos';
import ExportadorOrcamento from './ExportadorOrcamento';

const formatarValorBR = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) return '0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
};

const ErrosValidacao = ({ erros, onClose }) => {
  if (!erros || erros.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-yellow-800 font-semibold text-lg font-heading">
          ⚠️ Erros de Validação
        </h3>
        <button
          onClick={onClose}
          className="text-yellow-600 hover:text-yellow-800 text-lg font-bold"
        >
          ×
        </button>
      </div>
      <p className="text-yellow-700 mb-3 font-sans">
        Corrija os seguintes erros antes de salvar:
      </p>
      <ul className="text-yellow-600 list-disc list-inside space-y-1 font-sans">
        {erros.map((erro, index) => (
          <li key={index} className="text-sm">
            {erro}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Header = () => {
  const { 
    orcamentoAtual, 
    salvarOrcamento, 
    totais,
    carregando,
    erro,
    errosValidacao,
    limparErro,
    dispatch,
    validarOrcamentoAtual,
    limparErrosValidacao
  } = useOrcamento();

  const [mostrarGerenciador, setMostrarGerenciador] = useState(false);
  const [errosVisiveis, setErrosVisiveis] = useState(true);

  useEffect(() => {
    validarOrcamentoAtual();
  }, [orcamentoAtual]);

  const handleMetadataChange = (field, value) => {
    if (errosValidacao.length > 0) {
      limparErrosValidacao();
    }
    
    dispatch({
      type: 'UPDATE_METADATA',
      payload: { [field]: value }
    });
  };

  const handleSave = async () => {
    try {
      limparErro();
      
      const validacao = validarOrcamentoAtual();
      
      if (!validacao.valido) {
        setErrosVisiveis(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const id = await salvarOrcamento(orcamentoAtual);
      
      if (id) {
        alert(`✅ Orçamento salvo com sucesso!\nID: ${id}`);
        limparErrosValidacao();
      }
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
    }
  };

  const handleNovoOrcamento = () => {
    if (confirm('Deseja criar um novo orçamento? Todas as alterações não salvas serão perdidas.')) {
      window.location.reload();
    }
  };

  const podeSalvar = errosValidacao.length === 0;

  return (
    <div className="bg-relevo-background shadow-lg border-b border-relevo-border p-6 mb-6">
      {errosVisiveis && errosValidacao.length > 0 && (
        <ErrosValidacao 
          erros={errosValidacao} 
          onClose={() => setErrosVisiveis(false)}
        />
      )}

      {errosValidacao.length > 0 && !errosVisiveis && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex justify-between items-center">
          <span className="text-yellow-700 text-sm font-sans">
            ⚠️ Existem {errosValidacao.length} erro(s) de validação
          </span>
          <button
            onClick={() => setErrosVisiveis(true)}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition font-sans"
          >
            Ver Erros
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <img 
              src="https://raw.githubusercontent.com/RelevoAmbiental/relevo-site/refs/heads/main/assets/icons/Logo_atualizada_vertical.png" 
              alt="Relevo Consultoria Ambiental"
              className="h-16 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className="h-16 w-16 bg-relevo-green rounded-lg flex items-center justify-center hidden"
            >
              <span className="text-white font-bold text-lg">R</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-relevo-green font-heading">
              Relevo Consultoria Ambiental
            </h1>
            <p className="font-medium text-relevo-blue font-heading">
              Sistema de Orçamentos
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <ExportadorOrcamento />
          
          <button
            onClick={handleSave}
            disabled={carregando || !podeSalvar}
            className={`px-6 py-3 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200 shadow-md flex items-center justify-center gap-2 min-w-[160px] font-sans ${
              !podeSalvar ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-relevo-green'
            }`}
            title={!podeSalvar ? 'Corrija os erros de validação para salvar' : 'Salvar orçamento no Firebase'}
          >
            {carregando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                {podeSalvar ? '💾 Salvar' : '❌ Corrija os Erros'}
              </>
            )}
          </button>
          
          <button
            onClick={() => setMostrarGerenciador(true)}
            className="px-6 py-3 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200 shadow-md min-w-[120px] bg-relevo-blue font-sans"
          >
            📋 Gerenciar
          </button>
          
          <button
            onClick={handleNovoOrcamento}
            className="px-6 py-3 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200 shadow-md min-w-[100px] bg-relevo-orange font-sans"
          >
            🆕 Novo
          </button>
        </div>
      </div>

      <div className="bg-relevo-light-gray rounded-lg p-6 mb-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-relevo-text mb-4 text-center font-heading">
            Informações do Orçamento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-relevo-text font-sans">
                Nome do Orçamento *
              </label>
              <input
                type="text"
                value={orcamentoAtual.metadata.nome}
                onChange={(e) => handleMetadataChange('nome', e.target.value)}
                className="w-full px-4 py-3 border border-relevo-border rounded-lg focus:outline-none focus:ring-2 focus:ring-relevo-green-light transition-colors text-sm font-sans"
                placeholder="Ex: Projeto EIA-RIMA Serra Azul"
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-relevo-text font-sans">
                Cliente *
              </label>
              <input
                type="text"
                value={orcamentoAtual.metadata.cliente}
                onChange={(e) => handleMetadataChange('cliente', e.target.value)}
                className="w-full px-4 py-3 border border-relevo-border rounded-lg focus:outline-none focus:ring-2 focus:ring-relevo-green-light transition-colors text-sm font-sans"
                placeholder="Nome da empresa cliente"
              />
              <p className="text-xs text-gray-500 mt-1">Obrigatório</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-relevo-text font-sans">
                Data *
              </label>
              <input
                type="date"
                value={orcamentoAtual.metadata.data}
                onChange={(e) => handleMetadataChange('data', e.target.value)}
                className="w-full px-4 py-3 border border-relevo-border rounded-lg focus:outline-none focus:ring-2 focus:ring-relevo-green-light transition-colors text-sm font-sans"
              />
              <p className="text-xs text-gray-500 mt-1">Obrigatório</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-relevo-text font-sans">
                Desconto (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={orcamentoAtual.metadata.desconto}
                onChange={(e) => handleMetadataChange('desconto', e.target.value)}
                className="w-full px-4 py-3 border border-relevo-border rounded-lg focus:outline-none focus:ring-2 focus:ring-relevo-green-light transition-colors text-sm font-sans"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">0 a 100</p>
            </div>
          </div>
        </div>
      </div>

      {mostrarGerenciador && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-relevo-green font-heading">Gerenciar Orçamentos</h2>
              <button 
                onClick={() => setMostrarGerenciador(false)} 
                className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <GerenciadorOrcamentos />
          </div>
        </div>
      )}

      {erro && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed bottom-4 right-4 z-50 shadow-lg">
          <p>{erro}</p>
          <button onClick={limparErro} className="absolute top-1 right-2 text-red-700 font-bold">x</button>
        </div>
      )}
    </div>
  );
};

export default Header;
