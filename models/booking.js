/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');


const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "La reservacion debe pertenecer a un Tour"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "La reservacion debe pertenecer a un Usuario"]
    },
    price: {
        type: Number,
        required: [true, "La reversacion debe tener un precio"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});
bookingSchema.pre(/^find/, function (next) {
    this.populate("user").populate({
        path: "tour",
        select: "name"
    })
    next();
})



const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;