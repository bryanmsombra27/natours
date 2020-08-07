/* eslint-disable prettier/prettier */
const express = require('express');
//merge params
const router = express.Router({
    mergeParams: true
});

const {
    getAllReviews,
    createReview,
    deleteReview,
    updateReview,
    setTourUserId,
    getReview
} = require('../controller/ReviewController');
const {
    protect,
    restrictTo
} = require('../controller/authController');


router.use(protect);


//nest routes en express routes
router.get("/", getAllReviews);
router.post("/", restrictTo("user"), setTourUserId, createReview);
router.delete("/:id", restrictTo("admin", "user"), deleteReview);
router.patch("/:id", restrictTo("admin", "user"), updateReview);
router.get("/:id", getReview);

module.exports = router;