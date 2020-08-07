/* eslint-disable prettier/prettier */
const Tour = require('../models/tour');
const Booking = require('../models/booking');
const {
    catchAsync
} = require('../utils/catchAsync');
const {
    deleteOne,
    updateOne,
    createOne,
    getOne,
    getAll
} = require('./handlerFactory');
const AppError = require('../utils/appError');
const {
    update
} = require('../models/tour');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const getCheckoutSession = catchAsync(async (req, res, next) => {
    //1)get currently bokoked tour
    const tour = await Tour.findById(req.params.tourId);

    const name = tour.name.replace(/ /g, "-");
    //2)create checkout sessio
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${name}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [{
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1,
        }, ],
    });

    //3)create a session as response
    res.status(200).send({
        status: 'success',
        session,
    });
});

const createBookingCheckout = catchAsync(async (req, res, next) => {
    //temporal hasta que se suba a produccion
    const {
        tour,
        user,
        price
    } = req.query;

    if (!tour && !user && !price) {
        return next();
    }
    await Booking.create({
        tour,
        user,
        price
    });
    res.redirect(req.originalUrl.split("?")[0]);
});
const createBooking = createOne(Booking);
const updateBooking = updateOne(Booking);
const deleteBooking = deleteOne(Booking);
const getBooking = getOne(Booking);
const getAllBooking = getAll(Booking);
module.exports = {
    getCheckoutSession,
    createBookingCheckout,
    createBooking,
    updateBooking,
    deleteBooking,
    getBooking,
    getAllBooking
};