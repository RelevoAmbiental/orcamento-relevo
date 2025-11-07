// src/hooks/useFirebase.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useFirebase = () => {
  // SALVAR orçamento no Firebase
  const salvarOrcamento = async (orcamentoData) => {
    try {
      const docRef = await addDoc(collection(db, 'orcamentos'), {
        ...orcamentoData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      return { success: false, error: error.message };
    }
  };

  // CARREGAR todos os orçamentos
  const carregarOrcamentos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orcamentos'));
      const orcamentos = [];
      querySnapshot.forEach((doc) => {
        orcamentos.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: orcamentos };
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      return { success: false, error: error.message };
    }
  };

  // EXCLUIR orçamento
  const excluirOrcamento = async (id) => {
    try {
      await deleteDoc(doc(db, 'orcamentos', id));
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      return { success: false, error: error.message };
    }
  };

  // ATUALIZAR orçamento
  const atualizarOrcamento = async (id, orcamentoData) => {
    try {
      await updateDoc(doc(db, 'orcamentos', id), {
        ...orcamentoData,
        updatedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    salvarOrcamento,
    carregarOrcamentos,
    excluirOrcamento,
    atualizarOrcamento
  };
};