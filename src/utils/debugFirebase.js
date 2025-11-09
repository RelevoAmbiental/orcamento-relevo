// src/utils/debugFirebase.js - APENAS LEITURA, ZERO RISCO
import { orcamentoService } from '../firebase/orcamentos';

export const debugFirebase = async () => {
  try {
    console.log('🔍 INICIANDO DIAGNÓSTICO SEGURO DO FIREBASE');
    
    // 1. Listar todos os orçamentos
    const orcamentos = await orcamentoService.listarOrcamentos();
    console.log('📋 Orçamentos encontrados:', orcamentos.length);
    
    // 2. Para cada orçamento, ver estrutura
    orcamentos.forEach((orc, index) => {
      console.log(`--- ORÇAMENTO ${index + 1} ---`);
      console.log('ID:', orc.id);
      console.log('Metadata:', orc.metadata);
      console.log('Tem coordenacao?:', !!orc.coordenacao);
      console.log('Tem profissionais?:', !!orc.profissionais);
      console.log('Estrutura completa:', JSON.stringify(orc, null, 2));
    });
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
  }
};
