var mongoose = require('mongoose');

mongoose.promise = global.Promise;

//mongo URI: mongodb://heroku_tjj5w6j6:iu3gjoabmt6psk5502dbg305l3@ds117878.mlab.com:17878/heroku_tjj5w6j6
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Recipes').then( () => {
    if (!process.env.MONGODB_URI) {
        console.log('Connected to MongoDB successfully at localhost');
    } else {
        console.log('Connected to MongoDB successfully at ' + process.env.MONGODB_URI);
    }
}, (err) => {
    console.log(`Error: ${err}`);
});


module.exports = {mongoose};