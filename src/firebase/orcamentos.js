// src/firebase/orcamentos.js – versão corrigida (Firebase v9 modular)
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
import { getAuth } from 'firebase/auth';

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
  
    // CUSTOS INDIRETOS — TODOS DIRETAMENTE SOBRE O SUBTOTAL
    const encargosPessoal  = subtotalGeral * safe(p.encargosPessoal);
    const lucro            = subtotalGeral * safe(p.lucro);
    const fundoGiro        = subtotalGeral * safe(p.fundoGiro);
    const comissaoCaptacao = subtotalGeral * safe(p.comissaoCaptacao);
    const despesasFiscais  = subtotalGeral * safe(p.despesasFiscais);
  
    // TOTAL INDIRETOS
    const totalIndiretos = encargosPessoal + lucro + fundoGiro + comissaoCaptacao + despesasFiscais;
  
    // BASE PARA IMPOSTOS
    const totalBase = subtotalGeral + totalIndiretos;
  
    // IMPOSTOS (percentual)
    const impostos = totalBase * safe(p.imposto);
  
    // TOTAL PRE-DESCONTO
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
  // Criar novo orçamento (salva já com totais calculados)
  async criarOrcamento(orcamentoData) {
    try {
      console.log('💾 Iniciando salvamento no Firebase...');

      // Cálculo antes de persistir
      const totais = calcularTotaisPersistentes(orcamentoData);

      const payload = {
        ...orcamentoData,
        totais,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        versao: orcamentoData.metadata?.versao || 1
      };

      // LOGS DE MONITORAMENTO
      console.log('🔍 Estrutura sendo salva:', {
        metadata: payload.metadata,
        coordenacaoCount: payload.coordenacao?.length,
        profissionaisCount: payload.profissionais?.length,
        totaisResumo: {
          subtotal: payload.totais.subtotal,
          totalGeral: payload.totais.totalGeral
        }
      });

      const docRef = await addDoc(orcamentosRef, payload);
      console.log('🎯 NOVO ORÇAMENTO SALVO com ID único:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro crítico ao criar orçamento:', error);
      throw new Error(`Falha ao salvar orçamento: ${error.message}`);
    }
  },

  // Buscar todos os orçamentos (ordenados por atualizadoEm desc)
  async listarOrcamentos() {
    try {
      console.log('🔄 Buscando orçamentos no Firebase (ordem: atualizadoEm desc)...');
      const q = query(orcamentosRef, orderBy('atualizadoEm', 'desc'));
      const querySnapshot = await getDocs(q);

      const orcamentos = querySnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      console.log(`${orcamentos.length} documentos encontrados no total`);
      return orcamentos;
    } catch (error) {
      console.error('Erro ao listar orçamentos:', error);
      throw new Error(`Falha ao carregar orçamentos: ${error.message}`);
    }
  },

  // Buscar orçamento específico
  async buscarOrcamento(id) {
    try {
      console.log('Buscando orçamento:', id);
      const ref = doc(db, 'orcamentos', id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        console.log('✅ Orçamento encontrado e carregado');
        return { id: snap.id, ...snap.data() };
      } else {
        console.log('❌ Orçamento não encontrado');
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      throw new Error(`Falha ao carregar orçamento: ${error.message}`);
    }
  },

  // Atualizar orçamento (recalcula e persiste totais sempre)
  async atualizarOrcamento(id, orcamentoData) {
    try {
      console.log('Atualizando orçamento:', id);

      const totais = calcularTotaisPersistentes(orcamentoData);

      const ref = doc(db, 'orcamentos', id);
      await updateDoc(ref, {
        ...orcamentoData,
        totais,
        atualizadoEm: new Date()
      });

      console.log('✅ Orçamento atualizado com sucesso (incluindo totais)');
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw new Error(`Falha ao atualizar orçamento: ${error.message}`);
    }
  },

  // Excluir orçamento
  async excluirOrcamento(id) {
    try {
      console.log('Excluindo orçamento:', id);
      const ref = doc(db, 'orcamentos', id);
      await deleteDoc(ref);
      console.log('✅ Orçamento excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      throw new Error(`Falha ao excluir orçamento: ${error.message}`);
    }
  }
};
