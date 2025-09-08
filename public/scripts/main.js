import { db } from "./firebase-client.js";
import { jsPDF } from "https://cdn.skypack.dev/jspdf";

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { auth } from "./firebase-client.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// =================== TOAST ===================
function mostrarToast(mensaje, tipo = "success", duracion = 3000) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `alert shadow-lg ${
    tipo === "success" ? "alert-success" : tipo === "error" ? "alert-error" : "alert-info"
  }`;
  toast.innerHTML = `<div><span>${mensaje}</span></div>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duracion);
}

// =================== LOGOUT ===================
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "/login";
      } catch (error) {
        console.error("Error cerrando sesión:", error.message);
        alert("No se pudo cerrar sesión");
      }
    });
  }
});

// =================== SESIÓN ===================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/login";
  } else {
    console.log("Usuario autenticado:", user.email);
  }
});

// =================== FUNCIONES PRINCIPALES ===================
document.addEventListener("DOMContentLoaded", () => {
  const clientesRef = collection(db, "clientes");
  const form = document.getElementById("form-orden");
  const editarForm = document.getElementById("editar-form");
  const tablaBody = document.querySelector("#tabla-clientes tbody");
  const totalOrdenesEl = document.getElementById("totalOrdenes");
  const pendientesEl = document.getElementById("ordenesPendientes");
  const entregadasEl = document.getElementById("ordenesEntregadas");
  const contadorRef = doc(db, "counters", "ordenes"); // Documento para el contador

  // ===== Generar número de orden con transacción =====
  async function generarNumeroOrden() {
    let numeroOrden = "";
    await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(contadorRef);
      let ultimo = 0;
      if (counterSnap.exists()) {
        ultimo = counterSnap.data().ultimo;
      }
      const nuevo = ultimo + 1;
      transaction.set(contadorRef, { ultimo: nuevo });
      numeroOrden = `ORD-${nuevo.toString().padStart(4, "0")}`;
    });
    return numeroOrden;
  }

  // ===== Obtener datos del formulario =====
  function obtenerDatosFormulario(prefijo = "") {
    return {
      cliente: document.getElementById(`${prefijo}nombre`).value,
      correo: document.getElementById(`${prefijo}correo`).value,
      telefono: document.getElementById(`${prefijo}telefono`).value,
      marca: document.getElementById(`${prefijo}marca`).value,
      modelo: document.getElementById(`${prefijo}modelo`).value,
      numeroDeSerie: document.getElementById(`${prefijo}numeroDeSerie`).value,
      articulo: document.getElementById(`${prefijo}articulo`).value,
      precio: Number(document.getElementById(`${prefijo}precio`)?.value || 0),
      fechaIngreso: document.getElementById(`${prefijo}fechaIngreso`).value,
      fechaEntrega: document.getElementById(`${prefijo}fechaEntrega`).value,
      descripcion: document.getElementById(`${prefijo}descripcion`).value,
      notas: document.getElementById(`${prefijo}notas`)?.value || "",
      estado: "Pendiente",
    };
  }

  // ===== Generar PDF =====
  function generarOrdenPDF(orden) {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
    pdf.setFont("helvetica", "normal");

    const logo = new Image();
    logo.src = "/assets/logo.png";
    pdf.addImage(logo, "PNG", 12, 8, 25, 25);

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("TINTAS Y RECARGAS DEL BAJÍO", 105, 15, { align: "center" });
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text("C. Juan Caballero y Osio 248, Jardines de Querétaro,", 105, 20, { align: "center" });
    pdf.text("76020 Santiago de Querétaro, Qro.", 105, 25, { align: "center" });
    pdf.text("Tel: 442 248 2463 | Cel: 442 237 3569 | trbqro@hotmail.com", 105, 30, { align: "center" });
    pdf.line(10, 35, 205, 35);

    pdf.setFontSize(10);
    pdf.text(`Orden de entrada: ${orden.orden}`, 12, 42);
    pdf.text(`Fecha: ${orden.fecha}`, 160, 42);

    pdf.setFont("helvetica", "normal");
    pdf.rect(10, 45, 195, 35);
    pdf.text(`Nombre del cliente: ${orden.cliente}`, 12, 52);
    pdf.text(`Teléfono: ${orden.telefono ?? ''}`, 140, 52);
    pdf.text(`Correo: ${orden.correo ?? ''}`, 12, 59);
    pdf.text(`Artículo: ${orden.articulo ?? ''}`, 12, 66);
    pdf.text(`Marca: ${orden.marca ?? ''}`, 80, 66);
    pdf.text(`Modelo: ${orden.modelo ?? ''}`, 140, 66);
    pdf.text(`Serie: ${orden.numeroDeSerie ?? ''}`, 12, 73);

    pdf.rect(10, 82, 195, 20);
    pdf.text("Problema reportado:", 12, 89);
    pdf.setFont("helvetica", "italic");
    pdf.text(orden.descripcion ?? '', 12, 95);
    pdf.setFont("helvetica", "normal");

    pdf.rect(10, 105, 195, 20);
    pdf.text("Notas:", 12, 112);
    pdf.setFont("helvetica", "italic");
    pdf.text(orden.notas ?? '', 12, 118);
    pdf.setFont("helvetica", "normal");

    pdf.rect(10, 128, 195, 15);
    pdf.text(`Precio: $${orden.precio ?? 0}`, 12, 137);
    pdf.text(`Fecha de entrega: ${orden.fechaEntrega ?? ''}`, 120, 137);
// Firmas
pdf.rect(10, 148, 95, 20); // Caja para firma cliente
pdf.text("Firma del Cliente:_________________________", 12, 160);

pdf.rect(110, 148, 95, 20); // Caja para firma técnico
pdf.text("Firma del Técnico:_________________________", 112, 160);


    pdf.setFontSize(7);
    let condiciones = [
      "Sin presentar orden de servicio no se entrega equipo. A excepción de autorización y previa identificación.",
      "No se aceptan reclamos por equipos después de 60 días de haber ingresado al taller.",
      "El desarme de impresoras NO TIENE GARANTÍA. (Por depender del uso y tintas utilizadas).",
      "Los precios de servicio mínimo de equipo: $200 (Dos cientos pesos 00/100 M.N.).",
      "Equipos de uso pesado: $450 (Cuatro cientos cincuenta pesos 00/100 M.N.).",
      "Equipos no reparados en un plazo de 30 días estarán sujetos a revisión y cargo de $55 (cincuenta y cinco pesos 00/100 M.N.)."
    ];

    let y = 180;
    condiciones.forEach(linea => {
      pdf.text(linea, 12, y, { maxWidth: 190 });
      y += 5;
    });

      const pdfBlob = pdf.output("blob"); // crea un blob
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank"); // abre en nueva pestaña
  }

  // ===== CREAR NUEVA ORDEN =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const numeroOrden = await generarNumeroOrden();
      const datos = { ...obtenerDatosFormulario(), orden: numeroOrden, creado: new Date() };
      const docRef = await addDoc(clientesRef, datos);
      generarOrdenPDF({ ...datos, id: docRef.id, fecha: datos.fechaIngreso });
      form.reset();
      document.getElementById("nuevo-modal").checked = false;
      mostrarToast(`Orden ${datos.orden} creada correctamente.`, "success");
    } catch (err) {
      console.error("Error al guardar la orden:", err);
      mostrarToast("Error al crear la orden.", "error");
    }
  });

  // ===== EDITAR ORDEN =====
  editarForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = editarForm.dataset.id;
    const orden = document.getElementById("editar-orden").value; // input oculto
    const datos = obtenerDatosFormulario("editar-");
    try {
      const docRef = doc(db, "clientes", id);
      await updateDoc(docRef, datos);
      document.getElementById("editar-modal").checked = false;

      mostrarToast(`Orden ${orden} actualizada correctamente.`, "success");
    } catch (err) {
      console.error("Error al actualizar la orden:", err);
      mostrarToast("Error al actualizar la orden.", "error");
    }
  });

  // ===== MOSTRAR ÓRDENES EN TIEMPO REAL =====
  onSnapshot(clientesRef, (querySnapshot) => {
    tablaBody.innerHTML = "";

    let total = 0;
    let pendientes = 0;
    let entregadas = 0;

    if (querySnapshot.empty) {
      tablaBody.innerHTML = `<tr><td colspan="12" class="text-center py-4">No hay órdenes</td></tr>`;
      totalOrdenesEl.textContent = 0;
      pendientesEl.textContent = 0;
      entregadasEl.textContent = 0;
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const c = docSnap.data();

      total++;
      if (c.estado === "En progreso" || c.estado === "Pendiente") pendientes++;
      if (c.estado === "Entregado") entregadas++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.orden}</td>
        <td>${c.cliente}</td>
        <td>${c.correo}</td>
        <td>${c.telefono ?? ""}</td>
        <td>${c.marca ?? ""}</td>
        <td>${c.modelo ?? ""}</td>
        <td>${c.numeroDeSerie ?? ""}</td>
        <td>${c.articulo ?? ""}</td>
        <td>${c.fechaIngreso}</td>
        <td>${c.fechaEntrega ?? ""}</td>
        <td>${c.descripcion ?? ""}</td>
        <td>
          <select class="select select-bordered select-sm estado-select" data-id="${docSnap.id}">
            <option value="En progreso" ${c.estado === "En progreso" ? "selected" : ""}>En progreso</option>
            <option value="Entregado" ${c.estado === "Entregado" ? "selected" : ""}>Entregado</option>
          </select>
        </td>
        <td>
          <button class="btn btn-sm btn-warning btn-editar" data-id="${docSnap.id}">Editar</button>
          <button class="btn btn-sm btn-primary btn-pdf" data-id="${docSnap.id}">PDF</button>
        </td>
      `;
      tablaBody.appendChild(tr);

      // PDF
      tr.querySelector(".btn-pdf").addEventListener("click", () => {
        generarOrdenPDF({ ...c, id: docSnap.id, fecha: c.fechaIngreso });
      });

      // Editar
      tr.querySelector(".btn-editar").addEventListener("click", () => {
        editarForm.dataset.id = docSnap.id;
        document.getElementById("editar-nombre").value = c.cliente;
        document.getElementById("editar-correo").value = c.correo;
        document.getElementById("editar-telefono").value = c.telefono ?? "";
        document.getElementById("editar-marca").value = c.marca ?? "";
        document.getElementById("editar-modelo").value = c.modelo ?? "";
        document.getElementById("editar-numeroDeSerie").value = c.numeroDeSerie ?? "";
        document.getElementById("editar-articulo").value = c.articulo ?? "";
        document.getElementById("editar-precio").value = c.precio ?? 0;
        document.getElementById("editar-fechaIngreso").value = c.fechaIngreso;
        document.getElementById("editar-fechaEntrega").value = c.fechaEntrega ?? "";
        document.getElementById("editar-descripcion").value = c.descripcion ?? "";
        document.getElementById("editar-notas").value = c.notas ?? "";
        document.getElementById("editar-orden").value = c.orden; // input oculto
        document.getElementById("editar-modal").checked = true;
      });

      // Cambio de estado
      tr.querySelector(".estado-select").addEventListener("change", async (e) => {
        const nuevoEstado = e.target.value;
        const docRef = doc(db, "clientes", docSnap.id);
        try {
          await updateDoc(docRef, { estado: nuevoEstado });

          if ((c.estado === "Pendiente" || c.estado === "En progreso") && nuevoEstado === "Entregado") {
            pendientes--;
            entregadas++;
          } else if (c.estado === "Entregado" && (nuevoEstado === "Pendiente" || nuevoEstado === "En progreso")) {
            pendientes++;
            entregadas--;
          }

          pendientesEl.textContent = pendientes;
          entregadasEl.textContent = entregadas;
          c.estado = nuevoEstado;

          mostrarToast(`Orden ${c.orden} ahora está "${nuevoEstado}"`, "info");
        } catch (err) {
          console.error("Error al actualizar el estado:", err);
          mostrarToast(`Error al actualizar la orden ${c.orden}`, "error");
        }
      });
    });

    totalOrdenesEl.textContent = total;
    pendientesEl.textContent = pendientes;
    entregadasEl.textContent = entregadas;
  });
});
