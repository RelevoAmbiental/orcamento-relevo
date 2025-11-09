import { db } from './config';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  getDocs, getDoc, query, orderBy, where 
} from 'firebase/firestore';

const orcamentosRef = collection(db, 'orcamentos');

export const orcamentoService = {
  // Criar novo orçamento
  async criarOrcamento(orcamentoData) {
    try {
      console.log('Salvando orçamento no Firebase...', orcamentoData);
      
      const docRef = await addDoc(orcamentosRef, {
        ...orcamentoData,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        versao: orcamentoData.metadata?.versao || 1
      });
      
      console.log('Orçamento salvo com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      throw new Error(`Falha ao salvar orçamento: ${error.message}`);
    }
  },

  // Buscar todos os orçamentos
  async listarOrcamentos() {
    try {
      console.log('Buscando orçamentos do Firebase...');
      
      const q = query(orcamentosRef, orderBy('criadoEm', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const orcamentos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`${orcamentos.length} orçamentos encontrados`);
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
      
      const docRef = doc(db, 'orcamentos', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('Orçamento encontrado');
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        console.log('Orçamento não encontrado');
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      throw new Error(`Falha ao carregar orçamento: ${error.message}`);
    }
  },

  // Atualizar orçamento
  async atualizarOrcamento(id, orcamentoData) {
    try {
      console.log('Atualizando orçamento:', id);
      
      const docRef = doc(db, 'orcamentos', id);
      await updateDoc(docRef, {
        ...orcamentoData,
        atualizadoEm: new Date()
      });
      
      console.log('Orçamento atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw new Error(`Falha ao atualizar orçamento: ${error.message}`);
    }
  },

  // Excluir orçamento
  async excluirOrcamento(id) {
    try {
      console.log('Excluindo orçamento:', id);
      
      const docRef = doc(db, 'orcamentos', id);
      await deleteDoc(docRef);
      
      console.log('Orçamento excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      throw new Error(`Falha ao excluir orçamento: ${error.message}`);
    }
  }
};
