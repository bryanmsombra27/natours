/* eslint-disable prettier/prettier */

/////paquetes utilizados
const express = require('express');
const rateLimit = require("express-rate-limit");
const app = express();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp'); //parametros
const cookieParser = require('cookie-parser');
const compression = require('compression'); //un middleware que permite hacer que las respuestas al usuario no pesen tanto

///////////////////////////////////////////////////////////////

const routerTours = require('./routes/routes');
const userRoutes = require('./routes/usersRoutes');
const reviewRoutes = require('./routes/reviewsRoutes');
const viewRoutes = require('./routes/viewRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const {
  globalErrorHandler
} = require('./controller/ErrorController');
const path = require('path'); //modulo nativo de node para trabajar las rutas

//configurando la plantilla para renderizar las vistas 
app.set("view engine", "pug");
///colocando la carpeta de donde seran leidas las templates de pug
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));



//security http header
app.use(helmet());
///////////////
// Configurar cabeceras y cors
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
//   res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
//   next();
// });



//CONVERTIR TODAS LAS ENTRADAS DE INFORMACION A FORMATO JSON
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

//limitando la entrada de informacion
app.use(bodyParser.json({
  limit: "10kb"
}));

app.use(cookieParser());
//data sanitization  contra noSQL query injection
app.use(mongoSanitize());

//Data sanatization against xss 
app.use(xss());

//prevent parameter pollution  de esta forma solo pasaran por la url aquellos parametros que se indiquen y puedan ser repetidos mas de una vez
app.use(hpp({
  whitelist: ["duration", "ratingsAverage", "ratingsQuantity", "maxGroupSize", "difficulty", "price"]
}));


////////////////////////////////////////////////////////
// app.use((req,res,next)=>{
//   console.log(req.headers);

//   next();
// })

//LIMIT REQUEST
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Demasiadas peticiones realizadas, intenta mas tarde"
});

/////////////////////////////////////////////

///comprime todas las respuestas que sean enviadas al usuario (no funciona en imagenes, solo texto)
app.use(compression());
//afecta a todos los que comiencen con esa ruta
app.use("/api", limiter);

app.use("/api/v1/tours", routerTours);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use(viewRoutes)



//de esta forma declaramos un handler para todos los verbos del metodo http el signo de * indica que hara referencia a todas las rutas que se encuentren disponibles en el servidor debe declararse despues de cargar todas las rutas sino siempre estera mandando este mensaje pese a que la ruta si exista en el servidor
app.all("*", (req, res, next) => {
  // res.status(404).send({
  //   status:"error",
  //   message:`No se puede encontrar la ruta ${req.originalUrl} en este servidor`
  // })

  // const err = new Error(`No se puede encontrar la ruta ${req.originalUrl} en este servidor`);
  // err.status ="error";
  // err.statusCode= 404;

  const err = new AppError(`No se puede encontrar la ruta ${req.originalUrl} en este servidor`, 404)

  //cuando se le pasa un argumento a la funcion next automaticamente express asume que  le estamos indicando que ese argumento sera un error
  next(err);
})
//MIDDLEWARE PARA CONTROLAR LOS ERRORES DE LA APP
app.use(globalErrorHandler)

//permite servir archivos estaticos del servidor (imagenes,css,templates,etc) el metodo static le indica que servira archivos estaticos como parametro recibe la ruta a la que dara servicio
// app.use(express.static(`${__dirname}/public`));

module.exports = app;