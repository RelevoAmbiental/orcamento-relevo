// src/firebase/config.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔧 Projeto unificado: portal-relevo
const firebaseConfig = {
  apiKey: "AIzaSyBcQi5nToMOGVDBWprhhOY0NSJX4qE100w",
  authDomain: "portal-relevo.firebaseapp.com",
  projectId: "portal-relevo",
  storageBucket: "portal-relevo.firebasestorage.app",
  messagingSenderId: "182759626683",
  appId: "1:182759626683:web:2dde2eeef910d4c288569e",
  measurementId: "G-W8TTP3D3YQ"
};

// ✅ Evita re-inicialização em hot-reload/dev
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// 🔐 Serviços exportados para a aplicação
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
