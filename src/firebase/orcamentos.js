// src/firebase/orcamentos.js
// Serviço centralizado de interação com o Firestore para os orçamentos

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig'; // importa a instância configurada do Firestore

const COLLECTION = 'orcamentos';

/**
 * Normaliza o documento para evitar campos undefined e manter compatibilidade com o contexto
 */
const normalizeDoc = (docSnap) => {
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
  };
};

/**
 * Lista todos os orçamentos
 * @returns {Promise<Array>} lista de orçamentos [{id, metadata, parametros, ...}]
 */
async function listarOrcamentos() {
  const ref = collection(db, COLLECTION);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(normalizeDoc).sort((a, b) => {
    const dataA = new Date(a?.metadata?.data || 0);
    const dataB = new Date(b?.metadata?.data || 0);
    return dataB - dataA; // mais recentes primeiro
  });
}

/**
 * Carrega um orçamento pelo ID
 * @param {string} id - ID do documento
 * @returns {Promise<Object|null>}
 */
async function carregarOrcamento(id) {
  if (!id) throw new Error('ID do orçamento não informado.');
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  return normalizeDoc(snap);
}

/**
 * Cria um novo orçamento
 * @param {Object} data - Estrutura completa do orçamento
 * @returns {Promise<string>} ID gerado
 */
async function criarOrcamento(data) {
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    ...data,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Atualiza um orçamento existente
 * @param {string} id - ID do documento
 * @param {Object} data - Estrutura completa atualizada
 * @returns {Promise<void>}
 */
async function atualizarOrcamento(id, data) {
  if (!id) throw new Error('ID do orçamento não informado.');
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    ...data,
    atualizadoEm: serverTimestamp(),
  });
}

/**
 * Exclui um orçamento
 * @param {string} id - ID do documento
 * @returns {Promise<void>}
 */
async function excluirOrcamento(id) {
  if (!id) throw new Error('ID do orçamento não informado.');
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}

// Exporta como um serviço organizado
export const orcamentoService = {
  listarOrcamentos,
  carregarOrcamento,
  criarOrcamento,
  atualizarOrcamento,
  excluirOrcamento,
};
