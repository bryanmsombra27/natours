/* eslint-disable prettier/prettier */
const express = require('express');
const router = express.Router();

const {
    getCheckoutSession,
    createBooking,
    deleteBooking,
    getAllBooking,
    getBooking,
    updateBooking
} = require("../controller/bookingController");
const {
    protect,
    restrictTo
} = require("../controller/authController");
const {
    route
} = require('./viewRoutes');

//todas las rutas debera estar logueado el usuario par apoder acceder
router.use(protect);

router.use(restrictTo("admin", "lead-guide"));
router.get("/checkout-session/:tourId", getCheckoutSession);
router.get("/", getAllBooking);
router.post("/", createBooking);


router.get("/:id", getBooking);
router.patch("/:id", updateBooking);
router.delete("/:id", deleteBooking);






module.exports = router;