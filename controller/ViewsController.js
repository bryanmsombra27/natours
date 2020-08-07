/* eslint-disable prettier/prettier */
const Tour = require('../models/tour');
const Booking = require('../models/booking');
const {
    catchAsync
} = require('../utils/catchAsync');
const {
    findOneAndUpdate
} = require('../models/tour');


const overview = catchAsync(async (req, res, next) => {
    //1) get tour data  
    const tours = await Tour.find();
    //2)build template 


    //3)render template

    //con la funcion render() renderizamos la vista que configuramos anteriormente en la carpeta de esta forma express autoamticamente buscara en es acarpeta el nombre del archivo que coincida con el parametro que le estamos pasando (no es necesario colocar la extension porque ya  declaramos que tipo de plantilla estamos ocupando en la parte de  arriba); como segundo parametro podemos pasarle un objeto con variables que podran ser impresas en la vista
    res.status(200).render("overview", {
        title: "All tours",
        tours
    });
});
const getTour = catchAsync(async (req, res) => {
    const slug = req.params.slug.replace(/-/g, " ");
    const tour = await Tour.findOne({
        name: slug
    }).populate({
        path: "reviews",
        fields: "review rating user"
    });
    if (!tour) {
        return res.status(404).send({
            status: "error",
            message: "No se encontro ningun Tour con ese nombre"
        });
    }

    res.status(200).render("tour", {
        title: `${tour.name} Tour`,
        tour
    });
});
const getLoginForm = catchAsync(async (req, res, next) => {
    res.status(200).render("login", {
        title: "Log into your account"
    })
})

const getAccount = (req, res) => {
    res.render("account", {
        title: "Your account"
    })
}
const getMyTours = catchAsync(async (req, res, next) => {
    //1)find all bookings
    const bookings = await Booking.find({
        user: req.user.id
    });

    //2)find with the returned IDS4
    const tourIds = bookings.map(el => el.tour);

    const tours = await Tour.find({
        _id: {
            $in: tourIds
        }
    });


    res.status(200).render("overview", {
        title: "My Tours",
        tours
    });
});

module.exports = {
    overview,
    getTour,
    getLoginForm,
    getAccount,
    getMyTours,
}