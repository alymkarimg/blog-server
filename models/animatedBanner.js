const mongoose = require('mongoose');
require("dotenv").config();

// each banner comes with a title and associated images/text
const animatedBannerSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
        unique: true
    },
    items: [{type: mongoose.Schema.Types.ObjectId, ref: 'AnimatedBannerItem'}],
    interval: {
        type: Number
    }
}, {
    timestamps: true
})

animatedBannerSchema.statics.createBanner = function (title) {

    var banner = new this({
        title,
        items: [],
    })

    return banner;
}

module.exports = mongoose.model('AnimatedBanner', animatedBannerSchema)