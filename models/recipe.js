const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');

var schema = new mongoose.Schema({
    title: {
        type: String
    },
    url: {
        type: String
    },
    image: {
        type: String
    },
    lastmod: {
        type: String
    },
    website: {
        type: String
    },
    ingredients: []
});
schema.index({ingredients: 'text'});

const Recipe = mongoose.model('Recipe', schema);
// Recipe.plugin(mongoosastic);

module.exports = {Recipe};



