// src/firebase/orcamentos.js - VERSÃO COMPLETA CORRIGIDA
import { db } from './config';
import { getAuth } from 'firebase/auth';

const orcamentosRef = collection(db, 'orcamentos');

/**
 * Calcula e retorna um objeto com todos os totais e parciais
 * para serem PERSISTIDOS no Firestore.
 */
function calcularTotaisPersistentes(orcamento) {
  const safe = (n) => (isNaN(n) || n === null || n === undefined ? 0 : Number(n));

  // Subtotais por grupo
  const subtotalCoordenacao = (orcamento.coordenacao || []).reduce((total, item) => {
    const dias = safe(item.dias);
    const meses = dias / 30; // regra já utilizada no componente
    const subtotal = safe(item.subtotal);
    const quant = safe(item.quant);
    return total + (meses * subtotal * quant);
  }, 0);

  const subtotalProfissionais = (orcamento.profissionais || []).reduce((total, item) => {
    const dias = safe(item.dias);
    const meses = dias / 30;
    const prolabore = safe(item.prolabore);
    const pessoas = safe(item.pessoas);
    return total + (meses * prolabore * pessoas);
  }, 0);

  const subtotalValoresUnicos = (orcamento.valoresUnicos || []).reduce((total, item) => {
    const valor = safe(item.valor);
    const pessoas = safe(item.pessoas);
    const dias = safe(item.dias);
    return total + (valor * pessoas * dias);
  }, 0);

  const subtotalLogistica = (orcamento.logistica || []).reduce((total, item) => {
    const valor = safe(item.valor);
    const qtd = safe(item.qtd);
    const dias = safe(item.dias);
    return total + (valor * qtd * dias);
  }, 0);

  const subtotalGeral = subtotalCoordenacao + subtotalProfissionais + subtotalValoresUnicos + subtotalLogistica;

  // Parâmetros (percentuais em fração: 0.10 = 10%)
  const p = orcamento.parametros || {};
  const encargosPessoal   = (subtotalCoordenacao + subtotalProfissionais) * safe(p.encargosPessoal);
  const custoTotal        = subtotalGeral + encargosPessoal;
  const lucro             = custoTotal * safe(p.lucro);
  const fundoGiro         = custoTotal * safe(p.fundoGiro);
  const subtotalComLucroFundo = custoTotal + lucro + fundoGiro;

  const impostos          = subtotalComLucroFundo * safe(p.imposto);
  const despesasFiscais   = custoTotal * safe(p.despesasFiscais);
  const comissaoCaptacao  = custoTotal * safe(p.comissaoCaptacao);

  const totalAntesDesconto = subtotalComLucroFundo + impostos + despesasFiscais + comissaoCaptacao;

  // Desconto (% armazenado em metadata.desconto)
  const descontoPercent = safe(orcamento?.metadata?.desconto) / 100;
  const desconto        = totalAntesDesconto * descontoPercent;
  const totalGeral      = totalAntesDesconto - desconto;

  return {
    categorias: {
      coordenacao: subtotalCoordenacao,
      profissionais: subtotalProfissionais,
      valoresUnicos: subtotalValoresUnicos,
      logistica: subtotalLogistica,
    },
    encargosPessoal,
    custoTotal,
    lucro,
    fundoGiro,
    impostos,
    despesasFiscais,
    comissaoCaptacao,
    subtotal: subtotalGeral,
    subtotalComLucroFundo,
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
