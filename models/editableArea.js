const mongoose = require('mongoose');
const { model } = require('./category');
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
    },
    link: {
        type: String,
        trim: true,
    },
}, {
    timestamps: false
})

editableAreaSchema.statics.createPage = async function (body) {

    // // add an editable area whose pathname = blog editableArea and guid = blog {slug}, if it already exists, create a new one
    var page = await this.model("EditableArea").findOne({ guid: body.guid, pathname: "page" })
    if (!page) {
        page = new this({
            content: "<p>Coming soon</p>",
            pathname: "page",
            guid: `${body.guid}`
        });
    }

    return page;
}


module.exports = mongoose.model('EditableArea', editableAreaSchema)