import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {

    getFirestore,

    collection,

    getDocs

} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

async function cargarPagos(){

    const listaPagos =

        document.getElementById("listaPagos");

    const totalIngresos =

        document.getElementById("totalIngresos");

    const pagosRealizados =

        document.getElementById("pagosRealizados");

    const pagosPendientes =

        document.getElementById("pagosPendientes");

    const ingresosHoy =

        document.getElementById("ingresosHoy");

    listaPagos.innerHTML = "";

    const consulta =

        await getDocs(

            collection(db,"pedidos")

        );

}