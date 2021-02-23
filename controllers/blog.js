const Blog = require("../models/Blog");
const { errorHandler } = require('../helpers/dbErrorHandler')
const { uploadImage } = require('../helpers/imageUploader')

exports.readOne = (req, res) => {
    res.json('blog hello world');
}

exports.readAll = async (req, res) => {
    try {
        var blogs = await Blog.find({}).populate("categories").exec();

        var prototype = Blog.schema._indexedpaths.map(q => Object.keys(q[0])[0])

        if (Blog.schema.$timestamps) {
            prototype = prototype.concat(["updatedAt", "createdAt"])
        }

        return res.json({ blogs, prototype });

    }
    catch (e) {

        return res.status(400).json({
            err: errorHandler(e)
        });

    }

}

exports.create = async function (req, res, next) {

    try {
        var blog = await Blog.findOne({ slug: req.body.slug });
        if (blog) {
            return res.status(400).json({
                err: ['Title is taken'],
            })
        }

        // upload the image
        await uploadImage(req, res, next, "blog");

        var newBlog = await Blog.createBlog(req.body);
        await newBlog.save();

        res.status(200).json({ newBlog });

    } catch (e) {

        return res.status(400).json({
            err: errorHandler(e)
        });

    }

}

exports.deleteSelected = async function (req, res) {
    var selectedIDs = req.body.selected.map((blog) => {
        return blog.id
    });

    try {
        await Blog.deleteMany({
            _id: {
                $in: selectedIDs
            }
        })
    } catch (e) {
        res.json({ errors: [{ message: "Error deleting blog articles in database" }] })
    }
    res.json({ message: "Deleted blogs successfully" })
}