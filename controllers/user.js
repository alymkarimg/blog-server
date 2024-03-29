const User = require('../models/user');
const _ = require('lodash');
const { errorHandler } = require('../helpers/dbErrorHandler')

exports.userById = async (req, res, next, Id) => {
    try {
        var user = await User.findById(Id);
        if (!user) {
            return res.status(400).json({
                error: 'user not found'
            })
        }

        req.profile = user;
        next();

    } catch (e) {
        return res.status(400).json({
            err: errorHandler(e)
        });
    }
};

exports.read = async (req, res) => {
    try {
        res.status(200).json(req.profile)
    } catch (e) {
        return res.status(400).json({
            err: 'User not found'
        });
    }
}

exports.update = async (req, res) => {
    try {
        let user = req.profile;
        user = _.extend(user, req.body);

        if (req.files.image) {
            if (req.files.image.size > 1000000) {
                return res.status(400).json({
                    message: "Image should be less than 1mb in size"
                });
            }
            // post to s3
            // user.image.data = fs.readFileSync(req.files.image.path)
            // user.image.contentType = req.files.image.type;
        }

        // check if updated users username already exists for another account
        var existingUser = await User.find(
            { email: user.username, _id: { $ne: user._id } },
        )
        if (existingUser.length > 0) {
            return res.status(400).json({
                errors: [{ message: 'Username is taken' }]
            });
        }

        // check if updated users email already exists for another account
        existingUser = await User.find(
            { email: user.email, _id: { $ne: user._id } }
        )
        if (existingUser.lenght > 0) {
            return res.status(400).json({
                errors: [{ message: 'Email is taken' }]
            });
        }

        await user.save();
        await user.populate('category').execPopulate();
        return res.status(200).json({
            user
        });
    } catch (e) {
        console.log("error: ", e)
        return res.status(400).json({
            error: errorHandler(e)
        });
    }
}

exports.readAll = async (req, res) => {
    try {
      var users = await User.find({}).populate("categories").exec();
  
      var prototype = Object.keys(User.schema.paths);
  
      if (User.schema.$timestamps) {
        prototype = prototype.concat(["updatedAt", "createdAt"]);
      }
  
      return res.json({ users, prototype });
    } catch (e) {
      return res.status(400).json({
        err: errorHandler(e),
      });
    }
  };

  exports.create = async function (req, res, next) {
    try {
      var blog = await Blog.findOne({ slug: req.body.slug });
      if (blog) {
        return res.status(400).json({
          err: ["Title is taken"],
        });
      }
  
      // await uploadImage(req, res, next, "blog");
  
      var newBlog = await Blog.createBlog(req.body);
      await newBlog.save();
  
      res.status(200).json({ newBlog });
    } catch (e) {
      return res.status(400).json({
        err: errorHandler(e),
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
  