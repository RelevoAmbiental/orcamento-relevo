// src/firebase/config.js — versão modular com dados reais (.env)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCM4w5r60HHXLDS8tayldew0OfWXU3ZIJk",
  authDomain: "revelo-orcamentos.firebaseapp.com",
  projectId: "revelo-orcamentos",
  storageBucket: "revelo-orcamentos.firebasestorage.app",
  messagingSenderId: "256492526393",
  appId: "1:256492526393:web:81ff8efdd3c3accb9226e8"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Exporta instâncias para o resto do projeto
export { app, db, auth, firebaseConfig };
