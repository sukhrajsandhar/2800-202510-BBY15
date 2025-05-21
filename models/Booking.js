const mongoose = require('mongoose');

// Define the Booking schema
const bookingSchema = new mongoose.Schema({
    campsiteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campsite',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    tentSpots: {
        type: Number,
        required: true
    },
    contactInfo: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    }
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;

// This schema defines the structure of a booking document in the MongoDB database.