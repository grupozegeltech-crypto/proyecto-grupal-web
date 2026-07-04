import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    addDoc,
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

const serviciosNuevoPedido = [];
const auth = getAuth(app);

//==================================
// FECHA DEL DASHBOARD
//==================================

const fechaActual =
    document.getElementById("fechaActual");

const hoy = new Date();

const opciones = {

    weekday: "long",

    day: "numeric",

    month: "long",

    year: "numeric"

};

fechaActual.textContent =
    "Hoy es: " +

    hoy.toLocaleDateString("es-PE", opciones);

document.addEventListener('DOMContentLoaded', () => {

    onAuthStateChanged(auth, async (user) => {

        if (!user) {

            alert("Debes iniciar sesión.");

            window.location.href = "index.html";

            return;

        }

        if (user.email !== "grupo.zegel.tech@gmail.com") {

            alert("Acceso denegado.");

            window.location.href = "index.html";

            return;

        }

        const listaPedidos =
            document.getElementById('listaPedidos');

        const totalPedidos =
            document.getElementById('totalPedidos');
        const totalPendientes =
            document.getElementById('totalPendientes');
        const totalRecibidos =
            document.getElementById('totalRecibidos');

        const totalLavando =
            document.getElementById('totalLavando');

        const totalSecando =
            document.getElementById('totalSecando');

        const totalPlanchando =
            document.getElementById('totalPlanchando');

        const totalListos =
            document.getElementById('totalListos');

        const listaClientes =
            document.getElementById(
                'listaClientes'
            );

        const buscarCliente =
            document.getElementById(
                'buscarCliente'
            );

        const toggleClientes =
            document.getElementById(
                'toggleClientes'
            );

        const clientesContainer =
            document.getElementById(
                'clientesContainer'
            );

        const togglePedidos =
            document.getElementById(
                'togglePedidos'
            );

        const pedidosContainer =
            document.getElementById(
                'pedidosContainer'
            );

        try {

            const clientesSnapshot =
                await getDocs(
                    collection(db, "clientes")
                );

            const clientes = [];

            clientesSnapshot.forEach((docu) => {

                const cliente =
                    docu.data();

                clientes.push(cliente);


            });

            document.getElementById("totalClientes").textContent = clientes.length;

            function mostrarClientes(filtro = "") {

                listaClientes.innerHTML = "";

                clientes
                    .filter(cliente => {

                        const texto =
                            filtro.toLowerCase();

                        return (
                            cliente.nombre
                                ?.toLowerCase()
                                .includes(texto)

                            ||

                            cliente.correo
                                ?.toLowerCase()
                                .includes(texto)
                        );

                    })

                    .forEach(cliente => {

                        const card =
                            document.createElement("div");



                        card.classList.add(
                            "pedido-card"
                        );

                        card.innerHTML = `

<div class="cliente-card">

    <div class="cliente-icono">

        <i class="fas fa-user-circle"></i>

    </div>

    <div class="cliente-info">

        <h3>${cliente.nombre}</h3>

        <p>

            <i class="fas fa-envelope"></i>

            ${cliente.correo}

        </p>

        <small>

            <i class="fas fa-calendar-alt"></i>

            Registrado:
            ${new Date(cliente.fechaRegistro).toLocaleString("es-PE")}

        </small>

    </div>

    <div class="cliente-flecha">

        <i class="fas fa-chevron-right"></i>

    </div>

</div>

`;

                        card.style.cursor = "pointer";



                        card.addEventListener("click", async () => {

                            listaClientes.style.display = "none";

                            document.querySelector(".buscador-clientes").style.display = "none";

                            document.getElementById("detalleCliente").style.display = "block";

                            const contenido =
                                document.getElementById("contenidoDetalleCliente");

                            const pedidosSnapshot =
                                await getDocs(collection(db, "pedidos"));

                            let totalPedidos = 0;

                            let pendientes = 0;

                            let recibidos = 0;

                            let lavando = 0;

                            let secando = 0;

                            let planchando = 0;

                            let listos = 0;

                            let entregados = 0;

                            let historialHTML = "";

                            let telefonoCliente = "No registrado";

                            pedidosSnapshot.forEach((pedidoDoc) => {

                                const pedido = pedidoDoc.data();

                                if (pedido.correo !== cliente.correo) return;

                                if (pedido.telefono) {

                                    telefonoCliente = pedido.telefono;

                                }

                                totalPedidos++;


                                switch ((pedido.estado || "").toLowerCase()) {

                                    case "pendiente":
                                        pendientes++;
                                        break;

                                    case "recibido":
                                        recibidos++;
                                        break;

                                    case "lavando":
                                        lavando++;
                                        break;

                                    case "secando":
                                        secando++;
                                        break;

                                    case "planchando":
                                        planchando++;
                                        break;

                                    case "listo":
                                        listos++;
                                        break;


                                }

                                // Solo mostrar en el historial los pedidos terminados
                                if ((pedido.estado || "").toLowerCase() !== "listo") {
                                    return;
                                }

                                historialHTML += `
            <div class="pedido-card">

                <h3>🎫 ${pedido.ticket || "Sin código"}</h3>

                <p><strong>Estado:</strong> ${pedido.estado}</p>

                <p><strong>Fecha:</strong>
                    ${pedido.fechaCreacion
                                        ? new Date(pedido.fechaCreacion).toLocaleString("es-PE")
                                        : "Sin fecha"
                                    }
                </p>

                                <p><strong>Servicios:</strong> ${pedido.servicios
                                        ? pedido.servicios.join(", ")
                                        : "No registrado"
                                    }</p>

<p><strong>Prendas:</strong></p>

<ul>
    <li>👕 Polos: ${pedido.polos || 0}</li>
    <li>👔 Camisas: ${pedido.camisas || 0}</li>
    <li>👖 Pantalones: ${pedido.pantalones || 0}</li>
    <li>🧥 Casacas: ${pedido.casacas || 0}</li>
    <li>🧶 Chompas: ${pedido.chompas || 0}</li>
</ul>

<p>
<strong>📦 Total de prendas:</strong>
${(pedido.polos || 0)

                                    +

                                    (pedido.camisas || 0)

                                    +

                                    (pedido.pantalones || 0)

                                    +

                                    (pedido.casacas || 0)

                                    +

                                    (pedido.chompas || 0)

                                    }
</p>

<p><strong>📍 Dirección:</strong> ${pedido.direccion || "-"}</p>

<p><strong>📝 Observaciones:</strong> ${pedido.observaciones || "Sin observaciones"}</p>

            </div>
        `;

                            });

                            contenido.innerHTML = `

        <button id="volverClientes">
            ⬅ Volver a clientes
        </button>

        <h2>👤 ${cliente.nombre}</h2>

        <p><strong>📧 Correo:</strong> ${cliente.correo}</p>

        <p><strong>📱 Teléfono:</strong> ${telefonoCliente}</p>

        <hr>

        <p><strong>📦 Total pedidos:</strong> ${totalPedidos}</p>

        <p><strong>🟡 Pendientes:</strong> ${pendientes}</p>

        <p><strong>🔵 Recibidos:</strong> ${recibidos}</p>

        <p><strong>🟣 Lavando:</strong> ${lavando}</p>

        <p><strong>🟠 Secando:</strong> ${secando}</p>

        <p><strong>⚫ Planchando:</strong> ${planchando}</p>

        <p><strong>🟢 Listos:</strong> ${listos}</p>

        <hr>

        <h3>📦 Historial de pedidos</h3>

        ${historialHTML || "<p>Este cliente aún no tiene pedidos.</p>"}

    `;

                            document
                                .getElementById("volverClientes")
                                .addEventListener("click", () => {

                                    document.getElementById("detalleCliente").style.display = "none";

                                    listaClientes.style.display = "block";

                                    document.querySelector(".buscador-clientes").style.display = "flex";

                                });

                        });

                        listaClientes.appendChild(
                            card
                        );

                    });

            }

            mostrarClientes();

            toggleClientes.addEventListener(
                "click",
                () => {

                    if (
                        clientesContainer.style.display
                        === "none"
                    ) {

                        clientesContainer.style.display =
                            "block";

                        toggleClientes.innerHTML =
                            "👥 Clientes Registrados ▼";

                    } else {

                        clientesContainer.style.display =
                            "none";

                        toggleClientes.innerHTML =
                            "👥 Clientes Registrados ▶";

                    }

                }
            );

            togglePedidos.addEventListener(
                "click",
                () => {

                    if (
                        pedidosContainer.style.display
                        === "none"
                    ) {

                        pedidosContainer.style.display =
                            "block";

                        togglePedidos.innerHTML =
                            "📦 Gestión de Pedidos ▼";

                    } else {

                        pedidosContainer.style.display =
                            "none";

                        togglePedidos.innerHTML =
                            "📦 Gestión de Pedidos ▶";

                    }

                }
            );

            buscarCliente.addEventListener(
                "input",
                (e) => {

                    mostrarClientes(
                        e.target.value
                    );

                }
            );





            const querySnapshot =
                await getDocs(
                    collection(db, "pedidos")
                );

            const pedidosOrdenados =
                querySnapshot.docs.sort((a, b) => {

                    const fechaA =
                        a.data().fechaCreacion || "";

                    const fechaB =
                        b.data().fechaCreacion || "";

                    return fechaB.localeCompare(fechaA);

                });

            totalPedidos.textContent =
                querySnapshot.size;
            let pendientes = 0;
            let recibidos = 0;
            let lavando = 0;
            let secando = 0;
            let planchando = 0;
            let listos = 0;
            let entregados = 0;


            pedidosOrdenados.forEach((documento) => {

                const pedido =
                    documento.data();



                if (pedido.estado === "pendiente") {
                    pendientes++;
                }

                if (pedido.estado === "recibido") {
                    recibidos++;
                }

                if (pedido.estado === "lavando") {
                    lavando++;
                }

                if (pedido.estado === "secando") {
                    secando++;
                }

                if (pedido.estado === "planchando") {
                    planchando++;
                }

                if (pedido.estado === "listo") {

                    if (pedido.entregado) {

                        entregados++;

                    } else {

                        listos++;

                    }

                }

                const totalPrendas =
                    (pedido.polos || 0) +
                    (pedido.camisas || 0) +
                    (pedido.pantalones || 0) +
                    (pedido.casacas || 0) +
                    (pedido.chompas || 0);

                const card =
                    document.createElement('div');

                card.dataset.estado =
                    pedido.estado;

                card.dataset.entregado =
                    pedido.entregado;

                card.dataset.fecha = pedido.fechaCreacion;

                card.classList.add('pedido-card');

                card.innerHTML = `

                <h3>
                    🎫 Ticket: ${pedido.ticket}
                </h3>

                    <p>
                        <strong>Cliente:</strong>
                        ${pedido.nombre}
                    </p>

                    <p>
    <strong>📱 Teléfono:</strong>
    ${pedido.telefono || "No registrado"}
</p>

                    <p>
                        <strong>Correo:</strong>
                        ${pedido.correo}
                    </p>

                    <p>
                        <strong>Dirección:</strong>
                        ${pedido.direccion}
                    </p>
                    <p>
                        <strong>Fecha de registro:</strong>
                        ${pedido.fechaCreacion
                        ? new Date(pedido.fechaCreacion)
                            .toLocaleString('es-PE')
                        : 'No disponible'}
                    </p>

                    <p>
                        <strong>Servicios:</strong>
                        ${pedido.servicios.join(", ")}
                    </p>

                    <p>
    <strong>Prendas:</strong><br>

    👕 Polos: ${pedido.polos || 0}<br>

    👔 Camisas: ${pedido.camisas || 0}<br>

    👖 Pantalones: ${pedido.pantalones || 0}<br>

    🧥 Casacas: ${pedido.casacas || 0}<br>

    🧶 Chompas: ${pedido.chompas || 0}<br><br>

📦 <strong>Total de prendas:</strong> ${totalPrendas}
</p>

                    <p>
                        <strong>Estado:</strong>
                        <span class="estado-text estado-${pedido.estado}">
                           ${pedido.estado}
                        </span>
                    </p>

                    ${pedido.entregado ? `

<p>

<span style="
display:inline-block;
background:#16a34a;
color:white;
padding:6px 12px;
border-radius:20px;
font-weight:bold;
font-size:13px;
">

✅ ENTREGADO

</span>

</p>

` : ""}

                    <select class="estado-select">
                        <option value="pendiente">
                            Pendiente
                        </option>

                        <option value="recibido">
                            Recibido
                        </option>

                        <option value="lavando">
                            Lavando
                        </option>

                        <option value="secando">
                            Secado
                        </option>

                        <option value="planchando">
                            Planchando
                        </option>

                        <option value="listo">
                            Listo
                        </option>

                    </select>

                    

                    ${(
                        pedido.estado.toLowerCase() === "pendiente"
                            ? pedido.repartidorRecojo
                            : pedido.repartidorEntrega
                    )

                        ?

                        `

<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">

<button class="btn-repartidor">

🔄 Reasignar

</button>

<div class="badge-repartidor">

${(
                            pedido.estado.toLowerCase() === "pendiente"
                                ? pedido.repartidorRecojo
                                : pedido.repartidorEntrega
                        )

                            ===

                            "lavaexpressrepartidor1@gmail.com"

                            ?

                            "🚚 Carlos I"

                            :

                            "🚚 Alejandro II"

                        }

</div>

<button class="btn-eliminar">

🗑️ Eliminar Pedido

</button>

</div>

`

                        :

                        `

<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">

<div class="botones-admin">

    <button class="btn-repartidor">
        🚚 Asignar Repartidor
    </button>

    

    <button class="btn-eliminar">
        🗑️ Eliminar Pedido
    </button>

</div>

</div>

`

                    }

                `;

                const select =
                    card.querySelector('.estado-select');

                select.value =
                    pedido.estado;

                const btnEliminar =
                    card.querySelector('.btn-eliminar');

                const btnRepartidor =
                    card.querySelector(".btn-repartidor");





                btnRepartidor.addEventListener(
                    "click",
                    async () => {

                        const estado = pedido.estado.toLowerCase();

                        if (estado !== "pendiente" && estado !== "listo") {

                            Swal.fire({

                                icon: "warning",

                                title: "No disponible",

                                text: "Solo puedes asignar un repartidor cuando el pedido está en Pendiente o Listo."

                            });

                            return;

                        }

                        const resultado = await Swal.fire({

                            title: "Asignar repartidor",

                            text: "Selecciona un repartidor",

                            icon: "question",

                            showDenyButton: true,

                            showCancelButton: true,

                            confirmButtonText: "🚚 Carlos I",
                            denyButtonText: "🚚 Alejandro II",

                            cancelButtonText: "Cancelar"

                        });

                        let correo = "";

                        if (resultado.isConfirmed) {

                            correo =
                                "lavaexpressrepartidor1@gmail.com";

                        }

                        else if (resultado.isDenied) {

                            correo =
                                "lavaexpressrepartidor2@gmail.com";

                        }

                        else {

                            return;

                        }

                        try {



                            // ======================================
                            // REASIGNAR SI YA EXISTE UN REPARTIDOR
                            // ======================================

                            let repartidorActual = "";

                            if (pedido.estado.toLowerCase() === "pendiente") {

                                repartidorActual = pedido.repartidorRecojo || "";

                            } else {

                                repartidorActual = pedido.repartidorEntrega || "";

                            }

                            if (repartidorActual !== "") {

                                if (repartidorActual === correo) {

                                    Swal.fire({

                                        icon: "info",

                                        title: "Sin cambios",

                                        text: "Este pedido ya está asignado a ese repartidor."

                                    });

                                    return;

                                }

                                const nombreActual =

                                    repartidorActual === "lavaexpressrepartidor1@gmail.com"

                                        ? "🚚 Carlos I"

                                        : "🚚 Alejandro II";

                                const nombreNuevo =

                                    correo === "lavaexpressrepartidor1@gmail.com"

                                        ? "🚚 Carlos I"

                                        : "🚚 Alejandro II";

                                const confirmar = await Swal.fire({

                                    icon: "question",

                                    title: "Reasignar repartidor",

                                    html: `

        <b>Actualmente el pedido pertenece a:</b>

        <br><br>

        ${nombreActual}

        <br><br>

        <b>¿Deseas reasignarlo a ${nombreNuevo}?</b>

        `,

                                    showCancelButton: true,

                                    confirmButtonText: "Sí, reasignar",

                                    cancelButtonText: "Cancelar",

                                    confirmButtonColor: "#0071e3"

                                });

                                if (!confirmar.isConfirmed) {

                                    return;

                                }

                            }

                            if (pedido.estado.toLowerCase() === "pendiente") {

                                const { value: tiempoLlegada } = await Swal.fire({

                                    title: "🚚 Avisar salida del repartidor",

                                    input: "text",

                                    inputLabel: "Tiempo estimado de llegada",

                                    inputPlaceholder: "Ejemplo: 30 minutos",

                                    showCancelButton: true,

                                    confirmButtonText: "Enviar aviso",

                                    cancelButtonText: "Cancelar"

                                });

                                if (!tiempoLlegada) {

                                    return;

                                }

                                await updateDoc(

                                    doc(db, "pedidos", documento.id),

                                    {

                                        repartidorRecojo: correo,

                                        avisoRecojo: true,

                                        tiempoLlegada: tiempoLlegada

                                    }

                                );

                            }

                            else {

                                await updateDoc(

                                    doc(db, "pedidos", documento.id),

                                    {

                                        repartidorEntrega: correo

                                    }

                                );

                            }

                            const mensaje =

                                repartidorActual === ""

                                    ? "Repartidor asignado correctamente."

                                    : "Repartidor reasignado correctamente.";

                            const nombreFinal =

                                correo === "lavaexpressrepartidor1@gmail.com"

                                    ? "🚚 Carlos I"

                                    : "🚚 Alejandro II";

                            pedido.estado.toLowerCase() === "pendiente"
                                ? pedido.repartidorRecojo = correo
                                : pedido.repartidorEntrega = correo;

                            btnRepartidor.innerHTML = "🔄 Reasignar";
                            btnRepartidor.classList.add("asignado");

                            card.querySelectorAll(".badge-repartidor").forEach(e => e.remove());

                            const badge = document.createElement("div");

                            badge.className = "badge-repartidor";

                            badge.textContent = nombreFinal;

                            btnEliminar.insertAdjacentElement("beforebegin", badge);

                            Swal.fire({

                                icon: "success",

                                title: "Operación realizada",

                                html: `

        <b>${mensaje}</b>

        <br><br>

        El pedido ahora pertenece a:

        <br><br>

        <h3>${nombreFinal}</h3>

    `,

                                confirmButtonColor: "#0071e3",

                                confirmButtonText: "Aceptar"

                            });

                        } catch (error) {

                            console.error(error);

                            Swal.fire({

                                icon: "error",

                                title: "Error"

                            });

                        }

                    }

                );



                select.addEventListener(
                    "change",
                    async () => {

                        const estados = [
                            "pendiente",
                            "recibido",
                            "lavando",
                            "secando",
                            "planchando",
                            "listo"
                        ];

                        const nombresEstados = {

                            pendiente: "Pendiente",

                            recibido: "Recibido",

                            lavando: "Lavando",

                            secando: "Secando",

                            planchando: "Planchando",

                            listo: "Listo"

                        };
                        const actual = estados.indexOf(
                            pedido.estado.toLowerCase()
                        );

                        const nuevo = estados.indexOf(
                            select.value.toLowerCase()
                        );

                        if (nuevo < actual) {

                            Swal.fire({

                                icon: "warning",

                                title: "No permitido",

                                text: "No puedes regresar a un estado anterior."

                            });

                            select.value = pedido.estado;

                            return;

                        }

                        if (nuevo > actual + 1) {

                            Swal.fire({

                                icon: "warning",

                                title: "Debes seguir el proceso",

                                text: `Primero debes cambiar el pedido a "${nombresEstados[estados[actual + 1]]}".`

                            });

                            select.value = pedido.estado;

                            return;

                        }

                        // ======================================
                        // NO PERMITIR RECIBIDO HASTA CONFIRMAR PAGO
                        // ======================================

                        if (

                            pedido.estado.toLowerCase() === "pendiente"

                            &&

                            select.value.toLowerCase() === "recibido"

                            &&

                            pedido.pago !== "pagado"

                        ) {

                            Swal.fire({

                                icon: "warning",

                                title: "Pago pendiente",

                                text: "El repartidor aún no ha confirmado el pago y el recojo de las prendas."

                            });

                            select.value = pedido.estado;

                            return;

                        }

                        try {

                            if (select.value === "listo") {

                                // ======================================
                                // PEDIDO PRESENCIAL
                                // ======================================

                                if (pedido.tipoPedido === "presencial") {

                                    await updateDoc(

                                        doc(db, "pedidos", documento.id),

                                        {

                                            estado: "listo",

                                            entregado: false,

                                            fechaListo: new Date().toISOString()

                                        }

                                    );

                                    Swal.fire({

                                        icon: "success",

                                        title: "Pedido listo",

                                        html: `

<b>El cliente ya puede acercarse al local a recoger sus prendas.</b>

<br><br>

🎫 Ticket: <b>${pedido.ticket}</b>

            `,

                                        confirmButtonColor: "#0071e3"

                                    });

                                }

                                // ======================================
                                // PEDIDO A DOMICILIO
                                // ======================================

                                else {

                                    const { value: datosEntrega } = await Swal.fire({

                                        title: "🚚 Programar entrega",

                                        html: `

<input id="swalFecha" type="date" class="swal2-input">

<input id="swalHora" type="time" class="swal2-input">

            `,

                                        focusConfirm: false,

                                        showCancelButton: true,

                                        confirmButtonText: "Guardar",

                                        cancelButtonText: "Cancelar",

                                        preConfirm: () => {

                                            return {

                                                fecha: document.getElementById("swalFecha").value,

                                                hora: document.getElementById("swalHora").value

                                            };

                                        }

                                    });

                                    if (!datosEntrega) {

                                        select.value = pedido.estado;

                                        return;

                                    }

                                    await updateDoc(

                                        doc(db, "pedidos", documento.id),

                                        {

                                            estado: "listo",

                                            fechaEntrega: datosEntrega.fecha,

                                            horaEntrega: datosEntrega.hora,

                                            entregado: false,

                                            fechaListo: new Date().toISOString()

                                        }

                                    );

                                }

                            } else {

                                await updateDoc(

                                    doc(db, "pedidos", documento.id),

                                    {

                                        estado: select.value

                                    }

                                );

                            }

                            pedido.estado = select.value;

                            card.dataset.estado = select.value;

                            const estadoTexto =
                                card.querySelector(".estado-text");

                            estadoTexto.textContent =
                                select.value;

                            estadoTexto.className =
                                `estado-text estado-${select.value}`;

                            if (

                                !(

                                    select.value === "listo"

                                    &&

                                    pedido.tipoPedido === "presencial"

                                )

                            ) {

                                Swal.fire({

                                    icon: "success",

                                    title: "Estado actualizado",

                                    text: `Nuevo estado: ${nombresEstados[select.value]}`,

                                    confirmButtonColor: "#0071e3"

                                });

                            }
                        } catch (error) {

                            console.error(error);

                            Swal.fire({

                                icon: "error",

                                title: "Error",

                                text: "No se pudo actualizar el estado."

                            });

                            select.value = pedido.estado;

                        }

                    }

                );

                btnEliminar.addEventListener(
                    'click',
                    async () => {

                        const resultado =
                            await Swal.fire({

                                title: '¿Eliminar pedido?',
                                text: 'Esta acción no se puede deshacer.',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Sí, eliminar',
                                cancelButtonText: 'Cancelar',
                                confirmButtonColor: '#dc2626'

                            });

                        if (!resultado.isConfirmed) {
                            return;
                        }

                        try {

                            await deleteDoc(
                                doc(
                                    db,
                                    "pedidos",
                                    documento.id
                                )
                            );

                            Swal.fire({
                                icon: 'success',
                                title: 'Pedido eliminado'
                            }).then(() => {

                                location.reload();

                            });

                        } catch (error) {

                            console.error(error);

                            Swal.fire({
                                icon: 'error',
                                title: 'Error al eliminar'
                            });

                        }

                    }
                );

                listaPedidos.appendChild(card);

            });

            function filtrarPedidos(estado) {

                seccionTickets.style.display = "grid";

                const tarjetas =
                    document.querySelectorAll(".pedido-card");

                tarjetas.forEach((tarjeta) => {

                    if (!tarjeta.dataset.estado) {
                        return;
                    }

                    if (estado === "todos") {

                        tarjeta.style.display = "block";

                        return;

                    }

                    if (estado === "listo") {

                        tarjeta.style.display =
                            tarjeta.dataset.estado === "listo" &&
                                tarjeta.dataset.entregado !== "true"
                                ? "block"
                                : "none";

                        return;

                    }

                    if (estado === "entregados") {

                        tarjeta.style.display =
                            tarjeta.dataset.estado === "listo" &&
                                tarjeta.dataset.entregado === "true"
                                ? "block"
                                : "none";

                        return;

                    }

                    tarjeta.style.display =
                        tarjeta.dataset.estado === estado
                            ? "block"
                            : "none";

                });

            }

            // ======================================
            // FILTRAR PEDIDOS POR FECHA
            // ======================================

            function filtrarPorFecha(tipo) {

                const tarjetas =
                    document.querySelectorAll(".pedido-card");

                const hoy = new Date();

                tarjetas.forEach((tarjeta) => {

                    if (!tarjeta.dataset.fecha) return;

                    const fechaPedido =
                        new Date(tarjeta.dataset.fecha);

                    let mostrar = false;

                    switch (tipo) {

                        case "hoy":

                            mostrar =
                                fechaPedido.toDateString() ===
                                hoy.toDateString();

                            break;

                        case "ayer":

                            const ayer = new Date();

                            ayer.setDate(
                                hoy.getDate() - 1
                            );

                            mostrar =
                                fechaPedido.toDateString() ===
                                ayer.toDateString();

                            break;

                        case "semana":

                            const inicioSemana =
                                new Date();

                            inicioSemana.setDate(
                                hoy.getDate() - 7
                            );

                            mostrar =
                                fechaPedido >= inicioSemana;

                            break;

                        case "mes":

                            mostrar =
                                fechaPedido.getMonth() ===
                                hoy.getMonth()

                                &&

                                fechaPedido.getFullYear() ===
                                hoy.getFullYear();

                            break;

                    }

                    tarjeta.style.display =
                        mostrar ? "block" : "none";

                });

            }

            document
                .getElementById("btnPendientes")
                .addEventListener("click", () => {

                    filtrarPedidos("pendiente");

                });

            document
                .getElementById("btnRecibidos")
                .addEventListener("click", () => {

                    filtrarPedidos("recibido");

                });

            document
                .getElementById("btnLavando")
                .addEventListener("click", () => {

                    filtrarPedidos("lavando");

                });

            document
                .getElementById("btnSecando")
                .addEventListener("click", () => {

                    filtrarPedidos("secando");

                });

            document
                .getElementById("btnPlanchando")
                .addEventListener("click", () => {

                    filtrarPedidos("planchando");

                });

            document
                .getElementById("btnListos")
                .addEventListener("click", () => {

                    filtrarPedidos("listo");

                });

            document
                .getElementById("btnEntregados")
                .addEventListener("click", () => {

                    filtrarPedidos("entregados");

                });

            // ======================================
            // BOTONES DE FILTRO POR FECHA
            // ======================================

            // Muestra solo los pedidos creados hoy.
            document
                .getElementById("btnHoy")
                .addEventListener("click", () => {

                    filtrarPorFecha("hoy");

                });

            // Muestra solo los pedidos creados ayer.
            document
                .getElementById("btnAyer")
                .addEventListener("click", () => {

                    filtrarPorFecha("ayer");

                });

            // Muestra los pedidos de los últimos 7 días.
            document
                .getElementById("btnSemana")
                .addEventListener("click", () => {

                    filtrarPorFecha("semana");

                });

            // Muestra los pedidos del mes actual.
            document
                .getElementById("btnMes")
                .addEventListener("click", () => {

                    filtrarPorFecha("mes");

                });


            // ======================================
            // Actualizar tarjetas (si existen)
            // ======================================

            if (totalPendientes)
                totalPendientes.textContent = pendientes;

            if (totalRecibidos)
                totalRecibidos.textContent = recibidos;

            if (totalLavando)
                totalLavando.textContent = lavando;

            if (totalSecando)
                totalSecando.textContent = secando;

            if (totalPlanchando)
                totalPlanchando.textContent = planchando;

            if (totalListos)
                totalListos.textContent = listos;

            document.getElementById("btnPendientes").innerHTML =
                `🟡 Pendientes (${pendientes})`;

            document.getElementById("btnRecibidos").innerHTML =
                `🔵 Recibidos (${recibidos})`;

            document.getElementById("btnLavando").innerHTML =
                `🟣 Lavando (${lavando})`;

            document.getElementById("btnSecando").innerHTML =
                `🟠 Secando (${secando})`;

            document.getElementById("btnPlanchando").innerHTML =
                `⚫ Planchando (${planchando})`;

            document.getElementById("btnListos").innerHTML =
                `🟢 Listos (${listos})`;

            document.getElementById("btnEntregados").innerHTML =
                `✅ Entregados (${entregados})`;

            //==============================
            // MENÚ LATERAL
            //==============================

            const seccionPedidosTotales =
                document.getElementById("seccionPedidosTotales");

            const graficaDashboard =
                document.querySelector(".grafica-dashboard");

            const seccionClientes =
                document.getElementById("seccionClientes");

            const seccionGestionPedidos =
                document.getElementById("seccionGestionPedidos");

            const seccionRepartidores =
                document.getElementById("seccionRepartidores");

            const seccionNuevoPedido =
                document.getElementById("seccionNuevoPedido");

            const seccionPagos =
                document.getElementById("seccionPagos");

            const seccionReclamos =
                document.getElementById("seccionReclamos");

            const seccionReportes =
                document.getElementById("seccionReportes");

            const reporteResumen =
                document.getElementById("reporteResumen");

            const seccionTickets =
                document.querySelector(".seccionTickets");



            function ocultarTodo() {

                seccionPedidosTotales.style.display = "none";

                graficaDashboard.style.display = "none";

                seccionClientes.style.display = "none";

                seccionGestionPedidos.style.display = "none";

                seccionTickets.style.display = "none";

                seccionNuevoPedido.style.display = "none";

                seccionRepartidores.style.display = "none";

                seccionPagos.style.display = "none";

                seccionReclamos.style.display = "none";

                seccionReportes.style.display = "none";





            }

            //==================================
            // MENÚ RESPONSIVE
            //==================================

            const sidebar = document.querySelector(".sidebar");

            const btnMenuMovil = document.getElementById("btnMenuMovil");

            if (btnMenuMovil) {

                btnMenuMovil.addEventListener("click", () => {

                    sidebar.classList.toggle("activo");

                });

            }

            function cerrarMenuMovil() {

                if (window.innerWidth <= 768) {

                    sidebar.classList.remove("activo");

                }

            }

            // ======================================
            // VISTA INICIAL
            // ======================================

            ocultarTodo();

            seccionPedidosTotales.style.display = "block";

            graficaDashboard.style.display = "block";

            document
                .getElementById("menuDashboard")
                .addEventListener("click", () => {

                    ocultarTodo();

                    cerrarMenuMovil();

                    seccionPedidosTotales.style.display = "block";

                    graficaDashboard.style.display = "block";

                });



            document
                .getElementById("menuClientes")
                .addEventListener("click", () => {

                    ocultarTodo();

                    cerrarMenuMovil();

                    seccionClientes.style.display = "block";

                });

            document
                .getElementById("menuPedidos")
                .addEventListener("click", () => {

                    ocultarTodo();

                    cerrarMenuMovil();

                    seccionGestionPedidos.style.display = "block";

                    seccionTickets.style.display = "none";

                });

            document
                .getElementById("menuNuevoPedido")
                .addEventListener("click", () => {

                    ocultarTodo();

                    cerrarMenuMovil();

                    seccionNuevoPedido.style.display = "block";

                });

            document
                .getElementById("btnContinuarPedido")
                .addEventListener("click", () => {

                    const nombre =
                        document.getElementById("nuevoNombre").value.trim();

                    const telefono =
                        document.getElementById("nuevoTelefono").value.trim();

                    const correo =
                        document.getElementById("nuevoCorreo").value.trim();

                    const direccion =
                        document.getElementById("nuevoDireccion").value.trim();

                    if (
                        nombre === "" ||
                        telefono === "" ||
                        direccion === ""
                    ) {

                        Swal.fire({

                            icon: "warning",

                            title: "Faltan datos",

                            text: "Complete todos los datos del cliente."

                        });

                        return;

                    }

                    document
                        .getElementById("segundaPartePedido")
                        .style.display = "block";

                    document
                        .getElementById("btnContinuarPedido")
                        .style.display = "none";

                });

            [
                {
                    id: "servicioLavado",
                    nombre: "Lavado"
                },
                {
                    id: "servicioSecado",
                    nombre: "Secado"
                },
                {
                    id: "servicioPlanchado",
                    nombre: "Planchado"
                }

            ].forEach(servicio => {

                document
                    .getElementById(servicio.id)
                    .addEventListener("change", (e) => {

                        if (e.target.checked) {

                            if (!serviciosNuevoPedido.includes(servicio.nombre)) {

                                serviciosNuevoPedido.push(servicio.nombre);

                            }

                        } else {

                            const indice =
                                serviciosNuevoPedido.indexOf(servicio.nombre);

                            if (indice !== -1) {

                                serviciosNuevoPedido.splice(indice, 1);

                            }

                        }

                    });

            });

            document
                .getElementById("menuRepartidores")
                .addEventListener("click", async () => {

                    ocultarTodo();

                    cerrarMenuMovil();

                    seccionRepartidores.style.display = "block";

                    const lista =
                        document.getElementById("listaRepartidores");

                    lista.innerHTML = "";

                    const consulta =
                        await getDocs(collection(db, "pedidos"));

                    let cantidad = 0;
                    let html = "";

                    consulta.forEach((docu) => {

                        const pedido = docu.data();

                        if (

                            pedido.repartidorRecojo === "lavaexpressrepartidor1@gmail.com"

                            ||

                            pedido.repartidorEntrega === "lavaexpressrepartidor1@gmail.com"

                        ) {

                            cantidad++;

                            html += `

<div class="trabajo-item">

    <strong>🎫 ${pedido.ticket}</strong><br>

    👤 ${pedido.nombre}<br>

    ${[
                                    pedido.repartidorRecojo === "lavaexpressrepartidor1@gmail.com"
                                        ? "📦 Recojo"
                                        : null,

                                    pedido.repartidorEntrega === "lavaexpressrepartidor1@gmail.com"
                                        ? "🚚 Entrega"
                                        : null

                                ].filter(Boolean).join(" • ")}

    <br>

    🕒 ${pedido.repartidorRecojo === "lavaexpressrepartidor1@gmail.com"
                                    ? (
                                        pedido.fechaPago
                                            ? new Date(pedido.fechaPago).toLocaleString("es-PE")
                                            : "Pendiente"
                                    )
                                    : (
                                        pedido.fechaEntregado
                                            ? new Date(pedido.fechaEntregado).toLocaleString("es-PE")
                                            : "Pendiente"
                                    )
                                }

</div>

`;

                        }

                    });





                    lista.innerHTML = `

<div class="card-repartidor">

    <div class="repartidor-header">

        <div>

            <h2>🚚 Carlos I</h2>

            <p>lavaexpressrepartidor1@gmail.com</p>

        </div>

        <div class="badge-pedidos">

            ${cantidad} Pedido(s)

        </div>

    </div>

    <div class="repartidor-info">

        <h4>📋 Trabajos asignados</h4>

        ${html || "<p>No tiene pedidos asignados.</p>"}

    </div>

</div>

`;

                    let cantidad2 = 0;

                    let html2 = "";

                    consulta.forEach((docu) => {

                        const pedido = docu.data();

                        if (

                            pedido.repartidorRecojo === "lavaexpressrepartidor2@gmail.com"

                            ||

                            pedido.repartidorEntrega === "lavaexpressrepartidor2@gmail.com"

                        ) {

                            cantidad2++;

                            html2 += `

<div class="trabajo-item">

    <strong>🎫 ${pedido.ticket}</strong><br>

    👤 ${pedido.nombre}<br>

    ${[
                                    pedido.repartidorRecojo === "lavaexpressrepartidor2@gmail.com"
                                        ? "📦 Recojo"
                                        : null,

                                    pedido.repartidorEntrega === "lavaexpressrepartidor2@gmail.com"
                                        ? "🚚 Entrega"
                                        : null

                                ].filter(Boolean).join(" • ")}

<br>

🕒 ${pedido.repartidorRecojo === "lavaexpressrepartidor2@gmail.com"
                                    ? (
                                        pedido.fechaPago
                                            ? new Date(pedido.fechaPago).toLocaleString("es-PE")
                                            : "Pendiente"
                                    )
                                    : (
                                        pedido.fechaEntregado
                                            ? new Date(pedido.fechaEntregado).toLocaleString("es-PE")
                                            : "Pendiente"
                                    )
                                }

</div>

`;

                        }

                    });

                    lista.innerHTML += `

<div class="card-repartidor">

    <div class="repartidor-header">

        <div>

            <h2>🚚 Alejandro II</h2>

            <p>lavaexpressrepartidor2@gmail.com</p>

        </div>

        <div class="badge-pedidos">

            ${cantidad2} Pedido(s)

        </div>

    </div>

    <div class="repartidor-info">

        <h4>📋 Trabajos asignados</h4>

        ${html2 || "<p>No tiene pedidos asignados.</p>"}

    </div>

</div>

`;

                });

            document
                .getElementById("btnCalcularTotal")
                .addEventListener("click", () => {

                    const peso = Number(
                        document.getElementById("pesoRopa").value
                    );

                    const precio = Number(
                        document.getElementById("precioKilo").value
                    );

                    if (peso <= 0 || precio <= 0) {

                        Swal.fire({

                            icon: "warning",

                            title: "Datos incompletos",

                            text: "Ingrese el peso y el precio por kilo."

                        });

                        return;

                    }

                    const total = peso * precio;

                    document.getElementById("totalCalculado").textContent =
                        "S/ " + total.toFixed(2);

                });

            // ======================================
            // MÉTODO DE PAGO
            // ======================================

            const radiosPago =
                document.querySelectorAll(
                    'input[name="metodoPago"]'
                );

            const pagoEfectivo =
                document.getElementById("pagoEfectivo");

            const contenedorQR =
                document.getElementById("contenedorQR");

            const textoQR =
                document.getElementById("textoQR");

            radiosPago.forEach((radio) => {

    radio.addEventListener("change", () => {

        if (radio.value === "Efectivo" && radio.checked) {

            pagoEfectivo.style.display = "block";

            contenedorQR.style.display = "none";

        }

        else if (radio.value === "Tarjeta" && radio.checked) {

            pagoEfectivo.style.display = "none";

            contenedorQR.style.display = "none";

        }

        else if (radio.value === "Yape" && radio.checked) {

            pagoEfectivo.style.display = "none";

            contenedorQR.style.display = "block";

            textoQR.textContent =
                "📱 Escanea este QR para pagar con Yape";

        }

        else if (radio.value === "Plin" && radio.checked) {

            pagoEfectivo.style.display = "none";

            contenedorQR.style.display = "block";

            textoQR.textContent =
                "💜 Escanea este QR para pagar con Plin";

        }

    });

});

            // ======================================
            // CALCULAR VUELTO
            // ======================================

            document
                .getElementById("btnCalcularVuelto")
                .addEventListener("click", () => {

                    const totalTexto =
                        document.getElementById("totalCalculado").textContent;

                    const total =
                        Number(
                            totalTexto.replace("S/", "").trim()
                        );

                    const recibido =
                        Number(
                            document.getElementById("montoRecibido").value
                        );

                    if (recibido < total) {

                        Swal.fire({

                            icon: "warning",

                            title: "Monto insuficiente",

                            text: "El monto recibido es menor que el total."

                        });

                        return;

                    }

                    const vuelto = recibido - total;

                    document.getElementById("vueltoCalculado").textContent =
                        "S/ " + vuelto.toFixed(2);

                });


            document
                .getElementById("btnCrearPedido")
                .addEventListener("click", async () => {

                    const nombre =
                        document.getElementById("nuevoNombre").value.trim();

                    const telefono =
                        document.getElementById("nuevoTelefono").value.trim();

                    const correo =
                        document.getElementById("nuevoCorreo").value.trim();

                    const direccion =
                        document.getElementById("nuevoDireccion").value.trim();

                    const fechaRecojo =
                        document.getElementById("nuevaFechaRecojo").value;

                    const observaciones =
                        document.getElementById("observacionesPedido").value.trim();

                    const polos =
                        Number(document.getElementById("polos").value);

                    const camisas =
                        Number(document.getElementById("camisas").value);

                    const pantalones =
                        Number(document.getElementById("pantalones").value);

                    const casacas =
                        Number(document.getElementById("casacas").value);

                    const chompas =
                        Number(document.getElementById("chompas").value);

                    console.log({

                        nombre,
                        telefono,
                        correo,
                        direccion,
                        fechaRecojo,
                        observaciones,
                        serviciosNuevoPedido,
                        polos,
                        camisas,
                        pantalones,
                        casacas,
                        chompas

                    });

                    if (

                        nombre === "" ||

                        telefono === "" ||

                        direccion === "" ||

                        fechaRecojo === ""

                    ) {

                        Swal.fire({

                            icon: "warning",

                            title: "Datos incompletos",

                            text: "Complete todos los datos obligatorios."

                        });

                        return;

                    }

                    if (serviciosNuevoPedido.length === 0) {

                        Swal.fire({

                            icon: "warning",

                            title: "Seleccione un servicio",

                            text: "Debe elegir al menos un servicio."

                        });

                        return;

                    }

                    if (

                        polos +

                        camisas +

                        pantalones +

                        casacas +

                        chompas === 0

                    ) {

                        Swal.fire({

                            icon: "warning",

                            title: "Sin prendas",

                            text: "Debe registrar al menos una prenda."

                        });

                        return;

                    }

                    //======================================
                    // GENERAR TICKET
                    //======================================

                    const ticket =

                        "T-" +

                        Math.floor(

                            100000 +

                            Math.random() * 900000

                        );


                    //======================================
                    // DATOS DEL PAGO
                    //======================================

                    const metodoPago = document.querySelector(
                        'input[name="metodoPago"]:checked'
                    ).value;

                    const peso = Number(
                        document.getElementById("pesoRopa").value
                    );

                    const precioKilo = Number(
                        document.getElementById("precioKilo").value
                    );

                    const total = Number(
                        document
                            .getElementById("totalCalculado")
                            .textContent
                            .replace("S/", "")
                            .trim()
                    );

                    const vuelto = Number(
                        document
                            .getElementById("vueltoCalculado")
                            .textContent
                            .replace("S/", "")
                            .trim()
                    );

                    const clientesExistentes = await getDocs(collection(db, "clientes"));

                    let clienteExiste = false;

                    clientesExistentes.forEach((docu) => {

                        const cliente = docu.data();

                        if (

                            correo !== "" &&

                            cliente.correo &&

                            cliente.correo.toLowerCase() === correo.toLowerCase()

                        ) {

                            clienteExiste = true;

                        }

                    });

                    if (correo !== "" && !clienteExiste) {

                        await addDoc(collection(db, "clientes"), {

                            nombre,

                            telefono,

                            correo,

                            fechaRegistro: new Date().toISOString()

                        });

                    }

                    await addDoc(collection(db, "pedidos"), {

                        ticket,

                        tipoPedido: "presencial",

                        nombre,

                        telefono,

                        correo,

                        direccion,

                        fechaRecojo,

                        observaciones,

                        servicios: serviciosNuevoPedido,

                        polos,

                        camisas,

                        pantalones,

                        casacas,

                        chompas,

                        peso,

                        precioKilo,

                        total,

                        metodoPago,

                        vuelto,

                        estado: "recibido",

                        pago: "pagado",

                        entregado: false,

                        fechaCreacion: new Date().toISOString()

                    });

                    Swal.fire({

                        icon: "success",

                        title: "Ticket generado",

                        text: `Se creó correctamente el ticket ${ticket}`

                    }).then(() => {

                        location.reload();

                    });

                });



            document
                .getElementById("menuPagos")
                .addEventListener("click", async () => {

                    ocultarTodo();

                    cerrarMenuMovil();

                    seccionPagos.style.display = "block";

                    document.getElementById("listaPagos").innerHTML = "";

                    const consulta = await getDocs(collection(db, "pedidos"));

                    let ingresos = 0;
                    let realizados = 0;
                    let pendientes = 0;
                    let hoy = 0;

                    const fechaHoy = new Date().toDateString();

                    consulta.forEach((docu) => {

                        const pedido = docu.data();

                        if (pedido.pago === "pagado") {

                            realizados++;

                            ingresos += Number(pedido.total || 0);

                            const fechaReferencia =
                                pedido.fechaPago ||
                                pedido.fechaCreacion;

                            if (fechaReferencia) {

                                const fecha = new Date(fechaReferencia);

                                if (fecha.toDateString() === fechaHoy) {

                                    hoy += Number(pedido.total || 0);

                                }

                            }

                        } else {

                            pendientes++;

                        }

                    });

                    document.getElementById("totalIngresos").textContent =
                        "S/ " + ingresos.toFixed(2);

                    document.getElementById("pagosRealizados").textContent =
                        realizados;

                    document.getElementById("pagosPendientes").textContent =
                        pendientes;

                    document.getElementById("ingresosHoy").textContent =
                        "S/ " + hoy.toFixed(2);

                });


            document
                .getElementById("menuReclamos")


                .addEventListener("click", async () => {

                    ocultarTodo();

                    cerrarMenuMovil();

                    seccionReclamos.style.display = "block";

                    const listaPendientes =
                        document.getElementById("listaReclamosPendientes");

                    const listaHistorial =
                        document.getElementById("listaReclamosHistorial");

                    const tarjetaPendientes =
                        document.querySelector(".card-reclamos");

                    const tarjetaHistorial =
                        document.querySelector(".card-reclamos2");

                    listaPendientes.innerHTML = "";

                    listaHistorial.innerHTML = "";

                    listaPendientes.style.display = "block";
                    listaHistorial.style.display = "none";

                    let pendientes = 0;
                    let historial = 0;



                    const consulta =
                        await getDocs(collection(db, "reclamos"));

                    consulta.forEach((docu) => {

                        const reclamo =
                            docu.data();

                        if (reclamo.estado === "Pendiente") {

                            pendientes++;

                            listaPendientes.innerHTML += `

                            

<div class="pedido-card">

<h3>📢 Reclamo</h3>

<p><strong>🎫 Ticket:</strong> ${reclamo.ticket}</p>

<p><strong>👤 Cliente:</strong> ${reclamo.cliente}</p>

<p><strong>📧 Correo:</strong> ${reclamo.correo}</p>

<p><strong>📌 Motivo:</strong> ${reclamo.tipo}</p>

<p><strong>📝 Descripción:</strong> ${reclamo.descripcion}</p>

<p><strong>📅 Fecha:</strong>

${new Date(reclamo.fecha).toLocaleString("es-PE")}

</p>

<p>

<strong>Estado:</strong>

<b style="color:${reclamo.estado === "Respondido" ? "#16a34a" : "#dc2626"}">

${reclamo.estado}

</b>

</p>

${reclamo.estado === "Pendiente" ? `

<button
class="btnResponder"
data-id="${docu.id}"
>

💬 Responder

</button>

` : `

<div style="
background:#ecfdf5;
padding:12px;
border-left:5px solid #16a34a;
border-radius:8px;
margin-top:10px;
">

<b>✅ Respuesta enviada</b>

<br><br>

${reclamo.respuesta || "-"}

<br><br>

<small>

📅 ${reclamo.fechaRespuesta || ""}

</small>

</div>

`}

</div>

`;

                        }

                        else {

                            historial++;

                            listaHistorial.innerHTML += `

                            

                        <div class="pedido-card">

<h3>✅ Reclamo Respondido</h3>

<p><strong>🎫 Ticket:</strong> ${reclamo.ticket}</p>

<p><strong>👤 Cliente:</strong> ${reclamo.cliente}</p>

<p><strong>📧 Correo:</strong> ${reclamo.correo}</p>

<p><strong>📌 Motivo:</strong> ${reclamo.tipo}</p>

<p><strong>📝 Reclamo:</strong></p>

<div style="
background:#fff8e1;
padding:12px;
border-radius:8px;
margin-bottom:15px;
">

${reclamo.descripcion}

</div>

<p><strong>💬 Respuesta enviada:</strong></p>

<div style="
background:#ecfdf5;
padding:12px;
border-left:5px solid #16a34a;
border-radius:8px;
">

${reclamo.respuesta}

</div>

<br>

<p>

<strong>📅 Reclamo:</strong>

${new Date(reclamo.fecha).toLocaleString("es-PE")}

</p>

<p>

<strong>📅 Respondido:</strong>

${new Date(reclamo.fechaRespuesta).toLocaleString("es-PE")}

</p>

</div>

`;

                        }

                    });



                    document.getElementById("contadorPendientes").textContent =
                        pendientes;

                    document.getElementById("contadorHistorial").textContent =
                        historial;


                    tarjetaPendientes.onclick = () => {

                        listaPendientes.style.display = "block";
                        listaHistorial.style.display = "none";

                    };

                    tarjetaHistorial.onclick = () => {

                        listaPendientes.style.display = "none";
                        listaHistorial.style.display = "block";

                    };



                    // ======================================
                    // RESPONDER RECLAMO
                    // ======================================

                    document.querySelectorAll(".btnResponder").forEach((boton) => {

                        boton.addEventListener("click", async () => {

                            const id = boton.dataset.id;

                            const consultaReclamo = await getDoc(
                                doc(db, "reclamos", id)
                            );

                            const datos = consultaReclamo.data();

                            const { value: respuesta } = await Swal.fire({

                                title: "Responder reclamo",

                                width: 700,

                                html: `

<div style="text-align:left;line-height:1.8">

<p><b>🎫 Ticket:</b> ${datos.ticket}</p>

<p><b>👤 Cliente:</b> ${datos.cliente}</p>

<p><b>📧 Correo:</b> ${datos.correo}</p>

<p><b>📌 Motivo:</b> ${datos.tipo}</p>

<p><b>📝 Descripción:</b></p>

<div style="
background:#f8f9fa;
padding:12px;
border-radius:8px;
border-left:5px solid #0d6efd;
margin-bottom:20px;
">

${datos.descripcion}

</div>

<textarea
id="respuestaAdmin"
class="swal2-textarea"
placeholder="Escribe aquí la respuesta para el cliente..."
style="width:95%;height:140px;"
></textarea>

</div>

`,

                                focusConfirm: false,

                                showCancelButton: true,

                                confirmButtonText: "Enviar respuesta",

                                cancelButtonText: "Cancelar",

                                preConfirm: () => {

                                    return document.getElementById("respuestaAdmin").value;

                                }

                            });

                            if (!respuesta) return;

                            try {

                                await updateDoc(

                                    doc(db, "reclamos", id),

                                    {

                                        respuesta: respuesta,

                                        estado: "Respondido",

                                        fechaRespuesta: new Date().toISOString()

                                    }

                                );

                                // ==========================
                                // GUARDAR RESPUESTA EN PEDIDO
                                // ==========================

                                await updateDoc(

                                    doc(db, "pedidos", datos.ticket),

                                    {

                                        respuestaReclamo: respuesta,

                                        estadoReclamo: "Respondido",

                                        fechaRespuestaReclamo: new Date().toLocaleString("es-PE")

                                    }

                                );

                                Swal.fire({

                                    icon: "success",

                                    title: "Respuesta enviada"

                                });

                                document.getElementById("menuReclamos").click();

                            }

                            catch (error) {

                                console.error(error);

                                Swal.fire({

                                    icon: "error",

                                    title: "No se pudo responder"

                                });

                            }

                        });

                    });

                });

            document
                .getElementById("menuReportes")
                .addEventListener("click", async () => {

                    ocultarTodo();

                    cerrarMenuMovil();

                    seccionReportes.style.display = "block";

                    const pedidos =
                        await getDocs(collection(db, "pedidos"));

                    const clientes =
                        await getDocs(collection(db, "clientes"));

                    const reclamos =
                        await getDocs(collection(db, "reclamos"));

                    let ingresos = 0;

                    let ingresosPresencial = 0;

                    let ingresosWeb = 0;

                    let entregados = 0;

                    let pendientesReclamo = 0;

                    pedidos.forEach((docu) => {

                        const pedido = docu.data();

                        if (pedido.pago === "pagado") {

                            const total = Number(pedido.total || 0);

                            ingresos += total;

                            if (pedido.tipoPedido === "presencial") {

                                ingresosPresencial += total;

                            } else {

                                ingresosWeb += total;

                            }

                        }

                        if (pedido.entregado === true) {

                            entregados++;

                        }

                    });

                    document
                        .getElementById("btnGenerarReporte")
                        .addEventListener("click", async () => {

                            const { jsPDF } = window.jspdf;

                            const pdf = new jsPDF();

                            const pedidos =
                                await getDocs(collection(db, "pedidos"));

                            const clientes =
                                await getDocs(collection(db, "clientes"));

                            const reclamos =
                                await getDocs(collection(db, "reclamos"));

                            let ingresos = 0;

                            let ingresosPresencial = 0;

                            let ingresosWeb = 0;

                            let entregados = 0;

                            let pendientesReclamo = 0;

                            pedidos.forEach((docu) => {

                                const pedido = docu.data();

                                if (pedido.pago === "pagado") {

                                    const total = Number(pedido.total || 0);

                                    ingresos += total;

                                    if (pedido.tipoPedido === "presencial") {

                                        ingresosPresencial += total;

                                    } else {

                                        ingresosWeb += total;

                                    }

                                }

                                if (pedido.entregado === true) {

                                    entregados++;

                                }

                            });

                            reclamos.forEach((docu) => {

                                if (docu.data().estado === "Pendiente") {

                                    pendientesReclamo++;

                                }

                            });

                            pdf.setFontSize(20);
                            pdf.text("LAVAEXPRESS LIMA", 20, 20);

                            pdf.setFontSize(14);
                            pdf.text("REPORTE DEL DIA", 20, 35);

                            pdf.setFontSize(11);

                            pdf.text(
                                "Fecha: " +
                                new Date().toLocaleDateString("es-PE"),
                                20,
                                50
                            );

                            pdf.autoTable({

                                startY: 60,

                                head: [["Concepto", "Valor"]],

                                body: [

                                    ["Pedidos Totales", pedidos.size],

                                    ["Clientes Registrados", clientes.size],

                                    ["Ingresos Presenciales", "S/ " + ingresosPresencial.toFixed(2)],

                                    ["Ingresos Web", "S/ " + ingresosWeb.toFixed(2)],

                                    ["Ingresos Totales", "S/ " + ingresos.toFixed(2)],

                                    ["Pedidos Entregados", entregados],

                                    ["Reclamos Pendientes", pendientesReclamo]

                                ]

                            });

                            pdf.save(
                                "Reporte_LavaExpress.pdf"
                            );

                        });

                    reclamos.forEach((docu) => {

                        if (docu.data().estado === "Pendiente") {

                            pendientesReclamo++;

                        }

                    });

                    reporteResumen.innerHTML = `

<div class="reporte-item">

    <h3>📦 Pedidos Totales</h3>

    <span>${pedidos.size}</span>

</div>

<div class="reporte-item">

    <h3>👥 Clientes Registrados</h3>

    <span>${clientes.size}</span>

</div>

<div class="reporte-item">

    <h3>🏪 Ingresos Presenciales</h3>

    <span>S/ ${ingresosPresencial.toFixed(2)}</span>

</div>

<div class="reporte-item">

    <h3>🌐 Ingresos Web</h3>

    <span>S/ ${ingresosWeb.toFixed(2)}</span>

</div>

<div class="reporte-item">

    <h3>💰 Ingresos Totales</h3>

    <span>S/ ${ingresos.toFixed(2)}</span>

</div>

<div class="reporte-item">

    <h3>🚚 Entregados</h3>

    <span>${entregados}</span>

</div>

<div class="reporte-item">

    <h3>📢 Reclamos Pendientes</h3>

    <span>${pendientesReclamo}</span>

</div>

`;

                });

            // ======================================
            // GRÁFICA DE PEDIDOS POR ESTADO
            // ======================================

            // Se obtiene el lienzo (canvas) donde se dibujará la gráfica.
            const ctx = document
                .getElementById("graficaEstados");

            // Solo crea la gráfica si el canvas existe.
            if (ctx) {

                new Chart(ctx, {

                    type: "bar",

                    data: {

                        // Etiquetas que aparecerán debajo de cada barra.
                        labels: [
                            "Pendientes",
                            "Recibidos",
                            "Lavando",
                            "Secando",
                            "Planchando",
                            "Listos"
                        ],

                        datasets: [{

                            label: "Cantidad de pedidos",

                            data: [
                                pendientes,
                                recibidos,
                                lavando,
                                secando,
                                planchando,
                                listos
                            ],

                            backgroundColor: [
                                "#facc15",
                                "#3b82f6",
                                "#9333ea",
                                "#f97316",
                                "#525252",
                                "#22c55e"
                            ],

                            borderRadius: 10

                        }]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {

                                display: false

                            }

                        },

                        scales: {

                            y: {

                                beginAtZero: true,

                                ticks: {

                                    stepSize: 1

                                }

                            }

                        }

                    }

                });

            }

            // ======================================
            // CARGAR PAGOS
            // ======================================

            async function cargarPagos() {

                const consulta = await getDocs(collection(db, "pedidos"));

                const listaPagos = document.getElementById("listaPagos");



                listaPagos.innerHTML = `

<div style="margin-bottom:20px;">

<input
    type="text"
    id="buscarTicketPago"
    placeholder="🔍 Buscar por Ticket"
    style="
        width:100%;
        padding:12px;
        border-radius:10px;
        border:1px solid #ccc;
        font-size:15px;
    "
>

</div>

`;

                const contenedorPagos = document.createElement("div");

                listaPagos.appendChild(contenedorPagos);

                let ingresos = 0;
                let realizados = 0;
                let pendientes = 0;
                let hoy = 0;

                const fechaHoy = new Date().toDateString();

                consulta.forEach((docu) => {

                    const pedido = docu.data();

                    if (pedido.pago === "pagado") {

                        realizados++;

                        ingresos += Number(pedido.total || 0);

                        const fechaReferencia =

                            pedido.fechaPago ||

                            pedido.fechaCreacion;

                        if (fechaReferencia) {

                            const fecha = new Date(fechaReferencia);

                            if (fecha.toDateString() === fechaHoy) {

                                hoy += Number(pedido.total || 0);

                            }

                        }

                        contenedorPagos.innerHTML += `

<div class="pedido-card">

<h3>🎫 ${pedido.ticket}</h3>

<p><strong>👤 Cliente:</strong> ${pedido.nombre}</p>

<p><strong>📧 Correo:</strong> ${pedido.correo}</p>

<p><strong>🚚 Repartidor:</strong> ${pedido.repartidorPago}</p>

<p><strong>💳 Método:</strong> ${pedido.metodoPago}</p>

<p><strong>💰 Total:</strong> S/ ${pedido.total}</p>

<p><strong>📅 Fecha:</strong> ${new Date(pedido.fechaPago).toLocaleString("es-PE")}</p>

</div>

`;

                    } else {

                        pendientes++;

                    }





                });

                document.getElementById("totalIngresos").textContent =
                    "S/ " + ingresos.toFixed(2);

                document.getElementById("pagosRealizados").textContent =
                    realizados;

                document.getElementById("pagosPendientes").textContent =
                    pendientes;

                document.getElementById("ingresosHoy").textContent =
                    "S/ " + hoy.toFixed(2);

                const buscarTicketPago =
                    document.getElementById("buscarTicketPago");

                buscarTicketPago.addEventListener("input", () => {

                    const texto =
                        buscarTicketPago.value.toLowerCase().trim();

                    const tarjetas =
                        contenedorPagos.querySelectorAll(".pedido-card");

                    tarjetas.forEach((tarjeta) => {

                        const ticket =
                            tarjeta.querySelector("h3").textContent.toLowerCase();

                        tarjeta.style.display =
                            ticket.includes(texto)
                                ? "block"
                                : "none";

                    });

                });

            }

            // ======================================
            // BOTÓN PAGOS PENDIENTES
            // ======================================

            document
                .getElementById("btnVerPendientes")
                .addEventListener("click", async () => {

                    const consulta =
                        await getDocs(collection(db, "pedidos"));

                    const listaPagos =
                        document.getElementById("listaPagos");

                    listaPagos.innerHTML = "";

                    consulta.forEach((docu) => {

                        const pedido = docu.data();

                        if (pedido.pago !== "pendiente") return;

                        listaPagos.innerHTML += `

<div class="pedido-card">

<h3>🎫 ${pedido.ticket}</h3>

<p><strong>👤 Cliente:</strong> ${pedido.nombre}</p>

<p><strong>📞 Teléfono:</strong> ${pedido.telefono || "-"}</p>

<p><strong>📧 Correo:</strong> ${pedido.correo}</p>

<p><strong>📍 Dirección:</strong> ${pedido.direccion}</p>

<p><strong>💰 Estado:</strong> Pendiente de pago</p>

</div>

`;

                    });



                });


            // ======================================
            // BOTÓN HISTORIAL
            // ======================================

            document
                .getElementById("btnVerHistorial")
                .addEventListener("click", async () => {

                    await cargarPagos();

                });

        } catch (error) {

            console.error(error);

        }

    });

});


