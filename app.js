// Importamos los módulos necesarios de Firebase Web SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Tus credenciales exactas proporcionadas
const firebaseConfig = {
  apiKey: "AIzaSyA_W8I3jAlW6jIxfW2MrhpX9kVgtaZ6-kQ",
  authDomain: "lavaexpress-lima.firebaseapp.com",
  projectId: "lavaexpress-lima",
  storageBucket: "lavaexpress-lima.firebasestorage.app",
  messagingSenderId: "1028137831114",
  appId: "1:1028137831114:web:ebecf5c5d7a32266db0233"
};

// Inicializamos Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ELEMENTOS DE LA INTERFAZ (VISTA CLIENTE)
const ticketInput = document.getElementById('ticketInput');
const btnBuscar = document.getElementById('btnBuscar');
const trackerContainer = document.getElementById('trackerContainer');
const errorCliente = document.getElementById('errorCliente');
const lblCliente = document.getElementById('lblCliente');
const lblTicket = document.getElementById('lblTicket');

const stepRecibido = document.getElementById('step-recibido');
const stepLavando = document.getElementById('step-lavando');
const stepListo = document.getElementById('step-listo');

// ELEMENTOS DE LA INTERFAZ (VISTA ADMINISTRADOR)
const adminForm = document.getElementById('adminForm');
const adminTicket = document.getElementById('adminTicket');
const adminNombre = document.getElementById('adminNombre');
const adminEstado = document.getElementById('adminEstado');
const successAdmin = document.getElementById('successAdmin');

// --- LÓGICA 1: BUSCAR TICKET (CLIENTE) ---
btnBuscar.addEventListener('click', async () => {
    const idTicket = ticketInput.value.trim().toUpperCase();
    
    if (idTicket === "") return;

    errorCliente.classList.add('hidden');
    trackerContainer.classList.add('hidden');

    try {
        const docRef = doc(db, "pedidos", idTicket);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            lblCliente.innerText = data.nombre;
            lblTicket.innerText = idTicket;
            
            resetTracker();

            const estado = data.estado;
            if (estado === "recibido") {
                stepRecibido.classList.add('active');
            } else if (estado === "lavando") {
                stepRecibido.classList.add('completed');
                stepLavando.classList.add('active');
            } else if (estado === "listo") {
                stepRecibido.classList.add('completed');
                stepLavando.classList.add('completed');
                stepListo.classList.add('completed', 'active');
            }

            trackerContainer.classList.remove('hidden');
        } else {
            errorCliente.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error al buscar el ticket: ", error);
        alert("Ocurrió un problema al conectar con el servidor.");
    }
});

function resetTracker() {
    const steps = [stepRecibido, stepLavando, stepListo];
    steps.forEach(st => {
        st.classList.remove('active', 'completed');
    });
}

// --- LÓGICA 2: GUARDAR / ACTUALIZAR PEDIDO (ADMIN) ---
adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idTicket = adminTicket.value.trim().toUpperCase();
    const nombreCliente = adminNombre.value.trim();
    const estadoActual = adminEstado.value;

    try {
        await setDoc(doc(db, "pedidos", idTicket), {
            nombre: nombreCliente,
            estado: estadoActual,
            fechaActualizacion: new Date().toISOString()
        });

        successAdmin.classList.remove('hidden');
        adminForm.reset();

        setTimeout(() => {
            successAdmin.classList.add('hidden');
        }, 4000);

    } catch (error) {
        console.error("Error al guardar en Firebase: ", error);
        alert("No se pudo guardar la información. Revisa tus reglas de Firebase.");
    }
});

// --- LÓGICA 3: MOSTRAR / OCULTAR EL PANEL ADMIN ---
const toggleAdminBtn = document.getElementById('toggleAdminBtn');
const adminPanelSection = document.getElementById('adminPanelSection');

toggleAdminBtn.addEventListener('click', () => {
    adminPanelSection.classList.toggle('hidden');
    if(!adminPanelSection.classList.contains('hidden')){
        adminPanelSection.scrollIntoView({ behavior: 'smooth' });
    }
});

// --- LÓGICA 4: CONTROLLER DE LA VENTANA EMERGENTE (NOSOTROS) ---
const openNosotrosBtn = document.getElementById('openNosotrosBtn');
const nosotrosModal = document.getElementById('nosotrosModal');
const closeNosotrosBtn = document.getElementById('closeNosotrosBtn');
const modalActionBtn = document.getElementById('modalActionBtn');

// Abrir modal al hacer clic en "Nosotros"
openNosotrosBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Evita que la página salte
    nosotrosModal.classList.remove('hidden');
});

// Cerrar modal con la "X"
closeNosotrosBtn.addEventListener('click', () => {
    nosotrosModal.classList.add('hidden');
});

// Cerrar modal con el botón "¡Excelente!"
modalActionBtn.addEventListener('click', () => {
    nosotrosModal.classList.add('hidden');
});

// Cerrar modal si el usuario hace clic afuera de la tarjeta blanca
window.addEventListener('click', (e) => {
    if (e.target === nosotrosModal) {
        nosotrosModal.classList.add('hidden');
    }
});