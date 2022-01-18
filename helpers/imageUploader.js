const AWS = require("aws-sdk");
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const fs = require("fs");
let s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_ID_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});
const { errorHandler } = require("../helpers/dbErrorHandler");
const AnimatedBannerItem = require("../models/animatedBannerItem");

async function uploadToS3(req, file, destFileName, fileProps, guid) {
  let uploadParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: destFileName,
    Body: "",
  };
  let fileStream = fs.createReadStream(file.path);
  fileStream.on("error", function (err) {
    console.log("File Error", err);
  });

  uploadParams.Body = fileStream;
  const data = await s3.upload(uploadParams).promise();
  if (fileProps) {
    req.urls.push({
      url: data.Location,
      fileProps,
      guid,
    });
  } else {
    req.urls.push(data.Location);
  }
  return await deleteFile(file.path);
}

async function deleteFile(filePath) {
  fs.unlink(filePath, function (err) {
    if (err) {
      console.error(err);
    }
    console.log("Temp File Delete");
  });
}

const bannerUploadImage = async function (req, res, next, fileProps, title) {
  if (req.files && title) {
    let file = req.files[title];
    req.urls = [];
    var fileId = uuidv4();
    let filename;
    if (title.endsWith(".mp4")) {
      filename = `photos/${fileProps[0]}/${fileProps[1]}/${fileId}.mp4`;
    } else {
      filename = `photos/${fileProps[0]}/${fileProps[1]}/${fileId}.jpg`;
    }
    await uploadToS3(req, file, filename, fileProps, fileId);
  }
};

exports.uploadBannerImages = async function (req, res, next) {
  if (req.files) {
    var fileProps;
    let fileProperties = Object.getOwnPropertyNames(req.files)
    let uploadPromise = fileProperties.map(async (title, i) => {
      fileProps = title.split("::");
      if (req.files[title] != undefined) {
        await bannerUploadImage(req, res, next, fileProps, title);
      }
    })
    return await Promise.all(uploadPromise);
  }
  await (async () => {
    next();
  });
};

exports.uploadBannerImageURLs = async function (req, res, next) {
  await Promise.all(
    req.urls && req.urls.map(async (urlObject) => {
      let bannerItem = await AnimatedBannerItem.findOne({ pathname: urlObject.fileProps[0], guid: urlObject.fileProps[1] })
      bannerItem.image = urlObject.url
      await bannerItem.save()
      return bannerItem
    })
  );
  await (async () => {
    next();
  });
};

exports.uploadImage = async function (req, res, next) {
  if (req.files) {
    let file;
    req.urls = [];
    await Promise.all(
      Object.keys(req.files).map(async (fileProperty) => {
        let fileId = uuidv4();
        let filename;
        if (fileProperty.type == "video/mp4") {
          filename = `videos/${fileId}.mp4`;
        }
        filename = `photos/${fileId}.jpg`;
        file = req.files[fileProperty];
        if (file) {
          await uploadToS3(req, file, filename);
          res.json(req.urls[0]);
        }
      })
    );
  }

  req.body.image = req.urls;

  await (async () => {
    next();
  });
};
