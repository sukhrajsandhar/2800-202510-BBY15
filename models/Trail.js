const mongoose = require('mongoose');

const trailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    coordinates: {
        type: [Number],
        required: true,
        validate: {
            validator: function(v) {
                return v.length === 2 && 
                       v[0] >= -180 && v[0] <= 180 && 
                       v[1] >= -90 && v[1] <= 90;
            },
            message: 'Coordinates must be valid [longitude, latitude] values'
        }
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviews: {
        type: Number,
        min: 0,
        default: 0
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: 'Hiking Trail'
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Easy', 'Moderate', 'Hard']
    },
    length: {
        type: String,
        required: true
    },
    elevation: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    features: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
trailSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Trail', trailSchema); 