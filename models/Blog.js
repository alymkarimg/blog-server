const mongoose = require('mongoose');
const EditableArea = require('./editableArea')
const Category = require('./category');
const AnimatedBanner = require('./animatedBanner');
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

    if(body.categories){
        var categories = await Category.find({slug: {$in: body.categories}})
    }

    var blog = new this({
        title: body.title,
        slug: body.slug,
        categories: categories,
        author: body.author,
        publishedDate: body.publishedDate
    })

    return blog;
}

blogSchema.methods.editBlog = async function (body) {

    if(body.categories){
        var categories = await Category.find({slug: {$in: body.categories}})
    }
        var blog = this
        blog.title =  body.title,
        blog.slug = body.slug,
        blog.categories = categories,
        blog.author =  body.author,
        blog.publishedDate= body.publishedDate

    return blog;
}

module.exports = mongoose.model('Blog', blogSchema)