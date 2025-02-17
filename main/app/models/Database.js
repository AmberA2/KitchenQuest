
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

async function connectToDatabase() {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB Atlas");
    } catch (error) {
        console.error("Failed to connect to MongoDB Atlas", error);
        throw error;
    }
}

// Define User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userProfileImage: { type: String, default: '/images/place_holder_Image.png' }, // Default image path
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Verify password method
userSchema.methods.verifyPassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

// Check if the model is already defined, to prevent overwriting
const User = mongoose.models.User || mongoose.model('User', userSchema); // Check if the model is already defined


// Define Calendar Schema
const calendarSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: String, required: true },
    recipe: { type: [String], required: true }
}, { timestamps: true });

const Calendar = mongoose.model('Calendar', calendarSchema);

const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String },
    description: { type: String, required: true },
    steps: { type: [String], required: true },
    ingredients: { type: [String], required: true },
    totalTime: { type: String, required: true },
    prepTime: { type: String, required: true },
    cookTime: { type: String, required: true },
    tags: { type: [String], required: true },
    image: { type: String, required: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// Create a text index on the relevant fields
recipeSchema.index({
    name: 'text',
    description: 'text',
    tags: 'text',         // Add this line to index the tags field for text search
    steps: 'text',        // Add this line to index the steps field for text search
    ingredients: 'text'   // Add this line to index the ingredients field for text search
});

const Recipe = mongoose.model('Recipe', recipeSchema);

const favoritesSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    recipeIds: { type: [String], required: true }
}, { timestamps: true });

const Favorite = mongoose.model('Favorite', favoritesSchema);

module.exports = {
    connectToDatabase,
    User, Recipe, Favorite, Calendar // Export the User model
};
