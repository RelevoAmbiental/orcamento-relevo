import React from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import { formatarValorBR } from '../utils/formatters';
import { validators } from '../utils/validators';

const Logistica = () => {
  const { orcamentoAtual, dispatch, totais } = useOrcamento();

  const handleLogisticaChange = (id, field, value) => {
    dispatch({
      type: 'UPDATE_LOGISTICA',
      payload: {
        id,
        updates: { 
          [field]: field === 'item' || field === 'unidade' ? value : parseFloat(value) || 0 
        }
      }
    });
  };

  const adicionarNovoItem = () => {
    const novoId = Math.max(...orcamentoAtual.logistica.map(item => item.id)) + 1;
    dispatch({
      type: 'UPDATE_LOGISTICA',
      payload: {
        id: novoId,
        updates: {
          item: 'Novo Item',
          valor: 0,
          unidade: 'unidade',
          qtd: 1,
          dias: 1
        }
      }
    });
  };

  const getInputClassName = (field, value) => {
    const erro = validators.logistica[field]?.(value);
    const baseClass = "w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 font-sans";
    
    return erro 
      ? `${baseClass} border-red-300 focus:ring-red-500 bg-red-50` 
      : `${baseClass} border-relevo-border focus:ring-relevo-green-light`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-relevo-text font-heading">Logística</h2>
        <button
          onClick={adicionarNovoItem}
          className="bg-relevo-green hover:bg-relevo-green-light text-white font-bold py-2 px-4 rounded text-sm font-sans"
        >
          + Adicionar Item
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#E8F5E9]">
              <th className="px-4 py-2 text-left text-sm font-medium text-[#2E3E31] font-sans">Item</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-[#2E3E31] font-sans">Valor (R$)</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-[#2E3E31] font-sans">Unidade</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-[#2E3E31] font-sans">Quantidade</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-[#2E3E31] font-sans">Dias</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-[#2E3E31] font-sans">Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            {orcamentoAtual.logistica.map((item) => {
              const total = item.valor * item.qtd * item.dias;
              
              return (
                <tr key={item.id} className="border-b border-relevo-border hover:bg-relevo-light-gray">
                  <td className="px-4 py-2 text-sm">
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => handleLogisticaChange(item.id, 'item', e.target.value)}
                      className="w-full px-2 py-1 border border-relevo-border rounded text-sm font-sans"
                      placeholder="Descrição do item"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <input
                      type="number"
                      value={item.valor}
                      onChange={(e) => handleLogisticaChange(item.id, 'valor', e.target.value)}
                      className={getInputClassName('valor', item.valor)}
                    />
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <select
                      value={item.unidade}
                      onChange={(e) => handleLogisticaChange(item.id, 'unidade', e.target.value)}
                      className="w-full px-2 py-1 border border-relevo-border rounded text-sm font-sans"
                    >
                      <option value="dia/pessoa">dia/pessoa</option>
                      <option value="dia/veículo">dia/veículo</option>
                      <option value="pessoa">pessoa</option>
                      <option value="veículo">veículo</option>
                      <option value="dia">dia</option>
                      <option value="mês/veículo">mês/veículo</option>
                      <option value="lote">lote</option>
                      <option value="unidade">unidade</option>
                      <option value="km">km</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <input
                      type="number"
                      value={item.qtd}
                      onChange={(e) => handleLogisticaChange(item.id, 'qtd', e.target.value)}
                      className={getInputClassName('qtd', item.qtd)}
                    />
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <input
                      type="number"
                      value={item.dias}
                      onChange={(e) => handleLogisticaChange(item.id, 'dias', e.target.value)}
                      className={getInputClassName('dias', item.dias)}
                    />
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold">R$ {formatarValorBR(total)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#2EAD60] font-semibold font-sans">
              <td colSpan="5" className="px-4 py-2 text-right text-white">Total Logística:</td>
              <td className="px-4 py-2 text-sm text-white">
                R$ {formatarValorBR(totais.subtotalLogistica)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Logistica;
