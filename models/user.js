const mongoose = require('mongoose');

const User = mongoose.model('User', {
    name: {
        type: String
    },
    email: {
        type: String
    },
    favorites: []
});

module.exports = {User};