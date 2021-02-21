const mongoose = require('mongoose');
const EditableArea = require('./editableArea')
require("dotenv").config();
const { ObjectId } = mongoose.Schema

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        min: 3,
        max: 168,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        index: true,
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }],
    editableArea: { type: mongoose.Schema.Types.ObjectId, ref: 'EditableArea', required: true },
    mtitle: {
        type: String,
        trim: true
    },
    mdescription: {
        type: String,
        trimg: true
    },
    image: {
        type: String,
        trim: true
    }, 
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: false
})

blogSchema.statics.createBlog = async function (body, slug) {

    // // add an editable area whose pathname = blog editableArea and guid = blog {slug}, if it already exists, create a new one
    var editableArea = await EditableArea.findOne({ guid: `blog ${slug}`, pathname: "blog editableArea" })
    if (!editableArea) {
        editableArea = new EditableArea({
            content: "<p>Coming Soon</p>",
            pathname: "blog editableArea",
            guid: `blog ${slug}`
        });
        await editableArea.save();
    }

    var blog = new this({
        title: body.title,
        slug,
        editableArea,
        mtitle: body.title,
        mdescription: body.description,
        image: body.image,
        categories: body.categories,
        author: body.author
    })

    return blog;
}

module.exports = mongoose.model('Blog', blogSchema)