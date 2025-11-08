import React, { createContext, useContext, useMemo, useReducer } from 'react';

// ---------- Estado inicial ----------
const estadoInicial = {
  metadata: {
    nome: '',
    cliente: '',
    data: '',
    descontoPercentual: 0, // 0..100 (percentual)
  },
  // Percentuais em DECIMAL (0..1) — a UI exibe em %
  parametros: {
    imposto: 0.0,
    lucro: 0.0,
    fundoGiro: 0.0,
    encargosPessoal: 0.0,
    despesasFiscais: 0.0,
    comissaoCaptacao: 0.0,
  },
  custosGerais: [],   // [{ item, unidade, valor, qtd, dias }]
  coordenacao: [],    // [{ profissional, valor, dias }]
  profissionais: [],  // [{ profissional, valor, dias, pessoas }]
  valoresUnicos: [],  // [{ item, valor, qtd }]
  logistica: [],      // [{ item, valor, qtd, dias }]
};

// ---------- Reducer ----------
function reducer(state, action) {
  switch (action.type) {
    case 'ATUALIZAR_METADATA': {
      return { ...state, metadata: { ...state.metadata, ...action.payload } };
    }
    case 'ATUALIZAR_PARAMETRO': {
      const { parametro, valor } = action.payload; // valor em DECIMAL (0..1)
      return { ...state, parametros: { ...state.parametros, [parametro]: Number(valor) || 0 } };
    }
    case 'ADICIONAR_ITEM': {
      const { secao, item } = action.payload; // secao: 'custosGerais'|'coordenacao'|'profissionais'|'valoresUnicos'|'logistica'
      const lista = [...(state[secao] || [])];
      lista.push(item);
      return { ...state, [secao]: lista };
    }
    case 'REMOVER_ITEM': {
      const { secao, id } = action.payload;
      const lista = (state[secao] || []).filter((_, idx) => idx !== id);
      return { ...state, [secao]: lista };
    }
    case 'ATUALIZAR_ITEM': {
      const { secao, id, field, value } = action.payload;
      const lista = (state[secao] || []).map((it, idx) =>
        idx === id ? { ...it, [field]: typeof value === 'number' ? value : value } : it
      );
      return { ...state, [secao]: lista };
    }
    default:
      return state;
  }
}

// ---------- Helpers de cálculo ----------
const subtotalItem = (i) =>
  Number(i?.valor || 0) * Number(i?.qtd || i?.pessoas || 1) * Number(i?.dias || 1);

const somar = (itens) => (Array.isArray(itens) ? itens.reduce((a, i) => a + subtotalItem(i), 0) : 0);

// Computa totais diretos + indiretos (com base nas expectativas da UI)
function calcularTotais(orc) {
  const custosOperacionais =
    somar(orc.custosGerais) + somar(orc.logistica) + somar(orc.valoresUnicos);

  const honorarios = somar(orc.coordenacao) + somar(orc.profissionais);

  // Base para incidência dos percentuais (ajuste se sua regra for outra)
  const base = custosOperacionais + honorarios;

  const impostos          = base * Number(orc.parametros.imposto || 0);
  const lucro             = base * Number(orc.parametros.lucro || 0);
  const fundoGiro         = base * Number(orc.parametros.fundoGiro || 0);
  const encargosPessoal   = base * Number(orc.parametros.encargosPessoal || 0);
  const despesasFiscais   = base * Number(orc.parametros.despesasFiscais || 0);
  const comissaoCaptacao  = base * Number(orc.parametros.comissaoCaptacao || 0);

  const totalIndiretos = impostos + lucro + fundoGiro + encargosPessoal + despesasFiscais + comissaoCaptacao;

  const bdi = 0; // mantenha separadamente se tiver outra regra
  const total = base + totalIndiretos + bdi;

  const descontoPercentual = Number(orc.metadata.descontoPercentual || 0) / 100;
  const totalComDesconto = total * (1 - (descontoPercentual > 0 ? descontoPercentual : 0));

  return {
    custosOperacionais,
    honorarios,
    bdi,
    base,
    impostos,
    lucro,
    fundoGiro,
    encargosPessoal,
    despesasFiscais,
    comissaoCaptacao,
    totalIndiretos,
    total,
    totalComDesconto,
  };
}

// ---------- Contexto ----------
const OrcamentoContext = createContext(null);

export const OrcamentoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, estadoInicial);
  const totais = useMemo(() => calcularTotais(state), [state]);

  const value = useMemo(
    () => ({
      orcamentoAtual: state,
      dispatch,
      totais,
      // atalhos úteis já existentes em telas anteriores:
      setOrcamentoAtual: (novo) => dispatch({ type: 'SET_ALL', payload: novo }), // se precisar
      updateMetadata: (patch) => dispatch({ type: 'ATUALIZAR_METADATA', payload: patch }),
    }),
    [state, totais]
  );

  return <OrcamentoContext.Provider value={value}>{children}</OrcamentoContext.Provider>;
};

export const useOrcamento = () => {
  const ctx = useContext(OrcamentoContext);
  if (!ctx) throw new Error('useOrcamento deve ser usado dentro de OrcamentoProvider');
  return ctx;
};
