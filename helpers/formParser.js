const formidable = require('formidable')

const parse = (req, res, next) => {

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.status(400).json({
                error: "form-data could not be uploaded"
            })
        }

        req.body = fields;
        req.files = files;
        next();
    })
}

module.exports = {
    parse
}