const { hasBrowserCrypto } = require('google-auth-library/build/src/crypto/crypto');
const mongoose = require('mongoose');
const category = require('./category');
require("dotenv").config();
const { ObjectId } = mongoose.Schema

const menuSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    parentId: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },
    url: {
        type: String,
        trim: true,
        required: true
    }
},
    {
        timestamps: false
    })

menuSchema.statics.loadMenu = async function (list, parentId = null) {

    const menuItems = await this.model('Menu').find()
        .map(x => {
            return {
                id: x._id,
                parentId: x.parentId,
                active: x.active,
                page: x.page,
                list: null

            }
        });

    const menuTree = getMenuTree(menuItems)
    return menuTree;
}


menuSchema.statics.getMenuTree = async function (list, parentId = null) {

    var menuTree = list.filter(q => q.parentId == parentId)
        .map(x => {
            return {
                id: x._id,
                parentId: x.parentId,
                active: x.active,
                page: x.page,
                list: getMenuTree(list, _x.id)

            }
        })

    // filter the list based 

    return menuTree;
}

menuSchema.statics.createMenuItem = async function (body) {

    // // add an editable area whose pathname = blog editableArea and guid = blog {slug}, if it already exists, create a new one
    var page = await EditableArea.findOne({ guid: body.url, pathname: "page" })
    if (!page) {
       return "No page with that title exists, please select another page."
    }

    var category = await category.findOne({ title: body.category, type: "menu" })
    if (!category) {
       return "Please select a category"
    }

    var menu = new this({
        title: body.title,
        parentId: body.parentId,
        category, // check if it exists, if not, return error
        url: body.url // check if it exists, if not, return error
    })

    return menu;
}


module.exports = mongoose.model('Menu', menuSchema)