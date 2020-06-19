const mongoose = require('mongoose');
require("dotenv").config();

// each item comes with a name and associated text
const animatedBannerItem = new mongoose.Schema({
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