// src/firebase/orcamentos.js – VERSÃO FINAL CORRIGIDA

import { db } from './config';
import { 
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';

// Referência global à coleção “orcamentos”
const orcamentosRef = collection(db, 'orcamentos');

/**
 * Calcula e retorna um objeto com todos os totais e parciais
 * para serem PERSISTIDOS no Firestore.
 */
function calcularTotaisPersistentes(orcamento) {
  const safe = (n) => (isNaN(n) || n === null || n === undefined ? 0 : Number(n));

  // 📌 SUBTOTAIS POR GRUPO
  const subtotalCoordenacao = (orcamento.coordenacao || []).reduce((total, item) => {
    const meses = safe(item.dias) / 30;
    return total + (meses * safe(item.prolabore) * safe(item.quant));
  }, 0);

  const subtotalProfissionais = (orcamento.profissionais || []).reduce((total, item) => {
    const meses = safe(item.dias) / 30;
    return total + (meses * safe(item.prolabore) * safe(item.pessoas));
  }, 0);

  const subtotalValoresUnicos = (orcamento.valoresUnicos || []).reduce((total, item) => {
    return total + safe(item.valor) * safe(item.pessoas) * safe(item.dias);
  }, 0);

  const subtotalLogistica = (orcamento.logistica || []).reduce((total, item) => {
    return total + safe(item.valor) * safe(item.qtd) * safe(item.dias);
  }, 0);

  // SOMA GERAL DOS CUSTOS DIRETOS
  const subtotalGeral =
    subtotalCoordenacao +
    subtotalProfissionais +
    subtotalValoresUnicos +
    subtotalLogistica;

  // PARÂMETROS
  const p = orcamento.parametros || {};

  // CUSTOS INDIRETOS (todos calculados DIRETAMENTE sobre o subtotal)
  const encargosPessoal  = subtotalGeral * safe(p.encargosPessoal);
  const lucro            = subtotalGeral * safe(p.lucro);
  const fundoGiro        = subtotalGeral * safe(p.fundoGiro);
  const comissaoCaptacao = subtotalGeral * safe(p.comissaoCaptacao);
  const despesasFiscais  = subtotalGeral * safe(p.despesasFiscais);

  // TOTAL DE CUSTOS INDIRETOS
  const totalIndiretos =
    encargosPessoal +
    lucro +
    fundoGiro +
    comissaoCaptacao +
    despesasFiscais;

  // BASE PARA IMPOSTOS
  const totalBase = subtotalGeral + totalIndiretos;

  // IMPOSTOS
  const impostos = totalBase * safe(p.imposto);

  // TOTAL ANTES DO DESCONTO
  const totalAntesDesconto = totalBase + impostos;

  // DESCONTO
  const descontoPercent = safe(orcamento?.metadata?.desconto) / 100;
  const desconto = totalAntesDesconto * descontoPercent;

  // TOTAL FINAL
  const totalGeral = totalAntesDesconto - desconto;

  return {
    categorias: {
      coordenacao: subtotalCoordenacao,
      profissionais: subtotalProfissionais,
      valoresUnicos: subtotalValoresUnicos,
      logistica: subtotalLogistica,
    },
    subtotalGeral,
    encargosPessoal,
    lucro,
    fundoGiro,
    comissaoCaptacao,
    despesasFiscais,
    impostos,
    totalIndiretos,
    totalBase,
    totalAntesDesconto,
    desconto,
    totalGeral
  };
}

export const orcamentoService = {

  /**
   * Criar novo orçamento
   */
  async criarOrcamento(orcamentoData) {
    try {
      console.log('💾 Iniciando salvamento no Firebase...');

      // Calcula totais antes de salvar
      const totais = calcularTotaisPersistentes(orcamentoData);

      const payload = {
        ...orcamentoData,
        totais,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        versao: orcamentoData.metadata?.versao || 1
      };

      // 🔥 INSERIR NO FIRESTORE (gera ID automático)
      const docRef = await addDoc(orcamentosRef, payload);

      console.log('🎯 NOVO ORÇAMENTO SALVO com ID REAL:', docRef.id);

      return docRef.id;

    } catch (error) {
      console.error('❌ Erro crítico ao criar orçamento:', error);
      throw new Error(`Falha ao salvar orçamento: ${error.message}`);
    }
  },

  /**
   * Listar orçamentos ordenados por atualização
   * — SEM NUNCA SOBREPOR ID REAL COM id INTERNO
   */
  async listarOrcamentos() {
    try {
      console.log('🔄 Buscando orçamentos no Firebase...');

      const q = query(orcamentosRef, orderBy('atualizadoEm', 'desc'));
      const querySnapshot = await getDocs(q);

      const orcamentos = querySnapshot.docs.map((d) => {
        const data = d.data();

        return {
          id: d.id, // 🔥 sempre ID REAL
          metadata: data.metadata || {},
          totais: data.totais || {},
          coordenacao: data.coordenacao || [],
          profissionais: data.profissionais || [],
          valoresUnicos: data.valoresUnicos || [],
          logistica: data.logistica || [],
          parametros: data.parametros || {},
          criadoEm: data.criadoEm,
          atualizadoEm: data.atualizadoEm
        };
      });

      console.log(`📄 ${orcamentos.length} documentos carregados.`);
      return orcamentos;

    } catch (error) {
      console.error('Erro ao listar orçamentos:', error);
      throw new Error(`Falha ao carregar orçamentos: ${error.message}`);
    }
  },

  /**
   * Buscar orçamento específico
   */
  async buscarOrcamento(id) {
    try {
      console.log('🔎 Buscando orçamento:', id);

      const ref = doc(db, 'orcamentos', id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.log('❌ Orçamento não encontrado no Firebase');
        return null;
      }

      console.log('✅ Orçamento encontrado');
      return { id: snap.id, ...snap.data() };

    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      throw new Error(`Falha ao carregar orçamento: ${error.message}`);
    }
  },

  /**
   * Atualizar orçamento existente (recalculando totais)
   */
  async atualizarOrcamento(id, orcamentoData) {
    try {
      console.log('✏️ Atualizando orçamento:', id);

      const totais = calcularTotaisPersistentes(orcamentoData);

      const ref = doc(db, 'orcamentos', id);

      await updateDoc(ref, {
        ...orcamentoData,
        totais,
        atualizadoEm: new Date()
      });

      console.log('✅ Orçamento atualizado com sucesso!');

    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw new Error(`Falha ao atualizar orçamento: ${error.message}`);
    }
  },

  /**
   * Excluir orçamento
   */
  async excluirOrcamento(id) {
    try {
      console.log('🗑️ Excluindo orçamento:', id);
      const ref = doc(db, 'orcamentos', id);
      await deleteDoc(ref);
      console.log('✅ Orçamento excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      throw new Error(`Falha ao excluir orçamento: ${error.message}`);
    }
  }
};
