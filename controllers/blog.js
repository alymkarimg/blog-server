const Blog = require("../models/Blog");

exports.readOne = (req, res) => {
    res.json('blog hello world');
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