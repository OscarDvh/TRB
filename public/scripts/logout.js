import { auth } from "scripts/firebase-client.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      // Redirige al login
      window.location.href = "/login";
    } catch (error) {
      console.error("Error cerrando sesión:", error.message);
      alert("No se pudo cerrar sesión");
    }
  });
});
