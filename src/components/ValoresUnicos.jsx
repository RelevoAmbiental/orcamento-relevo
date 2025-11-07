import React from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import { formatarValorBR } from '../utils/formatters';
import { validators } from '../utils/validators';

const ValoresUnicos = () => {
  const { orcamentoAtual, dispatch, totais } = useOrcamento();

  const handleValorUnicoChange = (id, field, value) => {
    const isTextField = field === 'item';
    const valorFinal = isTextField ? value : parseFloat(value) || 0;
    
    // Validar campos numéricos
    let erro = null;
    if (!isTextField && validators.valoresUnicos[field]) {
      erro = validators.valoresUnicos[field](valorFinal);
    }
    
    if (erro) {
      console.warn(`Erro de validação em ${field}:`, erro);
    }

    dispatch({
      type: 'UPDATE_VALORES_UNICOS',
      payload: {
        id,
        updates: { [field]: valorFinal }
      }
    });
  };

  const adicionarNovoItem = () => {
    const novoId = Math.max(...orcamentoAtual.valoresUnicos.map(item => item.id)) + 1;
    dispatch({
      type: 'UPDATE_VALORES_UNICOS',
      payload: {
        id: novoId,
        updates: {
          item: 'Novo Item',
          valor: 0,
          pessoas: 1,
          dias: 1
        }
      }
    });
  };

  // Função para obter classe CSS baseada na validação
  const getInputClassName = (field, value, isTextField = false) => {
    if (isTextField) return "w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";
    
    const erro = validators.valoresUnicos[field]?.(value);
    const baseClass = "w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1";
    
    return erro 
      ? `${baseClass} border-red-300 focus:ring-red-500 bg-red-50` 
      : `${baseClass} border-gray-300 focus:ring-blue-500`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Valores Únicos</h2>
        <button
          onClick={adicionarNovoItem}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
        >
          + Adicionar Item
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Item</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Valor Unitário (R$)</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Pessoas</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Dias</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            {orcamentoAtual.valoresUnicos.map((item) => {
              const total = item.valor * item.pessoas * item.dias;
              
              // Validar campos numéricos
              const erroValor = validators.valoresUnicos.valor(item.valor);
              const erroPessoas = validators.valoresUnicos.pessoas(item.pessoas);
              const erroDias = validators.valoresUnicos.dias(item.dias);
              
              const temErro = erroValor || erroPessoas || erroDias;
              
              return (
                <tr 
                  key={item.id} 
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    temErro ? 'bg-red-50 hover:bg-red-100' : ''
                  }`}
                >
                  {/* ITEM (texto) */}
                  <td className="px-4 py-2 text-sm">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => handleValorUnicoChange(item.id, 'item', e.target.value)}
                        className={getInputClassName('item', item.item, true)}
                        placeholder="Descrição do item"
                        title="Descrição do item ou serviço"
                      />
                      {temErro && (
                        <span className="ml-2 text-red-500 text-xs flex-shrink-0" title="Verifique os valores deste item">
                          ⚠️
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* VALOR UNITÁRIO */}
                  <td className="px-4 py-2 text-sm">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.valor}
                        onChange={(e) => handleValorUnicoChange(item.id, 'valor', e.target.value)}
                        className={getInputClassName('valor', item.valor)}
                        title={erroValor || "Valor unitário do item"}
                      />
                      {erroValor && (
                        <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                          {erroValor}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* PESSOAS */}
                  <td className="px-4 py-2 text-sm">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.pessoas}
                        onChange={(e) => handleValorUnicoChange(item.id, 'pessoas', e.target.value)}
                        className={getInputClassName('pessoas', item.pessoas)}
                        title={erroPessoas || "Número de pessoas envolvidas"}
                      />
                      {erroPessoas && (
                        <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                          {erroPessoas}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* DIAS */}
                  <td className="px-4 py-2 text-sm">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.dias}
                        onChange={(e) => handleValorUnicoChange(item.id, 'dias', e.target.value)}
                        className={getInputClassName('dias', item.dias)}
                        title={erroDias || "Dias de utilização/duração"}
                      />
                      {erroDias && (
                        <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                          {erroDias}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-2 text-sm font-semibold">R$ {formatarValorBR(total)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan="4" className="px-4 py-2 text-right">Total Valores Únicos:</td>
              <td className="px-4 py-2 text-sm">
                R$ {formatarValorBR(totais?.subtotalValoresUnicos || 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* LEGENDA DE VALIDAÇÃO */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
        <div className="flex items-center mb-1">
          <span className="w-3 h-3 bg-red-300 rounded mr-2"></span>
          Campos em vermelho indicam valores que precisam ser ajustados
        </div>
        <div className="text-blue-600">
          • Valor Unitário: Não pode ser negativo<br/>
          • Pessoas: Quantidade não pode ser negativa<br/>
          • Dias: Quantidade não pode ser negativa
        </div>
      </div>
    </div>
  );
};

export default ValoresUnicos;