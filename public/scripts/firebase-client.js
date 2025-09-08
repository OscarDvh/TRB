import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCztPWjSUqMq3Jkrp8pBbnFruAtyTrzDGA",
  authDomain: "sistematrb.firebaseapp.com",
  projectId: "sistematrb",
  storageBucket: "sistematrb.firebasestorage.app",
  messagingSenderId: "397698272912",
  appId: "1:397698272912:web:b4866212140b331052d215",
  measurementId: "G-4D0RZ7BD1K"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);   // 👈 ahora sí exportas auth