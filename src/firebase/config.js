// src/firebase/config.js - VERSÃO UNIFICADA COM PORTAL
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔥 MESMO PROJETO DO PORTAL - CREDENCIAIS IDÊNTICAS
const firebaseConfig = {
  apiKey: "AIzaSyBcQi5nToMOGVDBWprhhOY0NSJX4qE100w",
  authDomain: "portal-relevo.firebaseapp.com",
  projectId: "portal-relevo",
  storageBucket: "portal-relevo.firebasestorage.app",
  messagingSenderId: "182759626683",
  appId: "1:182759626683:web:2dde2eeef910d4c288569e",
  measurementId: "G-W8TTP3D3YQ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('✅ Firebase configurado com projeto do Portal');
