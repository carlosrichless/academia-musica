import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCJmDAe7ExanZcj2zle56FDkhV7fvtD3mw",
    authDomain: "academia-musica-6e634.firebaseapp.com",
    projectId: "academia-musica-6e634",
    storageBucket: "academia-musica-6e634.firebasestorage.app",
    messagingSenderId: "712681985133",
    appId: "1:712681985133:web:2842a3e0dbc67fce5c9b64",
    measurementId: "G-8710PQNPNP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Disponibiliza globalmente
window.db = db;

// Disponibiliza também as funções necessárias
window.firestore = {
    doc,
    getDoc,
    setDoc
};

console.log("Firebase inicializado:", app.options.projectId);
