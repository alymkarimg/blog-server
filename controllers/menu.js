const mongoose = require('mongoose');
var Menu = require('../models/menu');

exports.createMenuItem = async function (req, res, next) {
    var menuItem = await Menu.createMenuItem(req.body)
    if (menuItem.message) {
        res.status(400).json(menuItem)
    } else {
        await menuItem.save();
        res.status(200).json(menuItem)
    }
}

exports.loadMenuItems = async function (req, res, next) {
    var menutree = await Menu.loadMenu()

    var prototype = Object.keys(Menu.schema.paths)

    if (Menu.schema.$timestamps) {
        prototype = prototype.concat(["updatedAt", "createdAt"])
    }

    res.status(200).json({ menutree, prototype })
}

exports.saveMenuTree = async function (req, res, next) {
    // set item.parent == destination parent.id

    var itemBeingMoved = await Menu.findOne({ _id: mongoose.Types.ObjectId(req.body.dragItem.id) });
    if (req.body.dragItem.parent != req.body.destinationParent) {
        itemBeingMoved.parent = req.body.destinationParent ? mongoose.Types.ObjectId(req.body.destinationParent.id) : null;
        await itemBeingMoved.save()
        res.json({loading: false})
    }
}

exports.deleteMenuItem = async function (req, res, next) {
    await Menu.deleteOne({ _id: req.body._id })
    await menuItem.save();
    res.status(200).json({})
}
