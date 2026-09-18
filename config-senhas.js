// CONFIGURAÇÃO DO FIREBASE (Global para o sistema)
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SUA_MESSAGING_SENDER_ID",
    appId: "SUA_APP_ID"
};

// Inicializa o Firebase e o Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
