require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const mongoose = require("mongoose");
const Campsite = require("./models/Campsite");
const Trail = require("./models/Trail");
const Review = require('./models/Review');
const Alert = require('./models/Alert');
const Booking = require('./models/Booking');
const saltRounds = 12;

const app = express();
const port = process.env.PORT || 8888;
const Joi = require("joi");

const expireTime = 1 * 60 * 60 * 1000; //expires after 1 hour  (hours * minutes * seconds * millis)

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

const { database } = require("./databaseConnection");

const userCollection = database.db(mongodb_database).collection("users");

// MongoDB connection
mongoose.connect(`mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
})
.catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1); // Exit if we can't connect to the database
});

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/styles"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`,
    crypto: {
        secret: mongodb_session_secret,
    },
});

app.use(
    session({
        secret: node_session_secret,
        store: mongoStore,
        saveUninitialized: false,
        resave: true,
    })
);

app.get("/", (req, res) => {
    res.render("main", { mapboxKey: process.env.MAPBOX_ACCESS_TOKEN });
});

app.get("/nosql-injection", async (req, res) => {
    var username = req.query.user;

    if (!username) {
        res.send(
            `<h3>no user provided - try /nosql-injection?user=name</h3> <h3>or /nosql-injection?user[$ne]=name</h3>`
        );
        return;
    }
    console.log("user: " + username);

    const schema = Joi.string().max(20).required();
    const validationResult = schema.validate(username);

    //If we didn't use Joi to validate and check for a valid URL parameter below
    // we could run our userCollection.find and it would be possible to attack.
    // A URL parameter of user[$ne]=name would get executed as a MongoDB command
    // and may result in revealing information about all users or a successful
    // login without knowing the correct password.
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.send(
            "<h1 style='color:darkred;'>A NoSQL injection attack was detected!!</h1>"
        );
        return;
    }

    const result = await userCollection
        .find({ username: username })
        .project({ username: 1, password: 1, _id: 1 })
        .toArray();

    console.log(result);

    res.send(`<h1>Hello ${username}</h1>`);
});

app.get("/signUp", (req, res) => {
    var image = ["login_img.jpg", "signUp.png"];
    res.render("signUp", { image: image });
});

app.post("/signUpSubmit", async (req, res) => {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var password = req.body.password;
    var email = req.body.email;

    var image = ["login_img.jpg", "signUp.png"];

    if (!firstName) {
        res.render("signUp", {
            error: "First name is required.",
            image: image,
        });
    } else if (!lastName) {
        res.render("signUp", { error: "Last name is required.", image: image });
    } else if (!email) {
        res.render("signUp", { error: "Email is required.", image: image });
    } else if (!password) {
        res.render("signUp", { error: "Password is required.", image: image });
    } else {
        const schema = Joi.object({
            firstName: Joi.string().alphanum().max(20).required(),
            lastName: Joi.string().alphanum().max(20).required(),
            password: Joi.string().max(20).required(),
            email: Joi.string().email().max(100).required(),
        });

        const validationResult = schema.validate({
            firstName,
            lastName,
            email,
            password,
        });
        if (validationResult.error != null) {
            console.log(validationResult.error);
            res.render("signUp", {
                error: "Invalid input. Please follow the rules.",
                image: image,
            });
            return;
        }

        var hashedPassword = await bcrypt.hash(password, saltRounds);

        await userCollection.insertOne({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });
        console.log("Inserted user");

        req.session.authenticated = true;
        req.session.email = email;

        res.redirect("/");
    }
});

app.get("/login", (req, res) => {
    var image = ["login_img.jpg"];
    res.render("login", { image: image });
});

app.post("/loginSubmit", async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    const schema = Joi.object({
        email: Joi.string().email().max(100).required(),
        password: Joi.string().max(20).required(),
    });

    const validationResult = schema.validate({ email, password });
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.render("login", {
            error: "Invalid input. Please check your email and password.",
            image: ["login_img.jpg"],
        });
        return;
    }

    const result = await userCollection
        .find({ email: email })
        .project({ firstName: 1, lastName: 1, email: 1, password: 1, _id: 1 })
        .toArray();

    console.log(result);

    if (result.length !== 1) {
        console.log("User not found");
        res.render("login", {
            error: "Invalid email/password combination.",
            image: ["login_img.jpg"],
        });
        return;
    }

    const user = result[0];

    if (await bcrypt.compare(password, user.password)) {
        console.log("correct password");
        req.session.authenticated = true;
        req.session.email = user.email;
        req.session.firstName = user.firstName;
        req.session.lastName = user.lastName;
        req.session.cookie.maxAge = expireTime;

        res.redirect("/");
    } else {
        console.log("Incorrect password");
        res.render("login", {
            error: "Invalid email/password combination.",
            image: ["login_img.jpg"],
        });
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log("Error destroying session:", err);
            res.status(500).render("error", { message: "Error logging out." });
        } else {
            res.render("logout");
        }
    });
});

app.get("/createReview/:campsiteId", async (req, res) => {
    try {
        const campsite = await Campsite.findById(req.params.campsiteId).lean();
        if (!campsite) {
            return res.status(404).send('Campsite not found');
        }
        res.render("createReview", {
            campsiteId: req.params.campsiteId, campsiteName: campsite.name});
    } catch (err) {
        res.status(500).send("Error loading review form");
    }
});

app.get("/createAlert/:campsiteId", async (req, res) => {
    try {
        const campsite = await Campsite.findById(req.params.campsiteId).lean();
        if (!campsite) {
            return res.status(404).send('Campsite not found');
        }
        res.render("createAlert", {
            campsiteId: req.params.campsiteId,
            campsiteName: campsite.name
        });
    } catch (err) {
        res.status(500).send("Error loading alert form");
    }
});

/**
 * Sydney Create Booking!!!
 */
app.get("/createBooking/:campsiteId", async (req, res) => {
    try {
        const campsite = await Campsite.findById(req.params.campsiteId).lean();
        if (!campsite) {
            return res.status(404).send('Campsite not found');
        }
        res.render("createBooking", {
            campsiteId: req.params.campsiteId,
            campsiteName: campsite.name,
            firstName: req.session.firstName || null,
        });
    } catch (err) {
        res.status(500).send("Error loading booking form");
    }
});

app.get("/booked", (req, res) => {
    const campsite = {
        id: 1,
        name: "Sunset Woods",
        imageUrl: "/camp.png",
        date: "2025-06-15",
        tents: 2,
        people: 4,
    };

    res.render("booked", { campsite });
});

app.get("/profile", (req, res) => {
    const user = {
        firstName: "Margot",
        lastName: "Robbie",
        email: "margot@example.com",
        bio: "",
        profileImage: "",
        userLevel: "",
    };
    res.render("profile", { user });
});


/**
 * Sydney viewBookings 
 */
app.get("/viewBookings", (req, res) => {
    res.render("viewBookings", { campsite: null, bookings: [] });
});







app.get("/viewAlerts", (req, res) => {
    res.render("viewAlerts");
});

app.get("/viewReviews", (req, res) => {
    res.render("viewReviews");
});

app.get("/favourites", (req, res) => {
    const favCampsites = {
        id: 1,
        name: "Porteau Cove",
        imageUrl: "/PorteauCove.svg",
        rating: 4.5,
        bio: "Porteau Cove is a scenic provincial park located along the Sea-to-Sky Highway in British Columbia, known for its waterfront campsites, rocky beach, and stunning views of Howe Sound. It is popular for activities like scuba diving, stargazing, and quick getaways from Vancouver due to its proximity and natural beauty.",
    };
    res.render("favourites", { favCampsites });
});

/**
 * Campsite-Info! connect and read from mongoDB
 * --> bookings, reviews, alerts
 */
app.get("/campsite-info/:id", async (req, res) => {
    try {
        const campsite = await Campsite.findById(req.params.id).lean(); 
        const review = await Review.find({ campsiteId: new mongoose.Types.ObjectId(req.params.id) }).lean(); // NOTE: must limit to 2 reviews
        const booking = await Booking.find({ campsiteId: new mongoose.Types.ObjectId(req.params.id) }).lean();
        const alert = await Alert.find({ campsiteId: new mongoose.Types.ObjectId(req.params.id) }).lean();
        if (!campsite) {
            return res.status(404).send('Campsite not found');
        }
        res.render('campsite-Info', { campsite, review, booking, alert });
        console.log('Campsite:', campsite);
        console.log('Reviews:', review);
        console.log('Alerts:', alert);
        console.log('Bookings:', booking);
    } catch (err) {
        res.status(500).send('Error loading campsite info');
    }
});

// //Original /campsite-info/:id route
// app.get("/campsite-info/:id", async (req, res) => {
//     try {
//         const campsite = await Campsite.findById(req.params.id).lean();
//         if (!campsite) {
//             return res.status(404).send('Campsite not found');
//         }
//         res.render('campsite-Info', { campsite, bookings: [] });
//     } catch (err) {
//         res.status(500).send('Error loading campsite info');
//     }
// });







// Update the GET /api/campsites endpoint to use MongoDB
app.get("/api/campsites", async (req, res) => {
    try {
        console.log('Fetching campsites from MongoDB...');
        const campsites = await Campsite.find();
        console.log(`Found ${campsites.length} campsites:`, campsites);
        
        // Transform the data to match the expected GeoJSON format
        const geojsonCampsites = {
            type: "FeatureCollection",
            features: campsites.map(campsite => ({
                type: "Feature",
                properties: {
                    _id: campsite._id,
                    name: campsite.name,
                    type: "campsite",
                    rating: campsite.rating,
                    reviews: campsite.reviews,
                    description: campsite.description,
                    facilities: campsite.amenities,
                    season: campsite.season,
                    difficulty: campsite.difficulty,
                    fees: campsite.fees,
                    amenities: campsite.amenities,
                    reservation: campsite.reservation
                },
                geometry: {
                    type: "Point",
                    coordinates: campsite.coordinates
                }
            }))
        };
        
        console.log('Sending GeoJSON response:', geojsonCampsites);
        res.json(geojsonCampsites);
    } catch (error) {
        console.error('Error fetching campsites:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to fetch campsites' });
    }
});

// Add trails endpoint with error handling
app.get("/api/trails", (req, res) => {
    try {
        const trails = [
            {
                name: "Garibaldi Lake Trail",
                coordinates: [-123.0017, 49.9500],
                rating: 4.8,
                reviews: 156,
                description: "A challenging but rewarding hike to the stunning Garibaldi Lake.",
                type: "Hiking",
                difficulty: "Moderate",
                length: "18 km",
                elevation: "820 m",
                time: "5-6 hours",
                features: [
                    "Lake Views",
                    "Mountain Scenery",
                    "Wildlife",
                    "Camping Available"
                ]
            },
            {
                name: "Stawamus Chief Trail",
                coordinates: [-123.1500, 49.6800],
                rating: 4.6,
                reviews: 245,
                description: "Popular hike to the iconic Stawamus Chief with three peaks to choose from.",
                type: "Hiking",
                difficulty: "Moderate",
                length: "11 km",
                elevation: "600 m",
                time: "4-5 hours",
                features: [
                    "Summit Views",
                    "Rock Scrambling",
                    "Photo Opportunities"
                ]
            },
            {
                name: "Lynn Canyon Loop",
                coordinates: [-123.0200, 49.3400],
                rating: 4.4,
                reviews: 189,
                description: "Beautiful forest trail with suspension bridge and waterfalls.",
                type: "Hiking",
                difficulty: "Easy",
                length: "3 km",
                elevation: "100 m",
                time: "1-2 hours",
                features: [
                    "Suspension Bridge",
                    "Waterfalls",
                    "Forest Trail",
                    "Family Friendly"
                ]
            }
        ];
        res.json(trails);
    } catch (error) {
        console.error('Error in /api/trails:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Sydney: include an app.get for bookings, alerts, reviews?
 */

app.get("/api/bookings", async (req, res) => {
    try {
        const bookings = await Booking.find().lean();
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});



// Add POST endpoint for /api/campsites
app.post("/api/campsites", async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        const campsiteData = req.body;
        
        // Validate the campsite data
        if (!campsiteData.name || !campsiteData.coordinates || !campsiteData.description || !campsiteData.type || !campsiteData.season || !campsiteData.difficulty || !campsiteData.fees) {
            console.log('Missing required fields:', {
                name: !campsiteData.name,
                coordinates: !campsiteData.coordinates,
                description: !campsiteData.description,
                type: !campsiteData.type,
                season: !campsiteData.season,
                difficulty: !campsiteData.difficulty,
                fees: !campsiteData.fees
            });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create a new campsite document
        const campsite = new Campsite({
            name: campsiteData.name,
            coordinates: campsiteData.coordinates,
            description: campsiteData.description,
            type: campsiteData.type,
            season: campsiteData.season,
            difficulty: campsiteData.difficulty,
            fees: campsiteData.fees,
            amenities: campsiteData.amenities || [],
            reservation: campsiteData.reservation || '',
            place_name: campsiteData.place_name || '',
            rating: campsiteData.rating || 0,
            reviews: campsiteData.reviews || 0
        });

        console.log('Created campsite document:', campsite);

        // Save the campsite to MongoDB
        const savedCampsite = await campsite.save();
        console.log('Successfully saved campsite:', savedCampsite);
        res.status(201).json(savedCampsite);
    } catch (error) {
        console.error('Error saving campsite:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to save campsite: ' + error.message });
    }
});

app.post("/api/reviews", async (req, res) => {
    try {
        console.log('Received review data:', req.body);
        const reviewData = req.body;

        // Validate the review data
        if (!reviewData.campsiteId || !reviewData.overallRating || !reviewData.dateVisited) {
            console.log('Missing required fields:', {
                campsiteId: !reviewData.campsiteId,
                overallRating: !reviewData.overallRating,
                dateVisited: !reviewData.dateVisited
            });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create a new review document
        const review = new Review({
            campsiteId: reviewData.campsiteId,
            overallRating: reviewData.overallRating,
            dateVisited: reviewData.dateVisited,
            electricityWaterHookups: reviewData.electricityWaterHookups || false,
            dogFriendly: reviewData.dogFriendly || false,
            picnicTables: reviewData.picnicTables || false,
            firePitsGrills: reviewData.firePitsGrills || false,
            cellService: reviewData.cellService || false,
            trashRecycleBins: reviewData.trashRecycleBins || false,
            washrooms: reviewData.washrooms || false,
            additionalComments: reviewData.additionalComments || '',
            date: new Date()
        });

        console.log('Created review document:', review);

        // Save the review to MongoDB
        const savedReview = await review.save();
        console.log('Successfully saved review:', savedReview);
        res.status(201).json(savedReview);
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).json({ error: 'Failed to save review: ' + error.message });
    }
});

app.post("/api/alerts", async (req, res) => {
    try {
        console.log('Received alert data:', req.body);
        const alertData = req.body;

        // Validate the alert data
        if (!alertData.campsiteId || !alertData.alertType || !alertData.alertDate) {
            console.log('Missing required fields:', {
                campsiteId: !alertData.campsiteId,
                alertType: !alertData.alertType,
                alertDate: !alertData.alertDate
            });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create a new alert document
        const alert = new Alert({
            campsiteId: alertData.campsiteId,
            alertType: alertData.alertType,
            alertDate: alertData.alertDate,
            message: alertData.message || '',
            dateCreated: new Date()
        });

        console.log('Created alert document:', alert);

        // Save the alert to MongoDB
        const savedAlert = await alert.save();
        console.log('Successfully saved alert:', savedAlert);
        res.status(201).json(savedAlert);
    } catch (error) {
        console.error('Error saving alert:', error);
        res.status(500).json({ error: 'Failed to save alert: ' + error.message });
    }
});


app.post("/api/bookings", async (req, res) => {
    try {
        console.log('Received booking data:', req.body);
        const bookingData = req.body;

        // Validate the booking data
        if (!bookingData.campsiteId || !bookingData.startDate || !bookingData.endDate) {
            console.log('Missing required fields:', {
                campsiteId: !bookingData.campsiteId,
                //firstName: !bookingData.firstName,
                startDate: !bookingData.startDate,
                endDate: !bookingData.endDate
            });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create a new booking document
        const booking = new Booking({
            campsiteId: bookingData.campsiteId,
            firstName: bookingData.firstName || null,
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            dateCreated: new Date(),
            tentSpots: bookingData.tentSpots || 0,
            contactInfo: bookingData.contactInfo || '',
            summary: bookingData.summary || ''
        });

        console.log('Created booking document:', booking);

        // Save the booking to MongoDB
        const savedBooking = await booking.save();
        console.log('Successfully saved booking:', savedBooking);
        res.status(201).json(savedBooking);
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).json({ error: 'Failed to save booking: ' + error.message });
    }
});

// Add the correct catch-all middleware
app.use((req, res) => {
    res.status(404);
    res.render("404");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
