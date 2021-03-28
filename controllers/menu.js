var Menu = require('../models/menu');

exports.createMenuItem = async function (req, res, next) {
    var menuItem = await Menu.createMenuItem(req.body)
    if(menuItem.message){
        res.status(400).json(menuItem)
    }else{
        await menuItem.save();
        res.status(200).json(menuItem)
    }
}

exports.loadMenuItems = async function (req, res, next) {
    var menutree = await Menu.loadMenu()
    res.status(200).json(menutree)
}