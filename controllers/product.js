const Product = require("../models/Product");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.readOne = async (req, res) => {
  var product = await Product.findOne({ slug: req.params.slug });
    if (product) {
      return res.status(200).json({
        product,
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
    var products = await Product.find({}).populate("categories").exec();

    var prototype = Object.keys(Product.schema.paths);

    if (Product.schema.$timestamps) {
      prototype = prototype.concat(["updatedAt", "createdAt"]);
    }

    return res.json({ products, prototype });
  } catch (e) {
    return res.status(400).json({
      err: errorHandler(e),
    });
  }
};

exports.create = async function (req, res, next) {
  try {
    var product = await Product.findOne({ slug: req.body.slug });
    if (product) {
      return res.status(400).json({
        err: ["Title is taken"],
      });
    }

    // await uploadImage(req, res, next, "Product");

    var newProduct = await Product.createProduct(req.body);
    await newProduct.save();

    res.status(200).json({ newProduct });
  } catch (e) {
    return res.status(400).json({
      err: errorHandler(e),
    });
  }
};

exports.editOne = async function (req, res, next) {
  try {
    var product = await Product.findOne({ _id: req.body._id });
    if (product) {
      // await uploadImage(req, res, next, "Product");
      // var newProduct = await Product.createProduct(req.body);
      product.editProduct(req.body);
      await product.save();

      res.status(200).json({ product });
    } else {
      return res.status(400).json({
        err: ["No Product found"],
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
    req.body.selected.map(async (product) => {
      var ProductToDelete = await Product.findOne({ slug: product.title.toLowerCase() });
      return ProductToDelete.id;
    })
  );

  try {
    await Product.deleteMany({
      _id: {
        $in: selectedIDs,
      },
    });
  } catch (e) {
    res.json({
      errors: [{ message: "Error deleting Product articles in database" }],
    });
  }
  res.json({ message: "Deleted Products successfully" });
};