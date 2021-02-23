const AWS = require('aws-sdk');
const uuid = require("uuid");
const fs = require('fs')
let s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_ID_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});
const { errorHandler } = require('../helpers/dbErrorHandler')

exports.uploadImage = async function (req, res, next, name) {

    async function uploadToS3(file, destFileName) {
        let uploadParams = { Bucket: process.env.BUCKET_NAME, Key: destFileName, Body: '' };
        let fileStream = fs.createReadStream(file.path);
        fileStream.on('error', function (err) {
            console.log('File Error', err);
        });

        uploadParams.Body = fileStream;
        const data = await s3.upload(uploadParams).promise();
        req.urls.push(data.Location)
        await deleteFile(file.path);
    }

    async function deleteFile(filePath) {
        fs.unlink(filePath, function (err) {
            if (err) {
                console.error(err);
            }
            console.log('Temp File Delete');
        })
    }

    if (req.files) {
        let file;
        req.urls = [];
        await Promise.all(
            Object.keys(req.files).map(async (fileProperty) => {
                let fileId = uuid.v4();
                let filename = `photos/${name}/${req.body.slug}/${fileId}.jpg`;
                file = req.files[fileProperty]
                await uploadToS3(file, filename)
            })
        )
    }

    req.body.image = req.urls;
    
    await (async () => {
        next();
    })
}