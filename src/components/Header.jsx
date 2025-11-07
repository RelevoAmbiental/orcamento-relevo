import React, { useState, useEffect } from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import GerenciadorOrcamentos from './GerenciadorOrcamentos';
import ExportadorOrcamento from './ExportadorOrcamento';

// Função para formatar valores no padrão brasileiro
const formatarValorBR = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) return '0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
};

// Componente para exibir erros de validação
const ErrosValidacao = ({ erros, onClose }) => {
  if (!erros || erros.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-yellow-800 font-semibold text-lg">
          ⚠️ Erros de Validação
        </h3>
        <button
          onClick={onClose}
          className="text-yellow-600 hover:text-yellow-800 text-lg font-bold"
        >
          ×
        </button>
      </div>
      <p className="text-yellow-700 mb-3">
        Corrija os seguintes erros antes de salvar:
      </p>
      <ul className="text-yellow-600 list-disc list-inside space-y-1">
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

  // Validar automaticamente quando o orçamento mudar
  useEffect(() => {
    validarOrcamentoAtual();
  }, [orcamentoAtual]);

  const handleMetadataChange = (field, value) => {
    // Limpar erros quando o usuário começar a corrigir
    if (errosValidacao.length > 0) {
      limparErrosValidacao();
    }
    
    // USAR DISPATCH DIRETAMENTE (COMPATÍVEL COM O CONTEXT)
    dispatch({
      type: 'UPDATE_METADATA',
      payload: { [field]: value }
    });
  };

  const handleSave = async () => {
    try {
      limparErro();
      
      // Validar antes de tentar salvar
      const validacao = validarOrcamentoAtual();
      
      if (!validacao.valido) {
        setErrosVisiveis(true);
        // Scroll para o topo para mostrar os erros
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
    <div className="bg-white shadow-lg border-b border-gray-200 p-6 mb-6" style={{ backgroundColor: '#FFFFFF' }}>
      {/* EXIBIÇÃO DE ERROS DE VALIDAÇÃO */}
      {errosVisiveis && errosValidacao.length > 0 && (
        <ErrosValidacao 
          erros={errosValidacao} 
          onClose={() => setErrosVisiveis(false)}
        />
      )}

      {/* BOTÃO PARA MOSTRAR/OCULTAR ERROS */}
      {errosValidacao.length > 0 && !errosVisiveis && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex justify-between items-center">
          <span className="text-yellow-700 text-sm">
            ⚠️ Existem {errosValidacao.length} erro(s) de validação
          </span>
          <button
            onClick={() => setErrosVisiveis(true)}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition"
          >
            Ver Erros
          </button>
        </div>
      )}

      {/* PRIMEIRA LINHA: LOGO E BOTÕES */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        {/* LOGO E IDENTIDADE VISUAL */}
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
            {/* Fallback caso a imagem não carregue */}
            <div 
              className="h-16 w-16 bg-green-800 rounded-lg flex items-center justify-center hidden"
              style={{ backgroundColor: '#2E7D32' }}
            >
              <span className="text-white font-bold text-lg">R</span>
            </div>
          </div>
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{ color: '#2E7D32', fontFamily: 'Montserrat, Roboto, sans-serif' }}
            >
              Relevo Consultoria Ambiental
            </h1>
            <p 
              className="font-medium"
              style={{ color: '#0097A7', fontFamily: 'Montserrat, Roboto, sans-serif' }}
            >
              Sistema de Orçamentos
            </p>
          </div>
        </div>
        
        {/* BOTÕES DE AÇÃO - ATUALIZADO COM EXPORTAÇÃO */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* BOTÕES DE EXPORTAÇÃO */}
          <ExportadorOrcamento />
          
          <button
            onClick={handleSave}
            disabled={carregando || !podeSalvar}
            className={`px-6 py-3 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200 shadow-md flex items-center justify-center gap-2 min-w-[160px] ${
              !podeSalvar ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ 
              backgroundColor: podeSalvar ? '#2E7D32' : '#9E9E9E',
              fontFamily: 'Roboto, Open Sans, sans-serif',
            }}
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
            className="px-6 py-3 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200 shadow-md min-w-[120px]"
            style={{ 
              backgroundColor: '#0097A7',
              fontFamily: 'Roboto, Open Sans, sans-serif',
            }}
          >
            📋 Gerenciar
          </button>
          
          <button
            onClick={handleNovoOrcamento}
            className="px-6 py-3 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 font-medium transition-all duration-200 shadow-md min-w-[100px]"
            style={{ 
              backgroundColor: '#FF6B35',
              fontFamily: 'Roboto, Open Sans, sans-serif',
            }}
          >
            🆕 Novo
          </button>
        </div>
      </div>

      {/* SEGUNDA LINHA: FORMULÁRIOS DE METADADOS - CENTRALIZADOS */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center" style={{ fontFamily: 'Montserrat, Roboto, sans-serif' }}>
            Informações do Orçamento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: '#333333', fontFamily: 'Roboto, Open Sans, sans-serif' }}
              >
                Nome do Orçamento *
              </label>
              <input
                type="text"
                value={orcamentoAtual.metadata.nome}
                onChange={(e) => handleMetadataChange('nome', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm"
                style={{ fontFamily: 'Roboto, Open Sans, sans-serif' }}
                placeholder="Ex: Projeto EIA-RIMA Serra Azul"
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres</p>
            </div>
            
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: '#333333', fontFamily: 'Roboto, Open Sans, sans-serif' }}
              >
                Cliente *
              </label>
              <input
                type="text"
                value={orcamentoAtual.metadata.cliente}
                onChange={(e) => handleMetadataChange('cliente', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm"
                style={{ fontFamily: 'Roboto, Open Sans, sans-serif' }}
                placeholder="Nome da empresa cliente"
              />
              <p className="text-xs text-gray-500 mt-1">Obrigatório</p>
            </div>
            
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: '#333333', fontFamily: 'Roboto, Open Sans, sans-serif' }}
              >
                Data *
              </label>
              <input
                type="date"
                value={orcamentoAtual.metadata.data}
                onChange={(e) => handleMetadataChange('data', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm"
                style={{ fontFamily: 'Roboto, Open Sans, sans-serif' }}
              />
              <p className="text-xs text-gray-500 mt-1">Obrigatório</p>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: '#333333', fontFamily: 'Roboto, Open Sans, sans-serif' }}
              >
                Desconto (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={orcamentoAtual.metadata.desconto}
                onChange={(e) => handleMetadataChange('desconto', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm"
                style={{ fontFamily: 'Roboto, Open Sans, sans-serif' }}
                placeholder="0,0"
              />
              <p className="text-xs text-gray-500 mt-1">0 a 100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* MENSAGEM DE ERRO DO FIREBASE */}
      {erro && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{erro}</span>
          <button 
            onClick={limparErro}
            className="absolute top-0 right-0 px-4 py-3"
          >
            <span className="text-red-700">×</span>
          </button>
        </div>
      )}
      
      {/* TERCEIRA LINHA: TOTAL GERAL EM DESTAQUE */}
      <div 
        className={`p-6 rounded-lg text-white shadow-lg transition-all duration-300 ${
          podeSalvar ? 'opacity-100' : 'opacity-70'
        }`}
        style={{ 
          background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
          fontFamily: 'Montserrat, Roboto, sans-serif'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <div className="text-sm opacity-90 font-light">TOTAL DO ORÇAMENTO</div>
            <div className="text-3xl font-bold tracking-tight">
              R$ {formatarValorBR(totais?.totalGeral)}
            </div>
            {totais?.desconto > 0 && (
              <div className="text-sm opacity-90 mt-2 font-light bg-black bg-opacity-20 px-3 py-1 rounded-full inline-block">
                🎯 Desconto aplicado: -R$ {formatarValorBR(totais.desconto)} ({orcamentoAtual.metadata.desconto}%)
              </div>
            )}
            {!podeSalvar && (
              <div className="text-sm opacity-90 mt-2 font-light bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full inline-block">
                ⚠️ Corrija os erros para salvar
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-6 text-right">
            <div>
              <div className="text-sm opacity-90 font-light">Custos Diretos</div>
              <div className="text-xl font-semibold">
                R$ {formatarValorBR(totais?.subtotalGeral)}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-90 font-light">Antes do desconto</div>
              <div className="text-xl font-semibold">
                R$ {formatarValorBR(totais?.totalAntesDesconto)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL GERENCIADOR DE ORÇAMENTOS */}
      {mostrarGerenciador && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Gerenciar Orçamentos Salvos</h2>
              <button
                onClick={() => setMostrarGerenciador(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <GerenciadorOrcamentos />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setMostrarGerenciador(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;