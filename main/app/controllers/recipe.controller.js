const { Recipe } = require('../models/Database'); // Assuming User schema is defined in Database.js

module.exports = {
    showFinder: (req, res) => {
        res.render('pages/finder', {
            search: searchQuery,  // The search term
            name: req.user.name,
            userProfileImage: req.user.userProfileImage,
            currentPath: req.path,
            recipes,
            userId: req.user._id,
            totalPages,
            currentPage: page
        });
    },

    searchFinder: async (req, res) => {
        const { page = 1, searchTerm = '', tags = [] } = req.body; // Now using req.body, not req.query
        console.log("req body: ", req.body);

        // Set up query object
        const query = {};

        // Search by search term (optional)
        if (searchTerm) {
            query.$text = { $search: searchTerm };
        }

        // Filter by tags (checkboxes and radio buttons)
        if (tags && tags.length > 0) {
            query.tags = { $all: tags };  // Match any tags in the tags array
        }

        try {
            // Paginate and fetch recipes
            const pageSize = 10;  // Define the number of recipes per page
            const skip = (page - 1) * pageSize;

            const recipes = await Recipe.find(query)
                .skip(skip)
                .limit(pageSize);

            // Get total count for pagination
            const totalRecipes = await Recipe.countDocuments(query);
            const totalPages = Math.ceil(totalRecipes / pageSize);

            // Send the response with the fetched recipes
            res.json({
                recipes,
                totalPages,
                currentPage: page,
            });
        } catch (error) {
            console.error('Error fetching recipes:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    // showRecipes: async (req, res) => {
    //     try {
    //         const recipeId = req.params.id; // Get recipe ID from URL
    //         const recipe = await Recipe.findById(recipeId); // Find recipe by ID in database
    //         if (!recipe) {
    //             return res.status(404).json({ message: 'Recipe not found' });
    //         }
    //         res.json(recipe); // Return the recipe data as JSON
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ message: 'Error fetching recipe' });
    //     }
    // }

    showRecipe: async (req, res) => {
        try {
            const recipeId = req.params.id;  // Get recipe ID from URL
            const recipe = await Recipe.findById(recipeId); // Find recipe by ID in the database

            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }

            // Render the recipe details page with the recipe data
          //  res.render('recipe', { recipe });
            res.render('pages/recipe', { name: req.user.name, userProfileImage: req.user.userProfileImage, userId: req.user._id, recipeId: recipe._id, currentPath: req.path, recipe });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching recipe' });
        }
    },

    handleGetRecipe: async (req, res) => {
        try {
            const { recipeIds } = req.body;  // Get the array of recipe IDs from the request body

            // Check if recipeIds array is provided
            if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
                return res.status(400).json({ message: "No recipe IDs provided" });
            }

            // Use recipeIds to find recipes in the database
            const recipes = await Recipe.find({ '_id': { $in: recipeIds } });

            // If no recipes found, return a message
            if (recipes.length === 0) {
                return res.status(404).json({ message: "No recipes found" });
            }

            // Map the recipes to return an array of [recipeId, recipeName]
            const recipeData = recipes.map(recipe => [recipe._id.toString(), recipe.name]);

            // Send the recipe data back as a response
            return res.status(200).json({ recipes: recipeData });
        } catch (err) {
            console.error("Error fetching recipes:", err);
            return res.status(500).json({ message: "Server error" });
        }
    },

    showAddRecipe: (req, res) => {
        res.render('addRecipes', { messages: req.flash() });
    },

    handleAddRecipe: async (req, res) => {
        const genericImages = [
            '/images/temp1.jpg',
            '/images/temp2.jpg',
            '/images/temp3.jpg',
            '/images/temp4.jpg',
            '/images/temp5.jpg',
            '/images/temp6.jpg',
            '/images/temp7.jpg',
            '/images/temp8.jpg',
            '/images/temp9.jpg',
            '/images/temp10.jpg',
            '/images/temp11.jpg',
            '/images/temp12.jpg',
            '/images/temp13.jpg',
            '/images/temp14.jpg',
            '/images/temp15.jpg',
            '/images/temp16.jpg',
            '/images/temp17.jpg',
            '/images/temp18.jpg',
            '/images/temp19.jpg',
            '/images/temp20.jpg'
        ];

        // Function to get a random image from the generic list
        const imageUrl = getRandomImage();

        function getRandomImage() {
            const randomIndex = Math.floor(Math.random() * genericImages.length);
            return genericImages[randomIndex];
        }

        // Extract form data from req.body
        let {
            'recipeName': name,
            'description': description,
            'totalTime': totalTimeText,
            'prepTime': prepTime = '',  // Default to empty string if not found
            'cookTime': cookTime = '',  // Default to empty string if not found
            'meal-type': mealType,  // mealType is now included in tags
            'directions': directionsRaw, // Step-by-step directions
            'notes': notes,
            'ingredientName': ingredientNamesRaw, // Ingredient names
            'tags': tagsRaw,  // Tags array from checkboxes
        } = req.body;

        // Function to ensure single values are converted into arrays
        const toArray = (value) => {
            return Array.isArray(value) ? value : (value ? [value] : []);
        };

        // Initialize arrays (tags, ingredients, and steps)
        let tags = toArray(tagsRaw);  // Convert tags to array
        let ingredientNames = toArray(ingredientNamesRaw);  // Convert ingredient names to array
        let directions = toArray(directionsRaw);  // Convert directions to array

        const userId = req.user._id; // Assuming user is logged in

        // Handle the ingredients (array of names only)
        // const ingredientNames = Array.isArray(ingredientNamesRaw) ? ingredientNamesRaw : [ingredientNamesRaw];

        // Initialize tags as an empty array if it's undefined or not an array
        tags = Array.isArray(tags) ? tags : [];  // Fallback to an empty array if tags is undefined

        console.log("tags: ", tags);

        // Add mealType as a tag if it exists
        if (mealType) {
            tags = tags || [];
            tags.push(mealType);
        }

        console.log("tags: ", tags);

        try {
            // Create the new recipe object in the requested format
            const newRecipe = {
                name,
                description,
                steps: directions,       // Directions as array
                ingredients: ingredientNames, // Array of ingredient names
                totalTime: totalTimeText,  // Keep the total time as text, to be parsed later
                prepTime,                // Set prep time, or default to empty string if not found
                cookTime,                // Set cook time, or default to empty string if not found
                tags,                    // Meal type included in tags array
                image: imageUrl,
                creatorId: userId,
            };

            // Save the new recipe to the database
            await new Recipe(newRecipe).save();
            console.log(newRecipe);
            // Success: Redirect to the recipes list page
            req.flash('success', 'Recipe added successfully!');
            res.redirect('/add-recipes');
        } catch (error) {
            console.error('Error adding recipe:', error);
            req.flash('error', 'Failed to add recipe. Please try again.');
            res.redirect('/add-recipes'); // Redirect back to the form
        }
    },

    showMyRecipes: async (req, res) => {
        const { page = 1 } = req.body;  // Using req.body for pagination
        const itemsPerPage = 10;  // Number of recipes per page
        const skip = (page - 1) * itemsPerPage;
    
        const userId = req.user._id;  // Get the current user's ID
    
        console.log("req body: ", req.body);
    
        // Fetch recipes created by the user (where creatorId matches userId)
        const recipes = await Recipe.find({ creatorId: userId })
            .skip(skip)
            .limit(itemsPerPage);
    
        // Get total count for pagination
        const totalRecipes = await Recipe.countDocuments({ creatorId: userId });
        const totalPages = Math.ceil(totalRecipes / itemsPerPage);
    
        // Send the response with the fetched recipes
        res.json({
            recipes,
            totalPages,
            currentPage: page,
        });
    }
    

}