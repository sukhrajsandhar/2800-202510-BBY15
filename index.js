require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const mongoose = require("mongoose");
const axios = require('axios');
const Campsite = require("./models/Campsite");
const Trail = require("./models/Trail");
const Review = require('./models/Review');
const Alert = require('./models/Alert');
const Booking = require('./models/Booking');
const User = require("./models/User");
const saltRounds = 12;
const { CohereClient } = require('cohere-ai');
const cohere = new CohereClient({ apiKey: process.env.COHERE_API_KEY });

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

// after you set up express, sessions, this will fetch document of the user 
// ex: their profile picture 
// global injection middleware 
// Store that user object on res.locals.user, anything becomes automatically 
// available to all EJS templates under the username

app.use(async (req, res, next) => {
    if (req.session.authenticated && req.session.email) {
      const user = await userCollection.findOne({ email: req.session.email });
      res.locals.user = user;
    } else {
      res.locals.user = null;
    }
    next();
  });
  
// Middleware to check if the user is authenticated
function isValidSession(req) {
    if (req.session.authenticated) {
        return true;
    }
    return false;
}

function sessionValidation(req, res, next) {
    if (isValidSession(req)) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Middleware to check if the user is an admin
function isAdmin(req) {
	if (req.session.user_type === 'admin') {
		return true;
	}
	return false;
}

function adminAuthorization(req, res, next) {
	if (!isAdmin(req)) {
		res.status(403);
		res.render("errorMessage", { error: "Not Authorized" });
		return;
	}
	next();
}


app.use((req, res, next) => {
    const publicPaths = ['/login', '/signUp', '/index', '/404', '/errorMessage']; // add any static/public paths
    if (publicPaths.some(path => req.path.startsWith(path))) {
        return next();
    }
    sessionValidation(req, res, next);
});


app.get("/index", (req, res) => {
    res.render("index");
});

app.get("/", (req, res) => {
    res.render("main", { mapboxKey: process.env.MAPBOX_ACCESS_TOKEN });
});


// EDIT THIS!!!!!!!
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
            user_type: "user" 
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

    //*on the admin side I added a user_type field to the user collection
    // so that we can check if the user is an admin or not
    const result = await userCollection
        .find({ email: email })
        .project({ firstName: 1, lastName: 1, email: 1, password: 1, user_type: 1, _id: 1 }) 
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

    // Check if the password is correct
    // bcrypt.compare will return true or false
    if (await bcrypt.compare(password, user.password)) {
        console.log("correct password");
        req.session.authenticated = true;
        req.session.email = user.email;
        req.session.firstName = user.firstName;
        req.session.lastName = user.lastName;
        req.session.user_type = user.user_type; // Store user type in session
        req.session.cookie.maxAge = expireTime;
        req.session.userId = user._id; // Store user ID in session

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
        const user = await User.findById(req.session.userId).lean();
        if (!campsite) {
            return res.status(404).send('Campsite not found');
        }
        res.render("createReview", {
            campsiteId: req.params.campsiteId,
            campsiteName: campsite.name,
            userId: user._id,
            firstName: user.firstName,
        });
    } catch (err) {
        res.status(500).send("Error loading review form");
    }
});

app.get("/createAlert/:campsiteId", async (req, res) => {
    try {
        const campsite = await Campsite.findById(req.params.campsiteId).lean();
        const user = await User.findById(req.session.userId).lean();
        if (!campsite) {
            return res.status(404).send('Campsite not found');
        }
        res.render("createAlert", {
            campsiteId: req.params.campsiteId,
            campsiteName: campsite.name,
            userId: user._id,
            firstName: user.firstName
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
        const campsites = await Campsite.find().lean();   
        const campsite = await Campsite.findById(req.params.campsiteId).lean();
        if (!campsite) {
            return res.status(404).send('Campsite not found');
        }
        res.render("createBooking", {
            campsites,
            campsiteId: req.params.campsiteId,
            campsiteName: campsite.name,
            firstName: req.session.firstName || null,
            userId: req.session.userId || null,
        });
    } catch (err) {
        res.status(500).send("Error loading booking form");
    }
});

app.get("/booked", async (req, res) => {
    try {
      if (!req.session.authenticated || !req.session.email) {
        return res.redirect("/login");
      }
  
      const user = await userCollection.findOne({ email: req.session.email });
      if (!user) {
        return res.render("booked", { bookings: [] });
      }
  
      // Get bookings by userId and populate campsite details
      const bookings = await Booking.find({ userId: user._id })
        .populate('campsiteId')
        .lean();
  
      res.render("booked", { bookings });
    } catch (err) {
      console.error("Error loading booked campsites:", err);
      res.status(500).send("Something went wrong.");
    }
  });
  
  app.post('/bookings/:id/delete', async (req, res) => {
    await Booking.findByIdAndDelete(req.params.id);
    res.redirect('/booked'); 
  });
  

// get the profile page
app.get("/profile", async (req, res) => {
    if (!req.session.authenticated) return res.redirect("/login");
  
    try {
      const user = await userCollection.findOne({ email: req.session.email });
      if (!user) return res.status(404).send("User not found");
      res.render("profile", { user });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });
  
  // update profile picture (avatar)
  app.post("/profile/picture", async (req, res) => {
    if (!req.session.authenticated) return res.redirect("/login");
  
    try {
      const { avatar } = req.body;
      if (!avatar) return res.status(400).send("No avatar selected.");
  
      await userCollection.updateOne(
        { email: req.session.email },
        { $set: { profileImage: `/images/avatars/${avatar}` } }
      );
  
      res.redirect("/profile");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });
  
  // update profile info
  app.post("/update-profile", (req, res) => {
    if (!req.session.authenticated) {
      return res.redirect("/login");
    }
  
    const { firstName, lastName, email, bio, userLevel } = req.body;
    const updateFields = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      bio: bio || "",
    };
  
    if (userLevel) {
      updateFields.userLevel = userLevel;
    }
  
    userCollection.updateOne(
      { email: req.session.email },
      { $set: updateFields },
      (err) => {
        if (err) {
          console.log("Error updating profile:", err);
          return res.status(500).send("Server error");
        }
  
        req.session.email = email;
        res.redirect("/profile");
      }
    );
  });
  


// Admin panel route
app.get('/admin', adminAuthorization, async (req, res) => {
        try {
        //fetch all user from the database
        const users = await userCollection.find().toArray(); 
        // render the admin.ejs page with the users
        res.render("admin", { users }); 
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).send("Internal Server Error /admin");
    }
});

//Admin Trusted badge
app.post("/toggle-trusted", async (req, res) => {
    const userId = req.body.userId;

    try {
        const user = await userCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });

        if (user) {
            const newTrustedStatus = !user.isTrusted;
            await userCollection.updateOne(
                { _id: new mongoose.Types.ObjectId(userId) },
                { $set: { isTrusted: newTrustedStatus } }
            );
        }

        res.redirect("/admin"); // Redirect back to the admin panel
    } catch (err) {
        console.error("Error toggling trusted badge:", err);
        res.status(500).send("Internal Server Error /toggle-trusted");
    }
    
});

//Admin toggle admin role
app.post("/toggle-role", async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await userCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        if (!user) {
            return res.status(404).render("errorMessage", { error: "User not found." });
        }
        const newRole = user.user_type === "admin" ? "user" : "admin";
        await userCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { $set: { user_type: newRole } }
        );
        res.redirect("/admin");
    } catch (err) {
        console.error("Role toggle error:", err);
        res.status(500).render("errorMessage", { error: "Could not update user role." });
    }
});

app.get("/viewAlerts/:id", async (req, res) => {
    try {
        const campsite = await Campsite.findById(req.params.id).lean();
        if (!campsite) {
            return res.status(404).send("Campsite not found");
        }

        let alerts = await Alert.find({ campsiteId: new mongoose.Types.ObjectId(req.params.id) })
        .populate('userId')  
        .lean();

        alerts.sort((a, b) => new Date(b.alertDate) - new Date(a.alertDate));

        res.render("viewAlerts", {
            campsite,
            alerts
        });
    } catch (err) {
        console.error("Error loading alerts:", err.message);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/viewReviews/:id", async (req, res) => {
    try {
        const campsite = await Campsite.findById(req.params.id).lean();
        if (!campsite) {
            return res.status(404).send("Campsite not found");
        }

        // Find reviews for this campsite and populate user info on each review
        let reviews = await Review.find({ campsiteId: req.params.id })
            .populate('userId')  // populate user info in each review
            .lean();

        // Sort reviews by dateCreated descending (most recent first)
        reviews.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

        res.render("viewReviews", { campsite, reviews });
    } catch (err) {
        console.error("Error loading reviews:", err.message);
        res.status(500).send("Internal Server Error");
    }
});




//Sydney
app.get("/viewBookings/:id", async (req, res) => {
    try {
      const campsite = await Campsite.findById(req.params.id).lean();
  
      const bookings = await Booking.find({ campsiteId: req.params.id })
        .populate('userId')
        .lean();
  
      if (!campsite) {
        return res.status(404).send('Campsite not found');
      }
  
      bookings.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  
      res.render("viewBookings", {
        campsite,
        booking: bookings,
        currentUserFirstName: req.session.firstName || 'Camper'
      });
    } catch (err) {
      console.error("Error in /viewBookings/:id", err); // debug
      res.status(500).send("Error loading bookings");
    }
  });
  
// Route to fetch booking owner info
//Sydney
app.get("/booking/:id/contact-info", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId')
            .populate('campsiteId'); // so you can get campsite name

        if (!booking || !booking.userId || !booking.campsiteId) {
            return res.status(404).json({ error: "Booking, user, or campsite not found" });
        }

        // Prevent contacting yourself
        if (req.session.userId === booking.userId._id.toString()) {
            return res.status(403).json({ error: "You cannot contact yourself." });
        }

        res.json({
            name: booking.userId.name || booking.userId.firstName,
            email: booking.userId.email,
            userFirstName: booking.userId.firstName,
            campsiteName: booking.campsiteId.name,
            startDate: booking.startDate.toDateString(),
            endDate: booking.endDate.toDateString()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Adding or removing a campsite from favourites
app.post('/favourites/:campsiteId', async (req, res) => {
    const email = req.session.email;
  
    // Check if user is logged in
    if (!email) {
      return res.status(401).send("You must be logged in to do that.");
    }
  
    try {
      // Finds the user email
      const user = await userCollection.findOne({ email });
      if (!user) return res.status(404).send("User not found");
  
      const campsiteId = req.params.campsiteId;
      const action = req.body.action; // add/remove campsites
  
      let update;
      if (action === "add") {
        update = { $addToSet: { favourites: campsiteId } }; // add only if not already there
      } else if (action === "remove") {
        update = { $pull: { favourites: campsiteId } }; // remove if it exists
      } else {
        return res.status(404).send("Invalid action");
      }
  
      // Update the user doc
      await userCollection.updateOne({ _id: user._id }, update);
      res.sendStatus(200);
    } catch (err) {
      console.error("Error updating favourites:", err);
      res.status(500).send("Something went wrong.");
    }
  });
  


// Show the user's favourite campsites
app.get("/favourites", async (req, res) => {
    try {
      // Redirect to login 
      if (!req.session.authenticated || !req.session.email) {
        return res.redirect("/login");
      }
  
      // finds the email of the user 
      const user = await userCollection.findOne({ email: req.session.email });
      if (!user || !user.favourites) {
        return res.render("favourites", { campsites: [], favourites: [] });
      }
  
      // takes all campsites that match the user's favourite IDs
      const favouriteCampsites = await Campsite.find({
        _id: { $in: user.favourites }
      });
  
      // renders with the list of favourite campsites
      res.render("favourites", {
        campsites: favouriteCampsites,
        favourites: user.favourites.map(id => id.toString()) // ensure strings for EJS
      });
    } catch (err) {
      console.error("Error loading favourites:", err);
      res.status(500).send("Something went wrong.");
    }
  });
  


/**
 * Campsite-Info! connect and read from mongoDB
 * --> bookings, reviews, alerts
 */
// Added weather info to the campsite-info page 
app.get("/campsite-info/:id", async (req, res) => {
    const campsiteId = req.params.id;
    
    try {
      // Make sure you get email from logged in user (adjust according to your auth)
      const email = req.user?.email || req.session?.email;
      if (!email) {
        return res.status(401).send("Not authenticated");
      }
  
      // Find the user by email
      const user = await userCollection.findOne({ email });
  
      // Find campsite and related data
      const campsite = await Campsite.findById(req.params.id).lean();
      if (!campsite) return res.status(404).send("Campsite not found");
  
      const review = await Review.find({ campsiteId: new mongoose.Types.ObjectId(req.params.id) }).populate('userId').lean().limit(3);
      const booking = await Booking.find({ campsiteId: new mongoose.Types.ObjectId(req.params.id) }).populate('userId').lean().limit(3);
      const alert = await Alert.find({ campsiteId: new mongoose.Types.ObjectId(req.params.id) }).populate('userId').lean().limit(3);
  
      // Check if user has favorited this campsite
      const isFavorited = user?.favourites?.map(id => id.toString()).includes(campsiteId);
      console.log("isFavorited before render:", isFavorited);
        
      // Weather fetch logic remains unchanged
      let weather = null;
      if (campsite.coordinates && campsite.coordinates.length === 2) {
        const [longitude, latitude] = campsite.coordinates;
        if (latitude && longitude) {
          try {
            const apiKey = process.env.OPENWEATHER_API_KEY;
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
            const weatherResponse = await axios.get(weatherUrl);
            const weatherData = weatherResponse.data;
            weather = {
              icon: weatherData.weather[0].icon,
              temp: weatherData.main.temp,
              desc: weatherData.weather[0].description,
            };
          } catch (error) {
            console.error("Error fetching weather data:", error.message);
          }
        }
      } else {
        console.error("Invalid coordinates for campsite:", campsite);
        return res.status(400).send("Invalid coordinates");
      }
  
      // Render page with all the data
      res.render("campsite-Info", { campsite, weather, review, booking, alert, isFavorited });
    } catch (err) {
      console.error("Error loading campsite info:", err.message);
      res.status(500).send("Internal Server Error");
    }
  });
  

app.get('/api/funfact/:campsiteName', async (req, res) => {
    try {
        const campsiteName = req.params.campsiteName;
        const prompt = `Tell me a unique, short camping fact related to nature or this place: ${campsiteName}. Only 1 sentence! Maximum 30 words.`;
        const response = await cohere.generate({
            model: 'command-r-plus',
            prompt: prompt,
            max_tokens: 40,
            temperature: 0.7,
        });
        res.json({ funFact: response.generations[0].text.trim() });
    } catch (err) {
        res.status(500).json({ funFact: "Could not generate fun fact." });
    }
});


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
        if (!reviewData.campsiteId || !reviewData.overallRating || !reviewData.dateVisited || !reviewData.userId) {
            console.log('Missing required fields:', {
                userId: !reviewData.userId,
                campsiteId: !reviewData.campsiteId,
                overallRating: !reviewData.overallRating,
                dateVisited: !reviewData.dateVisited
            });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create a new review document
        const review = new Review({
            userId: reviewData.userId || null,
            firstName: reviewData.firstName || 'Anonymous',
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
        if (!alertData.campsiteId || !alertData.alertType || !alertData.alertDate || !alertData.userId) {
            console.log('Missing required fields:', {
                userId: !alertData.userId,
                campsiteId: !alertData.campsiteId,
                alertType: !alertData.alertType,
                alertDate: !alertData.alertDate
            });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create a new alert document
        const alert = new Alert({
            userId: alertData.userId || null,
            firstName: alertData.firstName || 'Anonymous',
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
            userId: req.session.userId,
            firstName: req.session.firstName || 'Anonymous',            
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            dateCreated: new Date(),
            tentSpots: bookingData.tentSpots || 0,
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

const startCleanupJob = require('./scripts/cleanupBookings');
startCleanupJob();

// Add the correct catch-all middleware
app.use((req, res) => {
    res.status(404);
    res.render("404");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});