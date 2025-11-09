// src/firebase/orcamentos.js
// Serviços de CRUD para orçamentos armazenados no Firestore

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { firebaseApp } from "./firebaseConfig";

const db = getFirestore(firebaseApp);
const collectionName = "orcamentos";
const orcamentosRef = collection(db, collectionName);

// Cria um novo orçamento
export async function criarOrcamento(data) {
  const docRef = await addDoc(orcamentosRef, data);
  return docRef.id;
}

// Atualiza um orçamento existente
export async function atualizarOrcamento(id, data) {
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, data);
}

// Carrega um orçamento específico
export async function carregarOrcamento(id) {
  const ref = doc(db, collectionName, id);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// Lista todos os orçamentos
export async function listarOrcamentos() {
  const snapshot = await getDocs(orcamentosRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Exclui um orçamento
export async function excluirOrcamento(id) {
  const ref = doc(db, collectionName, id);
  await deleteDoc(ref);
}

// Exporta um objeto padrão para facilitar o uso no contexto
export const orcamentoService = {
  criarOrcamento,
  atualizarOrcamento,
  carregarOrcamento,
  listarOrcamentos,
  excluirOrcamento,
};

export default orcamentoService;
