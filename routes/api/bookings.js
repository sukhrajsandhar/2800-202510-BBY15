const express = require('express');
const router = express.Router();
const Booking = require('../../models/Booking');

// Get all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().lean();
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get a single booking by ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).lean();
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});

// Create a new booking
router.post('/', async (req, res) => {
    console.log('Received booking data:', req.body); // Log incoming data
    // Only use fields defined in the schema
    const booking = new Booking({
        campsiteId: req.body.campsiteId,
        firstName: req.session.firstName || null,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        dateCreated: req.body.dateCreated || new Date(),
        tentSpots: req.body.tentSpots,
        contactInfo: req.body.contactInfo,
        summary: req.body.summary
    });

    try {
        const newBooking = await booking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        console.error('Error saving booking:', error); // Log the error
        res.status(400).json({ error: 'Failed to create booking' });
    }
});

// Delete a booking by ID
router.delete('/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.status(204).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

router.get('/listBookings', async (req, res) => {
    try {
        const bookings = await Booking.find().lean();
        res.render('viewBookings', { bookings });
    } catch (err) {
        res.status(500).send('Error loading bookings');
    }
});

module.exports = router;