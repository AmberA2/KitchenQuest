const { Favorite } = require('../models/Database'); // Assuming User schema is defined in Database.js
const { Recipe } = require('../models/Database'); // Assuming User schema is defined in Database.js

module.exports = {

    addFavorite: async (req, res) => {
        try {
            const { userId, recipeId } = req.body;

            // Check if userId and recipeId are present
            if (!userId || !recipeId) {
                return res.status(400).json({ message: "User ID or Recipe ID is missing!" });
            }

            // Find the user's favorite document
            let favorite = await Favorite.findOne({ userId });

            // If no favorite document is found, create a new one
            if (!favorite) {
                favorite = new Favorite({
                    userId,
                    recipeIds: [recipeId] // Initialize with the current recipeId
                });
                await favorite.save(); // Save the new document
                console.log("New favorite created:", favorite);
                return res.status(200).json({ message: "Recipe added to favorites!" });
            }

            // Check if the recipeId is already in the array of favorites
            if (favorite.recipeIds.includes(recipeId)) {
                return res.status(400).json({ message: "Recipe already in favorites!" });
            }

            // Add the recipeId to the array of favorite recipes
            await Favorite.updateOne(
                { userId },
                { $push: { recipeIds: recipeId } } // Use $push to add recipeId to the array
            );
            console.log("Favorite updated:", favorite);
            res.status(200).json({ message: "Recipe added to favorites!" });
        } catch (error) {
            console.error("Error adding favorite:", error);
            res.status(500).json({ message: "An error occurred while adding the recipe to favorites." });
        }
    },

    getFavorite: async (req, res) => {

        const currentPage = parseInt(req.query.page) || 1;
        const itemsPerPage = 10;  // Adjust this number based on how many recipes you want per page
        const skip = (currentPage - 1) * itemsPerPage;

        console.log("getFavorite is here");
        const userId = req.user._id;

        // Fetch user favorites
        const userData = await Favorite.findOne({ userId });
        if (!userData) {
            return res.render('pages/favorites', { userId, recipes: [], currentPage: 1, totalPages: 1 });
        }



        const recipeIds = userData.recipeIds;


        const recipes = await Recipe.find({ _id: { $in: recipeIds } })
            .skip(skip)
            .limit(itemsPerPage);

        const totalRecipes = userData.recipeIds.length; // Correctly use recipeIds, not userData.recipes
        const totalPages = Math.ceil(totalRecipes / itemsPerPage);

        // Render the EJS page if it's a regular page request

        res.render('pages/favorites', {
            userId,
            recipes,
            currentPage,
            totalPages
        });

        console.log("finished rendering");
    },



    postFavorite: async (req, res) => {
        const { page = 1 } = req.body; // Now using req.body, not req.query
        const itemsPerPage = 10;  // Adjust this number based on how many recipes you want per page
        const skip = (page - 1) * itemsPerPage;

        const userId = req.user._id;
        console.log("req body: ", req.body);

        const userData = await Favorite.findOne({ userId });
        if (!userData) {
            return res.render('pages/favorites', { userId, recipes: [], currentPage: 1, totalPages: 1 });
        }


        const recipeIds = userData.recipeIds;


        const recipes = await Recipe.find({ _id: { $in: recipeIds } })
            .skip(skip)
            .limit(itemsPerPage);



        // Get total count for pagination
        const totalRecipes = userData.recipeIds.length;
        const totalPages = Math.ceil(totalRecipes / itemsPerPage);

        // Send the response with the fetched recipes
        res.json({
            recipes,
            totalPages,
            currentPage: page,
        });

    }



}