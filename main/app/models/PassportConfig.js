const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('./Database'); // Import the User model


passport.use(new LocalStrategy({
    usernameField: 'email',  // Use email as the username field
    passwordField: 'password', // Use password field as expected
}, async (email, password, done) => {
    try {
        // Attempt to find the user by email
        const user = await User.findOne({ email: email });

        if (!user) {
            return done(null, false, { message: 'Email or Password is incorrect. Try again or signUp.' });
        }

        // Verify password
        const isMatch = await user.verifyPassword(password);
        if (!isMatch) {
            return done(null, false, { message: 'Email or Password is incorrect. Try again or signUp.' });
        }

        return done(null, user); // Successful login
    } catch (err) {
        return done(err);  // Pass any errors to the done callback
    }
}));

// Serialize and deserialize user to maintain session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;


