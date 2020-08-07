/* eslint-disable no-use-before-define */
/* eslint-disable no-else-return */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */

// eslint-disable-next-line no-undef

const form = document.getElementById('form');
const logoutBtn = document.getElementById('logout');

////////////ALERTAS
const hiddenAlert = () => {
    const el = document.querySelector(".alert");
    //transversing DOM
    if (el) el.parentElement.removeChild(el);
}
const showAlert = (type, msg) => {
    hiddenAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
    setTimeout(hiddenAlert, 5000);

}
//////////////////////////////


const enviarDatos = async (e) => {
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    e.preventDefault();

    if (email.value == "" || password.value == "") {
        console.log("campos vacios");
        return;
    }
    const usuario = {
        email: email.value,
        password: password.value
    }
    const data = await sendData("/api/v1/users/login", usuario);

    if (data.status === "success") {
        showAlert("success", "Logueado exitosamente");
        setTimeout(() => {
            // window.location.assign("/");
            location.href = "/";
        }, 1000)

    }

}

const sendData = async (url, data) => {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const user = await res.json();
        if (res.status === 401) {
            showAlert("error", "Error no se pudo loguear");
            return;
        }
        return user;

    } catch (err) {
        console.log(err);
    }
}
const getData = async (url) => {
    try {
        const res = await fetch(url);
        const data = res.json();

        return data;
    } catch (err) {
        console.log(err);
        showAlert("error", "No se pudo salir de la cuenta");
    }
}

const salirCuenta = async (e) => {
    e.preventDefault();

    const data = await getData("/api/v1/users/login");

    console.log(data);
    if (data.status === "success") {
        showAlert("success", "se ha cerrado sesion con exito");
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
}
if (form) {

    form.addEventListener('click', enviarDatos);
}
if (logoutBtn) {
    logoutBtn.addEventListener("click", salirCuenta);
}