const express = require('express');
const router = express.Router();
const Alert = require('../../models/Alert');

// Get all alerts
router.get('/', async (req, res) => {
    try {
        const alerts = await Alert.find();
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single alert
router.get('/:id', async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }
        res.json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new alert
router.post('/', async (req, res) => {
    console.log('Received alert data:', req.body);

    const alert = new Alert({
        userId: req.body.userId,
        campsiteId: req.body.campsiteId,
        alertType: req.body.category,    
        alertDate: req.body.date,          
        message: req.body.description,   
        dateCreated: new Date()
    });

    try {
        const newAlert = await alert.save();
        res.status(201).json(newAlert);
    } catch (error) {
        console.error('Error saving alert:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
