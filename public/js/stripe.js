/* eslint-disable prettier/prettier */
const stripe = Stripe("pk_test_51HCuZdFeamrcwQaMpRaGdG7zbzoRwaPbQk8NUDF6Hbu8xyrKF7i2Z8Y9VdbsUnU3xXQvEHoSQ7mv3CHo6M1JJCbo00q6j7bsNy");
const bookBtn = document.getElementById("book-tour");
const {
    tourId
} = bookBtn.dataset;


const bookTour = async (tourid) => {
    // e.preventDefault();
    //1) get the sesion from endpoint
    const session = await fetch(`/api/v1/bookings/checkout-session/${tourid}`);
    const data = await session.json();
    console.log(data);
    console.log(data.id);

    //2) create checkoutform + charge credit card
    await stripe.redirectToCheckout({
        sessionId: data.id
    });


};

bookBtn.addEventListener("click", bookTour.bind(null, tourId));