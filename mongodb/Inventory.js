const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: false
    },
    itemId: {
        type: String,
        required: true 
    },
    uses: {
        type: Number,
        required: false,
        default: 0
    }
})

module.exports = userSchema;