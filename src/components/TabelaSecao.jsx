// src/components/TabelaSecao.jsx
import React from 'react';
import { useOrcamento } from '../context/OrcamentoContext';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const TabelaSecao = ({ titulo, secaoKey, columns, novoItemTemplate }) => {
  const { orcamentoAtual, dispatch } = useOrcamento();
  const itens = orcamentoAtual?.[secaoKey] || [];

  const handleChange = (idx, field, value) => {
    const col = columns.find(c => c.field === field);
    let val = value;
    if (col?.type === 'number') {
      val = value === '' ? '' : Number(value);
      if (isNaN(val)) val = 0;
    }
    dispatch({
      type: 'ATUALIZAR_ITEM',
      payload: { secao: secaoKey, id: idx, field, value: val }
    });
  };

  const adicionarItem = () => {
    dispatch({
      type: 'ADICIONAR_ITEM',
      payload: { secao: secaoKey, item: { ...novoItemTemplate } }
    });
  };

  const removerItem = (idx) => {
    dispatch({ type: 'REMOVER_ITEM', payload: { secao: secaoKey, id: idx } });
  };

  const subtotal = (row) => {
    const v = Number(row.valor || 0);
    const mult1 = Number(row.qtd ?? row.pessoas ?? 1) || 1;
    const mult2 = Number(row.dias || 1) || 1;
    return v * mult1 * mult2;
  };

  return (
    <section className="bg-white rounded-xl p-4 shadow">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">{titulo}</h2>
        <button
          onClick={adicionarItem}
          className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
        >
          + Adicionar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col.field} className="text-left p-2 text-sm font-medium text-gray-600 border-b">{col.label}</th>
              ))}
              <th className="text-right p-2 text-sm font-medium text-gray-600 border-b">Subtotal</th>
              <th className="p-2 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="p-4 text-center text-gray-500 text-sm">
                  Nenhum item cadastrado.
                </td>
              </tr>
            )}
            {itens.map((row, idx) => (
              <tr key={idx} className="odd:bg-white even:bg-gray-50">
                {columns.map(col => (
                  <td key={col.field} className="p-2 border-b">
                    {col.type === 'number' ? (
                      <input
                        type="number"
                        step="0.01"
                        value={row[col.field] ?? ''}
                        onChange={(e) => handleChange(idx, col.field, e.target.value)}
                        className="w-full border rounded px-2 py-1 text-right"
                      />
                    ) : (
                      <input
                        type="text"
                        value={row[col.field] ?? ''}
                        onChange={(e) => handleChange(idx, col.field, e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    )}
                  </td>
                ))}
                <td className="p-2 border-b text-right font-medium">
                  {currency.format(subtotal(row))}
                </td>
                <td className="p-2 border-b text-right">
                  <button
                    onClick={() => removerItem(idx)}
                    className="px-2 py-1 text-sm rounded bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TabelaSecao;
