const { Calendar, Recipe } = require('../models/Database');


module.exports = {

    // show the home page
    showHome: async (req, res) => {
        console.log("User is logged in:", req.user); // Check if the user object is available
        try {
            const userID = req.user._id;
    
            // Fetch calendar data where userId matches the logged-in user
            const calendarData = await Calendar.find({ userId: userID }).exec();
    
            // Log the fetched calendarData to check it
            console.log('Fetched Calendar Data:', calendarData);
    
            // Map the data into a format suitable for the front-end
            const placeholderMeals = calendarData.map(entry => {
                return {
                    date: entry.date, // The date string (e.g., '2024-12-05')
                    recipes: entry.recipe // Array of recipe IDs (e.g., ['6750a747ebb5369b403f1bc3'])
                };
            });
    
            // Log the placeholderMeals to check if the mapping is correct
            console.log('Placeholder Meals:', JSON.stringify(placeholderMeals));
    
            // Render the calendar page with the formatted meal dates
            res.render('pages/homepage', {
                name: req.user.name,
                userProfileImage: req.user.userProfileImage,
                userId: req.user._id,
                currentPath: req.path,
                mealDates: JSON.stringify(placeholderMeals), // Pass the formatted meal data
            });
        } catch (error) {
            console.error("Error fetching calendar data:", error);
            res.status(500).send("Error fetching calendar data.");
        }
    },

    showLogIn: (req, res) => {
        res.render('pages/login', { layout: false });
    },

    showRecipes: (req, res) => {
        res.render('pages/add-recipes', { name: req.user.name, userProfileImage: req.user.userProfileImage,  userId: req.user._id, currentPath: req.path });
    },

    
    showCalendar: async (req, res) => {
        try {
            const userID = req.user._id;
    
            // Fetch calendar data where userId matches the logged-in user
            const calendarData = await Calendar.find({ userId: userID }).exec();
    
            // Log the fetched calendarData to check it
            console.log('Fetched Calendar Data:', calendarData);
    
            // Map the data into a format suitable for the front-end
            const placeholderMeals = calendarData.map(entry => {
                return {
                    date: entry.date, // The date string (e.g., '2024-12-05')
                    recipes: entry.recipe // Array of recipe IDs (e.g., ['6750a747ebb5369b403f1bc3'])
                };
            });
    
            // Log the placeholderMeals to check if the mapping is correct
            console.log('Placeholder Meals:', JSON.stringify(placeholderMeals));
    
            // Render the calendar page with the formatted meal dates
            res.render('pages/calendar', {
                name: req.user.name,
                userProfileImage: req.user.userProfileImage,
                userId: req.user._id,
                currentPath: req.path,
                mealDates: JSON.stringify(placeholderMeals), // Pass the formatted meal data
            });
        } catch (error) {
            console.error("Error fetching calendar data:", error);
            res.status(500).send("Error fetching calendar data.");
        }
    },
  
    showFavorites: (req, res) => {
        res.render('pages/favorites', { name: req.user.name, userProfileImage: req.user.userProfileImage, currentPath: req.path });
    },

    showFinder: async (req, res) => {
        const searchQuery = req.query.search || '';  // Default to empty string if no search term
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
        const limit = 25;  // Number of recipes per page
        const skip = (page - 1) * limit;
        
        console.log("showFinder is here");

      //  try {
            let query = {$text: { $search: "Ham" }};
    
            
            // // Fetch recipes with pagination and search query if provided
            const recipes = await Recipe.find(query)  // Use query variable here
                 .skip(skip)
                 .limit(limit);
    
                // Render the EJS page if it's a regular page request
                res.render('pages/finder', {
                    search: searchQuery,  // Include the search term (empty on initial load)
                    name: req.user.name,
                    userProfileImage: req.user.userProfileImage,
                    currentPath: req.path,
                    recipes // Pass all recipes (or filtered recipes if search term exists)
                    //totalPages,
                   // currentPage: page
                });
            // }
            console.log("finished rendering");
            // console.log('Sending Response:', { recipes, totalPages });  // Debugging line

        // } catch (error) {
        //     console.error('Error fetching recipes:', error);
        //     res.status(500).send('Error fetching recipes');
        // }
    },

    showSignUp: (req, res) => {
        res.render('pages/signUp', { layout: false })
    },

    showUserProfile: (req, res) => {
        console.log('User Profile route hit!');
        res.render('pages/user_profile', {
            name: req.user.name,
            email: req.user.email,
            userProfileImage: req.user.userProfileImage,
            userId: req.user._id, // Pass the user ID to the template
            currentPath: req.path
        });
    },

    showEditProfile: (req, res) => {
        console.log('Edit Profile route hit!');
        res.render('pages/editProfile', {
            name: req.user.name,
            email: req.user.email,
            userProfileImage: req.user.userProfileImage,
            userId: req.user._id, // Pass the user ID to the template
            currentPath: req.path
        });
    },
      
    showCooking101: (req, res) => {
        res.render('pages/cooking101', { name: req.user.name, userProfileImage: req.user.userProfileImage, currentPath: req.path });
    }
}
