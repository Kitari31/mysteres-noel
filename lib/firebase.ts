// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBqUKro6DLFPd8e1kPLIFWi9KmvwBW6NCw",
    authDomain: "mysteres-noel.firebaseapp.com",
    projectId: "mysteres-noel",
    storageBucket: "mysteres-noel.firebasestorage.app",
    messagingSenderId: "825722121505",
    appId: "1:825722121505:web:ebcc84dfe63c44cc872260"
  };

// Initialise Firebase uniquement si ce n’est pas déjà fait
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Export Auth et Firestore pour l’utiliser partout
export const auth = getAuth(app);
export const db = getFirestore(app);