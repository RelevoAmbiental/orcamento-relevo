// src/context/OrcamentoContext.jsx - COM VALIDAÇÕES
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

const OrcamentoContext = createContext();

// Estado inicial completo - MANTIDO IGUAL
const initialState = {
  metadata: {
    nome: 'Novo Orçamento Relevo',
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
    { id: 1, cargo: 'Coordenador Geral', profissional: 'Sênior', subtotal: 5000, quant: 1, dias: 30 },
    { id: 2, cargo: 'Coordenador Técnico', profissional: 'Sênior', subtotal: 5000, quant: 1, dias: 30 },
    { id: 3, cargo: 'Coordenador de Campo', profissional: 'Pleno', subtotal: 2000, quant: 0, dias: 30 }
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
    { id: 15, cargo: 'Outro profissional', prolabore: 0, pessoas: 0, dias: 1 }
  ],
  valoresUnicos: [
    { id: 1, item: 'ARTs/RRTs', valor: 300, pessoas: 1, dias: 1 },
    { id: 2, item: 'Relatórios Técnicos', valor: 8000, pessoas: 1, dias: 1 },
    { id: 3, item: 'Digitalização/Documentação', valor: 50, pessoas: 0, dias: 1 },
    { id: 4, item: 'Amostras/Análises Laboratoriais', valor: 500, pessoas: 0, dias: 1 },
    { id: 5, item: '', valor: 500, pessoas: 0, dias: 1 }
  ],
  logistica: [
    { id: 1, item: 'Alimentação', valor: 100, unidade: 'dia/pessoa', qtd: 0, dias: 1 },
    { id: 2, item: 'Hospedagem', valor: 170, unidade: 'dia/pessoa', qtd: 0, dias: 1 },
    { id: 3, item: 'Lavanderia', valor: 150, unidade: 'dia/pessoa', qtd: 0, dias: 1 },
    { id: 4, item: 'Exame médico', valor: 50, unidade: 'pessoa', qtd: 0, dias: 1 },
    { id: 5, item: 'Seguro de Vida', valor: 50, unidade: 'pessoa', qtd: 0, dias: 1 },
    { id: 6, item: 'Combustível', valor: 8, litro: 'dia/veículo', qtd: 0, dias: 1 },
    { id: 7, item: 'Manutenção veículo', valor: 100, unidade: 'mês/veículo', qtd: 0, dias: 1 },
    { id: 8, item: 'Veículo', valor: 500, unidade: 'dia', qtd: 0, dias: 1 },
    { id: 9, item: 'Pedagios', valor: 50, unidade: 'dia/veículo', qtd: 0, dias: 1 },
    { id: 10, item: 'Passagens aéreas', valor: 1000, unidade: 'pessoa', qtd: 0, dias: 1 },
    { id: 11, item: 'Passagens Terrestres', valor: 250, unidade: 'pessoa', qtd: 0, dias: 1 },
    { id: 12, item: 'EPI', valor: 500, unidade: 'pessoa', qtd: 0, dias: 1 },
    { id: 13, item: 'Aluguel de drone', valor: 300, unidade: 'dia', qtd: 0, dias: 1 },
    { id: 14, item: 'Material de escritório', valor: 1000, unidade: 'lote', qtd: 0, dias: 1 },
    { id: 15, item: 'Material de expediente', valor: 800, unidade: 'lote', qtd: 0, dias: 1 },
    { id: 16, item: 'Outro item logística', valor: 0, unidade: 'unidade', qtd: 0, dias: 1 }
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
          ...initialState.metadata, // Mantém valores padrão
          ...action.payload.metadata // Sobrescreve com dados salvos
        }
      };

    case 'RESET_ORCAMENTO':
      return initialState;

    default:
      return state;
  }
}

// Função para calcular todos os totais - MANTIDA IGUAL
const calcularTotais = (state) => {
  const subtotalCoordenacao = state.coordenacao.reduce((total, item) => {
    const meses = item.dias / 30;
    return total + (meses * item.subtotal * item.quant);
  }, 0);

  const subtotalProfissionais = state.profissionais.reduce((total, item) => {
    const meses = item.dias / 30;
    return total + (meses * item.prolabore * item.pessoas);
  }, 0);

  const subtotalValoresUnicos = state.valoresUnicos.reduce((total, item) => {
    return total + (item.valor * item.pessoas * item.dias);
  }, 0);

  const subtotalLogistica = state.logistica.reduce((total, item) => {
    return total + (item.valor * item.qtd * item.dias);
  }, 0);

  const subtotalGeral = subtotalCoordenacao + subtotalProfissionais + subtotalValoresUnicos + subtotalLogistica;

  const baseFolhaPagamento = subtotalCoordenacao + subtotalProfissionais;
  const encargosPessoal = baseFolhaPagamento * state.parametros.encargosPessoal;

  const custoTotal = subtotalGeral + encargosPessoal;

  const lucro = custoTotal * state.parametros.lucro;
  const fundoGiro = custoTotal * state.parametros.fundoGiro;

  const subtotalComLucroFundo = custoTotal + lucro + fundoGiro;

  const impostos = subtotalComLucroFundo * state.parametros.imposto;

  const despesasFiscais = custoTotal * state.parametros.despesasFiscais;
  const comissaoCaptacao = custoTotal * state.parametros.comissaoCaptacao;

  const totalAntesDesconto = subtotalComLucroFundo + impostos + despesasFiscais + comissaoCaptacao;

  const desconto = totalAntesDesconto * (state.metadata.desconto / 100);
  const totalGeral = totalAntesDesconto - desconto;

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
    desconto,
    totalGeral
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

  // AÇÕES COM FIREBASE REAL - ATUALIZADA COM VALIDAÇÃO
  const salvarOrcamento = async (orcamentoData = state) => {
    // Validar antes de salvar
    const validacao = validarOrcamentoAtual();
    
    if (!validacao.valido) {
      setErro('Não é possível salvar o orçamento. Corrija os erros de validação primeiro.');
      throw new Error('Validação falhou');
    }

    setCarregando(true);
    setErro(null);
    
    try {
      const id = await orcamentoService.criarOrcamento(orcamentoData);
      setCarregando(false);
      return id;
    } catch (error) {
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
      const orcamento = await orcamentoService.buscarOrcamento(id);
      if (orcamento) {
        dispatch({ type: 'CARREGAR_ORCAMENTO', payload: orcamento });
      }
      setCarregando(false);
      return orcamento;
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
      const orcamentos = await orcamentoService.listarOrcamentos();
      setCarregando(false);
      return orcamentos;
    } catch (error) {
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

  const limparErro = () => setErro(null);

  // VALOR DO CONTEXT ATUALIZADO COM VALIDAÇÕES
  const value = {
    // Estado (compatível)
    orcamentoAtual: state,
    dispatch,
    
    // Novos estados
    carregando,
    erro,
    errosValidacao,
    totais: calcularTotais(state),
    
    // Ações Firebase
    salvarOrcamento,
    carregarOrcamento,
    listarOrcamentos,
    atualizarOrcamento,
    excluirOrcamento,
    
    // ⭐⭐ NOVAS AÇÕES DE VALIDAÇÃO ⭐⭐
    validarCampo,
    validarOrcamentoAtual,
    limparErrosValidacao,
    
    // Utilitários
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
