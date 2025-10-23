// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA08iGRxwySBeaog5S8D6LuzUZmnBjOuYU",
    authDomain: "stock-manager-2cc92.firebaseapp.com",
    projectId: "stock-manager-2cc92",
    storageBucket: "stock-manager-2cc92.firebasestorage.app",
    messagingSenderId: "208753915989",
    appId: "1:208753915989:web:12ac112e80c47321a9fcdc",
    measurementId: "G-56ENW2N205"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
