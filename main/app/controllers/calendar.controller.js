
const { Calendar } = require('../models/Database'); // Assuming User schema is defined in Database.js

module.exports = {
  
    addCalendar:async (req, res) => {
        try {
            const { userId, recipeId, date } = req.body;
    
            // Check if all required data is present
            if (!userId || !recipeId || !date) {
                return res.status(400).json({ message: "Missing required fields." });
            }
    
            // Check if an existing calendar entry exists for the user on that date
            let calendar = await Calendar.findOne({ userId, date });
    
            if (!calendar) {
                // If no entry exists, create a new calendar entry
                calendar = new Calendar({
                    userId,
                    date,
                    recipe: [recipeId] // Initialize with the current recipeId
                });
                await calendar.save();
                return res.status(200).json({ message: "Recipe added to your calendar!" });
            }
    
            // If the calendar entry exists, add the recipeId to the array
            if (!calendar.recipe.includes(recipeId)) {
                calendar.recipe.push(recipeId);
                await calendar.save();
                return res.status(200).json({ message: "Recipe added to your calendar!" });
            } else {
                return res.status(400).json({ message: "Recipe already added for this date." });
            }
        } catch (error) {
            console.error("Error adding to calendar:", error);
            res.status(500).json({ message: "An error occurred while adding to the calendar." });
        }
    },
          
    // Handle the removal of a meal from the calendar
    handleRemove: async (req, res) => {
        try {
            const { recipeId, date } = req.body; // Extract recipeId and date from request body
            const userId = req.user.id; // Get userId from the authenticated user

            console.log("Request Data:", req.body);

            // Find the user's calendar entry for the given date
            const userCalendar = await Calendar.findOne({ userId, date });

            if (!userCalendar) {
                return res.status(404).json({ message: "No meals found for this date" });
            }

            // Remove the recipeId from the recipe array
            const recipeIndex = userCalendar.recipe.indexOf(recipeId);

            if (recipeIndex !== -1) {
                userCalendar.recipe.splice(recipeIndex, 1); // Remove the recipeId from the recipes array
            } else {
                return res.status(404).json({ message: "Recipe not found for this date" });
            }

            // If the recipe array is now empty, delete the entire calendar entry for that date
            if (userCalendar.recipe.length === 0) {
                await Calendar.deleteOne({ _id: userCalendar._id });
            } else {
                // Otherwise, save the updated document
                await userCalendar.save();
            }

            return res.status(200).json({ message: "Meal removed successfully" });
        } catch (err) {
            console.error("Error removing meal:", err);
            return res.status(500).json({ message: "Server error" });
        }
    }
}
