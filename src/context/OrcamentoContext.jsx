// src/context/OrcamentoContext.jsx
import React, { createContext, useContext, useMemo, useReducer, useState } from 'react';
import { orcamentoService } from '../firebase/orcamentos';

// ---------------- Utils ----------------
const ensureArray = (v) => (Array.isArray(v) ? v : []);
const withIds = (arr, prefix) =>
  ensureArray(arr).map((it, idx) => ({
    id: it?.id ?? `${prefix}-${idx + 1}`,
    ...it,
  }));

// Subtotais por seção (mantidos compatíveis)
const subtotalCoordenacao = (i) => {
  const dias = Number(i?.dias || 0);
  const quant = Number(i?.quant || 0);
  const subtotal = Number(i?.subtotal || 0); // mensal
  const mes = dias / 30;
  return mes * subtotal * quant;
};

const subtotalProfissionais = (i) =>
  Number(i?.prolabore || i?.valor || 0) *
  Number(i?.pessoas || 1) *
  (Number(i?.dias || 1) / 30);

const subtotalCustosGerais = (i) =>
  Number(i?.valor || 0) * Number(i?.qtd || 1) * Number(i?.dias || 1);

const subtotalValoresUnicos = (i) =>
  Number(i?.valor || 0) * Number(i?.pessoas || i?.qtd || 1) * Number(i?.dias || 1);

const subtotalLogistica = (i) =>
  Number(i?.valor || 0) * Number(i?.qtd || 1) * Number(i?.dias || 1);

// ---------------- Estado inicial ----------------
const estadoInicial = {
  metadata: {
    nome: 'Novo Orçamento',
    cliente: '',
    data: new Date().toISOString().split('T')[0],
    descontoPercentual: 0,
  },
  parametros: {
    imposto: 0.07,
    lucro: 0.05,
    fundoGiro: 0.05,
    encargosPessoal: 0.10,
    despesasFiscais: 0.03,
    comissaoCaptacao: 0.03,
  },
  coordenacao: [
    { id: 1, cargo: 'Coordenador Geral', profissional: 'Sênior', subtotal: 5000, quant: 1, dias: 30 },
    { id: 2, cargo: 'Coordenador Técnico', profissional: 'Sênior', subtotal: 5000, quant: 1, dias: 30 },
    { id: 3, cargo: 'Coordenador de Campo', profissional: 'Pleno', subtotal: 2000, quant: 0, dias: 30 }
  ],
  profissionais: [
    { id: 1, cargo: 'Geólogo I', prolabore: 10000, pessoas: 0, dias: 0 },
    { id: 2, cargo: 'Geólogo II', prolabore: 9000, pessoas: 0, dias: 0 },
    { id: 3, cargo: 'Geofísico', prolabore: 11000, pessoas: 0, dias: 0 },
    { id: 4, cargo: 'Biólogo-Invertebrado', prolabore: 9000, pessoas: 0, dias: 0 },
    { id: 5, cargo: 'Biólogo-Vertebrado', prolabore: 9000, pessoas: 0, dias: 0 },
    { id: 6, cargo: 'Biólogo-Geral', prolabore: 9500, pessoas: 0, dias: 0 },
    { id: 7, cargo: 'Arqueólogo', prolabore: 9500, pessoas: 0, dias: 0 },
    { id: 8, cargo: 'Sociólogo', prolabore: 9500, pessoas: 0, dias: 0 },
    { id: 9, cargo: 'Paleontólogo', prolabore: 9500, pessoas: 0, dias: 0 },
    { id: 10, cargo: 'Engenheiro Florestal', prolabore: 9000, pessoas: 0, dias: 0 },
    { id: 11, cargo: 'Geoprocessamento', prolabore: 9000, pessoas: 0, dias: 0 },
    { id: 12, cargo: 'Auxiliar de Campo', prolabore: 9000, pessoas: 0, dias: 0 },
    { id: 13, cargo: 'Administrador', prolabore: 7000, pessoas: 0, dias: 0 },
    { id: 14, cargo: 'Croquista/Topógrafo', prolabore: 9000, pessoas: 0, dias: 0 },
    { id: 15, cargo: 'Outro Profissional', prolabore: 0, pessoas: 0, dias: 0 }
  ],
  valoresUnicos: [
    { id: 1, item: 'ARTs/RRTs', valor: 300, pessoas: 1, dias: 1 },
    { id: 2, item: 'Relatórios Técnicos', valor: 8000, pessoas: 1, dias: 1 },
    { id: 3, item: 'Digitalização/Documentação', valor: 50, pessoas: 0, dias: 1 },
    { id: 4, item: 'Amostras/Análises Laboratoriais', valor: 500, pessoas: 0, dias: 1 },
    { id: 5, item: 'Outro Valor Único', valor: 0, pessoas: 1, dias: 1 }
  ],
  logistica: [
    { id: 1, item: 'Alimentação', valor: 100, unidade: 'dia/pessoa', qtd: 0, dias: 1 },
    { id: 2, item: 'Hospedagem', valor: 170, unidade: 'dia/pessoa', qtd: 0, dias: 1 },
    { id: 3, item: 'Lavanderia', valor: 150, unidade: 'dia/pessoa', qtd: 0, dias: 1 },
    { id: 4, item: 'Exame Médico', valor: 50, unidade: 'pessoa', qtd: 0, dias: 1 },
    { id: 5, item: 'Seguro de Vida', valor: 50, unidade: 'pessoa', qtd: 1, dias: 1 },
    { id: 6, item: 'Combustível', valor: 8, unidade: 'dia/veículo', qtd: 1, dias: 1 },
    { id: 7, item: 'Manutenção Veículo', valor: 100, unidade: 'mês/veículo', qtd: 1, dias: 1 },
    { id: 8, item: 'Veículo', valor: 500, unidade: 'dia', qtd: 1, dias: 1 },
    { id: 9, item: 'Pedágios', valor: 50, unidade: 'dia/veículo', qtd: 0, dias: 1 },
    { id: 10, item: 'Passagens Aéreas', valor: 1000, unidade: 'pessoa', qtd: 0, dias: 1 },
    { id: 11, item: 'Passagens Terrestres', valor: 250, unidade: 'pessoa', qtd: 0, dias: 1 },
    { id: 12, item: 'EPI', valor: 500, unidade: 'pessoa', qtd: 1, dias: 1 },
    { id: 13, item: 'Aluguel de Drone', valor: 300, unidade: 'dia', qtd: 1, dias: 1 },
    { id: 14, item: 'Material de Escritório', valor: 1000, unidade: 'lote', qtd: 1, dias: 1 },
    { id: 15, item: 'Material de Expediente', valor: 800, unidade: 'lote', qtd: 1, dias: 1 },
    { id: 16, item: 'Outro Item Logística', valor: 0, unidade: 'unidade', qtd: 1, dias: 1 }
  ],
  custosGerais: [],
};

// ---------------- Normalização ----------------
const normalizeState = (raw) => {
  const payload = raw || {};
  return {
    ...estadoInicial,
    ...payload,
    metadata: { ...estadoInicial.metadata, ...(payload.metadata || {}) },
    parametros: { ...estadoInicial.parametros, ...(payload.parametros || {}) },
    custosGerais: withIds(payload.custosGerais ?? estadoInicial.custosGerais, 'cg'),
    coordenacao: withIds(payload.coordenacao ?? estadoInicial.coordenacao, 'coord'),
    profissionais: withIds(payload.profissionais ?? estadoInicial.profissionais, 'prof'),
    valoresUnicos: withIds(payload.valoresUnicos ?? estadoInicial.valoresUnicos, 'vu'),
    logistica: withIds(payload.logistica ?? estadoInicial.logistica, 'log'),
  };
};

// ---------------- Reducer ----------------
function reducer(state, action) {
  switch (action.type) {
    case 'SET_ALL':
      return normalizeState(action.payload);
    case 'ATUALIZAR_METADATA':
      return { ...state, metadata: { ...state.metadata, ...action.payload } };
    case 'UPDATE_PARAMETROS':
      return { ...state, parametros: { ...state.parametros, ...(action.payload || {}) } };
    case 'UPDATE_COORDENACAO':
      const { id, updates } = action.payload;
      return {
        ...state,
        coordenacao: state.coordenacao.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      };
    default:
      return state;
  }
}

// ---------------- Cálculo de totais ----------------
function calcularTotais(orc) {
  const stCoordenacao = ensureArray(orc.coordenacao).reduce((a, i) => a + subtotalCoordenacao(i), 0);
  const stProfissionais = ensureArray(orc.profissionais).reduce((a, i) => a + subtotalProfissionais(i), 0);
  const stCustosGerais = ensureArray(orc.custosGerais).reduce((a, i) => a + subtotalCustosGerais(i), 0);
  const stValoresUnicos = ensureArray(orc.valoresUnicos).reduce((a, i) => a + subtotalValoresUnicos(i), 0);
  const stLogistica = ensureArray(orc.logistica).reduce((a, i) => a + subtotalLogistica(i), 0);

  const custosOperacionais = stCustosGerais + stLogistica + stValoresUnicos;
  const honorarios = stCoordenacao + stProfissionais;
  const base = custosOperacionais + honorarios;

  const impostos = base * orc.parametros.imposto;
  const lucro = base * orc.parametros.lucro;
  const fundoGiro = base * orc.parametros.fundoGiro;
  const encargosPessoal = base * orc.parametros.encargosPessoal;
  const despesasFiscais = base * orc.parametros.despesasFiscais;
  const comissaoCaptacao = base * orc.parametros.comissaoCaptacao;

  const totalIndiretos = impostos + lucro + fundoGiro + encargosPessoal + despesasFiscais + comissaoCaptacao;
  const total = base + totalIndiretos;
  const desconto = total * (orc.metadata.descontoPercentual / 100);
  const totalComDesconto = total - desconto;

  return {
    subtotalCoordenacao: stCoordenacao,
    subtotalProfissionais: stProfissionais,
    subtotalCustosGerais: stCustosGerais,
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
    total,
    desconto,
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

  // Firestore
  const listarOrcamentos = async () => {
    try {
      setCarregando(true);
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

  const salvarOrcamento = async (id = null) => {
    try {
      setCarregando(true);
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

  const excluirOrcamento = async (id) => {
    try {
      setCarregando(true);
      await orcamentoService.excluirOrcamento(id);
      return true;
    } catch (e) {
      setErro(e?.message || 'Erro ao excluir orçamento');
      return false;
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
