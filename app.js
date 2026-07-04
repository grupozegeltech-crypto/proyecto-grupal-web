import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    query,
    where,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
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
const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {

    document.body.classList.add("intro-activa");

    const btnLogin = document.getElementById('btnLogin');
    const btnHacerPedido = document.getElementById('btnHacerPedido');
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLogout = document.getElementById('btnLogout');
    const btnMiPedido = document.getElementById('btnMiPedido');
    const btnModificarPedido = document.getElementById('btnModificarPedido');
    const btnDetallePedido = document.getElementById('btnDetallePedido');
    const userName = document.getElementById('userName');

    onAuthStateChanged(auth, async (user) => {

        if (user) {

            const clienteRef =
                doc(
                    db,
                    "clientes",
                    user.uid
                );

            const clienteSnap =
                await getDoc(
                    clienteRef
                );

            if (!clienteSnap.exists()) {

                await setDoc(
                    clienteRef,
                    {
                        uid:
                            user.uid,

                        nombre:
                            user.displayName,

                        correo:
                            user.email,

                        fechaRegistro:
                            new Date().toISOString()
                    }
                );

            }

            btnLogin.style.display = "none";

            btnMiPedido.classList.remove("hidden");

            btnModificarPedido.classList.add("hidden");

            btnLogout.style.display = "inline-block";

            userName.textContent =
                `Hola, ${user.displayName}`;

            localStorage.setItem("introLavaExpress", "ocultar");

        } else {

            btnLogin.style.display = "inline-block";

            btnLogout.style.display = "none";

            btnMiPedido.classList.add("hidden");

            btnModificarPedido.classList.add("hidden");

            userName.textContent = "";

            const overlay = document.getElementById("introOverlay");

if (

    overlay

    &&

    !localStorage.getItem("introLavaExpress")

) {

    setTimeout(() => {

        document
            .querySelector(".panel-left")
            ?.classList.add("abrir");

        document
            .querySelector(".panel-right")
            ?.classList.add("abrir");

    }, 800);

    setTimeout(() => {

    overlay.classList.add("ocultar");

    document.body.classList.remove("intro-activa");

    document.body.classList.add("intro-finalizada");

}, 2300);

} else if (overlay) {

    overlay.style.display = "none";

}

        }

    });

    // ==========================
    // HACER PEDIDO
    // ==========================

    if (btnHacerPedido) {

        btnHacerPedido.addEventListener('click', async () => {

            if (!auth.currentUser) {

                Swal.fire({
                    icon: 'warning',
                    title: 'Inicia sesión',
                    text: 'Debes registrarte o iniciar sesión antes de realizar un pedido.',
                    confirmButtonColor: '#0071e3'
                });

                try {

                    await signInWithPopup(auth, provider);

                    Swal.fire({
                        icon: 'success',
                        title: 'Registro exitoso',
                        text: 'Ahora puedes realizar tu pedido.',
                        confirmButtonColor: '#0071e3'
                    });

                    window.location.href = "pedido.html";

                } catch (e) {

                    console.error(e);

                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo iniciar sesión.',
                        confirmButtonColor: '#0071e3'
                    });

                }

            } else {

                window.location.href = "pedido.html";

            }

        });

    }

    // ==========================
    // LOGIN GOOGLE
    // ==========================

    if (btnLogin) {

        btnLogin.addEventListener('click', async () => {

            try {

                await signInWithPopup(auth, provider);

                Swal.fire({
                    icon: 'success',
                    title: 'Sesión iniciada',
                    text: '¡Bienvenido a LavaExpress!',
                    confirmButtonColor: '#0071e3'
                });

            } catch (e) {

                console.error(e);

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo iniciar sesión.',
                    confirmButtonColor: '#0071e3'
                });

            }

        });

    }

    // ==========================
    // BUSCAR PEDIDO
    // ==========================

    if (btnBuscar) {

        btnBuscar.addEventListener('click', async () => {

            const idTicket =
                document
                    .getElementById('ticketInput')
                    .value
                    .trim()
                    .toUpperCase();

            btnDetallePedido.classList.remove("hidden");

            if (!idTicket) {

                Swal.fire({
                    icon: 'warning',
                    title: 'Campo vacío',
                    text: 'Ingresa un número de ticket.',
                    confirmButtonColor: '#0071e3'
                });

                return;

            }

            try {

                const consulta = query(

                    collection(db, "pedidos"),

                    where("ticket", "==", idTicket)

                );

                const resultado = await getDocs(consulta);

                if (resultado.empty) {

                    btnDetallePedido.classList.add("hidden");

                    Swal.fire({

                        icon: "error",

                        title: "Ticket no encontrado",

                        text: "Verifica el número ingresado.",

                        confirmButtonColor: "#0071e3"

                    });

                    return;

                }

                const docSnap = resultado.docs[0];

                if (docSnap.exists()) {

                    const datos =
                        docSnap.data();

                    btnDetallePedido.onclick = () => {

                        const totalPrendas =
                            (datos.polos || 0) +
                            (datos.camisas || 0) +
                            (datos.pantalones || 0) +
                            (datos.casacas || 0) +
                            (datos.chompas || 0);

                        Swal.fire({

                            title: "📦 Prendas enviadas",

                            width: 650,

                            html: `

        <div style="text-align:left;line-height:1.8;">

            <b>🎫 Ticket:</b> ${idTicket}<br><br>

            <b>🧺 Servicios:</b><br>

${(datos.servicios || []).length > 0
                                    ? (datos.servicios || []).map(servicio =>
                                        `✅ ${servicio}`
                                    ).join("<br>")
                                    : "No registrado"}

<br><br>

            <b>👕 Polos:</b> ${datos.polos || 0}<br>

            <b>👔 Camisas:</b> ${datos.camisas || 0}<br>

            <b>👖 Pantalones:</b> ${datos.pantalones || 0}<br>

            <b>🧥 Casacas:</b> ${datos.casacas || 0}<br>

            <b>🧶 Chompas:</b> ${datos.chompas || 0}<br><br>

            <b>📦 Total de prendas:</b> ${totalPrendas}<br><br>

            <b>📍 Dirección:</b><br>

            ${datos.direccion || "No registrada"}<br><br>

            <b>📝 Observaciones:</b><br>

            ${datos.observaciones || "Ninguna"}

        </div>

        `,

                            confirmButtonText: "Cerrar",

                            confirmButtonColor: "#0071e3"

                        });

                    };

                    document
                        .getElementById('lblCliente')
                        .innerText =
                        datos.nombre || "Cliente";

                    document
                        .getElementById('lblTicket')
                        .innerText =
                        idTicket;

                    document
                        .getElementById('trackerContainer')
                        .classList
                        .remove('hidden');

                    // ==========================
                    // LIMPIAR PASOS
                    // ==========================

                    document
                        .querySelectorAll('.step')
                        .forEach(step => {

                            step.classList.remove('active');
                            step.classList.remove('current');

                        });

                    const estado =
                        datos.estado
                            ? datos.estado.toLowerCase()
                            : "recibido";

                    if (estado === "pendiente") {

                        btnModificarPedido.classList.remove("hidden");

                    } else {

                        btnModificarPedido.classList.add("hidden");

                    }

                    // ==========================
                    // PENDIENTE
                    // ==========================

                    if (estado === "pendiente") {

                        document
                            .getElementById('step-pendiente')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-pendiente')
                            .classList
                            .add('current');

                    }

                    // ==========================
                    // RECIBIDO
                    // ==========================

                    if (estado === "recibido") {

                        document
                            .getElementById('step-pendiente')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-recibido')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-recibido')
                            .classList
                            .add('current');

                    }

                    // ==========================
                    // LAVANDO
                    // ==========================

                    if (estado === "lavando") {

                        document
                            .getElementById('step-recibido')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-lavando')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-lavando')
                            .classList
                            .add('current');

                    }

                    // ==========================
                    // SECANDO
                    // ==========================

                    if (estado === "secando") {

                        document
                            .getElementById('step-recibido')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-lavando')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-secando')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-secando')
                            .classList
                            .add('current');

                    }

                    // ==========================
                    // PLANCHANDO
                    // ==========================

                    if (estado === "planchando") {

                        document
                            .getElementById('step-recibido')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-lavando')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-secando')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-planchando')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-planchando')
                            .classList
                            .add('current');

                    }

                    // ==========================
                    // LISTO
                    // ==========================

                    if (estado === "listo") {

                        document
                            .getElementById('step-recibido')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-lavando')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-secando')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-planchando')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-listo')
                            .classList
                            .add('active');

                        document
                            .getElementById('step-listo')
                            .classList
                            .add('current');


                        // ==========================================
                        // ENTREGA PROGRAMADA
                        // ==========================================

                        if (!datos.entregado) {

    if (datos.tipoPedido === "presencial") {

        Swal.fire({

            icon: "success",

            title: "🎉 Pedido listo",

            html: `

Tu pedido ya está listo.

<br><br>

Puedes acercarte a <b>LavaExpress Lima</b> para recoger tus prendas.

<br><br>

🎫 <b>Ticket:</b> ${datos.ticket}

            `,

            confirmButtonColor: "#22c55e"

        });

    } else {

        Swal.fire({

            icon: "info",

            title: "🚚 Entrega programada",

            html: `

Tu pedido ya está listo.

<br><br>

📅 <b>Fecha:</b> ${datos.fechaEntrega || "-"}

<br>

🕒 <b>Hora:</b> ${datos.horaEntrega || "-"}

<br>

🚚 <b>Repartidor:</b> ${datos.repartidorEntrega || "Por asignar"}

            `,

            confirmButtonColor: "#0071e3"

        });

    }

}



                    }

                } else {

                    btnDetallePedido.classList.add("hidden");

                    Swal.fire({
                        icon: 'error',
                        title: 'Ticket no encontrado',
                        text: 'Verifica el número ingresado.',
                        confirmButtonColor: '#0071e3'
                    });

                }

            } catch (e) {

                console.error(e);

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al buscar el pedido.',
                    confirmButtonColor: '#0071e3'
                });

            }

        });

    }
    // ==========================
    // MI PEDIDO
    // ==========================

    if (btnMiPedido) {

        btnMiPedido.addEventListener('click', async () => {

            try {

                const usuario =
                    auth.currentUser;

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
                            )

                        )

                    );

                if (pedidos.empty) {

                    Swal.fire({
                        icon: 'warning',
                        title: 'Sin pedido',
                        text: 'No se encontró un pedido registrado.'
                    });

                    return;

                }

                const pedidosOrdenados =
                    pedidos.docs.sort((a, b) => {

                        const fechaA =
                            a.data().fechaCreacion || "";

                        const fechaB =
                            b.data().fechaCreacion || "";

                        return fechaB.localeCompare(fechaA);

                    });

                const ultimoPedido =
                    pedidosOrdenados[0];

                if (ultimoPedido.data().estado.toLowerCase() === "pendiente") {

                    btnModificarPedido.classList.remove("hidden");

                } else {

                    btnModificarPedido.classList.add("hidden");

                }

                document.getElementById(
                    'ticketInput'
                ).value =
                    ultimoPedido.data().ticket;

                btnBuscar.click();

                const pedidosProceso =
                    document.getElementById(
                        "pedidosProceso"
                    );

                const historialPedidos =
                    document.getElementById(
                        "historialPedidos"
                    );

                const misPedidosContainer =
                    document.getElementById(
                        "misPedidosContainer"
                    );

                pedidosProceso.innerHTML = "";
                historialPedidos.innerHTML = "";

                misPedidosContainer.classList.remove(
                    "hidden"
                );

                pedidosOrdenados.forEach((pedidoDoc) => {

                    const pedido =
                        pedidoDoc.data();

                    const totalPrendas =
                        (pedido.polos || 0) +
                        (pedido.camisas || 0) +
                        (pedido.pantalones || 0) +
                        (pedido.casacas || 0) +
                        (pedido.chompas || 0);

                    const tarjeta = `

        <div style="
            background:#fff;
            padding:15px;
            margin-bottom:10px;
            border-radius:10px;
            box-shadow:0 2px 10px rgba(0,0,0,.08);
        ">

            <strong>
                Ticket:
            </strong>
            ${pedido.ticket}

            <br>

            <strong>
                Fecha:
            </strong>
            ${new Date(
                        pedido.fechaCreacion
                    ).toLocaleString('es-PE')}

            <br>

            <strong>
                Estado:
            </strong>
            ${pedido.estado}

            <br>

            <strong>
                Prendas:
            </strong>
            ${totalPrendas}

        </div>

    `;

                    if (

                        pedido.estado.toLowerCase() === "listo"

                        &&

                        pedido.entregado

                    ) {

                        const tarjetaHistorial = `

    <div style="
        background:#fff;
        padding:15px;
        margin-bottom:10px;
        border-radius:10px;
        box-shadow:0 2px 10px rgba(0,0,0,.08);
    ">

        <strong>🎫 Ticket:</strong>
        ${pedido.ticket}

        <br>

        <strong>📅 Fecha de entrega:</strong>
        ${pedido.fechaEntregado || "-"}

        <br>

        <strong>🕒 Hora de entrega:</strong>
        ${pedido.horaEntregado || "-"}

        <br>

        <strong>✅ Estado:</strong>
        Entregado

        <br>

        <strong>📦 Prendas:</strong>
        ${totalPrendas}

        <br><br>

<button
class="btnReclamo"
data-ticket="${pedido.ticket}"
style="
background:#ef4444;
color:white;
border:none;
padding:10px 18px;
border-radius:8px;
cursor:pointer;
font-weight:bold;
">

📢 Presentar reclamo

</button>

${pedido.respuestaReclamo ? `

<hr style="margin:20px 0;">

<div style="
background:#eef7ff;
padding:15px;
border-radius:10px;
border-left:5px solid #0d6efd;
">

<h4 style="margin-top:0;">
📢 Reclamo respondido
</h4>

<p>

<b>Estado:</b>

${pedido.estadoReclamo || "Respondido"}

</p>

<p>

<b>Respuesta de LavaExpress:</b>

</p>

<div style="
background:white;
padding:12px;
border-radius:8px;
">

${pedido.respuestaReclamo}

</div>

<p style="margin-top:15px;">

<b>Fecha:</b>

${pedido.fechaRespuestaReclamo || "-"}

</p>

</div>

` : ""}

    </div>

    `;

                        historialPedidos.innerHTML += tarjetaHistorial;

                    }

                    else {

                        let tarjetaProceso = tarjeta;

                        // ==========================================
                        // REPARTIDOR EN CAMINO
                        // ==========================================

                        if (

                            pedido.estado.toLowerCase() === "pendiente"

                            &&

                            pedido.avisoRecojo

                        ) {

                            tarjetaProceso = `

<div style="
background:#fff8e1;
padding:18px;
margin-bottom:12px;
border-radius:12px;
border-left:6px solid #f59e0b;
">

<strong>🎫 Ticket:</strong>

${pedido.ticket}

<br><br>

<strong>🟡 Estado:</strong>

Pendiente

<br>

<strong>🚚 Repartidor:</strong>

${pedido.repartidorRecojo || "Por asignar"}

<br>

<strong>⏱ Llegará aproximadamente en:</strong>

${pedido.tiempoLlegada}

<br><br>

<div style="
background:#fff3cd;
padding:10px;
border-radius:8px;
font-size:14px;
">

🚚 Nuestro repartidor ya salió hacia tu domicilio.
Ten tus prendas listas para agilizar el servicio.

</div>

</div>

`;

                        }

                        if (

    pedido.estado.toLowerCase() === "listo"

    &&

    !pedido.entregado

) {

    if (pedido.tipoPedido === "presencial") {

        tarjetaProceso = `

<div style="
background:#e8f5e9;
padding:18px;
margin-bottom:12px;
border-radius:12px;
border-left:6px solid #22c55e;
">

<strong>🎫 Ticket:</strong>

${pedido.ticket}

<br><br>

<strong>🟢 Estado:</strong>

Listo para recoger

<hr style="margin:18px 0;">

<div style="
background:#eefbf3;
padding:14px;
border-radius:10px;
border-left:5px solid #22c55e;
font-size:14px;
line-height:1.7;
">

<b>🎉 ¡Tus prendas ya están listas!</b>

<br><br>

Puedes acercarte a <b>LavaExpress Lima</b> para recoger tu pedido.

<br><br>

No olvides presentar tu número de ticket:

<b>${pedido.ticket}</b>

</div>

</div>

`;

    } else {

        tarjetaProceso = `

<div style="
background:#e8f5e9;
padding:18px;
margin-bottom:12px;
border-radius:12px;
border-left:6px solid #22c55e;
">

<strong>🎫 Ticket:</strong>
${pedido.ticket}

<br><br>

<strong>🟢 Estado:</strong>
Listo

<br>

<strong>📅 Entrega programada:</strong>
${pedido.fechaEntrega || "-"}

<br>

<strong>🕒 Hora estimada:</strong>
${pedido.horaEntrega || "-"}

<br>

<strong>🚚 Repartidor:</strong>

${pedido.repartidorEntrega || "Por asignar"}

<hr style="margin:18px 0;">

<div style="
background:#fff8e1;
padding:14px;
border-radius:10px;
border-left:5px solid #f59e0b;
font-size:14px;
line-height:1.7;
">

<b>💡 Recomendación</b>

<br><br>

Cuando recibas tu pedido, revisa cuidadosamente que todas tus prendas hayan sido entregadas correctamente y que el servicio realizado sea el esperado.

<br><br>

📢 Si detectas algún inconveniente, podrás presentar un reclamo dentro de las <b>48 horas posteriores a la entrega</b> desde la sección <b>Historial de Pedidos</b>.

</div>

</div>

`;

    }

}

                        

                        pedidosProceso.innerHTML += tarjetaProceso;

                    }

                });

                // ==========================================
                // BOTÓN PRESENTAR RECLAMO
                // ==========================================

                document.querySelectorAll(".btnReclamo").forEach(boton => {

                    boton.addEventListener("click", () => {

                        const ticket = boton.dataset.ticket;

                        Swal.fire({

                            title: "📢 Presentar reclamo",

                            width: 650,

                            html: `

<div style="text-align:left;">

<b>🎫 Ticket:</b>

${ticket}

<br><br>

<label><b>Motivo del reclamo</b></label>

<select
id="tipoReclamo"
style="
width:100%;
padding:10px;
margin-top:8px;
margin-bottom:20px;
">

<option>Falta una prenda</option>

<option>Prenda dañada</option>

<option>Prenda manchada</option>

<option>Mal lavado</option>

<option>Demora en la entrega</option>

<option>Otro</option>

</select>

<label><b>Describe lo ocurrido</b></label>

<textarea

id="descripcionReclamo"

rows="6"

style="
width:100%;
margin-top:8px;
padding:10px;
resize:none;
"

placeholder="Describe detalladamente lo sucedido...">

</textarea>

</div>

`,

                            showCancelButton: true,

                            confirmButtonText: "📨 Enviar reclamo",

                            cancelButtonText: "Cancelar",

                            confirmButtonColor: "#ef4444",

                            preConfirm: () => {

                                const tipo =

                                    document.getElementById(
                                        "tipoReclamo"
                                    ).value;

                                const descripcion =

                                    document.getElementById(
                                        "descripcionReclamo"
                                    ).value.trim();

                                if (!descripcion) {

                                    Swal.showValidationMessage(

                                        "Debes escribir una descripción."

                                    );

                                    return false;

                                }

                                return {

                                    tipo,

                                    descripcion

                                };

                            }

                        }).then(async (result) => {

                            if (!result.isConfirmed) return;

                            try {

                                await addDoc(

                                    collection(db, "reclamos"),

                                    {

                                        ticket: ticket,

                                        cliente: auth.currentUser.displayName,

                                        correo: auth.currentUser.email,

                                        tipo: result.value.tipo,

                                        descripcion: result.value.descripcion,

                                        fecha: new Date().toISOString(),

                                        estado: "Pendiente"

                                    }

                                );

                                Swal.fire({

                                    icon: "success",

                                    title: "Reclamo enviado",

                                    text: "Tu reclamo fue registrado correctamente. Nos pondremos en contacto contigo.",

                                    confirmButtonColor: "#0071e3"

                                });

                            } catch (error) {

                                console.error(error);

                                Swal.fire({

                                    icon: "error",

                                    title: "Error",

                                    text: "No se pudo registrar el reclamo.",

                                    confirmButtonColor: "#0071e3"

                                });

                            }

                        });

                    });

                });

            } catch (error) {

                console.error(error);

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron obtener los pedidos.'
                });

            }

        });

    }

    // ==========================
    // MODIFICAR PEDIDO
    // ==========================

    if (btnModificarPedido) {

        btnModificarPedido.addEventListener('click', () => {

            window.location.href =
                "pedido.html?editar=true";

        });

    }

    // ==========================
    // CERRAR SESIÓN
    // ==========================

    if (btnLogout) {

        btnLogout.addEventListener('click', async () => {

            try {

                await signOut(auth);

                localStorage.removeItem("introLavaExpress");

                await Swal.fire({
                    icon: 'success',
                    title: 'Sesión cerrada',
                    text: 'Has cerrado sesión correctamente.',
                    confirmButtonColor: '#0071e3'
                });

                location.reload();

            } catch (e) {

                console.error(e);

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cerrar sesión.',
                    confirmButtonColor: '#0071e3'
                });



            }

        });

    }
});

