var mongoose = require('mongoose');

var Site = mongoose.model('Site', {
    title: {
        type: String
    },
    pagesIndexed: {
        type: Number
    },
    content: []
});

module.exports = {Site};
