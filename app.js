const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/camping_app', {
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/api/campsites', require('./routes/api/campsites'));
app.use('/api/trails', require('./routes/api/trails'));

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Home route
app.get('/', (req, res) => {
    res.render('main', {
        mapboxKey: process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoic3RyNHQiLCJhIjoiY2w3czIxZXY3MDAzczBrcWJ1ZWNubm4ifQ.2QZQZQZQZQZQZQZQZQZQZQ'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 