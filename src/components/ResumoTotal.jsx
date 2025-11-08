import React from 'react';
import { useOrcamento } from '../context/OrcamentoContext';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const ResumoTotal = () => {
  const { orcamentoAtual, updateMetadata, totais } = useOrcamento();
  const desconto = Number(orcamentoAtual?.metadata?.descontoPercentual || 0);

  return (
    <section className="bg-white rounded-xl p-4 shadow mt-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Resumo do Orçamento</h2>
          <p className="text-sm text-gray-500">Visão geral dos valores consolidados</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Desconto (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={desconto}
              onChange={(e) => updateMetadata({ descontoPercentual: e.target.value })}
              className="w-32 border rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="border rounded-lg p-3">
          <div className="text-xs text-gray-500">Custos Operacionais</div>
          <div className="text-lg font-semibold">{currency.format(totais?.custosOperacionais || 0)}</div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-xs text-gray-500">Honorários Técnicos</div>
          <div className="text-lg font-semibold">{currency.format(totais?.honorarios || 0)}</div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-xs text-gray-500">BDI</div>
          <div className="text-lg font-semibold">{currency.format(totais?.bdi || 0)}</div>
        </div>
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="text-xs text-gray-500">Total</div>
          <div className="text-lg font-semibold">{currency.format(totais?.total || 0)}</div>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
        <div className="text-sm text-emerald-800">Total com desconto</div>
        <div className="text-2xl font-bold text-emerald-900">
          {currency.format(totais?.totalComDesconto || 0)}
        </div>
      </div>
    </section>
  );
};

export default ResumoTotal;
