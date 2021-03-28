const { hasBrowserCrypto } = require('google-auth-library/build/src/crypto/crypto');
const mongoose = require('mongoose');
const Category = require('./category');
require("dotenv").config();
const { ObjectId } = mongoose.Schema
const EditableArea = require('./editableArea')

const menuSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        index: true
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

    let menuItems = await this.model('Menu').find({})

    menuItems = menuItems.map(x => {
        return {
            id: x.id,
            parent: x.parent,
            title: x.title,
            category: x.category,
            url: x.url,
            children: null

        }
    });

    const menuTree = await this.model('Menu').getMenuTree(menuItems)

    return { menuTree, menuItems };
}

menuSchema.statics.getMenuTree = async function (menuItems, parent = null) {

    var menuTree = await Promise.all(menuItems.filter(q => q.parent == parent)
        .map(async x => {
            var children = await this.model('Menu').getMenuTree(menuItems, x.id)
            return {
                id: x.id,
                parent: x.parent,
                title: x.title,
                category: x.category,
                url: x.url,
                children
            }
        }))

    // filter the list based 

    return menuTree;
}

menuSchema.statics.createMenuItem = async function (body) {

    // // add an editable area whose pathname = blog editableArea and guid = blog {slug}, if it already exists, create a new one
    var page = await EditableArea.findOne({ guid: body.url, pathname: "page" })
    if (!page) {
        return { message: "No page with that title exists, please select another page." }
    }

    var category = await Category.findOne({ title: body.category, type: "menu" })
    if (!category) {
        return { message: "Please select a category" }
    }


    var menu = new this({
        title: body.title,
        parent: body.parent,
        category, // check if it exists, if not, return error
        url: body.url // check if it exists, if not, return error
    })

    return menu;
}


module.exports = mongoose.model('Menu', menuSchema)