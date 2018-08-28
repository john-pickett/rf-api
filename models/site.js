var mongoose = require('mongoose');

var Site = mongoose.model('Site', {
    title: {
        type: String
    },
    url: {
        type: String
    }
});

// JOCB: 5b02a715cbf5b217846d39cf
// SR: 5b02a74ecbf5b217846d39d0

module.exports = {Site};
