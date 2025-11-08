// src/firebase/orcamentos.js
import { db } from './config';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore';

const orcamentosRef = collection(db, 'orcamentos');

export const orcamentoService = {
  async criarOrcamento(orcamentoData) {
    const docRef = await addDoc(orcamentosRef, {
      ...orcamentoData,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
    return docRef.id;
  },

  async atualizarOrcamento(id, orcamentoData) {
    const ref = doc(db, 'orcamentos', id);
    await updateDoc(ref, {
      ...orcamentoData,
      atualizadoEm: serverTimestamp(),
    });
  },

  async excluirOrcamento(id) {
    const ref = doc(db, 'orcamentos', id);
    await deleteDoc(ref);
  },

  async listarOrcamentos() {
    const q = query(orcamentosRef, orderBy('atualizadoEm', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async carregarOrcamento(id) {
    const ref = doc(db, 'orcamentos', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  },
};
