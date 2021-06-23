const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const citySchema = new Schema({
    city: {
        type: String
    },
    loc: {
        type: [Number], 
        index: '2dsphere'
    },
    pop: {
        type: Number
    },
    state: {
        type: String
    }
});

module.exports = mongoose.model('City', citySchema);