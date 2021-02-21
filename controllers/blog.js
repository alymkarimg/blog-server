const Blog = require("../models/Blog");

exports.readOne = (req, res) => {
    res.json('blog hello world');
}

exports.readAll = async (req, res) => {
    var blogs = await Blog.find({})

    blogs.forEach(async (blog) => {
        await blog.populate('categories.category').execPopulate();
    })

    var prototype = Blog.schema.paths 

    return res.json({ blogs, prototype });

}

exports.create = async function (req, res) {

    try {
        var slug = body.title
        var blog = await Blog.findOne({ slug });
        if (blog) {
            return res.status(400).json({
                errors: [{ message: 'Title is taken' }],
            })
        }

        var newBlog = await Blog.createBlog(req.body, slug);
        await newBlog.save();
        return res.status(200).json({ newBlog });

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