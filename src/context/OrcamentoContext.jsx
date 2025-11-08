import React, { createContext, useContext, useMemo, useReducer, useState } from 'react';
import { orcamentoService } from '../firebase/orcamentos';

// ---------------- Estado inicial ----------------
const estadoInicial = {
  metadata: {
    nome: '',
    cliente: '',
    data: '',
    descontoPercentual: 0, // 0..100 (percentual)
  },
  // Percentuais em DECIMAL (0..1). A UI pode mostrar em % (x100) se quiser.
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

// ---------------- Reducer ----------------
function reducer(state, action) {
  switch (action.type) {
    case 'SET_ALL': {
      // Mescla com defaults para garantir que campos existam
      const payload = action.payload || {};
      return {
        ...estadoInicial,
        ...payload,
        metadata: { ...estadoInicial.metadata, ...(payload.metadata || {}) },
        parametros: { ...estadoInicial.parametros, ...(payload.parametros || {}) },
      };
    }
    case 'ATUALIZAR_METADATA': {
      return { ...state, metadata: { ...state.metadata, ...action.payload } };
    }
    case 'ATUALIZAR_PARAMETRO': {
      const { parametro, valor } = action.payload; // valor em decimal 0..1
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
        idx === id ? { ...it, [field]: value } : it
      );
      return { ...state, [secao]: lista };
    }
    default:
      return state;
  }
}

// ---------------- Helpers de cálculo ----------------
const subtotalItem = (i) =>
  Number(i?.valor || 0) * Number(i?.qtd || i?.pessoas || 1) * Number(i?.dias || 1);

const somar = (itens) =>
  Array.isArray(itens) ? itens.reduce((a, i) => a + subtotalItem(i), 0) : 0;

function calcularTotais(orc) {
  const custosOperacionais =
    somar(orc.custosGerais) + somar(orc.logistica) + somar(orc.valoresUnicos);

  const honorarios = somar(orc.coordenacao) + somar(orc.profissionais);

  const base = custosOperacionais + honorarios;

  const impostos          = base * Number(orc.parametros.imposto || 0);
  const lucro             = base * Number(orc.parametros.lucro || 0);
  const fundoGiro         = base * Number(orc.parametros.fundoGiro || 0);
  const encargosPessoal   = base * Number(orc.parametros.encargosPessoal || 0);
  const despesasFiscais   = base * Number(orc.parametros.despesasFiscais || 0);
  const comissaoCaptacao  = base * Number(orc.parametros.comissaoCaptacao || 0);

  const totalIndiretos = impostos + lucro + fundoGiro + encargosPessoal + despesasFiscais + comissaoCaptacao;

  const bdi = 0; // deixe 0 aqui se BDI tiver outra regra de negócio
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

// ---------------- Contexto ----------------
const OrcamentoContext = createContext(null);

export const OrcamentoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, estadoInicial);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const totais = useMemo(() => calcularTotais(state), [state]);

  // ---------- Métodos de persistência (Firestore) ----------
  const listarOrcamentos = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const docs = await orcamentoService.listarOrcamentos();
      return docs; // [{id, ...}]
    } catch (e) {
      setErro(e?.message || 'Erro ao listar orçamentos');
      return [];
    } finally {
      setCarregando(false);
    }
  };

  const carregarOrcamento = async (id) => {
    try {
      setCarregando(true);
      setErro(null);
      const doc = await orcamentoService.carregarOrcamento(id);
      if (doc) dispatch({ type: 'SET_ALL', payload: doc });
      return !!doc;
    } catch (e) {
      setErro(e?.message || 'Erro ao carregar orçamento');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  const excluirOrcamento = async (id) => {
    try {
      setCarregando(true);
      setErro(null);
      await orcamentoService.excluirOrcamento(id);
      return true;
    } catch (e) {
      setErro(e?.message || 'Erro ao excluir orçamento');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  const salvarOrcamento = async (id = null) => {
    try {
      setCarregando(true);
      setErro(null);
      const payload = { ...state };
      if (id) {
        await orcamentoService.atualizarOrcamento(id, payload);
        return id;
      } else {
        const novoId = await orcamentoService.criarOrcamento(payload);
        return novoId;
      }
    } catch (e) {
      setErro(e?.message || 'Erro ao salvar orçamento');
      return null;
    } finally {
      setCarregando(false);
    }
  };

  const value = useMemo(
    () => ({
      orcamentoAtual: state,
      totais,
      dispatch,
      carregando,
      erro,
      // atalhos usados por componentes existentes
      updateMetadata: (patch) => dispatch({ type: 'ATUALIZAR_METADATA', payload: patch }),
      setOrcamentoAtual: (novo) => dispatch({ type: 'SET_ALL', payload: novo }),
      listarOrcamentos,
      carregarOrcamento,
      excluirOrcamento,
      salvarOrcamento,
    }),
    [state, totais, carregando, erro]
  );

  return <OrcamentoContext.Provider value={value}>{children}</OrcamentoContext.Provider>;
};

export const useOrcamento = () => {
  const ctx = useContext(OrcamentoContext);
  if (!ctx) throw new Error('useOrcamento deve ser usado dentro de OrcamentoProvider');
  return ctx;
};
