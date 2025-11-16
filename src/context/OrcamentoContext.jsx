// src/context/OrcamentoContext.jsx - VERSÃO ALINHADA À NOVA REGRA
import React, { createContext, useContext, useReducer, useState } from 'react';
import { orcamentoService } from '../firebase/orcamentos';
import { 
  validarOrcamentoCompleto, 
  orcamentoPodeSerSalvo,
  validarMetadata,
  validarParametros,
  validarCoordenacao,
  validarProfissionais,
  validarValoresUnicos,
  validarLogistica 
} from '../utils/validators';

// Usa o usuário propagado pelo portal (window.relevoUser) ou, se existir, o firebase global
const userGlobal = (typeof window !== 'undefined')
  ? (window.relevoUser || (window.firebase ? window.firebase.auth().currentUser : null))
  : null;

const OrcamentoContext = createContext();

// ---------------------- ESTADO INICIAL ----------------------
const initialState = {
  metadata: {
    nome: '',
    cliente: '',
    data: new Date().toISOString().split('T')[0],
    versao: '1.0',
    desconto: 0
  },
  parametros: {
    imposto: 0.07,
    lucro: 0.05,
    fundoGiro: 0.05,
    encargosPessoal: 0.10,
    despesasFiscais: 0.03,
    comissaoCaptacao: 0.03
  },
  coordenacao: [
    { id: 1, cargo: 'Coordenador Geral', profissional: 'Sênior', prolabore: 5000, quant: 1, dias: 30 },
    { id: 2, cargo: 'Coordenador Técnico', profissional: 'Sênior', prolabore: 5000, quant: 1, dias: 30 },
    { id: 3, cargo: 'Coordenador de Campo', profissional: 'Pleno', prolabore: 2000, quant: 0, dias: 30 }
  ],
  profissionais: [
    { id: 1, cargo: 'Geólogo I', prolabore: 10000, pessoas: 0, dias: 1 },
    { id: 2, cargo: 'Geólogo II', prolabore: 9000, pessoas: 0, dias: 1 },
    { id: 3, cargo: 'Geofísico', prolabore: 11000, pessoas: 0, dias: 1 },
    { id: 4, cargo: 'Biólogo-Invertebrado', prolabore: 9000, pessoas: 0, dias: 1 },
    { id: 5, cargo: 'Biólogo-vertebrado', prolabore: 9000, pessoas: 0, dias: 1 },
    { id: 6, cargo: 'Biólogo-geral', prolabore: 9500, pessoas: 0, dias: 1 },
    { id: 7, cargo: 'Arqueólogo', prolabore: 9500, pessoas: 0, dias: 1 },
    { id: 8, cargo: 'Sociólogo', prolabore: 9500, pessoas: 0, dias: 1 },
    { id: 9, cargo: 'Paleontólogo', prolabore: 9500, pessoas: 0, dias: 1 },
    { id: 10, cargo: 'Engenheiro florestal', prolabore: 9000, pessoas: 0, dias: 1 },
    { id: 11, cargo: 'Geoprocessamento', prolabore: 9000, pessoas: 0, dias: 1 },
    { id: 12, cargo: 'Auxiliar de campo', prolabore: 9000, pessoas: 0, dias: 1 },
    { id: 13, cargo: 'Administrador', prolabore: 7000, pessoas: 0, dias: 1 },
    { id: 14, cargo: 'Croquista/topógrafo', prolabore: 9000, pessoas: 0, dias: 1 },
  ],
  valoresUnicos: [
    { id: 1, item: 'ARTs/RRTs', valor: 300, pessoas: 1, dias: 1 },
    { id: 2, item: 'Relatórios Técnicos', valor: 8000, pessoas: 1, dias: 1 },
    { id: 3, item: 'Digitalização/Documentação', valor: 50, pessoas: 0, dias: 1 },
    { id: 4, item: 'Amostras/Análises Laboratoriais', valor: 500, pessoas: 0, dias: 1 },
  ],
  logistica: [
    { id: 1, item: 'Alimentação', valor: 100, unidade: 'dia/pessoa', qtd: 0, dias: 1 },
    { id: 2, item: 'Hospedagem', valor: 170, unidade: 'dia/pessoa', qtd: 0, dias: 1 },
    { id: 3, item: 'Lavanderia', valor: 150, unidade: 'dia/pessoa', qtd: 0, dias: 1 },
    { id: 4, item: 'Exame médico', valor: 50, unidade: 'pessoa', qtd: 0, dias: 1 },
    { id: 5, item: 'Seguro de Vida', valor: 50, unidade: 'pessoa', qtd: 0, dias: 1 },
    { id: 6, item: 'Combustível', valor: 8, unidade: 'dia/veículo', qtd: 0, dias: 1 },
    { id: 7, item: 'Manutenção veículo', valor: 100, unidade: 'mês/veículo', qtd: 0, dias: 1 },
    { id: 8, item: 'Veículo', valor: 500, unidade: 'dia', qtd: 0, dias: 1 },
    { id: 9, item: 'Pedagios', valor: 50, unidade: 'dia/veículo', qtd: 0, dias: 1 },
    { id: 10, item: 'Passagens aéreas', valor: 1000, unidade: 'pessoa', qtd: 0, dias: 1 },
    { id: 11, item: 'Passagens Terrestres', valor: 250, unidade: 'pessoa', qtd: 0, dias: 1 },
    { id: 12, item: 'EPI', valor: 500, unidade: 'pessoa', qtd: 0, dias: 1 },
    { id: 13, item: 'Aluguel de drone', valor: 300, unidade: 'dia', qtd: 0, dias: 1 },
    { id: 14, item: 'Material de escritório', valor: 1000, unidade: 'lote', qtd: 0, dias: 1 },
    { id: 15, item: 'Material de expediente', valor: 800, unidade: 'lote', qtd: 0, dias: 1 },
  ]
};

// ---------------------- REDUCER ----------------------
function orcamentoReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_METADATA':
      return {
        ...state,
        metadata: { ...state.metadata, ...action.payload }
      };

    case 'UPDATE_PARAMETROS':
      return {
        ...state,
        parametros: { ...state.parametros, ...action.payload }
      };

    case 'UPDATE_COORDENACAO': {
      const coordenacaoAtualizada = state.coordenacao.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates }
          : item
      );
      return { ...state, coordenacao: coordenacaoAtualizada };
    }

    case 'UPDATE_PROFISSIONAIS': {
      const itemExistente = state.profissionais.find(item => item.id === action.payload.id);
      if (!itemExistente) {
        return {
          ...state,
          profissionais: [...state.profissionais, { id: action.payload.id, ...action.payload.updates }]
        };
      }
      const profissionaisAtualizados = state.profissionais.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates }
          : item
      );
      return { ...state, profissionais: profissionaisAtualizados };
    }

    case 'UPDATE_VALORES_UNICOS': {
      const itemExistente = state.valoresUnicos.find(item => item.id === action.payload.id);
      if (!itemExistente) {
        return {
          ...state,
          valoresUnicos: [...state.valoresUnicos, { id: action.payload.id, ...action.payload.updates }]
        };
      }
      const valoresAtualizados = state.valoresUnicos.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates }
          : item
      );
      return { ...state, valoresUnicos: valoresAtualizados };
    }

    case 'UPDATE_LOGISTICA': {
      const itemExistente = state.logistica.find(item => item.id === action.payload.id);
      if (!itemExistente) {
        return {
          ...state,
          logistica: [...state.logistica, { id: action.payload.id, ...action.payload.updates }]
        };
      }
      const logisticaAtualizada = state.logistica.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates }
          : item
      );
      return { ...state, logistica: logisticaAtualizada };
    }

    case 'CARREGAR_ORCAMENTO':
      return {
        ...action.payload,
        metadata: {
          ...initialState.metadata,
          ...action.payload.metadata
        }
      };

    case 'RESET_ORCAMENTO':
      return initialState;

    default:
      return state;
  }
}

// ---------------------- CÁLCULO DE TOTAIS (NOVO MODELO) ----------------------
const calcularTotais = (state) => {
  const n = (v) => (isNaN(v) || v === null || v === undefined ? 0 : Number(v));

  // Subtotais diretos
  const subtotalCoordenacao = state.coordenacao.reduce((total, item) => {
    const meses = n(item.dias) / 30;
    return total + (meses * n(item.prolabore) * n(item.quant));
  }, 0);

  const subtotalProfissionais = state.profissionais.reduce((total, item) => {
    const meses = n(item.dias) / 30;
    return total + (meses * n(item.prolabore) * n(item.pessoas));
  }, 0);

  const subtotalValoresUnicos = state.valoresUnicos.reduce((total, item) => {
    return total + (n(item.valor) * n(item.pessoas) * n(item.dias));
  }, 0);

  const subtotalLogistica = state.logistica.reduce((total, item) => {
    return total + (n(item.valor) * n(item.qtd) * n(item.dias));
  }, 0);

  const subtotalGeral = subtotalCoordenacao + subtotalProfissionais + subtotalValoresUnicos + subtotalLogistica;

  // Parâmetros
  const p = state.parametros || {};
  const encargosPessoal = subtotalGeral * n(p.encargosPessoal);
  const fundoGiro       = subtotalGeral * n(p.fundoGiro);
  const lucro           = subtotalGeral * n(p.lucro);            // margem de lucro (R$)
  const despesasFiscais = subtotalGeral * n(p.despesasFiscais);
  const comissaoCaptacao = subtotalGeral * n(p.comissaoCaptacao);

  const subtotalIndiretos =
    encargosPessoal + fundoGiro + lucro + despesasFiscais + comissaoCaptacao;

  // Impostos sobre (diretos + indiretos)
  const baseImposto = subtotalGeral + subtotalIndiretos;
  const impostos = baseImposto * n(p.imposto);

  // Custo total antes de desconto (diretos + indiretos + impostos)
  const custoTotal = subtotalGeral + subtotalIndiretos;   // antes de impostos
  const totalAntesDesconto = custoTotal + impostos;       // orçamento bruto

  // Desconto
  const descontoPerc = n(state.metadata?.desconto) / 100;
  const desconto = totalAntesDesconto * descontoPerc;

  const totalGeral = totalAntesDesconto - desconto;

  return {
    // Subtotais diretos
    subtotalCoordenacao,
    subtotalProfissionais,
    subtotalValoresUnicos,
    subtotalLogistica,
    subtotalGeral,

    // Indiretos detalhados
    encargosPessoal,
    fundoGiro,
    lucro,             // << margem de lucro em R$
    despesasFiscais,
    comissaoCaptacao,

    // Agregados
    totalIndiretos: subtotalIndiretos,
    custoTotal,        // diretos + indiretos
    impostos,
    totalAntesDesconto,
    desconto,
    totalGeral
  };
};

// ---------------------- PROVIDER ----------------------
export const OrcamentoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orcamentoReducer, initialState);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [errosValidacao, setErrosValidacao] = useState([]);

  // ---- Validação de campos ----
  const validarCampo = (secao, campo, valor, id = null) => {
    let errors = [];
    
    switch (secao) {
      case 'metadata':
        errors = validarMetadata({ [campo]: valor });
        break;
      case 'parametros':
        errors = validarParametros({ [campo]: valor });
        break;
      case 'coordenacao': {
        const item = state.coordenacao.find(i => i.id === id);
        if (item) {
          const updated = { ...item, [campo]: valor };
          errors = validarCoordenacao([updated]);
        }
        break;
      }
      case 'profissionais': {
        const item = state.profissionais.find(i => i.id === id);
        if (item) {
          const updated = { ...item, [campo]: valor };
          errors = validarProfissionais([updated]);
        }
        break;
      }
      case 'valoresUnicos': {
        const item = state.valoresUnicos.find(i => i.id === id);
        if (item) {
          const updated = { ...item, [campo]: valor };
          errors = validarValoresUnicos([updated]);
        }
        break;
      }
      case 'logistica': {
        const item = state.logistica.find(i => i.id === id);
        if (item) {
          const updated = { ...item, [campo]: valor };
          errors = validarLogistica([updated]);
        }
        break;
      }
      default:
        break;
    }
    
    return errors;
  };

  const validarOrcamentoAtual = () => {
    const resultado = orcamentoPodeSerSalvo(state);
    setErrosValidacao(resultado.errors);
    return resultado;
  };

  const limparErrosValidacao = () => {
    setErrosValidacao([]);
  };

  // ---- RESUMO COMPLETO (para salvar no Firestore e exportar) ----
  const calcularResumoCompleto = (orcamentoData) => {
    const simulado = {
      ...orcamentoData,
      parametros: { ...initialState.parametros, ...(orcamentoData.parametros || {}) },
      metadata:   { ...initialState.metadata,   ...(orcamentoData.metadata || {}) },
      coordenacao:   orcamentoData.coordenacao   || [],
      profissionais: orcamentoData.profissionais || [],
      valoresUnicos: orcamentoData.valoresUnicos || [],
      logistica:     orcamentoData.logistica     || []
    };

    const t = calcularTotais(simulado);

    return {
      subtotalCoordenacao: t.subtotalCoordenacao,
      subtotalProfissionais: t.subtotalProfissionais,
      subtotalValoresUnicos: t.subtotalValoresUnicos,
      subtotalLogistica: t.subtotalLogistica,
      subtotalGeral: t.subtotalGeral,

      encargosPessoal: t.encargosPessoal,
      fundoGiro: t.fundoGiro,
      lucro: t.lucro,
      despesasFiscais: t.despesasFiscais,
      comissaoCaptacao: t.comissaoCaptacao,

      custoTotal: t.custoTotal,
      impostos: t.impostos,
      totalAntesDesconto: t.totalAntesDesconto,
      desconto: t.desconto,
      totalGeral: t.totalGeral,

      calculadoEm: new Date().toISOString(),
      versaoCalculo: '2.0'
    };
  };

  // ---- Salvar orçamento ----
  const salvarOrcamento = async (orcamentoData = state) => {
    const validacao = validarOrcamentoAtual();
    
    if (!validacao.valido) {
      setErro('Não é possível salvar o orçamento. Corrija os erros de validação primeiro.');
      throw new Error('Validação falhou');
    }

    setCarregando(true);
    setErro(null);
    
    try {
      const idUnico = orcamentoData.id || `orc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const resumoCompleto = calcularResumoCompleto(orcamentoData);
      
      const dadosParaSalvar = JSON.parse(JSON.stringify({
        ...orcamentoData,
        id: idUnico,
        resumo: resumoCompleto,
        coordenacao: orcamentoData.coordenacao?.map(item => ({ ...item })) || [],
        profissionais: orcamentoData.profissionais?.map(item => ({ ...item })) || [],
        valoresUnicos: orcamentoData.valoresUnicos?.map(item => ({ ...item })) || [],
        logistica: orcamentoData.logistica?.map(item => ({ ...item })) || [],
        metadata: {
          ...orcamentoData.metadata,
          criadoEm: orcamentoData.metadata?.criadoEm || new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
          criadoPor: userGlobal?.uid || null,
          versao: '2.0'
        }
      }));
      
      console.log('💾 Salvando orçamento com ID único:', idUnico);
      console.log('📊 RESUMO incluído:', resumoCompleto);
      
      const id = await orcamentoService.criarOrcamento(dadosParaSalvar);
      
      console.log('✅ Orçamento salvo com ID único:', id);
      setCarregando(false);
      return id;
    } catch (error) {
      console.error('❌ Erro ao salvar orçamento:', error);
      setErro(error.message);
      setCarregando(false);
      throw error;
    }
  };

  // ---- Carregar orçamento ----
  const carregarOrcamento = async (id) => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao([]);
    
    try {
      console.log('🚀 INICIANDO carregamento do orçamento ID:', id);
      const orcamento = await orcamentoService.buscarOrcamento(id);
      console.log('📦 Dados recebidos do Firebase:', orcamento);
      
      if (orcamento) {
        dispatch({ type: 'CARREGAR_ORCAMENTO', payload: orcamento });
        console.log('✅ Estado atualizado com orçamento carregado.');
      } else {
        console.warn('⚠️ Orçamento NULO recebido do Firebase');
      }
      
      setCarregando(false);
      return orcamento;
    } catch (error) {
      console.error('❌ Erro ao carregar orçamento:', error);
      setErro(error.message);
      setCarregando(false);
      throw error;
    }
  };

  // ---- Atualizar / Excluir / Listar ----
  const atualizarOrcamento = async (id, orcamentoData) => {
    setCarregando(true);
    setErro(null);
    
    try {
      await orcamentoService.atualizarOrcamento(id, orcamentoData);
      setCarregando(false);
    } catch (error) {
      setErro(error.message);
      setCarregando(false);
      throw error;
    }
  };

  const excluirOrcamento = async (id) => {
    setCarregando(true);
    setErro(null);
    
    try {
      await orcamentoService.excluirOrcamento(id);
      setCarregando(false);
    } catch (error) {
      setErro(error.message);
      setCarregando(false);
      throw error;
    }
  };

  const listarOrcamentos = async () => {
    setCarregando(true);
    setErro(null);
    
    try {
      const todosOrcamentos = await orcamentoService.listarOrcamentos();
      const uid = userGlobal?.uid || null;

      const orcamentosFiltrados = uid
        ? todosOrcamentos.filter(orc => orc.metadata?.criadoPor === uid)
        : todosOrcamentos;

      console.log(`📊 ${orcamentosFiltrados.length} orçamentos retornados (uid: ${uid || 'sem filtro'})`);
      console.log('📋 IDs únicos dos orçamentos:', orcamentosFiltrados.map(o => o.id));
      
      setCarregando(false);
      return orcamentosFiltrados;
    } catch (error) {
      setErro(error.message);
      setCarregando(false);
      throw error;
    }
  };

  const limparErro = () => setErro(null);

  const value = {
    orcamentoAtual: state,
    dispatch,
    carregando,
    erro,
    errosValidacao,
    totais: calcularTotais(state),
    salvarOrcamento,
    carregarOrcamento,
    listarOrcamentos,
    atualizarOrcamento,
    excluirOrcamento,
    validarCampo,
    validarOrcamentoAtual,
    limparErrosValidacao,
    limparErro
  };

  return (
    <OrcamentoContext.Provider value={value}>
      {children}
    </OrcamentoContext.Provider>
  );
};

// Hook
export const useOrcamento = () => {
  const context = useContext(OrcamentoContext);
  if (!context) {
    throw new Error('useOrcamento deve ser usado dentro de OrcamentoProvider');
  }
  return context;
};
