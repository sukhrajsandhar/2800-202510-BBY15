const mongoose = require('mongoose');

// Define the Alert schema
const alertSchema = new mongoose.Schema({
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
    alertType: {
        type: String,
        required: true
    },
    alertDate: {
        type: Date,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;