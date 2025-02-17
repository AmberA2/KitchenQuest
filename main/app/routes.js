
const express = require('express');
const router = express.Router();
const mainController = require('./controllers/main.controller');
const userController = require('./controllers/user.controller'); // Import user controller
const recipeController = require('./controllers/recipe.controller'); // Import user controller
const favoriteController = require('./controllers/favorites.controller');
const calendarController = require('./controllers/calendar.controller');


// Middleware to check if the user is authenticated
function checkAuthenticated(req, res, next) {
    console.log("Authenticated?", req.isAuthenticated());
    if (req.isAuthenticated()) {
        console.log("User is authenticated, proceeding...");
        return next();
    }
    console.log("User not authenticated, redirecting to login...");
    res.redirect('/login');
}
// Sign-Up Routes
router.get('/signup', mainController.showSignUp); // Show signup page
router.post('/signup', userController.handleSignUp); // Handle signup logic

// Login Routes
router.get(['/login', '/'], mainController.showLogIn); // Show login page
router.post('/login', userController.handleLogin); // Handle login logic

// Add the logout route
router.get('/logout', userController.handleLogout);

// Define Routes with Authentication Check
// Home page (requires authentication)
router.get('/homepage', checkAuthenticated, mainController.showHome);
router.post('/homepage', checkAuthenticated, recipeController.showMyRecipes);

// Calendar (requires authentication)
router.get('/calendar', checkAuthenticated, mainController.showCalendar); // Requires user to be logged in
router.post('/remove-calendar', checkAuthenticated, calendarController.handleRemove); // Requires user to be logged in
router.post('/get-recipes', checkAuthenticated, recipeController.handleGetRecipe); // Requires user to be logged in

// Favorites (requires authentication)
router.get('/favorites', checkAuthenticated, mainController.showFavorites); // Requires user to be logged in

// Finder page (requires authentication)
router.get('/finder', checkAuthenticated, mainController.showFinder); // Requires user to be logged in
router.post('/finder', checkAuthenticated, recipeController.searchFinder); // Requires user to be logged in

// Recipes page
router.get('/recipe/:id', checkAuthenticated, recipeController.showRecipe);

//add/update to favorites
router.post('/addFavorite', checkAuthenticated, favoriteController.addFavorite);
router.get('/favorite', checkAuthenticated, favoriteController.getFavorite);
router.post('/favorite', checkAuthenticated, favoriteController.postFavorite);


//add to calendar
router.post('/calendar', checkAuthenticated, calendarController.addCalendar);

// Add Recipes page (requires authentication)
router.get('/add-recipes', checkAuthenticated, mainController.showRecipes); // Requires user to be logged in
router.post('/add-recipes', checkAuthenticated, recipeController.handleAddRecipe); // Requires user to be logged in


// User Profile page (requires authentication)
router.get('/user_profile', checkAuthenticated, mainController.showUserProfile); // Requires user to be logged in

// Edit Profile (requires authentication)
router.get('/editProfile', checkAuthenticated, mainController.showEditProfile); // Requires user to be logged in

//Acutally Updates profile in db
router.put('/edit-profile', (req, res) => {
    console.log('PUT /edit-profile route is being hit');
    userController.updateProfile(req, res);
});


router.get('/cooking101', checkAuthenticated, mainController.showCooking101);

module.exports = router;
