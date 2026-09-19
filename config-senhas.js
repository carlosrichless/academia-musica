// Importa o Firebase SDK modular necessário
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Suas credenciais reais do projeto
const firebaseConfig = {
    apiKey: "AIzaSyCJmDAe7ExanZcj2zle56FDkhV7fvtD3mw",
    authDomain: "academia-musica-6e634.firebaseapp.com",
    projectId: "academia-musica-6e634",
    storageBucket: "academia-musica-6e634.firebasestorage.app",
    messagingSenderId: "712681985133",
    appId: "1:712681985133:web:2842a3e0dbc67fce5c9b64",
    measurementId: "G-8710PQNPNP"
};

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.db = db; // Disponibiliza globalmente para os scripts antigos do painel
