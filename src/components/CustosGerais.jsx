import React from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import { formatarValorBR, formatarPercentual } from '../utils/formatters';
import { validators } from '../utils/validators';

const CustosGerais = () => {
  const { orcamentoAtual, dispatch, totais } = useOrcamento();

  const handleParametroChange = (parametro, valor) => {
    const valorPercentual = parseFloat(valor) / 100 || 0;
    
    // Validar o valor (0-100% em porcentagem, 0-1 em decimal)
    const erro = validators.parametros[parametro]?.(valorPercentual);
    
    if (erro) {
      console.warn(`Erro de validação em ${parametro}:`, erro);
      // O usuário verá o feedback visual
    }

    dispatch({
      type: 'UPDATE_PARAMETROS',
      payload: { [parametro]: valorPercentual }
    });
  };

  // Calcular total de custos indiretos para exibição
  const totalCustosIndiretos = (totais?.encargosPessoal || 0) + 
                               (totais?.lucro || 0) + 
                               (totais?.fundoGiro || 0) + 
                               (totais?.impostos || 0) + 
                               (totais?.despesasFiscais || 0) + 
                               (totais?.comissaoCaptacao || 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Custos Gerais e Parâmetros</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { key: 'imposto', label: 'Impostos (%)' },
          { key: 'lucro', label: 'Lucro (%)' },
          { key: 'fundoGiro', label: 'Fundo de Giro (%)' },
          { key: 'encargosPessoal', label: 'Encargos Pessoal (%)' },
          { key: 'despesasFiscais', label: 'Despesas Fiscais (%)' },
          { key: 'comissaoCaptacao', label: 'Comissão de Captação (%)' }
        ].map((param) => {
          const valorAtual = orcamentoAtual.parametros[param.key] * 100;
          const erro = validators.parametros[param.key]?.(orcamentoAtual.parametros[param.key]);
          
          return (
            <div key={param.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {param.label}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={valorAtual}
                onChange={(e) => handleParametroChange(param.key, e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  erro ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {erro && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {erro.replace('0-1', '0-100%')}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumo dos Custos - ATUALIZADO */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Resumo dos Custos Indiretos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Despesas Fiscais:</span>
            <div className="font-semibold">
              R$ {formatarValorBR(totais?.despesasFiscais || 0)}
            </div>
            <div className="text-xs text-gray-500">
              {formatarPercentual(orcamentoAtual.parametros.despesasFiscais)}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Lucro:</span>
            <div className="font-semibold">
              R$ {formatarValorBR(totais?.lucro || 0)}
            </div>
            <div className="text-xs text-gray-500">
              {formatarPercentual(orcamentoAtual.parametros.lucro)}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Fundo de Giro:</span>
            <div className="font-semibold">
              R$ {formatarValorBR(totais?.fundoGiro || 0)}
            </div>
            <div className="text-xs text-gray-500">
              {formatarPercentual(orcamentoAtual.parametros.fundoGiro)}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Impostos:</span>
            <div className="font-semibold">
              R$ {formatarValorBR(totais?.impostos || 0)}
            </div>
            <div className="text-xs text-gray-500">
              {formatarPercentual(orcamentoAtual.parametros.imposto)}
            </div>
          </div>
        </div>
        
        {/* Outros custos */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-gray-200">
          <div>
            <span className="text-gray-600">Encargos Pessoal:</span>
            <div className="font-semibold">
              R$ {formatarValorBR(totais?.encargosPessoal || 0)}
            </div>
            <div className="text-xs text-gray-500">
              {formatarPercentual(orcamentoAtual.parametros.encargosPessoal)}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Comissão Captação:</span>
            <div className="font-semibold">
              R$ {formatarValorBR(totais?.comissaoCaptacao || 0)}
            </div>
            <div className="text-xs text-gray-500">
              {formatarPercentual(orcamentoAtual.parametros.comissaoCaptacao)}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Total Custos Indiretos:</span>
            <div className="font-semibold text-green-600">
              R$ {formatarValorBR(totalCustosIndiretos)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustosGerais;