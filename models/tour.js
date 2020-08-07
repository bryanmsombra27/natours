/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator')
const User = require("./user"); //si es por normalizar el documento no se re quiere de importar el modelo en caso de que fuera un documento embebido si se require 
const tourSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, "El tour debe tener un nombre"],
            unique: [true, "No puede haber tours duplicados"],
            trim: true,
            //max y minlength son validators que solo se pueden usar en tipos string
            // maxlength:[40,"se excedio el limite de caracteres "],
            minlength: [5, "debe tener mas que 20 caracteres"],
            // validate: [validator.isAlpha,"el nombre solo deben ser caracteres"]
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, "debe tener una duracion"]
        },
        maxGroupSize: {
            type: Number,
            required: [true, "Debe tener un tamaño maximo de grupo"]
        },
        difficulty: {
            type: String,
            //esta notacion es un sorthand 
            required: [true, "Debe tener una dificultad"],
            //define un validator qque es un arreglo con los valores que se le permiten ingresar en ese campo, esta e sla version completa de la definicion de un validator SOLO SIRVE PARA LOS STRINGS
            enum: {
                values: ["easy", "medium", "difficult"],
                message: "solo se permite ingresar easy medium y difficult en este campo"
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            //min y max son validators unicamente utilizados para los tipos number y dates  y funcionan similar al max y minlength
            min: [1, "el rating minimo que se obtener es 1"],
            max: [5, "el rating maximo  que se puede obtener es 5"],
            set: val => val.toFixed(1)
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: true
        },
        priceDiscount: {
            type: Number,
            //creando validators propios
            validate: {
                validator: function (val) {
                    //solo funciona esta validacion para los nuevos documentos para actualizar ya no sirve
                    return val < this.price;
                },
                message: `el precio de descuento ({VALUE}) debe ser menor al precio regular`
            }

        },
        summary: {
            type: String,
            trim: true,
            required: [true, "debe tener una descripcion"]
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, "debe tener una imagen de portada"]
        },
        images: [String],
        createAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            //geoJSON:Especifica informacion geografica  
            type: {
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [{
            type: {
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }],
        // guides:Array para crear documentos embebidos
        guides: [ //para crear referencias 
            {
                type: mongoose.Schema.ObjectId,
                ref: "User"
            }
        ],


    },
    //segundo parametro un arreglo con opciones donde podemos indicarle que habilite las propiedades virtuales al momento de que el documento sea  impreso en json  y sea un objeto
    {
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    });

//asignando indices
// tourSchema.index({
//     price: 1
// });

tourSchema.index({
    price: 1,
    ratingsAverage: -1
});
tourSchema.index({
    slug: 1
});
tourSchema.index({
    startLocation: "2dsphere"
})
//virtual properties  propiedades que no persisten en el esquema solo son temporales
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

///////////////////////////////////////4
//VIRTUAL POPULATE 

tourSchema.virtual('reviews', {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
})
///////////////////////////////////////





///////////////////////////////////////////////////////////////////////////77

//Encargado de crear documentos embebidos
// tourSchema.pre("save",async function(next){
//     //se realiza una query para sacar los usuarios que concuerden con el id que se le paso en el arreglo de guias y despues esos resultadose se almacenan en el objeto para ser guardados de manera embebida
//     const guidesPromises = this.guides.map(async id => await User.findById(id));

//    this.guides = await Promise.all(guidesPromises);


//     next();  
// });
/////////////////////////////////////////////////////////////////////////////


// //document middleware: runs before the .save() and create() si se utiliza insertMany esto no funcionara
// tourSchema.pre('save',function(next){
//     this.slug = slugify(this.name,{lower:true});
//     next();
// })

// tourSchema.post("save",function(doc,next){
//     console.log(doc)
//     next();

// })
//no se debe de usar un a virtual propeerty para la query ya que estas no son realmente parte de la base de datos solo se imprimen al momento de desplegar la informacion 

//QUERY MIDDLEWARE:se ejecuta conforme a la consulta porla que espere el evento que sea disparado
// tourSchema.pre('find',function(next){
tourSchema.pre(/^find/, function (next) {
    this.find({
        secretTour: {
            $ne: true
        }
    });

    this.start = Date.now()
    next();
});



tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: "guides",
        select: "-__v -passwordChangedAt"
    })

    next();
})
///seejecuta cuando la consulta ya se realizo
tourSchema.post(/^find/, function (docs, next) {
    // console.log(`le tomo a la consulta: ${Date.now() - this.start} miliseconds`)
    next();
})

//AGREGATION MIDDLEWARE
// tourSchema.pre("aggregate", function (next) {

//     next();
// })

const Tour = mongoose.model("Tour", tourSchema)

module.exports = Tour;