const AWS = require('aws-sdk');
const uuid = require("uuid");
const fs = require('fs')
let s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_ID_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});
const { errorHandler } = require('../helpers/dbErrorHandler')
const AnimatedBannerItem = require('../models/animatedBannerItem')

async function uploadToS3(req, file, destFileName, fileProps, guid) {
    let uploadParams = { Bucket: process.env.BUCKET_NAME, Key: destFileName, Body: '' };
    let fileStream = fs.createReadStream(file.path);
    fileStream.on('error', function (err) {
        console.log('File Error', err);
    });

    uploadParams.Body = fileStream;
    const data = await s3.upload(uploadParams).promise();
    if (fileProps) {
        req.urls.push({
            url: data.Location,
            fileProps,
            guid
        })
    } else {
        req.urls.push(data.Location)
    }
    // await deleteFile(file.path);
}

async function deleteFile(filePath) {
    fs.unlink(filePath, function (err) {
        if (err) {
            console.error(err);
        }
        console.log('Temp File Delete');
    })
}

const uploadImages = async function (req, res, next, fileProps) {

    if (req.files) {
        let file;
        req.urls = [];
        await Promise.all(
            Object.keys(req.files).map(async (fileProperty, i) => {
                if (i == fileProps[1])
                    var fileId = uuid.v4();
                let filename;
                if (fileProperty.endsWith(".mp4")) {
                    filename = `photos/${req.body.title}/${req.body.guid}/${fileId}.mp4`;
                } else {
                    filename = `photos/${fileProps[0]}/${fileProps[1]}/${fileId}.jpg`;
                }
                file = req.files[fileProperty]
                await uploadToS3(req, file, filename, fileProps, req.body.guid);
            })
        )
    }
}

exports.uploadBannerImages = async function (req, res, next) {

    if (req.files) {
        var fileProps;
        await Promise.all(Object.getOwnPropertyNames(req.files).map(async (title, index) => {
            fileProps = title.split(' ')
            var bannerItem = await AnimatedBannerItem.findOne({ pathname: fileProps[0], guid: fileProps[1] })
            console.log(req.files[title])
            if (req.files[title] != undefined) {
                await uploadImages(req, res, next, fileProps)
            }

            if (req.urls) {
                req.urls.forEach((urlObject, index) => {
                    var fileProps = urlObject.fileProps
                    if (bannerItem && fileProps[0] == bannerItem.pathname && fileProps[1] == bannerItem.guid) {
                        bannerItem.image = urlObject.url
                    }
                })
            }
            await bannerItem.save();
        }));

    }


    await (async () => {
        next();
    })
}

exports.uploadBannerImageURLs = async function (req, res, next) {
    await Promise.all(req.urls.map(async (urlObject) => {
        await AnimatedBannerItem.findOneAndUpdate({pathname: urlObject.fileProps, guid: urlObject.guid}, {image: urlObject.url})
    }))
}

exports.uploadImage = async function (req, res, next) {

    if (req.files) {
        let file;
        req.urls = [];
        await Promise.all(
            Object.keys(files).map(async (fileProperty) => {
                let fileId = uuid.v4();
                let filename
                if (fileProperty.type == "video/mp4") {
                    filename = `photos/${req.body.animatedBanner.title}/${req.body.animatedBanner.items.guid}/${fileId}.mp4`;
                }
                filename = `photos/${req.body.animatedBanner.title}/${req.body.animatedBanner.items.guid}/${fileId}.jpg`;
                file = req.files[fileProperty]
                if(file){
                    await uploadToS3(req, file, filename)
                }
            })
        )
    }

    req.body.image = req.urls;

    await (async () => {
        next();
    })
}