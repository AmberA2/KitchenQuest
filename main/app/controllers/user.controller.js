const { User } = require('../models/Database'); // Assuming User schema is defined in Database.js
const passport = require('passport');

// Show signup page
exports.showSignUp = (req, res) => {
    res.render('signup', { messages: req.flash() });
};

//handle signup
exports.handleSignUp = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            req.flash('error', 'Email already exists');
            return res.redirect('/signup');  // Stay on the signup page
        }
        
        const newUser = new User({ name, email, password });
        await newUser.save();
        req.flash('success', 'Account created successfully. Please log in.');
        res.redirect('/login');  // Redirect to login on successful signup
    } catch (error) {
        console.error("Error signing up:", error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/signup');  // Stay on signup page on error
    }
};

// Show login page
exports.showLogin = (req, res) => {
    res.render('login', { messages: req.flash('error', 'Email or Password is incorrect. Try again or signUp.') });
};

// Handle user login with Passport.js
exports.handleLogin = passport.authenticate('local', {
    successRedirect: '/homepage',
    failureRedirect: '/login',
    failureFlash: true, // Enable flash messages on failure
});

// Handle user logout
exports.handleLogout = (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); } // Handle error if needed
        res.redirect('/login'); // Redirect to login page after logout
        console.log("logging out.");
    });
};
exports.updateProfile = async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Log the request body for debugging
        const { id, name } = req.body; // Destructure to get 'id' and 'name'
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        // Update the user's name in the database
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile', error });
    }
};