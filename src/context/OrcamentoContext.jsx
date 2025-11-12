// src/context/OrcamentoContext.jsx - VERSÃO CORRIGIDA
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

import { getAuth } from "firebase/auth";
import { app } from "../firebase/config";

const auth = getAuth(app);
const user = auth.currentUser || null;

const OrcamentoContext = createContext();

// Estado inicial completo - CORRIGIDO
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

// Reducer para gerenciar o estado - MANTIDO IGUAL
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

    case 'UPDATE_COORDENACAO':
      const coordenacaoAtualizada = state.coordenacao.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates }
          : item
      );
      return { ...state, coordenacao: coordenacaoAtualizada };

    case 'UPDATE_PROFISSIONAIS':
      const itemExistenteProfissionais = state.profissionais.find(item => item.id === action.payload.id);
      if (!itemExistenteProfissionais) {
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

    case 'UPDATE_VALORES_UNICOS':
      const itemExistenteValores = state.valoresUnicos.find(item => item.id === action.payload.id);
      if (!itemExistenteValores) {
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

    case 'UPDATE_LOGISTICA':
      const itemExistenteLogistica = state.logistica.find(item => item.id === action.payload.id);
      if (!itemExistenteLogistica) {
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

// Função para calcular todos os totais – NOVA REGRA DE CÁLCULO
const calcularTotais = (state) => {
  // --- Subtotais diretos ---
  const subtotalCoordenacao = state.coordenacao.reduce((total, item) => {
    const meses = (Number(item.dias) || 0) / 30;
    const prolabore = Number(item.prolabore) || 0;
    const quant = Number(item.quant) || 0;
    return total + (meses * prolabore * quant);
  }, 0);

  const subtotalProfissionais = state.profissionais.reduce((total, item) => {
    const meses = (Number(item.dias) || 0) / 30;
    const prolabore = Number(item.prolabore) || 0;
    const pessoas = Number(item.pessoas) || 0;
    return total + (meses * prolabore * pessoas);
  }, 0);

  const subtotalValoresUnicos = state.valoresUnicos.reduce((total, item) => {
    const valor = Number(item.valor) || 0;
    const pessoas = Number(item.pessoas) || 0;
    const dias = Number(item.dias) || 0;
    return total + (valor * pessoas * dias);
  }, 0);

  const subtotalLogistica = state.logistica.reduce((total, item) => {
    const valor = Number(item.valor) || 0;
    const qtd = Number(item.qtd) || 0;
    const dias = Number(item.dias) || 0;
    return total + (valor * qtd * dias);
  }, 0);

  const subtotalGeral = subtotalCoordenacao + subtotalProfissionais + subtotalValoresUnicos + subtotalLogistica;

  // --- Indiretos (NÃO cumulativos; todos sobre subtotalGeral) ---
  const p = state.parametros || {};
  const encargosPessoalValor = subtotalGeral * (Number(p.encargosPessoal) || 0);
  const fundoGiroValor      = subtotalGeral * (Number(p.fundoGiro) || 0);
  const lucroValor          = subtotalGeral * (Number(p.lucro) || 0);
  const comissaoValor       = subtotalGeral * (Number(p.comissaoCaptacao) || 0);

  const subtotalIndiretos = encargosPessoalValor + fundoGiroValor + lucroValor + comissaoValor;

  // --- Impostos sobre (diretos + indiretos) ---
  const baseImposto = subtotalGeral + subtotalIndiretos;
  const impostos = baseImposto * (Number(p.imposto) || 0);

  // --- Valor do orçamento (bruto) ---
  const valorOrcamentoBruto = baseImposto + impostos;

  // --- Desconto sobre o valor do orçamento (bruto) ---
  const descontoPerc = (state.metadata?.desconto || 0) / 100;
  const desconto = valorOrcamentoBruto * descontoPerc;

  // --- Total final ---
  const totalGeral = valorOrcamentoBruto - desconto;

  return {
    // Subtotais diretos
    subtotalCoordenacao,
    subtotalProfissionais,
    subtotalValoresUnicos,
    subtotalLogistica,
    subtotalGeral,

    // Indiretos detalhados
    encargosPessoalValor,
    fundoGiroValor,
    lucroValor,
    comissaoValor,
    subtotalIndiretos,

    // Impostos / desconto / totais
    impostos,
    valorOrcamentoBruto,  // total antes do desconto
    desconto,
    totalGeral            // total final
  };
};

export const OrcamentoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orcamentoReducer, initialState);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [errosValidacao, setErrosValidacao] = useState([]);

  // ⭐⭐ NOVAS FUNÇÕES DE VALIDAÇÃO ⭐⭐
  const validarCampo = (secao, campo, valor, id = null) => {
    let errors = [];
    
    switch (secao) {
      case 'metadata':
        errors = validarMetadata({ [campo]: valor });
        break;
      case 'parametros':
        errors = validarParametros({ [campo]: valor });
        break;
      case 'coordenacao':
        const itemCoordenacao = state.coordenacao.find(item => item.id === id);
        if (itemCoordenacao) {
          const updatedItem = { ...itemCoordenacao, [campo]: valor };
          errors = validarCoordenacao([updatedItem]);
        }
        break;
      case 'profissionais':
        const itemProfissional = state.profissionais.find(item => item.id === id);
        if (itemProfissional) {
          const updatedItem = { ...itemProfissional, [campo]: valor };
          errors = validarProfissionais([updatedItem]);
        }
        break;
      case 'valoresUnicos':
        const itemValorUnico = state.valoresUnicos.find(item => item.id === id);
        if (itemValorUnico) {
          const updatedItem = { ...itemValorUnico, [campo]: valor };
          errors = validarValoresUnicos([updatedItem]);
        }
        break;
      case 'logistica':
        const itemLogistica = state.logistica.find(item => item.id === id);
        if (itemLogistica) {
          const updatedItem = { ...itemLogistica, [campo]: valor };
          errors = validarLogistica([updatedItem]);
        }
        break;
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

  // ✅ RESUMO ALINHADO ÀS REGRAS (usa o mesmo cálculo da UI)
  const calcularResumoCompleto = (orcamentoData) => {
    // Reaproveita a função oficial de cálculo, simulando o "state"
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
      // Subtotais diretos
      subtotalCoordenacao: t.subtotalCoordenacao,
      subtotalProfissionais: t.subtotalProfissionais,
      subtotalValoresUnicos: t.subtotalValoresUnicos,
      subtotalLogistica: t.subtotalLogistica,
      subtotalGeral: t.subtotalGeral,

      // Indiretos detalhados e soma
      encargosPessoalValor: t.encargosPessoalValor,
      fundoGiroValor: t.fundoGiroValor,
      lucroValor: t.lucroValor,
      comissaoValor: t.comissaoValor,
      subtotalIndiretos: t.subtotalIndiretos,

      // Impostos / desconto / totais
      impostos: t.impostos,
      valorOrcamentoBruto: t.valorOrcamentoBruto,
      desconto: t.desconto,
      totalGeral: t.totalGeral,

      // Metadados
      calculadoEm: new Date().toISOString(),
      versaoCalculo: '2.0'
    };
  };

  // ✅ APENAS UMA FUNÇÃO salvarOrcamento (REMOVA A OUTRA)
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
          criadoPor: user?.uid,
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

  const carregarOrcamento = async (id) => {
    setCarregando(true);
    setErro(null);
    setErrosValidacao([]);
    
    try {
      console.log('🚀 INICIANDO carregamento do orçamento ID:', id);
      const orcamento = await orcamentoService.buscarOrcamento(id);
      console.log('📦 Dados recebidos do Firebase:', orcamento);
      
      if (orcamento) {
        console.log('🔄 Dispatchando CARREGAR_ORCAMENTO...');
        console.log('📊 Dados que serão dispatchados:', {
          metadata: orcamento.metadata,
          coordenacao: orcamento.coordenacao?.length,
          profissionais: orcamento.profissionais?.length
        });
        
        dispatch({ type: 'CARREGAR_ORCAMENTO', payload: orcamento });
        
        console.log('✅ Dispatch completo. Estado atualizado.');
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
      const orcamentosDoUsuario = todosOrcamentos.filter(orc => 
        orc.metadata?.criadoPor === user?.uid
      );
      
      console.log(`📊 ${orcamentosDoUsuario.length} orçamentos do usuário ${user?.email}`);
      console.log('📋 IDs únicos dos orçamentos:', orcamentosDoUsuario.map(o => o.id));
      
      setCarregando(false);
      return orcamentosDoUsuario;
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

export const useOrcamento = () => {
  const context = useContext(OrcamentoContext);
  if (!context) {
    throw new Error('useOrcamento deve ser usado dentro de OrcamentoProvider');
  }
  return context;
};
