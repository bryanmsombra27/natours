/* eslint-disable import/newline-after-import */
/* eslint-disable no-multi-assign */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const express = require('express');
const router = express.Router();
const {
    protect,
    restrictTo
} = require('../controller/authController');


const tourController = require('../controller/toursController');
const {
    test,
    aliasTopTours
    // camposRequridos,
    // aliasTopTours<<
} = middlewareTours = require('../middlewares/middleware');
// const {createReview} = require('../controller/ReviewController');
const reviewRouter = require('./reviewsRoutes');

router.use("/:tourId/reviews", reviewRouter);

router.get("/tours-within/:distance/center/:latlng/unit/:unit", tourController.getTourWithIn);
router.get("/distances/:latlng/unit/:unit", tourController.getDistances);

router.get("/top-5-cheap", aliasTopTours, tourController.getAlltours);
router.get("/tour-stats", tourController.getTourStats);
router.get('/', tourController.getAlltours);
router.get('/:id', tourController.getTour);
router.get("/monthly-plan/:year", protect, restrictTo("admin", "lead-guide", "guide"), tourController.getMonthlyPlan);
router.post('/', protect, restrictTo("admin", "lead-guide"), tourController.createTours);
router.patch('/:id', protect, restrictTo("admin", "lead-guide"), tourController.uploadTourimages, tourController.resizeTourImages, tourController.updateTour);
router.delete("/:id", protect, restrictTo("admin", "lead-guide"), tourController.deleteTour);

///nested routes
// router.post("/:tourId/reviews",protect,restrictTo("user"),createReview);



module.exports = router;