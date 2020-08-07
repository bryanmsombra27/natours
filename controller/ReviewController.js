/* eslint-disable prettier/prettier */
const Review = require('../models/review');
// const {catchAsync}= require('../utils/catchAsync');
const {deleteOne,updateOne,createOne,getOne,getAll} = require("./handlerFactory");


const setTourUserId = (req,res,next) => {
    //allow nested routes
    if(!req.body.tour) req.body.tour  = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id; 
    next();
};

const getAllReviews = getAll(Review);
const getReview =getOne(Review);
const createReview = createOne(Review);
const deleteReview = deleteOne(Review);
const updateReview = updateOne(Review);


module.exports ={ getAllReviews,createReview,deleteReview,updateReview,setTourUserId,getReview};