const mongoose = require('mongoose');

const campsiteSchema = new mongoose.Schema({
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
        enum: ['Provincial Park', 'National Park', 'Private Campground', 'Backcountry', 'Other']
    },
    season: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Easy', 'Moderate', 'Hard']
    },
    fees: {
        camping: {
            type: String,
            required: true
        }
    },
    amenities: [{
        type: String
    }],
    reservation: {
        type: String,
        required: false
    },
    place_name: {
        type: String
    },
    imageUrl: {
        type: String
    },
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
campsiteSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Campsite', campsiteSchema); 