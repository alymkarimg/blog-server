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
    var menuTree = req.body.menuTree
    let reorderedMenuItems = [];

    // cycle through menutree and save all values
    const saveNewMenuItems = (menuTree) => {
        if(menuTree && menuTree.length > 0) {
            menuTree.map(menuItem => {
                if (menuItem.children) {
                    saveNewMenuItems(menuItem.children)
                }
                reorderedMenuItems.push(menuItem);
            })
        }
    }

    saveNewMenuItems(menuTree);

    await Promise.all(reorderedMenuItems.map(async (menuItem) => {
       await menuItem.save()
    }))
}

exports.deleteMenuItem = async function (req, res, next) {
    await Menu.deleteOne({ _id: req.body._id })
    await menuItem.save();
    res.status(200).json({})
}