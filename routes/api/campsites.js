const express = require('express');
const router = express.Router();
const Campsite = require('../../models/Campsite');

// Get all campsites
router.get('/', async (req, res) => {
    try {
        const campsites = await Campsite.find();
        res.json(campsites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single campsite
router.get('/:id', async (req, res) => {
    try {
        const campsite = await Campsite.findById(req.params.id);
        if (!campsite) {
            return res.status(404).json({ message: 'Campsite not found' });
        }
        res.json(campsite);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new campsite
router.post('/', async (req, res) => {
    console.log('Received campsite data:', req.body); // Log incoming data
    // Only use fields defined in the schema
    const campsite = new Campsite({
        name: req.body.name,
        coordinates: req.body.coordinates,
        rating: req.body.rating || 0,
        reviews: req.body.reviews || 0,
        description: req.body.description,
        type: req.body.type,
        season: req.body.season,
        difficulty: req.body.difficulty,
        fees: req.body.fees,
        amenities: req.body.amenities,
        reservation: req.body.reservation,
        place_name: req.body.place_name
    });

    try {
        const newCampsite = await campsite.save();
        res.status(201).json(newCampsite);
    } catch (error) {
        console.error('Error saving campsite:', error); // Log the error
        res.status(400).json({ message: error.message });
    }
});

// Update a campsite
router.patch('/:id', async (req, res) => {
    try {
        const campsite = await Campsite.findById(req.params.id);
        if (!campsite) {
            return res.status(404).json({ message: 'Campsite not found' });
        }

        Object.keys(req.body).forEach(key => {
            campsite[key] = req.body[key];
        });

        const updatedCampsite = await campsite.save();
        res.json(updatedCampsite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a campsite
router.delete('/:id', async (req, res) => {
    try {
        const campsite = await Campsite.findById(req.params.id);
        if (!campsite) {
            return res.status(404).json({ message: 'Campsite not found' });
        }

        await campsite.remove();
        res.json({ message: 'Campsite deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Campsite list page (table view)
router.get('/list', async (req, res) => {
    try {
        const campsites = await Campsite.find().lean();
        res.render('campsite-list', { campsites });
    } catch (err) {
        res.status(500).send('Error loading campsites');
    }
});

module.exports = router; 