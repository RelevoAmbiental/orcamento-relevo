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
      <h2 className="text-xl font-bold mb-4 text-relevo-text font-heading">Custos Gerais e Parâmetros</h2>
      
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
              <label className="block text-sm font-medium text-relevo-text/80 font-sans mb-1">
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
                  erro ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-relevo-green-light'
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

      {/* Resumo dos Custos - CORRIGIDO */}
      <div className="mt-6 p-4 bg-relevo-light-gray rounded-lg">
        <h3 className="font-semibold text-relevo-text font-heading mb-4">Resumo dos Custos Indiretos</h3>
        
        {/* Primeira linha - 4 itens */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div className="text-center">
            <span className="text-relevo-text/70 font-sans block">Despesas Fiscais:</span>
            <div className="font-semibold text-relevo-text">
              R$ {formatarValorBR(totais?.despesasFiscais || 0)}
            </div>
            <div className="text-xs text-relevo-text/60 font-sans">
              {formatarPercentual(orcamentoAtual.parametros.despesasFiscais)}
            </div>
          </div>
          
          <div className="text-center">
            <span className="text-relevo-text/70 font-sans block">Lucro:</span>
            <div className="font-semibold text-relevo-text">
              R$ {formatarValorBR(totais?.lucro || 0)}
            </div>
            <div className="text-xs text-relevo-text/60 font-sans">
              {formatarPercentual(orcamentoAtual.parametros.lucro)}
            </div>
          </div>
          
          <div className="text-center">
            <span className="text-relevo-text/70 font-sans block">Fundo de Giro:</span>
            <div className="font-semibold text-relevo-text">
              R$ {formatarValorBR(totais?.fundoGiro || 0)}
            </div>
            <div className="text-xs text-relevo-text/60 font-sans">
              {formatarPercentual(orcamentoAtual.parametros.fundoGiro)}
            </div>
          </div>
          
          <div className="text-center">
            <span className="text-relevo-text/70 font-sans block">Impostos:</span>
            <div className="font-semibold text-relevo-text">
              R$ {formatarValorBR(totais?.impostos || 0)}
            </div>
            <div className="text-xs text-relevo-text/60 font-sans">
              {formatarPercentual(orcamentoAtual.parametros.imposto)}
            </div>
          </div>
        </div>
        
        {/* Segunda linha - 3 itens centralizados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t border-gray-200 pt-4">
          <div className="text-center">
            <span className="text-relevo-text/70 font-sans block">Encargos Pessoal:</span>
            <div className="font-semibold text-relevo-text">
              R$ {formatarValorBR(totais?.encargosPessoal || 0)}
            </div>
            <div className="text-xs text-relevo-text/60 font-sans">
              {formatarPercentual(orcamentoAtual.parametros.encargosPessoal)}
            </div>
          </div>
          
          <div className="text-center">
            <span className="text-relevo-text/70 font-sans block">Comissão Captação:</span>
            <div className="font-semibold text-relevo-text">
              R$ {formatarValorBR(totais?.comissaoCaptacao || 0)}
            </div>
            <div className="text-xs text-relevo-text/60 font-sans">
              {formatarPercentual(orcamentoAtual.parametros.comissaoCaptacao)}
            </div>
          </div>
          
          <div className="text-center">
            <span className="text-relevo-text/70 font-sans block">Total Custos Indiretos:</span>
            <div className="font-semibold text-relevo-green font-sans">
              R$ {formatarValorBR(totalCustosIndiretos)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustosGerais;
