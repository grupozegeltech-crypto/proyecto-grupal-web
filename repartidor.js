// ==========================================
// IMPORTAR FIREBASE
// ==========================================

import {

    initializeApp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

    getFirestore,

    collection,

    getDocs,

    doc,

    updateDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

    getAuth,

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ==========================================
// CONFIGURACIÓN FIREBASE
// (Pega aquí la misma configuración que usas
// en admin.js y pedido.js)
// ==========================================

const firebaseConfig = {

    apiKey: "AIzaSyA_W8I3jAlW6jIxfW2MrhpX9kVgtaZ6-kQ",

    authDomain: "lavaexpress-lima.firebaseapp.com",

    projectId: "lavaexpress-lima",

    storageBucket: "lavaexpress-lima.firebasestorage.app",

    messagingSenderId: "1028137831114",

    appId: "1:1028137831114:web:ebecf5c5d7a32266db0233"

};


// ==========================================
// INICIALIZAR FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

// ==========================================
// CONTENEDOR DE PEDIDOS
// ==========================================

const listaPedidos =

    document.getElementById("listaPedidos");

const seccionDashboard =
    document.getElementById("seccionDashboard");

const seccionPedidos =
    document.getElementById("seccionPedidos");

const menuDashboard =
    document.getElementById("menuDashboard");

const menuPedidos =
    document.getElementById("menuPedidos");

const menuPagos =
    document.getElementById("menuPagos");

const totalPedidos =
    document.getElementById("totalPedidos");

const pendientesPago =
    document.getElementById("pendientesPago");

const pedidosPagados =
    document.getElementById("pedidosPagados");


// ==========================================
// CUANDO CARGA LA PÁGINA
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ===========================
    // MOSTRAR FECHA ACTUAL
    // ===========================

    const fechaActual = document.getElementById("fechaActual");

    const hoy = new Date();

    fechaActual.textContent =

        hoy.toLocaleDateString("es-PE", {

            weekday: "long",

            day: "numeric",

            month: "long",

            year: "numeric"

        });

});



// ===========================
// BOTÓN RECOJOS
// ===========================

document
    .getElementById("btnRecojos")
    .addEventListener("click", () => {

        cargarPedidos("pendiente");

    });

// ===========================
// BOTÓN ENTREGAS
// ===========================

document
    .getElementById("btnEntregas")
    .addEventListener("click", () => {

        cargarPedidos("listo");

    });


// ==========================================
// MOSTRAR USUARIO
// ==========================================

onAuthStateChanged(auth, (user) => {


    console.log("Correo:", user.email);
    console.log("UID:", user.uid);

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    if (

        user.email !== "lavaexpressrepartidor1@gmail.com"

        &&

        user.email !== "lavaexpressrepartidor2@gmail.com"

    ) {

        alert("Acceso denegado");

        window.location.href = "login.html";

        return;

    }

    document.getElementById("nombreRepartidor").textContent =

        user.displayName ||

        user.email;

    mostrarDashboard();

    cargarDashboard();

});

// ==========================================
// CARGAR PEDIDOS
// ==========================================

async function cargarPedidos(tipo = "pendiente") {



    listaPedidos.innerHTML = "";

    const consulta =

        await getDocs(

            collection(db, "pedidos")

        );

    consulta.forEach((doc) => {

        const pedido = doc.data();

        // Solo mostrar el estado seleccionado

        if (pedido.estado.toLowerCase() !== tipo.toLowerCase()) {

            return;

        }

        const correoRepartidor = auth.currentUser.email;

        if (
            tipo === "pendiente" &&
            (
                pedido.repartidorRecojo !== correoRepartidor ||
                pedido.pago === "pagado"
            )
        ) {
            return;
        }

        if (
            tipo === "listo" &&
            (
                pedido.repartidorEntrega !== correoRepartidor ||
                pedido.entregado
            )
        ) {
            return;
        }

        let contenidoExtra = "";

        if (tipo === "pendiente") {

            contenidoExtra = `

        <hr>

        <h3>🧺 Servicios</h3>

        <p>${pedido.servicios?.join(", ") || "Sin servicios"}</p>

        <hr>

        <h3>👕 Prendas</h3>

        <p>👕 Polos: ${pedido.polos || 0}</p>

        <p>👔 Camisas: ${pedido.camisas || 0}</p>

        <p>👖 Pantalones: ${pedido.pantalones || 0}</p>

        <p>🧥 Casacas: ${pedido.casacas || 0}</p>

        <p>🧶 Chompas: ${pedido.chompas || 0}</p>

        <hr>

        <h3>⚖️ Peso de la ropa</h3>

        <input

            type="number"

            class="peso-input"

            placeholder="Peso en kg"

            step="0.1"

            min="0"

            data-precio="5"

        >

        <p>

            Precio por kilo:

            <strong>S/ 5.00</strong>

        </p>

        <h2 class="total-pagar">

    Total:
    <span class="precio-total">

        S/ 0.00

    </span>

</h2>

        <hr>

        <h3>💳 Método de Pago</h3>

<select class="metodo-pago">

    <option>Efectivo</option>

    <option>Yape</option>

    <option>Plin</option>

    <option>Tarjeta</option>

</select>

<div class="contenedor-qr" style="display:none;">

    <br>

    <h4>Escanee el código QR</h4>

    <img
        class="imagen-qr"
        src=""
        width="220">

</div>

<br>

<button class="btn-calcular">

    💰 Calcular Pago

</button>

<br>

<button
    class="btn-confirmar"
    style="display:none;">

    ✅ Pago Realizado

</button>

<br>



    `;

        } else {

            const totalPrendas =

                (pedido.polos || 0) +

                (pedido.camisas || 0) +

                (pedido.pantalones || 0) +

                (pedido.casacas || 0) +

                (pedido.chompas || 0);

            contenidoExtra = `

        <hr>

        <h3>🧺 Servicios</h3>

        <p>${pedido.servicios?.join(", ") || "Sin servicios"}</p>

        <hr>

        <h3>👕 Prendas</h3>

        <p>👕 Polos: ${pedido.polos || 0}</p>

        <p>👔 Camisas: ${pedido.camisas || 0}</p>

        <p>👖 Pantalones: ${pedido.pantalones || 0}</p>

        <p>🧥 Casacas: ${pedido.casacas || 0}</p>

        <p>🧶 Chompas: ${pedido.chompas || 0}</p>

        <hr>

        <h2>

            🧺 Total de prendas: ${totalPrendas}

        </h2>

        <br>

        <button class="btn-entregado">

            🚚 Ropa Entregada

        </button>

    `;

        }

        listaPedidos.innerHTML += `

<div class="pedido-card" data-id="${doc.id}">

    <h2>

        🎫 Ticket: ${pedido.ticket}

    </h2>

    <p>

        <strong>👤 Cliente:</strong>

        ${pedido.nombre || "Sin nombre"}

    </p>

    <p>

        <strong>📱 Teléfono:</strong>

        ${pedido.telefono || "-"}

    </p>

    <p>

        <strong>📍 Dirección:</strong>

        ${pedido.direccion}

    </p>

    ${contenidoExtra}

</div>

`;

    });

}

// ==========================================
// CAMBIAR ENTRE SECCIONES
// ==========================================

function mostrarDashboard() {

    seccionDashboard.style.display = "block";

    seccionPedidos.style.display = "none";

    document.getElementById("seccionPagos").style.display = "none";

}

function mostrarPedidos() {

    seccionDashboard.style.display = "none";

    seccionPedidos.style.display = "block";

    document.getElementById("seccionPagos").style.display = "none";

}

// ==========================================
// MENÚ LATERAL
// ==========================================

menuDashboard.addEventListener("click", () => {

    mostrarDashboard();

    listaPedidos.innerHTML = "";

});

menuPedidos.addEventListener("click", () => {

    mostrarPedidos();

    listaPedidos.innerHTML = "";

});

menuPagos.addEventListener("click", () => {

    seccionDashboard.style.display = "none";

    seccionPedidos.style.display = "none";

    document.getElementById("seccionPagos").style.display = "block";

    cargarPagos();

});

// ==========================================
// DASHBOARD
// ==========================================

async function cargarDashboard() {

    const consulta = await getDocs(
        collection(db, "pedidos")
    );

    let asignados = 0;
    let pendientes = 0;
    let pagados = 0;

    consulta.forEach((doc) => {

        const pedido = doc.data();

        const correoRepartidor = auth.currentUser.email;

        // ======================================
        // PEDIDOS ASIGNADOS
        // ======================================

        // Recojos pendientes de cobrar
        if (

            pedido.estado?.toLowerCase() === "pendiente" &&

            pedido.repartidorRecojo === correoRepartidor &&

            pedido.pago !== "pagado"

        ) {

            asignados++;

        }

        // Entregas pendientes de entregar
        if (

            pedido.estado?.toLowerCase() === "listo" &&

            pedido.repartidorEntrega === correoRepartidor &&

            !pedido.entregado

        ) {

            asignados++;

        }

        // Contar solo los pagos de los pedidos asignados a este repartidor
        const perteneceAlRepartidor =

            (pedido.estado?.toLowerCase() === "pendiente" &&
                pedido.repartidorRecojo === correoRepartidor)

            ||

            (pedido.estado?.toLowerCase() === "listo" &&
                pedido.repartidorEntrega === correoRepartidor);

        if (perteneceAlRepartidor) {

            if (pedido.pago === "pendiente") {

                pendientes++;

            }

            if (

                pedido.pago === "pagado"

                &&

                pedido.repartidorPago === correoRepartidor

            ) {

                pagados++;

            }

        }

    });

    totalPedidos.textContent = asignados;

    pendientesPago.textContent = pendientes;

    pedidosPagados.textContent = pagados;

}

// ==========================================
// MOSTRAR QR SEGÚN EL MÉTODO DE PAGO
// ==========================================

document.addEventListener("change", (e) => {

    if (!e.target.classList.contains("metodo-pago")) return;

    const tarjeta =
        e.target.closest(".pedido-card");

    const qr =
        tarjeta.querySelector(".contenedor-qr");

    const imagen =
        tarjeta.querySelector(".imagen-qr");

    if (e.target.value === "Yape") {

        qr.style.display = "block";

        imagen.src = "QR.jpg";

    }

    else if (e.target.value === "Plin") {

        qr.style.display = "block";

        imagen.src = "QR.jpg";

    }

    else {

        qr.style.display = "none";

    }

});

// ==========================================
// CALCULAR TOTAL
// ==========================================

document.addEventListener("click", (e) => {

    if (!e.target.classList.contains("btn-calcular")) return;

    const tarjeta =
        e.target.closest(".pedido-card");

    const peso =
        tarjeta.querySelector(".peso-input");

    const total =
        tarjeta.querySelector(".precio-total");

    const botonPago =
        tarjeta.querySelector(".btn-confirmar");

    const kilos =
        parseFloat(peso.value);

    if (isNaN(kilos) || kilos <= 0) {

        alert("Ingrese un peso válido.");

        return;

    }

    const precio = kilos * 5;

    total.textContent =
        "S/ " + precio.toFixed(2);

    e.target.style.display = "none";

    botonPago.style.display = "block";

    console.log(botonPago);

});

// ==========================================
// REGISTRAR PAGO
// ==========================================

document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("btn-confirmar")) return;

    const tarjeta = e.target.closest(".pedido-card");

    const idPedido = tarjeta.dataset.id;

    const metodo = tarjeta.querySelector(".metodo-pago").value;

    const total = parseFloat(
        tarjeta.querySelector(".precio-total")
            .textContent
            .replace("S/", "")
            .trim()
    );

    try {

        await updateDoc(

            doc(db, "pedidos", idPedido),

            {

                pago: "pagado",

                metodoPago: metodo,

                total: total,

                repartidorPago: auth.currentUser.email,

                fechaPago: new Date().toISOString()

            }

        );

        Swal.fire({

            icon: "success",

            title: "¡Pago registrado!",

            html: `
        <b>El pago fue registrado correctamente.</b><br><br>
        El administrador ya puede visualizar este pago en el panel de <b>Gestión de Pagos</b>.
    `,

            confirmButtonText: "Aceptar",

            confirmButtonColor: "#0071e3"

        });

        const boton = e.target;

        boton.disabled = true;

        boton.innerHTML = "✔ Pago Confirmado";

        boton.style.background = "#6b7280";

        boton.style.cursor = "not-allowed";

        boton.style.border = "none";

        boton.style.opacity = "0.9";

        cargarDashboard();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});

// ==========================================
// ROPA ENTREGADA
// ==========================================

document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("btn-entregado")) return;

    const tarjeta = e.target.closest(".pedido-card");

    const idPedido = tarjeta.dataset.id;

    const confirmar = await Swal.fire({

        icon: "question",

        title: "¿Confirmar entrega?",

        text: "¿El cliente recibió correctamente su pedido?",

        showCancelButton: true,

        confirmButtonText: "Sí, entregar",

        cancelButtonText: "Cancelar",

        confirmButtonColor: "#16a34a"

    });

    if (!confirmar.isConfirmed) return;

    const ahora = new Date();

    await updateDoc(

        doc(db, "pedidos", idPedido),

        {

            entregado: true,

            fechaEntregado: ahora.toISOString().split("T")[0],

            horaEntregado: ahora.toTimeString().substring(0, 5)

        }

    );

    Swal.fire({

        icon: "success",

        title: "Entrega registrada",

        text: "El pedido fue entregado correctamente."

    });

    tarjeta.remove();

    cargarDashboard();

});

// ==========================================
// CARGAR PAGOS DEL REPARTIDOR
// ==========================================

async function cargarPagos(tipo = "historial") {

    const listaPagos =
        document.getElementById("listaPagos");

    listaPagos.innerHTML = "";

    const consulta =
        await getDocs(collection(db, "pedidos"));

    const correo =
        auth.currentUser.email;

    let cobradoHoy = 0;
    let pendientes = 0;
    let pagados = 0;

    const hoy = new Date().toDateString();

    consulta.forEach((docu) => {

        


        const pedido = docu.data();

        // ======================================
// PAGOS PENDIENTES
// ======================================

if (

    tipo === "pendientes"

    &&

    pedido.repartidorRecojo === correo

    &&

    pedido.pago === "pendiente"

) {

    listaPagos.innerHTML += `

<div class="pedido-card">

    <h2>

        🎫 ${pedido.ticket}

    </h2>

    <p>

        <strong>👤 Cliente:</strong>

        ${pedido.nombre}

    </p>

    <p>

        <strong>📍 Dirección:</strong>

        ${pedido.direccion}

    </p>

    <p>

        <strong>💳 Método:</strong>

        ${pedido.metodoPago || "-"}

    </p>

    <p>

        <strong>💰 Total:</strong>

        S/ ${Number(pedido.total || 0).toFixed(2)}

    </p>

    <p style="color:#d97706;font-weight:bold;">

        ⏳ Pago pendiente

    </p>

</div>

`;

    pendientes++;

    return;

}

        // Solo pagos de ESTE repartidor
        if (pedido.repartidorPago !== correo) return;

        pagados++;

        const total =
            Number(pedido.total || 0);

        const fechaPago =
            pedido.fechaPago
                ? new Date(pedido.fechaPago)
                : null;

        if (

            fechaPago &&

            fechaPago.toDateString() === hoy

        ) {

            cobradoHoy += total;

        }

        listaPagos.innerHTML += `

<div class="pedido-card">

    <h2>

        🎫 ${pedido.ticket}

    </h2>

    <p>

        <strong>Cliente:</strong>

        ${pedido.nombre}

    </p>

    <p>

        <strong>Método:</strong>

        ${pedido.metodoPago}

    </p>

    <p>

        <strong>Total:</strong>

        S/ ${total.toFixed(2)}

    </p>

    <p>

        <strong>Fecha:</strong>

        ${fechaPago
            ? fechaPago.toLocaleDateString("es-PE")
            : "-"}

    </p>

    <p style="color:green;font-weight:bold;">

        ✔ Pago confirmado

    </p>

</div>

`;

    });

    consulta.forEach((docu) => {

        const pedido = docu.data();

        if (

            pedido.repartidorRecojo === correo &&

            pedido.pago === "pendiente"

        ) {

            pendientes++;

        }

    });

    document.getElementById("totalCobradoHoy").textContent =

        "S/ " + cobradoHoy.toFixed(2);

    document.getElementById("totalPendientes").textContent =

        pendientes;

    document.getElementById("totalPagados").textContent =

        pagados;

}

// ==========================================
// BOTONES DEL MÓDULO PAGOS
// ==========================================

document

    .getElementById("btnPagosPendientes")

    .addEventListener("click", () => {

        cargarPagos("pendientes");

    });

document

    .getElementById("btnHistorialPagos")

    .addEventListener("click", () => {

        cargarPagos("historial");

    });