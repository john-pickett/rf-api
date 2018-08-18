const mongoose = require('mongoose');

const TestRecipe = mongoose.model('TestRecipe', {
    name: {
        type: String
    },
    url: {
        type: String
    },
    author: {
        type: String
    },
    datePublished: {
        type: String
    },
    description: {
        type: String
    },
    image: {
        type: Array
    },
    recipeYield: {
        type: String
    },
    prepTime: {
        type: String
    },
    cookTime: {
        type: String
    },
    totalTime: {
        type: String
    },
    recipeIngredient: {
        type: Array
    },
    recipeInstructions: {
        type: Array
    },
    recipeCuisine: {
        type: Array
    },
    recipeCategory: {
        type: Array
    }
});

// JOCB: 5b02a715cbf5b217846d39cf
// SR: 5b02a74ecbf5b217846d39d0

module.exports = {TestRecipe};
