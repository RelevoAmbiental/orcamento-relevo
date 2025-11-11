// src/firebase/config.js - ARQUIVO COMPLETO ATUALIZADO
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔐 AUTENTICAÇÃO DO PORTAL (SEMPRE ESTA CONFIGURAÇÃO)
const authApp = initializeApp({
  apiKey: "AIzaSyBcQi5nToMOGVDBWprhhOY0NSJX4qE100w",
  authDomain: "portal-relevo.firebaseapp.com",
  projectId: "portal-relevo"
}, 'portal-auth');

// 💾 BANCO DE DADOS DOS ORÇAMENTOS (MANTENDO SUAS VARIÁVEIS DE AMBIENTE)
const dbApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}, 'orcamentos-db');

// Exportar serviços
export const auth = getAuth(authApp);    // 🔐 Autenticação do PORTAL
export const db = getFirestore(dbApp);   // 💾 Banco de dados dos ORÇAMENTOS
export default dbApp;
