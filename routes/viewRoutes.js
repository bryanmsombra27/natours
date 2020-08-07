/* eslint-disable prettier/prettier */
const express = require('express');
const router = express.Router();
const {
    overview,
    getTour,
    getLoginForm,
    getAccount,
    getMyTours
} = require('../controller/ViewsController');
const {
    isLoggedIn,
    protect
} = require('../controller/authController');
// const {
//     createBookingCheckout
// } = require('../controller/bookingController');




//renderizando las vistas con PUG
router.get("/", isLoggedIn, overview); //, createBookingCheckout
router.get("/tour/:slug", isLoggedIn, getTour);
router.get("/login", isLoggedIn, getLoginForm);
router.get("/me", protect, getAccount);
router.get("/my-tours", protect, getMyTours);





module.exports = router;