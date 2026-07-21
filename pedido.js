import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    addDoc,
    collection,
    getDocs,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA_W8I3jAlW6jIxfW2MrhpX9kVgtaZ6-kQ",
    authDomain: "lavaexpress-lima.firebaseapp.com",
    projectId: "lavaexpress-lima",
    storageBucket: "lavaexpress-lima.firebasestorage.app",
    messagingSenderId: "1028137831114",
    appId: "1:1028137831114:web:ebecf5c5d7a32266db0233"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

const selectedServices = [];

const params =
    new URLSearchParams(
        window.location.search
    );

const modoEditar =
    params.get("editar");

let ticketEditar = null;

// ==========================
// CARGAR DATOS PARA EDITAR
// ==========================

if (modoEditar === "true") {

    onAuthStateChanged(
        auth,
        async (usuario) => {

            if (!usuario) {
                return;
            }

            const pedidos =
                await getDocs(

                    query(
                        collection(db, "pedidos"),

                        where(
                            "correo",
                            "==",
                            usuario.email
                        ),

                        where(
                            "estado",
                            "==",
                            "pendiente"
                        )

                    )

                );

            if (pedidos.empty) {
                return;
            }

            const pedido =
                pedidos.docs[0];

            const datos =
                pedido.data();

            ticketEditar =
                pedido.id;

            // ======================================
            // CARGAR NOMBRE DEL CLIENTE
            // ======================================

            document.getElementById(
                "nombreCliente"
            ).value =
                datos.nombre || "";

            // ======================================
            // CARGAR TELÉFONO
            // ======================================

            document.getElementById(
                "telefonoCliente"
            ).value =
                datos.telefono || "";

            document.getElementById(
                "direccion"
            ).value =
                datos.direccion || "";

            document.getElementById(
                "fechaRecojo"
            ).value =
                datos.fecha || "";

            document.getElementById(
                "polos"
            ).value =
                datos.polos || 0;

            document.getElementById(
                "camisas"
            ).value =
                datos.camisas || 0;

            document.getElementById(
                "pantalones"
            ).value =
                datos.pantalones || 0;

            document.getElementById(
                "casacas"
            ).value =
                datos.casacas || 0;

            document.getElementById(
                "chompas"
            ).value =
                datos.chompas || 0;

            document.getElementById(
                "observaciones"
            ).value =
                datos.observaciones || "";

            document.querySelector(
                ".submit-btn"
            ).textContent =
                "Guardar Cambios";

        }

    );

}

// ==========================
// SELECCIÓN DE SERVICIOS
// ==========================

document.querySelectorAll('.service-card').forEach(card => {

    card.addEventListener('click', () => {

        const service = card.dataset.service;

        card.classList.toggle('active');

        if (selectedServices.includes(service)) {

            const index =
                selectedServices.indexOf(service);

            selectedServices.splice(index, 1);

        } else {

            selectedServices.push(service);

        }

    });

});

// ==========================
// REGISTRAR PEDIDO
// ==========================

document.getElementById('pedidoForm')
    .addEventListener('submit', async (e) => {

        e.preventDefault();

        // ======================================
        // DATOS DEL CLIENTE
        // Obtiene el nombre y teléfono escritos
        // por el usuario.
        // ======================================

        const nombreCliente =
            document.getElementById("nombreCliente")
                .value
                .trim();

        const telefonoCliente =
            document.getElementById("telefonoCliente")
                .value
                .trim();

        const direccion =
            document.getElementById('direccion')
                .value
                .trim();

        const fecha =
            document.getElementById('fechaRecojo')
                .value;

        const observaciones =
            document.getElementById('observaciones')
                .value
                .trim();

        const polos =
            parseInt(document.getElementById('polos').value) || 0;

        const camisas =
            parseInt(document.getElementById('camisas').value) || 0;

        const pantalones =
            parseInt(document.getElementById('pantalones').value) || 0;

        const casacas =
            parseInt(document.getElementById('casacas').value) || 0;

        const chompas =
            parseInt(document.getElementById('chompas').value) || 0;

        const totalPrendas =
            polos +
            camisas +
            pantalones +
            casacas +
            chompas;

        // ==========================
        // CÁLCULO DEL TOTAL
        // ==========================

        const precioPorPrenda = 5;

        const totalPagar =
            totalPrendas * precioPorPrenda;

        // ======================================
        // VALIDACIÓN DEL NOMBRE
        // ======================================

        if (nombreCliente === "") {

            Swal.fire({

                icon: "warning",

                title: "Nombre requerido",

                text: "Debes ingresar tu nombre.",

                confirmButtonColor: "#0071e3"

            });

            return;

        }

        // ======================================
        // VALIDACIÓN DEL TELÉFONO
        // ======================================

        if (telefonoCliente === "") {

            Swal.fire({

                icon: "warning",

                title: "Teléfono requerido",

                text: "Debes ingresar tu número de teléfono.",

                confirmButtonColor: "#0071e3"

            });

            return;

        }

        if (direccion === "") {

            Swal.fire({
                icon: 'warning',
                title: 'Dirección requerida',
                text: 'Debes ingresar la dirección de recojo.',
                confirmButtonColor: '#0071e3'
            });

            return;

        }

        if (fecha === "") {

            Swal.fire({
                icon: 'warning',
                title: 'Fecha requerida',
                text: 'Debes seleccionar fecha y hora.',
                confirmButtonColor: '#0071e3'
            });

            return;

        }

        if (totalPrendas < 5) {

            Swal.fire({
                icon: 'warning',
                title: 'Cantidad insuficiente',
                text: 'Debes registrar al menos 5 prendas en total.',
                confirmButtonColor: '#0071e3'
            });

            return;

        }

        if (selectedServices.length === 0) {

            Swal.fire({
                icon: 'warning',
                title: 'Servicio requerido',
                text: 'Debes seleccionar al menos un servicio.',
                confirmButtonColor: '#0071e3'
            });

            return;

        }

        try {

            const ticket =
                "T-" +
                Math.floor(
                    100000 + Math.random() * 900000
                );

            const usuario =
                auth.currentUser;

            if (modoEditar === "true" && ticketEditar) {
//CREACIÓN
                await updateDoc(

                    doc(db, "pedidos", ticketEditar),

                    {

                        nombre: nombreCliente,
                        telefono: telefonoCliente,
                        direccion,
                        fecha,
                        servicios: selectedServices,
                        polos,
                        camisas,
                        pantalones,
                        casacas,
                        chompas,
                        observaciones
                    }

                );

                await Swal.fire({
                    icon: 'success',
                    title: 'Cambios guardados',
                    text: 'Tu pedido fue actualizado correctamente.',
                    confirmButtonColor: '#0071e3'
                });

                window.location.href = "index.html";

                return;

            }
//verifica que no tenga otro pedido pendiente
            const pedidosPendientes =
                await getDocs(

                    query(
                        collection(db, "pedidos"),

                        where(
                            "correo",
                            "==",
                            usuario?.email
                        ),

                        where(
                            "estado",
                            "==",
                            "pendiente"
                        )

                    )

                );

            if (!pedidosPendientes.empty) {

                Swal.fire({
                    icon: 'warning',
                    title: 'Pedido pendiente',
                    text: 'Ya tienes un pedido pendiente. Debes esperar a que sea procesado.',
                    confirmButtonColor: '#0071e3'
                });

                return;

            }
//CREACIÓN
            await setDoc(
                doc(db, "pedidos", ticket),
                {

                    // ==========================
                    // DATOS DEL PEDIDO
                    // ==========================

                    ticket: ticket,

                    tipoPedido: "domicilio",

                    // Nombre escrito por el cliente
                    nombre: nombreCliente,

                    // Teléfono del cliente
                    telefono: telefonoCliente,

                    // Correo del usuario autenticado
                    correo:
                        usuario?.email ||
                        "Sin correo",

                    direccion:
                        direccion,

                    fecha:
                        fecha,

                    servicios:
                        selectedServices,
                    polos:
                        polos,

                    camisas:
                        camisas,

                    pantalones:
                        pantalones,

                    casacas:
                        casacas,

                    chompas:
                        chompas,

                    observaciones:
                        observaciones,

                    estado:
                        "pendiente",

                    fechaCreacion:
                        new Date().toISOString()

                    ,

                    total: totalPagar,

                    pago: "pendiente",

                    metodoPago: "",

                    fechaPago: "",

                    repartidorPago: ""
                }
            );

            await addDoc(collection(db, "notificaciones"), {

                tipo: "nuevoPedido",

                ticket: ticket,

                cliente: nombreCliente,

                telefono: telefonoCliente,

                correo: usuario?.email || "",

                servicios: selectedServices,

                fecha: serverTimestamp(),

                leido: false

            });

            localStorage.setItem(
                "ultimoTicket",
                ticket
            );
//SE LE DA UN TICKET
            await Swal.fire({
                icon: 'success',
                title: 'Pedido registrado',
                html: `
                <b>Tu ticket es:</b>
                <br><br>
                <h2>${ticket}</h2>
            `,
                confirmButtonColor: '#0071e3'

            }).then(() => {

                window.location.replace("index.html");
            });



            document.getElementById(
                'pedidoForm'
            ).reset();

            selectedServices.length = 0;

            document
                .querySelectorAll('.service-card')
                .forEach(card => {

                    card.classList.remove(
                        'active'
                    );

                });

        } catch (error) {

            console.error(
                "ERROR FIREBASE:",
                error
            );

            Swal.fire({
                icon: 'error',
                title: 'Error al registrar',
                text: error.message,
                confirmButtonColor: '#0071e3'
            });

        }

    });