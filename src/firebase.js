import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyABTYjJJ-uLwFhY1AkFlRXTaTaxL2dlBj0",
    authDomain: "kisoco-manager.firebaseapp.com",
    projectId: "kisoco-manager",
    storageBucket: "kisoco-manager.firebasestorage.app",
    messagingSenderId: "175109464253",
    appId: "1:175109464253:web:48bf45adf297fd2bc6d7d4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);