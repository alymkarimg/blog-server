var EditableArea = require('../models/editableArea');
var async = require('async');
const AWS = require('aws-sdk');

exports.createPage = async function (req, res, next){
    var page = await EditableArea.createPage(req.body)
    console.log(page)
    await page.save();
    res.status(200).json(page);
}

exports.loadEditableArea = async function (req, res, next) {
    if(req.body.pathname != "page"){
        var editableArea = await EditableArea.findOne({ pathname: req.body.pathname, guid: req.body.guid });
        if (editableArea) {
            res.json(editableArea);
        } else {
            editableArea = new EditableArea({
                content: "<p>Coming Soon</p>",
                pathname: req.body.pathname,
                guid: req.body.guid
    
            })
            editableArea.save();
            res.json(editableArea)
        }
    }
    else {
        var editableArea = await EditableArea.findOne({ pathname: req.body.pathname, guid: req.body.guid });
        if (editableArea) {
            res.json(editableArea);
        } else {
            res.json({
                message: "no page with that URL was found"
            })
        }
    }
}

exports.saveEditableArea = async function (req, res, next) {

    var areas = await EditableArea.find();
    var areasToSave = [];

    req.body.editableAreas.forEach(element => {

        // find db area which matches each item in array
        var editableArea = areas.find(function (dbarea) {
            return dbarea.pathname == element.pathname && dbarea.guid == element.guid
        });

        // save to db
        if (editableArea && editableArea.content != element.data) {
            editableArea.content = element.data;
            areasToSave.push(editableArea);
        }
    });

    // save all editable areas in array
    if (areasToSave.length > 0) {
        async.each(areasToSave, function (area, callback) {
            area.save();
            callback();
        })
    }

    res.json(
        {
            message: "Page saved!"
        }
    )
}