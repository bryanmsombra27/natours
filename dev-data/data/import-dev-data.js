/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

const Tour = require('../../models/tour');
const Review = require('../../models/review');
const User = require('../../models/user');

dotenv.config({
    path: './config.env',
});

mongoose
    .connect(
        `mongodb+srv://bryan:${process.env.DATABASE_PASSWORD}@cluster0.szh2i.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        }
    )
    .then(() => {
        console.log('conexion exitosa');
    });

//read json file 
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//import data into database 
const importData = async () => {
    try {
        await Tour.create(tours)
        await User.create(users,{ validateBeforeSave: false})
        await Review.create(reviews)

        console.log("data carga correctamente");
        process.exit();
    } catch (err) {
        console.log(err)
    }
}
//Delete all data from collection
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
 
        process.exit();
    } catch (err) {
        console.log(err)
    }
}
if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}