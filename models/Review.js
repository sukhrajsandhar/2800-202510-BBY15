const mongoose = require('mongoose');

// Define the Review schema
const reviewSchema = new mongoose.Schema({
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
        ref: 'User',
        required: true
    },
    overallRating: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    dateVisited: {
        type: Date,
        required: true
    },
    electricityWaterHookups: {
        type: String,
        default: 'No'
    },
    dogFriendly: {
        type: String,
        default: 'No'
    },
    picnicTables: {
        type: String,
        default: 'No'
    },
    firePitsGrills: {
        type: String,
        default: 'No'
    },
    cellService: {
        type: String,
        default: 'No'
    },
    trashRecycleBins: {
        type: String,
        default: 'No'
    },
    washrooms: {
        type: String,
        default: 'No'
    },
    additionalComments: {
        type: String,
        default: 'No'
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
// Compare this snippet from routes/api/campsites.js: