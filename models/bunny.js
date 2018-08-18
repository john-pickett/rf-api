const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const Schema = mongoose.Schema;
const esURL = process.env.BONSAI_URL || 'localhost:9200';

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
