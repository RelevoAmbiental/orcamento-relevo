// src/firebase/config.js — integração direta com o portal Relevo
// ---------------------------------------------------------------
// Este arquivo garante que o app de ORÇAMENTOS use o mesmo Firebase
// já inicializado pelo PORTAL (portal-relevo). Assim, a sessão Auth
// é compartilhada, e o usuário permanece logado entre módulos.
// ---------------------------------------------------------------

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// ✅ 1) Verifica se o portal já inicializou o Firebase
if (window.firebase && firebase.apps.length) {
  console.log("♻️ Reutilizando instância Firebase do portal existente");
} else {
  // 🚀 2) Inicializa o Firebase localmente (caso o portal ainda não tenha carregado)
  const firebaseConfig = {
    apiKey: "AIzaSyBcQi5nToMOGVDBWprhhOY0NSJX4qE100w",
    authDomain: "portal-relevo.firebaseapp.com",
    projectId: "portal-relevo",
    storageBucket: "portal-relevo.firebasestorage.app",
    messagingSenderId: "182759626683",
    appId: "1:182759626683:web:2dde2eeef910d4c288569e",
    measurementId: "G-W8TTP3D3YQ"
  };

  firebase.initializeApp(firebaseConfig);
  console.log("✅ Firebase compat inicializado (projeto portal-relevo)");
}

// ---------------------------------------------------------------
// 🔗 Exporta referências universais para uso no app React
// ---------------------------------------------------------------
export const app = firebase.app();
export const auth = firebase.auth();
export const db = firebase.firestore();

// ---------------------------------------------------------------
// 🧩 Diagnóstico rápido no console
// ---------------------------------------------------------------
console.log("📡 Firebase ativo:", app.name);
console.log("📁 Projeto conectado:", app.options.projectId);
console.log("👤 Usuário atual:", auth.currentUser ? auth.currentUser.email : "nenhum");
