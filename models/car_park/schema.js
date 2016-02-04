var mongoose = require('mongoose');
var mongooseHidden = require('mongoose-hidden')();

var LocationSchema = new mongoose.Schema({
    address: String,
    city: String,
    country: String,
    coordinates: {type: Number, index: '2dsphere'}   
});

var CostsSchema = new mongoose.Schema({
    time_in_m: Number,
    cost: Number
});

var TagSchema = new mongoose.Schema({
    name: String
});

var CarParkSchema = new mongoose.Schema({
    name: { type: String, required: true },

    location: {
	LocationSchema
    },

    costs: {
	[CostsSchema]
    },

    tags: {
	[TagSchema]
    }

    last_update: { type: Date, required: true },
});
