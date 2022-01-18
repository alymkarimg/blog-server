const Blog = require("../models/blog");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.readOne = async (req, res) => {
  var blog = await Blog.findOne({ slug: req.params.slug });
  if (blog) {
    return res.status(200).json({
      blog,
    });
  } else {
    return res.status(400).json({
      err: ["Title is taken"],
    });
  }
};

exports.readAll = async (req, res) => {
  try {
    var blogs = await Blog.find({}).populate("categories").exec();

    var prototype = Object.keys(Blog.schema.paths);

    if (Blog.schema.$timestamps) {
      prototype = prototype.concat(["updatedAt", "createdAt"]);
    }

    return res.json({ blogs, prototype });
  } catch (e) {
    return res.status(400).json({
      err: errorHandler(e),
    });
  }
};

exports.create = async function (req, res, next) {
  try {
    var blog = await Blog.findOne({ slug: req.body.slug });
    if (!blog) {
      var newBlog = await Blog.createBlog(req.body);
      await newBlog.save();

      res.status(200).json({ newBlog });
    } else {
      return res.status(400).json({
        err: ["Title is taken"],
      });
    }
    // await uploadImage(req, res, next, "blog");
  } catch (e) {
    return res.status(400).json({
      err: e,
    });
  }
};

exports.editOne = async function (req, res, next) {
  try {
    var blog = await Blog.findOne({ _id: req.body._id });
    if (blog) {
      // await uploadImage(req, res, next, "blog");
      // var newBlog = await Blog.createBlog(req.body);
      blog.editBlog(req.body);
      await blog.save();

      res.status(200).json({ blog });
    } else {
      return res.status(400).json({
        err: ["No blog found"],
      });
    }
  } catch (e) {
    return res.status(400).json({
      err: errorHandler(e),
    });
  }
};

exports.deleteSelected = async function (req, res) {
  var selectedIDs = await Promise.all(
    req.body.selected.map(async (blog) => {
      var blogToDelete = await Blog.findOne({ slug: blog.title.toLowerCase() });
      return blogToDelete.id;
    })
  );

  try {
    await Blog.deleteMany({
      _id: {
        $in: selectedIDs,
      },
    });
  } catch (e) {
    res.json({
      errors: [{ message: "Error deleting blog articles in database" }],
    });
  }
  res.json({ message: "Deleted blogs successfully" });
};
