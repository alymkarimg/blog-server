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
        required: true,
        index: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        index: true
    },
    url: {
        type: String,
        trim: true,
        required: true,
        index: true
    }
},
    {
        timestamps: true
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

menuSchema.statics.saveNewMenuItems = (menuTree) => {
    if (menuTree && menuTree.length > 0) {
        menuTree.map(menuItem => {
            console.log(menuItem.children)
            if (menuItem.children && menuItem.children.length > 0) {
                this.model('Menu').saveNewMenuItems(menuItem.children)
            }
            reorderedMenuItems.push(menuItem);
        })
    }
}

menuSchema.statics.createMenuItem = async function (body) {

    var menu = new this({
        title: body.title,
        parent: body.parent,
        url: body.url // check if it exists, if not, return error
    })

    return menu;
}


module.exports = mongoose.model('Menu', menuSchema)