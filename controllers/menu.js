const mongoose = require("mongoose");
var Menu = require("../models/menu");

exports.createMenuItem = async function (req, res, next) {
  var menuItem = await Menu.createMenuItem(req.body);
  if (menuItem.message) {
    res.status(400).json(menuItem);
  } else {
    await menuItem.save();
    res.status(200).json(menuItem);
  }
};

exports.loadMenuItems = async function (req, res, next) {
  var menutree = await Menu.loadMenu();

  var prototype = Object.keys(Menu.schema.paths);

  if (Menu.schema.$timestamps) {
    prototype = prototype.concat(["updatedAt", "createdAt"]);
  }

  res.status(200).json({ menutree, prototype });
};

exports.saveMenuTree = async function (req, res, next) {
  // set item.parent == destination parent.id

  var itemBeingMoved = await Menu.findOne({
    _id: mongoose.Types.ObjectId(req.body.dragItem.id),
  });
  if (req.body.dragItem.parent != req.body.destinationParent) {
    itemBeingMoved.parent = req.body.destinationParent
      ? mongoose.Types.ObjectId(req.body.destinationParent.id)
      : null;
    await itemBeingMoved.save();
    res.json({ loading: false });
  }
};

exports.deleteMenuItem = async function (req, res, next) {
  const findAllDescendents = async (id) => {
    const children = await Menu.find({ parent: id });
    return children.map((element) => {
      return findAllDescendents(element);
    });
  };

  const children = await Promise.all(
    await findAllDescendents(mongoose.Types.ObjectId(req.body.id))
  );
  let parent = await Menu.findOne({
    _id: mongoose.Types.ObjectId(req.body.id),
  });
  let parentAndChildren = [...children, parent];

  try {
    await Menu.deleteMany({
      _id: {
        $in: parentAndChildren.map((q) => q._id),
      },
    });
  } catch (e) {
    res.json({
      errors: [{ message: "Error deleting Product articles in database" }],
    });
  }
  res.json({ message: "Deleted Products successfully" });
  res.status(200).json({});
};

exports.editOne = async function (req, res, next) {
  try {
    var menu = await Menu.findOne({ _id: req.body._id });
    if (menu) {
      // await uploadImage(req, res, next, "Product");
      // var newProduct = await Product.createProduct(req.body);
      menu.editMenuItem(req.body);
      await menu.save();

      res.status(200).json({ menu });
    } else {
      return res.status(400).json({
        err: ["No MenuItem found"],
      });
    }
  } catch (e) {
    return res.status(400).json({
      err: errorHandler(e),
    });
  }
};
