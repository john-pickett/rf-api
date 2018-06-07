const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const Schema = mongoose.Schema;

const BunnySchema = new Schema({
    name: String,
    age: Number,
    cuteness: String
});

BunnySchema.plugin(mongoosastic, {
    hosts: [
        process.env.BONSAI_URL
    ]
});

// MyModel.plugin(mongoosastic, {
//     hosts: [
//       'localhost:9200',
//       'anotherhost:9200'
//     ]
//   })

let Bunny = mongoose.model('Bunny', BunnySchema);

module.exports = { Bunny };

/*
var mongoose     = require('mongoose')
  , mongoosastic = require('mongoosastic')
  , Schema       = mongoose.Schema

var User = new Schema({
    name: String
  , email: String
  , city: String
})

User.plugin(mongoosastic)
*/

/*
var destinationSchema = new Schema({
    airport: String,
    month: String
  })
  
  // Define the scheme
  var User = new Schema ({
    firstName: {
      type: String,
      index: true
    },
    lastName: {
      type: String,
      index: true
    },
    email: {
      type: String,
      index: true
    },
    homeAirport: {
      type: String,
      index: true
    },
    destinations: [destinationSchema]
  })
  */