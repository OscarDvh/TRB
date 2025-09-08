import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCztPWjSUqMq3Jkrp8pBbnFruAtyTrzDGA",
  authDomain: "sistematrb.firebaseapp.com",
  projectId: "sistematrb",
  storageBucket: "sistematrb.firebasestorage.app",
  messagingSenderId: "397698272912",
  appId: "1:397698272912:web:b4866212140b331052d215",
  measurementId: "G-4D0RZ7BD1K"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elementos
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorEl = document.getElementById("login-error");

// Evento login
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return; // 🔹 prevención extra

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/";
    } catch (error) {
      alert("Usuario o contraseña incorrectos");
      console.error(error.message);
    }
  });
});


// Verificar si hay sesión activa
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuario logeado:", user.email);
    // Si ya está logeado, podrías redirigir directo al dashboard
    window.location.href = "/";
  }
});
