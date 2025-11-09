// src/context/OrcamentoContext.jsx
import React, { createContext, useContext, useMemo, useReducer, useState } from 'react';
import { orcamentoService } from '../firebase/orcamentos';

// ---------- Utils seguras ----------
const arr = (v) => (Array.isArray(v) ? v : []);
const withId = (item, idx, prefix) => ({
  id: item?.id ?? `${prefix}-${idx + 1}`,
  ...item,
});

// Normalizadores por seção (toleram esquemas antigos e valores faltantes)
const normalizeCoordenacao = (lista) =>
  arr(lista)
    .filter(Boolean)
    .map((it, idx) => ({
      id: it.id ?? `coord-${idx + 1}`,
      cargo: it.cargo ?? '',                          // só leitura na UI
      profissional: it.profissional ?? '',            // texto editável (nível)
      subtotal: Number(it.subtotal ?? it.valor ?? 0), // mensal
      quant: Number(it.quant ?? it.qtd ?? 0),
      dias: Number(it.dias ?? 0),
    }));

const normalizeProfissionais = (lista) =>
  arr(lista)
    .filter(Boolean)
    .map((it, idx) => ({
      id: it.id ?? `prof-${idx + 1}`,
      cargo: it.cargo ?? '',
      prolabore: Number(it.prolabore ?? it.valor ?? 0), // canônico: prolabore
      pessoas: Number(it.pessoas ?? it.qtd ?? 0),
      dias: Number(it.dias ?? 0),
    }));

const normalizeValoresUnicos = (lista) =>
  arr(lista)
    .filter(Boolean)
    .map((it, idx) => ({
      id: it.id ?? `vu-${idx + 1}`,
      item: it.item ?? '',
      valor: Number(it.valor ?? 0),
      pessoas: Number(it.pessoas ?? 1),
      dias: Number(it.dias ?? 1),
    }));

const normalizeLogistica = (lista) =>
  arr(lista)
    .filter(Boolean)
    .map((it, idx) => ({
      id: it.id ?? `log-${idx + 1}`,
      item: it.item ?? '',
      valor: Number(it.valor ?? 0),
      unidade: it.unidade ?? 'unidade',
      qtd: Number(it.qtd ?? it.pessoas ?? 1),
      dias: Number(it.dias ?? 1),
    }));

// ---------- Estado inicial canônico ----------
const estadoInicial = {
  metadata: {
    nome: '',
    cliente: '',
    data: '',
    descontoPercentual: 0, // 0..100
  },
  // Percentuais em decimal (0..1)
  parametros: {
    imposto: 0,
    lucro: 0,
    fundoGiro: 0,
    encargosPessoal: 0,
    despesasFiscais: 0,
    comissaoCaptacao: 0,
  },
  coordenacao: [],
  profissionais: [],
  valoresUnicos: [],
  logistica: [],
};

// ---------- Normalização do estado completo ----------
const normalizeState = (raw) => {
  const p = raw || {};
  return {
    ...estadoInicial,
    ...p,
    metadata: { ...estadoInicial.metadata, ...(p.metadata || {}) },
    parametros: { ...estadoInicial.parametros, ...(p.parametros || {}) },

    // Seções saneadas + compatíveis com componentes atuais
    coordenacao: normalizeCoordenacao(p.coordenacao),
    profissionais: normalizeProfissionais(p.profissionais),
    valoresUnicos: normalizeValoresUnicos(p.valoresUnicos),
    logistica: normalizeLogistica(p.logistica),
  };
};

// ---------- Reducer ----------
function reducer(state, action) {
  switch (action.type) {
    case 'SET_ALL': {
      return normalizeState(action.payload);
    }

    case 'ATUALIZAR_METADATA': {
      return { ...state, metadata: { ...state.metadata, ...action.payload } };
    }

    case 'UPDATE_PARAMETROS': {
      return { ...state, parametros: { ...state.parametros, ...(action.payload || {}) } };
    }

    // Coordenacao
    case 'UPDATE_COORDENACAO': {
      const { id, updates } = action.payload || {};
      const lista = state.coordenacao.map((it, idx) =>
        it.id === id || idx === id ? { ...it, ...(updates || {}) } : it
      );
      return { ...state, coordenacao: normalizeCoordenacao(lista) };
    }
    case 'ADD_COORDENACAO': {
      const item = normalizeCoordenacao([action.payload?.item || {}])[0];
      const lista = [...state.coordenacao, withId(item, state.coordenacao.length, 'coord')];
      return { ...state, coordenacao: lista };
    }
    case 'REMOVE_COORDENACAO': {
      const { id } = action.payload || {};
      const lista = state.coordenacao.filter((it, idx) => it.id !== id && idx !== id);
      return { ...state, coordenacao: lista };
    }

    // Profissionais
    case 'UPDATE_PROFISSIONAIS': {
      const { id, updates } = action.payload || {};
      const lista = state.profissionais.map((it, idx) =>
        it.id === id || idx === id ? { ...it, ...(updates || {}) } : it
      );
      return { ...state, profissionais: normalizeProfissionais(lista) };
    }
    case 'ADD_PROFISSIONAIS': {
      const item = normalizeProfissionais([action.payload?.item || {}])[0];
      const lista = [...state.profissionais, withId(item, state.profissionais.length, 'prof')];
      return { ...state, profissionais: lista };
    }
    case 'REMOVE_PROFISSIONAIS': {
      const { id } = action.payload || {};
      const lista = state.profissionais.filter((it, idx) => it.id !== id && idx !== id);
      return { ...state, profissionais: lista };
    }

    // Logística
    case 'UPDATE_LOGISTICA': {
      const { id, updates } = action.payload || {};
      const lista = state.logistica.map((it, idx) =>
        it.id === id || idx === id ? { ...it, ...(updates || {}) } : it
      );
      return { ...state, logistica: normalizeLogistica(lista) };
    }
    case 'ADD_LOGISTICA': {
      const item = normalizeLogistica([action.payload?.item || {}])[0];
      const lista = [...state.logistica, withId(item, state.logistica.length, 'log')];
      return { ...state, logistica: lista };
    }
    case 'REMOVE_LOGISTICA': {
      const { id } = action.payload || {};
      const lista = state.logistica.filter((it, idx) => it.id !== id && idx !== id);
      return { ...state, logistica: lista };
    }

    // Valores únicos
    case 'UPDATE_VALORES_UNICOS': {
      const { id, updates } = action.payload || {};
      const lista = state.valoresUnicos.map((it, idx) =>
        it.id === id || idx === id ? { ...it, ...(updates || {}) } : it
      );
      return { ...state, valoresUnicos: normalizeValoresUnicos(lista) };
    }
    case 'ADD_VALORES_UNICOS': {
      const item = normalizeValoresUnicos([action.payload?.item || {}])[0];
      const lista = [...state.valoresUnicos, withId(item, state.valoresUnicos.length, 'vu')];
      return { ...state, valoresUnicos: lista };
    }
    case 'REMOVE_VALORES_UNICOS': {
      const { id } = action.payload || {};
      const lista = state.valoresUnicos.filter((it, idx) => it.id !== id && idx !== id);
      return { ...state, valoresUnicos: lista };
    }

    default:
      return state;
  }
}

// ---------- Cálculos canônicos ----------
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

function calcularTotais(orc) {
  const c = normalizeCoordenacao(orc.coordenacao);
  const p = normalizeProfissionais(orc.profissionais);
  const vu = normalizeValoresUnicos(orc.valoresUnicos);
  const lg = normalizeLogistica(orc.logistica);

  const stCoordenacao = sum(
    c.map((i) => (Number(i.dias || 0) / 30) * Number(i.subtotal || 0) * Number(i.quant || 0))
  );
  const stProfissionais = sum(
    p.map((i) => (Number(i.dias || 0) / 30) * Number(i.prolabore || 0) * Number(i.pessoas || 0))
  );
  const stValoresUnicos = sum(vu.map((i) => Number(i.valor || 0) * Number(i.pessoas || 1) * Number(i.dias || 1)));
  const stLogistica = sum(lg.map((i) => Number(i.valor || 0) * Number(i.qtd || 1) * Number(i.dias || 1)));

  const custosOperacionais = stValoresUnicos + stLogistica;
  const honorarios = stCoordenacao + stProfissionais;
  const base = custosOperacionais + honorarios;

  const impostos         = base * Number(orc.parametros.imposto || 0);
  const lucro            = base * Number(orc.parametros.lucro || 0);
  const fundoGiro        = base * Number(orc.parametros.fundoGiro || 0);
  const encargosPessoal  = base * Number(orc.parametros.encargosPessoal || 0);
  const despesasFiscais  = base * Number(orc.parametros.despesasFiscais || 0);
  const comissaoCaptacao = base * Number(orc.parametros.comissaoCaptacao || 0);

  const totalIndiretos = impostos + lucro + fundoGiro + encargosPessoal + despesasFiscais + comissaoCaptacao;

  const bdi = 0; // se houver regra específica, ajustar aqui
  const total = base + totalIndiretos + bdi;

  const descontoPct = Number(orc.metadata.descontoPercentual || 0) / 100;
  const totalComDesconto = total * (1 - (descontoPct > 0 ? descontoPct : 0));

  return {
    subtotalCoordenacao: stCoordenacao,
    subtotalProfissionais: stProfissionais,
    subtotalValoresUnicos: stValoresUnicos,
    subtotalLogistica: stLogistica,
    custosOperacionais,
    honorarios,
    base,
    impostos,
    lucro,
    fundoGiro,
    encargosPessoal,
    despesasFiscais,
    comissaoCaptacao,
    totalIndiretos,
    bdi,
    total,
    totalComDesconto,
  };
}

// ---------- Contexto ----------
const OrcamentoContext = createContext(null);

export const OrcamentoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, estadoInicial);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const totais = useMemo(() => calcularTotais(state), [state]);

  // --- Firestore ---
  const listarOrcamentos = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const docs = await orcamentoService.listarOrcamentos();
      return docs;
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
      const payload = normalizeState(state); // garante shape salvo limpo
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
