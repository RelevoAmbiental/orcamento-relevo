// src/context/OrcamentoContext.jsx  — RESTAURADO (como o antigo, com pequenas defesas)
// Mantém: estado inicial preenchido, actions UPDATE_*, cálculos e integração Firebase

import React, { createContext, useContext, useReducer, useState, useMemo } from 'react';
import { orcamentoService } from '../firebase/orcamentos';

// ---------------- Estado inicial restaurado ----------------
const estadoInicial = {
  metadata: {
    nome: 'Novo Orçamento',
    cliente: '',
    data: new Date().toISOString().split('T')[0],
    versao: '1.0',
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
    { id: 4, cargo: 'Biólogo - Invertebrado', prolabore: 9000, pessoas: 0, dias: 0 },
    { id: 5, cargo: 'Biólogo - Vertebrado', prolabore: 9000, pessoas: 0, dias: 0 },
    { id: 6, cargo: 'Arqueólogo', prolabore: 9500, pessoas: 0, dias: 0 },
    { id: 7, cargo: 'Paleontólogo', prolabore: 9500, pessoas: 0, dias: 0 },
    { id: 8, cargo: 'Auxiliar de Campo', prolabore: 6000, pessoas: 0, dias: 0 },
  ],
  valoresUnicos: [
    { id: 1, item: 'ARTs/RRTs', valor: 300, pessoas: 1, dias: 1 },
    { id: 2, item: 'Relatórios Técnicos', valor: 8000, pessoas: 1, dias: 1 },
    { id: 3, item: 'Digitalização/Documentação', valor: 50, pessoas: 0, dias: 1 },
  ],
  logistica: [
    { id: 1, item: 'Alimentação', valor: 120, unidade: 'dia/pessoa', qtd: 0, dias: 1 },
    { id: 2, item: 'Hospedagem', valor: 200, unidade: 'dia/pessoa', qtd: 0, dias: 1 },
    { id: 3, item: 'Veículo', valor: 400, unidade: 'dia', qtd: 0, dias: 1 },
  ],
};

// ---------------- Reducer (como no antigo) ----------------
function orcamentoReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_METADATA':
      return { ...state, metadata: { ...state.metadata, ...action.payload } };

    case 'UPDATE_PARAMETROS':
      return { ...state, parametros: { ...state.parametros, ...action.payload } };

    case 'UPDATE_COORDENACAO': {
      const nova = state.coordenacao.map((it) =>
        it.id === action.payload.id ? { ...it, ...action.payload.updates } : it
      );
      return { ...state, coordenacao: nova };
    }

    case 'UPDATE_PROFISSIONAIS': {
      const nova = state.profissionais.map((it) =>
        it.id === action.payload.id ? { ...it, ...action.payload.updates } : it
      );
      return { ...state, profissionais: nova };
    }

    case 'UPDATE_VALORES_UNICOS': {
      const existe = state.valoresUnicos.find((it) => it.id === action.payload.id);
      if (!existe) {
        return {
          ...state,
          valoresUnicos: [...state.valoresUnicos, { id: action.payload.id, ...action.payload.updates }],
        };
      }
      const nova = state.valoresUnicos.map((it) =>
        it.id === action.payload.id ? { ...it, ...action.payload.updates } : it
      );
      return { ...state, valoresUnicos: nova };
    }

    case 'UPDATE_LOGISTICA': {
      const existe = state.logistica.find((it) => it.id === action.payload.id);
      if (!existe) {
        return {
          ...state,
          logistica: [...state.logistica, { id: action.payload.id, ...action.payload.updates }],
        };
      }
      const nova = state.logistica.map((it) =>
        it.id === action.payload.id ? { ...it, ...action.payload.updates } : it
      );
      return { ...state, logistica: nova };
    }

    case 'CARREGAR_ORCAMENTO':
      // Mantém defaults de metadata/parametros se vierem faltando no Firebase
      return {
        ...action.payload,
        metadata: { ...initialState.metadata, ...action.payload.metadata },
        parametros: { ...initialState.parametros, ...action.payload.parametros },
      };

    case 'RESET_ORCAMENTO':
      return initialState;

    default:
      return state;
  }
}

// ---------------- Cálculos (como no antigo) ----------------
const calcularTotais = (state) => {
  // Coordenação: subtotal é mensal; converte dias -> meses
  const subtotalCoordenacao = state.coordenacao.reduce((tot, it) => {
    const meses = (Number(it.dias) || 0) / 30;
    return tot + meses * (Number(it.subtotal) || 0) * (Number(it.quant) || 0);
  }, 0);

  // Profissionais: prolabore mensal * pessoas * (dias/30)
  const subtotalProfissionais = state.profissionais.reduce((tot, it) => {
    const meses = (Number(it.dias) || 0) / 30;
    return tot + meses * (Number(it.prolabore) || 0) * (Number(it.pessoas) || 0);
  }, 0);

  const subtotalValoresUnicos = state.valoresUnicos.reduce((tot, it) => {
    return tot + (Number(it.valor) || 0) * (Number(it.pessoas) || 0) * (Number(it.dias) || 0);
  }, 0);

  const subtotalLogistica = state.logistica.reduce((tot, it) => {
    return tot + (Number(it.valor) || 0) * (Number(it.qtd) || 0) * (Number(it.dias) || 0);
  }, 0);

  const subtotalGeral = subtotalCoordenacao + subtotalProfissionais + subtotalValoresUnicos + subtotalLogistica;

  // Encargos sobre folha (coordenação + profissionais)
  const baseFolhaPagamento = subtotalCoordenacao + subtotalProfissionais;
  const encargosPessoal = baseFolhaPagamento * (Number(state.parametros.encargosPessoal) || 0);

  // Custo total antes de lucro/fundo
  const custoTotal = subtotalGeral + encargosPessoal;

  const lucro = custoTotal * (Number(state.parametros.lucro) || 0);
  const fundoGiro = custoTotal * (Number(state.parametros.fundoGiro) || 0);

  const subtotalComLucroFundo = custoTotal + lucro + fundoGiro;

  // Impostos sobre subtotal com lucro+fundo
  const impostos = subtotalComLucroFundo * (Number(state.parametros.imposto) || 0);

  // Outras despesas calculadas sobre custoTotal
  const despesasFiscais = custoTotal * (Number(state.parametros.despesasFiscais) || 0);
  const comissaoCaptacao = custoTotal * (Number(state.parametros.comissaoCaptacao) || 0);

  const totalAntesDesconto = subtotalComLucroFundo + impostos + despesasFiscais + comissaoCaptacao;

  const descontoAbs = totalAntesDesconto * ((Number(state.metadata.desconto) || 0) / 100);
  const totalGeral = totalAntesDesconto - descontoAbs;

  return {
    subtotalCoordenacao,
    subtotalProfissionais,
    subtotalValoresUnicos,
    subtotalLogistica,
    subtotalGeral,
    baseFolhaPagamento,
    custoTotal,
    subtotalComLucroFundo,
    encargosPessoal,
    lucro,
    fundoGiro,
    impostos,
    despesasFiscais,
    comissaoCaptacao,
    totalAntesDesconto,
    desconto: descontoAbs,
    totalGeral,
  };
};

// ---------------- Contexto ----------------
const OrcamentoContext = createContext(null);

export const OrcamentoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orcamentoReducer, initialState);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const totais = useMemo(() => calcularTotais(state), [state]);

  // ---- Wrappers resilientes aos nomes existentes no service ----
  const listarOrcamentos = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const svc = orcamentoService;
      const lista = svc.listarOrcamentos
        ? await svc.listarOrcamentos()
        : (svc.listar ? await svc.listar() : []);
      return Array.isArray(lista) ? lista : [];
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
      const svc = orcamentoService;
      const doc = svc.buscarOrcamento
        ? await svc.buscarOrcamento(id)
        : (svc.carregarOrcamento ? await svc.carregarOrcamento(id) : null);
      if (doc) dispatch({ type: 'CARREGAR_ORCAMENTO', payload: doc });
      return !!doc;
    } catch (e) {
      setErro(e?.message || 'Erro ao carregar orçamento');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  const salvarOrcamento = async (orcamentoData = state) => {
    try {
      setCarregando(true);
      setErro(null);
      const id = await orcamentoService.criarOrcamento(orcamentoData);
      return id;
    } catch (e) {
      setErro(e?.message || 'Erro ao salvar orçamento');
      return null;
    } finally {
      setCarregando(false);
    }
  };

  const atualizarOrcamento = async (id, orcamentoData) => {
    try {
      setCarregando(true);
      setErro(null);
      await orcamentoService.atualizarOrcamento(id, orcamentoData);
      return true;
    } catch (e) {
      setErro(e?.message || 'Erro ao atualizar orçamento');
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

  const value = {
    orcamentoAtual: state,
    dispatch,
    totais,
    carregando,
    erro,
    // atalhos usados nos componentes
    updateMetadata: (patch) => dispatch({ type: 'UPDATE_METADATA', payload: patch }),
    // firebase ops
    listarOrcamentos,
    carregarOrcamento,
    salvarOrcamento,
    atualizarOrcamento,
    excluirOrcamento,
  };

  return <OrcamentoContext.Provider value={value}>{children}</OrcamentoContext.Provider>;
};

export const useOrcamento = () => {
  const ctx = useContext(OrcamentoContext);
  if (!ctx) throw new Error('useOrcamento deve ser usado dentro de OrcamentoProvider');
  return ctx;
};
