const express = require('express'),
    app = express(),
    path = require('path'),
    session = require('express-session'),
    passport = require('passport'),
    expressLayouts = require('express-ejs-layouts'),
    flash = require('connect-flash'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

// Load environment variables
require('dotenv').config();

// Import the database connection and Passport configuration
const { connectToDatabase } = require(path.resolve(__dirname, 'app/models/Database'));
require('./app/models/PassportConfig');

// Set the port
const port = process.env.PORT || 8080;

// Connect to MongoDB
connectToDatabase()
    .then(() => {
        // Middleware setup
        app.use(cookieParser());
        app.use(express.json());
        app.use(session({
            secret: process.env.SECRET,
            resave: false,
            saveUninitialized: false,
        }));

        app.use(passport.initialize());
        app.use(passport.session());

        app.use(flash());
        app.use(function(req, res, next) {
            res.locals.messages = req.flash();
            next();
        });

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(express.json()); 

        app.use(express.static(path.join(__dirname, 'public')));
        app.use('/images', express.static(path.join(__dirname, 'public/images')));
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'ejs');
        app.use(expressLayouts);
        

        // Use routes
        app.use(require('./app/routes.js'));

        // Start the server
        app.listen(port, () => {
            console.log(`App listening on http://localhost:${port}`);
        });
    })
    .catch(error => {
        console.error("Database connection failed:", error);
        process.exit(1);
    });
module.exports = app