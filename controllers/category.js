const Category = require('../models/category');
const _ = require('lodash');
const { errorHandler } = require('../helpers/dbErrorHandler')

exports.readOne = async (req, res) => {
    var category = await Category.findOne({ slug: req.params.slug });
      if (category) {
        return res.status(200).json({
          category,
        });
      }
      else {
        return res.status(400).json({
          err: ["Title is taken"],
        });
      }
  };
  
  exports.readAll = async (req, res) => {
    try {
      var categorys = await Category.find({});
  
      var prototype = Object.keys(Category.schema.paths);
  
      if (Category.schema.$timestamps) {
        prototype = prototype.concat(["updatedAt", "createdAt"]);
      }
  
      return res.json({ categorys, prototype });
    } catch (e) {
      return res.status(400).json({
        err: errorHandler(e),
      });
    }
  };
  
  exports.create = async function (req, res, next) {
    try {
      var category = await Category.findOne({ slug: req.body.slug });
      if (category) {
        return res.status(400).json({
          err: ["Title is taken"],
        });
      }
  
      var newCategory = await Category.createCategory(req.body);
      await newCategory.save();
  
      res.status(200).json({ newCategory });
    } catch (e) {
      return res.status(400).json({
        err: errorHandler(e),
      });
    }
  };
  
  exports.editOne = async function (req, res, next) {
    try {
      var category = await Category.findOne({ _id: req.body._id });
      if (category) {
        category.editCategory(req.body);
        await category.save();
  
        res.status(200).json({ category });
      } else {
        return res.status(400).json({
          err: ["No Category found"],
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
      req.body.selected.map(async (category) => {
        var CategoryToDelete = await Category.findOne({ title: category.title });
        return CategoryToDelete.id;
      })
    );
  
    try {
      await Category.deleteMany({
        _id: {
          $in: selectedIDs,
        },
      });
    } catch (e) {
      res.json({
        errors: [{ message: "Error deleting Categories in the database" }],
      });
    }
    res.json({ message: "Deleted Categories successfully" });
  };