const mongoose = require('mongoose');
require("dotenv").config();

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
    },
    type: {
        type: String,
        trim: true,
        maxlength: 32,
    },
}, {
    timestamps: false
})

module.exports = mongoose.model('Category', categorySchema)