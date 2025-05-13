const express = require('express');
const router = express.Router();
const Trail = require('../../models/Trail');

// Get all trails
router.get('/', async (req, res) => {
    try {
        const trails = await Trail.find();
        res.json(trails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single trail
router.get('/:id', async (req, res) => {
    try {
        const trail = await Trail.findById(req.params.id);
        if (!trail) {
            return res.status(404).json({ message: 'Trail not found' });
        }
        res.json(trail);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new trail
router.post('/', async (req, res) => {
    const trail = new Trail({
        name: req.body.name,
        coordinates: req.body.coordinates,
        rating: req.body.rating || 0,
        reviews: req.body.reviews || 0,
        description: req.body.description,
        type: req.body.type,
        difficulty: req.body.difficulty,
        length: req.body.length,
        elevation: req.body.elevation,
        time: req.body.time,
        features: req.body.features
    });

    try {
        const newTrail = await trail.save();
        res.status(201).json(newTrail);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a trail
router.patch('/:id', async (req, res) => {
    try {
        const trail = await Trail.findById(req.params.id);
        if (!trail) {
            return res.status(404).json({ message: 'Trail not found' });
        }

        Object.keys(req.body).forEach(key => {
            trail[key] = req.body[key];
        });

        const updatedTrail = await trail.save();
        res.json(updatedTrail);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a trail
router.delete('/:id', async (req, res) => {
    try {
        const trail = await Trail.findById(req.params.id);
        if (!trail) {
            return res.status(404).json({ message: 'Trail not found' });
        }

        await trail.remove();
        res.json({ message: 'Trail deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 