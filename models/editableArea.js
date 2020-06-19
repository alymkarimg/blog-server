const mongoose = require('mongoose');
require("dotenv").config();

const editableAreaSchema = new mongoose.Schema({
    content: {
        type: String,
        trim: true,
    },
    guid: {
        type: String,
        trim: true,
    },
    pathname: {
        type: String,
        trim: true,
    }
}, {
    timestamps: false
})

module.exports = mongoose.model('EditableArea', editableAreaSchema)