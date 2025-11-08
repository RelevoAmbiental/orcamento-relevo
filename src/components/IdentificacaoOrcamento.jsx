import React from 'react';
import { useOrcamento } from '../context/OrcamentoContext';

const IdentificacaoOrcamento = () => {
  const { orcamentoAtual, updateMetadata } = useOrcamento();
  const m = orcamentoAtual?.metadata || {};

  return (
    <section className="bg-white rounded-xl p-4 shadow mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Identificação do Orçamento</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Nome do orçamento</label>
          <input
            type="text"
            value={m.nome || ''}
            onChange={(e) => updateMetadata({ nome: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ex.: PBA Espeleológico - Lote 03"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Cliente</label>
          <input
            type="text"
            value={m.cliente || ''}
            onChange={(e) => updateMetadata({ cliente: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ex.: Companhia X"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Data</label>
          <input
            type="date"
            value={m.data || ''}
            onChange={(e) => updateMetadata({ data: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </section>
  );
};

export default IdentificacaoOrcamento;
