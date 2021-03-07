const mongoose = require('mongoose');
require("dotenv").config();

// each item comes with a name and associated text
const animatedBannerItem = new mongoose.Schema({
    guid: {
        type: String,
        trim: true,
        unique: true
    },
    pathname: {
        type: String,
        trim: true,
    },
    image: { 
        type: String, 
        required: true 
    },
    format: { 
        type: String, 
        required: true 
    },
    EditableArea: {type: mongoose.Schema.Types.ObjectId, ref: 'EditableArea'}
});



module.exports = mongoose.model('AnimatedBannerItem', animatedBannerItem)