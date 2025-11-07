import React from 'react';
import { useOrcamento } from '../context/OrcamentoContext';
import { formatarValorBR } from '../utils/formatters';

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Logística</h2>
        <button
          onClick={adicionarNovoItem}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
        >
          + Adicionar Item
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Item</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Valor (R$)</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Unidade</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantidade</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Dias</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            {orcamentoAtual.logistica.map((item) => {
              const total = item.valor * item.qtd * item.dias;
              
              return (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => handleLogisticaChange(item.id, 'item', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Descrição do item"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <input
                      type="number"
                      value={item.valor}
                      onChange={(e) => handleLogisticaChange(item.id, 'valor', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <select
                      value={item.unidade}
                      onChange={(e) => handleLogisticaChange(item.id, 'unidade', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
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
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <input
                      type="number"
                      value={item.dias}
                      onChange={(e) => handleLogisticaChange(item.id, 'dias', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold">R$ {formatarValorBR(total)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan="5" className="px-4 py-2 text-right">Total Logística:</td>
              <td className="px-4 py-2 text-sm">
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