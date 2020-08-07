/*eslint-disable*/
////////////ALERTAS
const hiddenAlert5 = () => {
    const el = document.querySelector(".alert");
    //transversing DOM
    if (el) el.parentElement.removeChild(el);
}
const showAlert5 = (type, msg) => {
    hiddenAlert5();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
    setTimeout(hiddenAlert5, 5000);

}
//////////////////////////////
const alertMessage = document.querySelector("body").dataset.alert;

if (alertMessage) {
    showAlert5("success", alertMessage);
}