const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const properties = require("../properties.json");
var inventory = require("./Inventory");
var gear = require("./Gear");

var userSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: 'Nickname is required',
        minlength: 3,
        maxlength: 25,
		match: [/^[a-zA-Z0-9 ]*$/, 'Please fill a valid nickname']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: 'Password is required',
        minlength: 6,
        maxlength: 100
    },
	banned: {
		type: Boolean,
		default: false
	},
	ban_expires: {
		type: Number
	},
	muted: {
		type: Boolean,
		default: false
	},
	mute_expires: {
		type: Number
	},
	newlyCreated: {
		type: Boolean,
		default: true
	},
    ticket: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    playerId: {
        type: mongoose.ObjectId,
        index: true,
        auto: true
    },
    coins: {
        type: Number,
        default: properties.start_coins || 0
    },
    gems: {
        type: Number,
        default: 0
    },
    critterId: {
        type: String,
        default: "hamster"
    },
    gear: gear,
    inventory: [inventory]
})

userSchema.methods.validatePassword = async function validatePassword(data) {
	return await bcrypt.compare(data, this.password);
};

module.exports = mongoose.model('User', userSchema);