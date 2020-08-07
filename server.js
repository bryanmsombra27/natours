/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
    path: './config.env'
});
const port = process.env.PORT || 3000;
const app = require('./app');

//conecxion a a base de datos en la nube
mongoose.connect(`mongodb+srv://${process.env.USER}:${process.env.DATABASE_PASSWORD}@cluster0.szh2i.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log("conexion exitosa")
})
const server = app.listen(port, () => {
    console.log(`escuchando por el puerto ${port}`);
});

//el evento unhandledRejection se encarga de manejar todas los errores que las promesas arrojen en caso de no lograrse de manera correcta
//reject promises de esta forma podemos capturar las rejecciones que las promesas arrojen en caso de no haberla manejado con un catch 
process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log("Promesa no se resolvio apagando la aplicacion");
    server.close(() => {
        process.exit(1);

    });
});
//uncought exeption: los errores que no se atrapan de las funciones asyncronas
process.on("uncaughtException", err => {
    console.log(err.name, err.message);
    console.log("Promesa no se resolvio apagando la aplicacion");
    server.close(() => {
        process.exit(1);

    });
})
//manera polite en la que el servidor sera apagado por heroku al momento de terminar todas sus peticiones
process.on("SIgTERM", () => {
    console.log("sigterm recieved shutting down");
    server.close(() => {
        console.log("proceso terminado")
    });
});