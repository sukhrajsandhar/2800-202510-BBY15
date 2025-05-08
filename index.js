require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const MongoStore = require('connect-mongo');
const session = require('express-session');
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

const { database } = require('./databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/styles"));

app.use(express.urlencoded({ extended: false }));

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`,
    crypto: {
        secret: mongodb_session_secret
    }
})

app.use(session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true
}));

app.get('/', (req, res) => {
    const email = req.session.email;
    const firstName = req.session.firstName;
    if (!email) {
        res.render('pseudoMain', { email: null });
    } else {
        res.render('pseudoMain', { email: email, firstName: firstName });
    }
});


app.get('/nosql-injection', async (req, res) => {
    var username = req.query.user;

    if (!username) {
        res.send(`<h3>no user provided - try /nosql-injection?user=name</h3> <h3>or /nosql-injection?user[$ne]=name</h3>`);
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
        res.send("<h1 style='color:darkred;'>A NoSQL injection attack was detected!!</h1>");
        return;
    }

    const result = await userCollection.find({ username: username }).project({ username: 1, password: 1, _id: 1 }).toArray();

    console.log(result);

    res.send(`<h1>Hello ${username}</h1>`);
});

app.get('/signUp', (req, res) => {
    var image = ['login_img.jpg', 'signUp.png'];
    res.render('signUp', { image: image });
});

app.post('/signUpSubmit', async (req, res) => {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var password = req.body.password;
    var email = req.body.email;

    var image = ['login_img.jpg', 'signUp.png'];

    if (!firstName) {
        res.render('signUp', { error: 'First name is required.', image: image });
    } else if (!lastName) {
        res.render('signUp', { error: 'Last name is required.', image: image });
    } else if (!email) {
        res.render('signUp', { error: 'Email is required.', image: image });
    } else if (!password) {
        res.render('signUp', { error: 'Password is required.', image: image });
    } else {
        const schema = Joi.object({
            firstName: Joi.string().alphanum().max(20).required(),
            lastName: Joi.string().alphanum().max(20).required(),
            password: Joi.string().max(20).required(),
            email: Joi.string().email().max(100).required()
        });

        const validationResult = schema.validate({ firstName, lastName, email, password });
        if (validationResult.error != null) {
            console.log(validationResult.error);
            res.render('signUp', { error: 'Invalid input. Please follow the rules.', image: image });
            return;
        }

        var hashedPassword = await bcrypt.hash(password, saltRounds);

        await userCollection.insertOne({ firstName, lastName, email, password: hashedPassword });
        console.log('Inserted user');

        req.session.authenticated = true;
        req.session.email = email;

        res.redirect('/');
    }
});

app.get('/login', (req, res) => {
    var image = ['login_img.jpg'];
    res.render('login', { image: image });
});

app.post('/loginSubmit', async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    const schema = Joi.object({
        email: Joi.string().email().max(100).required(),
        password: Joi.string().max(20).required()
    });

    const validationResult = schema.validate({ email, password });
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.render('login', { error: 'Invalid input. Please check your email and password.', image: ['login_img.jpg'] });
        return;
    }

    const result = await userCollection
        .find({ email: email })
        .project({ firstName: 1, lastName: 1, email: 1, password: 1, _id: 1 })
        .toArray();

    console.log(result);

    if (result.length !== 1) {
        console.log("User not found");
        res.render('login', { error: 'Invalid email/password combination.', image: ['login_img.jpg'] });
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

        res.redirect('/');
    } else {
        console.log("Incorrect password");
        res.render('login', { error: 'Invalid email/password combination.', image: ['login_img.jpg'] });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log('Error destroying session:', err);
            res.status(500).render('error', { message: 'Error logging out.' });
        } else {
            res.render('logout');
        }
    });
});

app.get('/pseudoCampsite', (req, res) => {
    res.render('pseudoCampsite');
});

app.get('/createReview', (req, res) => {
    res.render('createReview');
});

app.get('/booked', (req, res) => {
    const campsite = {
      id: 1,
      name: 'Sunset Woods',
      imageUrl: '/camp.png',
      date: '2025-06-15',
      tents: 2,
      people: 4
    };
  
    res.render('booked', { campsite });
  });
  
app.get('/profile', (req, res) => {
    const user = {
        firstName: 'Margot',
        lastName: 'Robbie',
        email: 'margot@example.com',
        bio: '',
        profileImage: '',
        userLevel: ''
    };
    res.render('profile', { user });
});

app.get('/createAlert', (req, res) => {
    res.render('createAlert');
});

app.get("*dummy", (req, res) => {
    res.status(404);
    res.render('404');
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});