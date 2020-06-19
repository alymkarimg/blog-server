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
    captionPosition: {
        type: String
    },
    mask: {
        type: String
    }
}, {
    timestamps: true
})

animatedBannerSchema.statics.createBanner = function (body) {

    var captionPosition = body.captionPosition ? body.captionPosition : "centre";

    var banner = new this({
        title: body.title,
        items: [],
        captionPosition,
        mask: body.mask,
    })

    return banner;
}

module.exports = mongoose.model('AnimatedBanner', animatedBannerSchema)