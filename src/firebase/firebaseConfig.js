// src/firebase/firebaseConfig.js
// Configuração central do Firebase (usando variáveis de ambiente do Vite)

import { initializeApp } from "firebase/app";

// As chaves são injetadas no ambiente via .env.local ou GitHub Secrets
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa o app Firebase
export const firebaseApp = initializeApp(firebaseConfig);
