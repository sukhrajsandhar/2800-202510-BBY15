const express = require('express');
const router = express.Router();
const Review = require('../../models/Review');

// Get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single review
router.get('/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new review
router.post('/', async (req, res) => {
    console.log('Received review data:', req.body); // Log incoming data
    // Only use fields defined in the schema
    const review = new Review({
        userId: req.body.userId,
        firstName: req.body.firstName,
        campsiteId: req.body.campsiteId,
        overallRating: req.body.overallRating,
        dateVisited: req.body.dateVisited,
        electricityWaterHookups: req.body.electricityWaterHookups,
        dogFriendly: req.body.dogFriendly,
        picnicTables: req.body.picnicTables,
        firePitsGrills: req.body.firePitsGrills,
        cellService: req.body.cellService,
        trashRecycleBins: req.body.trashRecycleBins,
        washrooms: req.body.washrooms,
        additionalComments: req.body.additionalComments,
        date: req.body.date || new Date()
    });

    try {
        const newReview = await review.save();
        res.status(201).json(newReview);
    } catch (error) {
        console.error('Error saving review:', error); // Log the error
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;