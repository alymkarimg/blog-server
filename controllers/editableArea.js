var EditableArea = require('../models/editableArea');
var async = require('async');
const AWS = require('aws-sdk');

exports.loadEditableArea = async function (req, res, next) {
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