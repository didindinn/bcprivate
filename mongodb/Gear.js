const mongoose = require("mongoose");

var gearSchema = new mongoose.Schema({
	belt: String,
	body: String,
	cape: String,
	ears: String,
	eyes: String,
	hand: String,
	head: String,
	mask: String,
	neck: String,
	pack: String,
	ride: String
})

mongoose.model('Gear', gearSchema)
module.exports = gearSchema;