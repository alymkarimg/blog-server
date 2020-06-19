var EditableArea = require('../models/editableArea');
var async = require('async');
const http = require("http");
const https = require("https");
const AWS = require('aws-sdk');
const formidable = require("formidable");
const uuid = require("uuid");
const fs = require('fs')
let s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_ID_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

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

exports.uploadImage = async function (req, res, next) {

    function uploadToS3(file, destFileName, callback) {
        let uploadParams = { Bucket: process.env.BUCKET_NAME, Key: destFileName, Body: '' };
        let fileStream = fs.createReadStream(file.path);
        fileStream.on('error', function (err) {
            console.log('File Error', err);
        });

        uploadParams.Body = fileStream;
        deleteFile(file.path);
        s3.upload(uploadParams, callback);
    }

    function deleteFile(filePath) {
        fs.unlink(filePath, function (err) {
            if (err) {
                console.error(err);
            }
            console.log('Temp File Delete');
        });
    }

    let fileId = uuid.v4();
    let filename = `user-photos/${fileId}.jpg`;
    let file = req.files[Object.keys(req.files)[0]];
    // let file = files[0]; 

    if (!/^image\/(jpe?g|png)$/i.test(file.type)) {
        deleteFile(file.path);
        res.status(200).json({ message: "Expects Image File. Please try again." });
        return response.end();
    }

    uploadToS3(file, filename, function (error, data) {
        if (error) {
            console.log(error);
            res.status(400).json({
                uploaded: false, error: {
                    message: "Yikes! Error uploading your photo. Please try again."
                }
            });
        }
        else if (data) {
            res.status(200).json({ uploaded: true, url: data.Location });
        }
        else {
            res.status(200).json({
                uploaded: false, error: {
                    message: "Yikes! Error uploading your photo. Please try again."
                }
            });
        }
    })
}