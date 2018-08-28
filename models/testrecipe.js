const mongoose = require('mongoose');
const Schema = mongoose.Schema

const TestRecipeSchema = new Schema({
    name: {
        type: String
    },
    url: {
        type: String
    },
    website: {
        type: mongoose.Schema.Types.ObjectId
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
})

// TestRecipeSchema.pre('save', () => {
//     if (this.isNew) {
//         this.save().then((doc) => {
//             return doc;
//         })
//     } else {
//         return new Error('not saved');
//     }
//     next();
// })

const TestRecipe = mongoose.model('TestRecipe', TestRecipeSchema);

// JOCB: 5b02a715cbf5b217846d39cf
// SR: 5b02a74ecbf5b217846d39d0

module.exports = {TestRecipe};
