const mongoose = require('mongoose');
const Campsite = require('../models/Campsite');
const Trail = require('../models/Trail');
require('dotenv').config();

// Get MongoDB connection details from environment variables
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;

// Initial data
const initialCampsites = [
    {
        name: "Porteau Cove Provincial Park",
        coordinates: [-123.2375, 49.5575],
        rating: 4.5,
        reviews: 128,
        description: "A scenic waterfront campground with stunning views of Howe Sound.",
        type: "Provincial Park",
        season: "Year-round",
        difficulty: "Easy",
        fees: {
            camping: "$35/night",
            dayUse: "$3/person"
        },
        amenities: [
            "Flush Toilets",
            "Drinking Water",
            "Fire Pits",
            "Picnic Tables",
            "Boat Launch"
        ],
        reservation: "https://bcparks.ca/reserve/porteau-cove/",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
    },
    {
        name: "Alice Lake Provincial Park",
        coordinates: [-123.0775, 49.7775],
        rating: 4.3,
        reviews: 95,
        description: "Family-friendly campground surrounded by four lakes and mountain views.",
        type: "Provincial Park",
        season: "May-September",
        difficulty: "Easy",
        fees: {
            camping: "$35/night",
            dayUse: "$3/person"
        },
        amenities: [
            "Flush Toilets",
            "Hot Showers",
            "Drinking Water",
            "Fire Pits",
            "Swimming Area"
        ],
        reservation: "https://bcparks.ca/reserve/alice-lake/",
        imageUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80"
    },
    {
        name: "Garibaldi Lake",
        coordinates: [-123.0017, 49.9500],
        rating: 4.8,
        reviews: 156,
        description: "Backcountry camping with breathtaking views of Garibaldi Lake and surrounding peaks.",
        type: "Backcountry",
        season: "July-September",
        difficulty: "Moderate",
        fees: {
            camping: "$10/night"
        },
        amenities: [
            "Pit Toilets",
            "Food Storage",
            "Camping Pads"
        ],
        reservation: "https://bcparks.ca/reserve/garibaldi/",
        imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80"
    },
    {
        name: "Golden Ears Provincial Park",
        coordinates: [-122.4775, 49.2775],
        rating: 4.7,
        reviews: 312,
        description: "One of BC's largest parks with diverse recreational opportunities.",
        type: "Provincial Park",
        season: "Year-round",
        difficulty: "Easy",
        fees: {
            camping: "$35/night",
            dayUse: "$3/person"
        },
        amenities: [
            "Flush Toilets",
            "Showers",
            "Drinking Water",
            "Fire Pits",
            "Picnic Tables",
            "Horse Trails"
        ],
        reservation: "https://bcparks.ca/reserve/golden-ears/",
        imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80"
    }
];

const initialTrails = [
    {
        name: "Grouse Grind",
        coordinates: [-123.0847, 49.3777],
        rating: 4.7,
        reviews: 2500,
        description: "Known as 'Mother Nature's Stairmaster', this challenging 2.9km trail gains 853m in elevation.",
        type: "Hiking Trail",
        difficulty: "Hard",
        length: "2.9 km",
        elevation: "853m",
        time: "1.5-2 hours",
        features: [
            "Steep Incline",
            "Wooden Stairs",
            "Forest Setting",
            "Viewpoints"
        ]
    },
    {
        name: "Lynn Canyon Loop",
        coordinates: [-123.0277, 49.3422],
        rating: 4.6,
        reviews: 1800,
        description: "A beautiful loop trail featuring a suspension bridge, waterfalls, and swimming holes.",
        type: "Hiking Trail",
        difficulty: "Easy",
        length: "2.6 km",
        elevation: "100m",
        time: "1-1.5 hours",
        features: [
            "Suspension Bridge",
            "Waterfalls",
            "Swimming Holes",
            "Forest Trails"
        ]
    },
    {
        name: "Quarry Rock",
        coordinates: [-122.9527, 49.3147],
        rating: 4.5,
        reviews: 2200,
        description: "Popular trail in Deep Cove leading to a scenic viewpoint over Indian Arm.",
        type: "Hiking Trail",
        difficulty: "Easy",
        length: "3.8 km",
        elevation: "100m",
        time: "1-1.5 hours",
        features: [
            "Ocean Views",
            "Rocky Outcrop",
            "Forest Trail",
            "Family Friendly"
        ]
    },
    {
        name: "St. Mark's Summit",
        coordinates: [-123.2017, 49.3947],
        rating: 4.8,
        reviews: 1200,
        description: "Challenging trail in Cypress Provincial Park with panoramic views of Howe Sound.",
        type: "Hiking Trail",
        difficulty: "Moderate",
        length: "11 km",
        elevation: "460m",
        time: "4-5 hours",
        features: [
            "Panoramic Views",
            "Alpine Meadows",
            "Wildlife Viewing",
            "Photography Spots"
        ]
    },
    {
        name: "Dog Mountain",
        coordinates: [-122.9527, 49.3647],
        rating: 4.4,
        reviews: 1500,
        description: "Short but rewarding trail on Mount Seymour with views of the city and surrounding mountains.",
        type: "Hiking Trail",
        difficulty: "Easy",
        length: "5 km",
        elevation: "100m",
        time: "1.5-2 hours",
        features: [
            "City Views",
            "Mountain Views",
            "Family Friendly",
            "Year-round Access"
        ]
    }
];

// Connect to MongoDB Atlas
mongoose.connect(`mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('Connected to MongoDB Atlas');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    try {
        // Clear existing data
        await Campsite.deleteMany({});
        await Trail.deleteMany({});
        console.log('Cleared existing data');

        // Insert new data
        const campsites = await Campsite.insertMany(initialCampsites);
        const trails = await Trail.insertMany(initialTrails);
        console.log(`Successfully seeded ${campsites.length} campsites and ${trails.length} trails`);
        // Close the connection
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding database:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        mongoose.connection.close();
    }
})
.catch(err => {
    console.error('Could not connect to MongoDB:', err);
    console.error('Connection details:', {
        host: mongodb_host,
        database: mongodb_database,
        user: mongodb_user
    });
});