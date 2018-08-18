const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const Schema = mongoose.Schema;
const esURL = process.env.BONSAI_URL || 'localhost:9200';

var RecipeSchema = new Schema({
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

RecipeSchema.plugin(mongoosastic, {
    hosts: [ esURL ]
})
// schema.index({ingredients: 'text'});

const Recipe = mongoose.model('Recipe', RecipeSchema);
// Recipe.plugin(mongoosastic);

module.exports = {Recipe};

/*
const BunnySchema = new Schema({
    name: String,
    age: Number,
    cuteness: String
});

BunnySchema.plugin(mongoosastic, {
    hosts: [
        esURL
    ]
});

const Bunny = mongoose.model('Bunny', BunnySchema);

module.exports = { Bunny };
*/