// reiniciarContador.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { firebaseConfig } from "./public/scripts/firebase-client.js"; // tu config de Firebase

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencia al documento del contador
const contadorRef = doc(db, "counters", "ordenes");

// Función para reiniciar contador
async function reiniciarContador() {
  try {
    await setDoc(contadorRef, { ultimo: 0 });
    console.log("Contador reiniciado a ORD-0001 ✅");
    process.exit(0);
  } catch (err) {
    console.error("Error al reiniciar el contador:", err);
    process.exit(1);
  }
}

// Ejecutar
reiniciarContador();
