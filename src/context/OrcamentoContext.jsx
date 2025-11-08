import React, { createContext, useContext, useMemo, useState } from 'react';

const OrcamentoContext = createContext(null);

export const OrcamentoProvider = ({ children }) => {
  const [orcamentoAtual, setOrcamentoAtual] = useState({
    metadata: {
      nome: '',
      cliente: '',
      data: '',
      descontoPercentual: 0,
    },
    custosGerais: [],
    coordenacao: [],
    profissionais: [],
    valoresUnicos: [],
    logistica: [],
  });

  const calcularTotais = (orc) => {
    const valorSecao = (itens) => {
      if (!Array.isArray(itens)) return 0;
      return itens.reduce((acc, i) => {
        const valor = Number(i.valor || 0);
        const mult1 = Number(i.qtd || i.pessoas || 1);
        const mult2 = Number(i.dias || 1);
        return acc + valor * mult1 * mult2;
      }, 0);
    };

    const custosOperacionais = valorSecao(orc.custosGerais) + valorSecao(orc.logistica) + valorSecao(orc.valoresUnicos);
    const honorarios = valorSecao(orc.coordenacao) + valorSecao(orc.profissionais);
    const bdi = 0;
    const total = custosOperacionais + honorarios + bdi;

    const descontoPercentual = Number(orc.metadata?.descontoPercentual || 0);
    const totalComDesconto = total * (1 - (descontoPercentual / 100));

    return { custosOperacionais, honorarios, bdi, total, totalComDesconto };
  };

  const totais = useMemo(() => calcularTotais(orcamentoAtual), [orcamentoAtual]);

  const updateMetadata = (patch) => {
    setOrcamentoAtual(prev => ({
      ...prev,
      metadata: { ...prev.metadata, ...patch }
    }));
  };

  return (
    <OrcamentoContext.Provider value={{ orcamentoAtual, setOrcamentoAtual, updateMetadata, totais }}>
      {children}
    </OrcamentoContext.Provider>
  );
};

export const useOrcamento = () => {
  const ctx = useContext(OrcamentoContext);
  if (!ctx) throw new Error('useOrcamento deve ser usado dentro de OrcamentoProvider');
  return ctx;
};
