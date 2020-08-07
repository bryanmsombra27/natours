/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
const form2 = document.getElementById("form-user-data");
const formPassword = document.getElementById("form-user-password");

////////////ALERTAS
const hiddenAlert2 = () => {
    const el = document.querySelector(".alert");
    //transversing DOM
    if (el) el.parentElement.removeChild(el);
}
const showAlert2 = (type, msg) => {
    hiddenAlert2();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
    setTimeout(hiddenAlert2, 5000);

}
//////////////////////////////


const actualizarDatos = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    const name = e.target.name.value;
    const email = e.target.email.value;
    const photo = e.target.photo.files[0];

    formData.append("name", name);
    formData.append("email", email);
    formData.append("photo", photo);

    if (name === "" || email === "") {
        showAlert2("error", "Campos vacios");
        return;
    }
    const data = await enviardatosUpdatePhoto("http://localhost:3000/api/v1/users/updateMe", formData);
    console.log(data);
    if (data.status === "success") {
        showAlert2("success", "Los datos han sido actualizados con exito");
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
};
const actualizarPassword = async (e) => {
    e.preventDefault();

    const passwordCurrent = e.target.passwordCurrent.value;
    const password = e.target.password.value;
    const passwordConfirm = e.target.passwordConfirm.value;
    if (password === "" || passwordCurrent === "" || passwordConfirm === "") {
        showAlert2("error", "Campos vacios");
        return;
    }
    if (password === passwordConfirm) {
        const objeto = {
            passwordCurrent,
            password,
            passwordConfirm
        };

        const data = await enviardatosUpdate("http://localhost:3000/api/v1/users/updateMyPassword", objeto);

        console.log(data);
        if (data.status === "success") {
            showAlert2("success", "Los datos han sido actualizados con exito");
        }
    } else {
        showAlert2("error", "Las contraseñas no son iguales");
    }

};
const enviardatosUpdatePhoto = async (url, datos) => {
    try {
        const res = await fetch(url, {
            method: "PATCH",
            body: datos
        })
        // const data =await res.json(); //deberia haber colocado un await pero como retorno una promesa realmente no importa mucho
        const data = res.json();

        return data;
    } catch (err) {
        showAlert2("error", "algo salio mal");

    }
};
const enviardatosUpdate = async (url, datos) => {
    try {
        const res = await fetch(url, {
            method: "PATCH",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(datos)
        })
        // const data =await res.json();
        const data = res.json();

        return data;
    } catch (err) {
        showAlert2("error", "algo salio mal");

    }


};


form2.addEventListener('submit', actualizarDatos);
formPassword.addEventListener('submit', actualizarPassword);