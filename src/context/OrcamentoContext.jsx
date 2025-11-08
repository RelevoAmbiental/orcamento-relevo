import React, { createContext, useContext, useMemo, useReducer, useState } from 'react';
import { orcamentoService } from '../firebase/orcamentos';

// ---------------- Utils ----------------
const ensureArray = (v) => (Array.isArray(v) ? v : []);
const withIds = (arr, prefix) =>
  ensureArray(arr).map((it, idx) => ({
    id: it?.id ?? `${prefix}-${idx + 1}`,
    ...it,
  }));

// Regras de subtotal por seção (compatível com seus componentes reais)
const subtotalCoordenacao = (i) => {
  const dias = Number(i?.dias || 0);
  const quant = Number(i?.quant || 0);
  const subtotal = Number(i?.subtotal || 0); // mensal
  const mes = dias / 30;
  return mes * subtotal * quant;
};

const subtotalProfissionais = (i) =>
  Number(i?.valor || 0) * Number(i?.pessoas || 1) * Number(i?.dias || 1);

const subtotalCustosGerais = (i) =>
  Number(i?.valor || 0) * Number(i?.qtd || 1) * Number(i?.dias || 1);

const subtotalValoresUnicos = (i) => Number(i?.valor || 0) * Number(i?.qtd || 1);

const subtotalLogistica = (i) =>
  Number(i?.valor || 0) * Number(i?.qtd || 1) * Number(i?.dias || 1);

// ---------------- Estado inicial ----------------
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
  custosGerais: [],        // [{ id, item, unidade, valor, qtd, dias }]
  coordenacao: [],         // [{ id, cargo, profissional, subtotal, quant, dias }]
  profissionais: [],       // [{ id, profissional, valor, pessoas, dias }]
  valoresUnicos: [],       // [{ id, item, valor, qtd }]
  logistica: [],           // [{ id, item, valor, qtd, dias }]
};

// ---------------- Normalização ----------------
const normalizeState = (raw) => {
  const payload = raw || {};
  return {
    ...estadoInicial,
    ...payload,
    metadata: { ...estadoInicial.metadata, ...(payload.metadata || {}) },
    parametros: { ...estadoInicial.parametros, ...(payload.parametros || {}) },
    custosGerais: withIds(payload.custosGerais, 'cg'),
    coordenacao: withIds(payload.coordenacao, 'coord'),
    profissionais: withIds(payload.profissionais, 'prof'),
    valoresUnicos: withIds(payload.valoresUnicos, 'vu'),
    logistica: withIds(payload.logistica, 'log'),
  };
};

// ---------------- Reducer ----------------
function reducer(state, action) {
  switch (action.type) {
    case 'SET_ALL': {
      return normalizeState(action.payload);
    }

    case 'ATUALIZAR_METADATA': {
      return { ...state, metadata: { ...state.metadata, ...action.payload } };
    }

    // ---- Parâmetros (payload é objeto de merge em DECIMAL 0..1) ----
    case 'UPDATE_PARAMETROS': {
      return {
        ...state,
        parametros: { ...state.parametros, ...(action.payload || {}) },
      };
    }

    // ---- Coordenacao ----
    case 'UPDATE_COORDENACAO': {
      const { id, updates } = action.payload || {};
      const lista = state.coordenacao.map((it, idx) =>
        it.id === id || idx === id ? { ...it, ...(updates || {}) } : it
      );
      return { ...state, coordenacao: lista };
    }
    case 'ADD_COORDENACAO': {
      const item = action.payload?.item || {};
      const lista = [...state.coordenacao, { id: item.id ?? `coord-${state.coordenacao.length + 1}`, ...item }];
      return { ...state, coordenacao: lista };
    }
    case 'REMOVE_COORDENACAO': {
      const { id } = action.payload || {};
      const lista = state.coordenacao.filter((it, idx) => it.id !== id && idx !== id);
      return { ...state, coordenacao: lista };
    }

    // ---- Profissionais ----
    case 'UPDATE_PROFISSIONAIS': {
      const { id, updates } = action.payload || {};
      const lista = state.profissionais.map((it, idx) =>
        it.id === id || idx === id ? { ...it, ...(updates || {}) } : it
      );
      return { ...state, profissionais: lista };
    }
    case 'ADD_PROFISSIONAIS': {
      const item = action.payload?.item || {};
      const lista = [...state.profissionais, { id: item.id ?? `prof-${state.profissionais.length + 1}`, ...item }];
      return { ...state, profissionais: lista };
    }
    case 'REMOVE_PROFISSIONAIS': {
      const { id } = action.payload || {};
      const lista = state.profissionais.filter((it, idx) => it.id !== id && idx !== id);
      return { ...state, profissionais: lista };
    }

    // ---- Logistica ----
    case 'UPDATE_LOGISTICA': {
      const { id, updates } = action.payload || {};
      const lista = state.logistica.map((it, idx) =>
        it.id === id || idx === id ? { ...it, ...(updates || {}) } : it
      );
      return { ...state, logistica: lista };
    }
    case 'ADD_LOGISTICA': {
      const item = action.payload?.item || {};
      const lista = [...state.logistica, { id: item.id ?? `log-${state.logistica.length + 1}`, ...item }];
      return { ...state, logistica: lista };
    }
    case 'REMOVE_LOGISTICA': {
      const { id } = action.payload || {};
      const lista = state.logistica.filter((it, idx) => it.id !== id && idx !== id);
      return { ...state, logistica: lista };
    }

    // ---- Valores Únicos ----
    case 'UPDATE_VALORES_UNICOS': {
      const { id, updates } = action.payload || {};
      const lista = state.valoresUnicos.map((it, idx) =>
        it.id === id || idx === id ? { ...it, ...(updates || {}) } : it
      );
      return { ...state, valoresUnicos: lista };
    }
    case 'ADD_VALORES_UNICOS': {
      const item = action.payload?.item || {};
      const lista = [...state.valoresUnicos, { id: item.id ?? `vu-${state.valoresUnicos.length + 1}`, ...item }];
      return { ...state, valoresUnicos: lista };
    }
    case 'REMOVE_VALORES_UNICOS': {
      const { id } = action.payload || {};
      const lista = state.valoresUnicos.filter((it, idx) => it.id !== id && idx !== id);
      return { ...state, valoresUnicos: lista };
    }

    // ---- Custos Gerais ----
    case 'UPDATE_CUSTOS_GERAIS': {
      const { id, updates } = action.payload || {};
      const lista = state.custosGerais.map((it, idx) =>
        it.id === id || idx === id ? { ...it, ...(updates || {}) } : it
      );
      return { ...state, custosGerais: lista };
    }
    case 'ADD_CUSTOS_GERAIS': {
      const item = action.payload?.item || {};
      const lista = [...state.custosGerais, { id: item.id ?? `cg-${state.custosGerais.length + 1}`, ...item }];
      return { ...state, custosGerais: lista };
    }
    case 'REMOVE_CUSTOS_GERAIS': {
      const { id } = action.payload || {};
      const lista = state.custosGerais.filter((it, idx) => it.id !== id && idx !== id);
      return { ...state, custosGerais: lista };
    }

    default:
      return state;
  }
}

// ---------------- Cálculos ----------------
function calcularTotais(orc) {
  // Subtotais por seção (regras específicas)
  const stCoordenacao = ensureArray(orc.coordenacao).reduce((acc, i) => acc + subtotalCoordenacao(i), 0);
  const stProfissionais = ensureArray(orc.profissionais).reduce((acc, i) => acc + subtotalProfissionais(i), 0);
  const stCustosGerais = ensureArray(orc.custosGerais).reduce((acc, i) => acc + subtotalCustosGerais(i), 0);
  const stValoresUnicos = ensureArray(orc.valoresUnicos).reduce((acc, i) => acc + subtotalValoresUnicos(i), 0);
  const stLogistica = ensureArray(orc.logistica).reduce((acc, i) => acc + subtotalLogistica(i), 0);

  const custosOperacionais = stCustosGerais + stLogistica + stValoresUnicos;
  const honorarios = stCoordenacao + stProfissionais;

  const base = custosOperacionais + honorarios;

  // Indiretos (% sobre base)
  const impostos          = base * Number(orc.parametros.imposto || 0);
  const lucro             = base * Number(orc.parametros.lucro || 0);
  const fundoGiro         = base * Number(orc.parametros.fundoGiro || 0);
  const encargosPessoal   = base * Number(orc.parametros.encargosPessoal || 0);
  const despesasFiscais   = base * Number(orc.parametros.despesasFiscais || 0);
  const comissaoCaptacao  = base * Number(orc.parametros.comissaoCaptacao || 0);

  const totalIndiretos = impostos + lucro + fundoGiro + encargosPessoal + despesasFiscais + comissaoCaptacao;

  const bdi = 0; // ajuste aqui se houver outra regra
  const total = base + totalIndiretos + bdi;

  const descontoPercentual = Number(orc.metadata.descontoPercentual || 0) / 100;
  const totalComDesconto = total * (1 - (descontoPercentual > 0 ? descontoPercentual : 0));

  return {
    // subtotais por seção (úteis para rodapés de tabelas)
    subtotalCoordenacao: stCoordenacao,
    subtotalProfissionais: stProfissionais,
    subtotalCustosGerais: stCustosGerais,
    subtotalValoresUnicos: stValoresUnicos,
    subtotalLogistica: stLogistica,

    // grupos principais
    custosOperacionais,
    honorarios,
    base,

    // indiretos detalhados
    impostos,
    lucro,
    fundoGiro,
    encargosPessoal,
    despesasFiscais,
    comissaoCaptacao,
    totalIndiretos,

    // totais
    bdi,
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

  // ---------- Firestore ----------
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

      // firestore
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
