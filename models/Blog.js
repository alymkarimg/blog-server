const mongoose = require('mongoose');
const EditableArea = require('./editableArea')
const Category = require('./category')
require("dotenv").config();
const { ObjectId } = mongoose.Schema

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        min: 3,
        max: 168,
        required: true,
        index: true
    },
    slug: {
        type: String,
        unique: true,
        index: true,
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    }],
    editableArea: { type: mongoose.Schema.Types.ObjectId, ref: 'EditableArea', required: true, index: true },
    mtitle: {
        type: String,
        trim: true,
        index: true
    },
    mdescription: {
        type: String,
        trimg: true,
        index: true
    },
    images: [{
        type: String,
        trim: true,
        index: true
    }], 
    author: {
        type: String,
        trim: true,
        required: true,
        index: true
    },
    publishedDate: {
        type: Date,
        trim: true,
        required: true,
        index: true
    }
}, {
    timestamps: true,
})

blogSchema.statics.createBlog = async function (body) {

    // // add an editable area whose pathname = blog editableArea and guid = blog {slug}, if it already exists, create a new one
    var editableArea = await EditableArea.findOne({ guid: `blog ${body.slug}`, pathname: "blog_editableArea" })
    if (!editableArea) {
        editableArea = new EditableArea({
            content: body.editableArea.data,
            pathname: "blog editableArea",
            guid: `blog ${body.slug}`
        });
        await editableArea.save();
    }

    if(body.categories){
        var categories = await Category.find({slug: {$in: body.categories}})
    }


    var blog = new this({
        title: body.title,
        slug: body.slug,
        editableArea,
        mtitle: body.title,
        mdescription: body.description,
        images: body.image,
        categories: categories,
        author: body.author,
        publishedDate: body.publishedDate
    })

    return blog;
}

module.exports = mongoose.model('Blog', blogSchema)