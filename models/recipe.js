var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    title: {
        type: String
    },
    url: {
        type: [String]
    },
    image: {
        type: String
    },
    lastmod: {
        type: String
    }
});
schema.index({url: 'text'});

var Recipe = mongoose.model('Recipe', schema);

module.exports = {Recipe};



// var schema = new mongoose.Schema({ name: 'string', size: 'string' });
// var Tank = mongoose.model('Tank', schema);