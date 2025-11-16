import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

if (window.firebase && firebase.apps.length) {
  console.log("♻️ Reutilizando instância Firebase do portal existente");
} else {
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
}

export const app = firebase.app();
export const auth = firebase.auth();
export const db = firebase.firestore();
