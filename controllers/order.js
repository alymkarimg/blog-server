const Order = require("../models/order");
const _ = require("lodash");
const { errorHandler } = require("../helpers/dbErrorHandler");
const stripe = require("stripe")(process.env.SECRET_STRIPE_KEY);

exports.readOne = async (req, res) => {
  var order = await Order.findOne({ slug: req.params.id });
  if (order) {
    return res.status(200).json({
      order: order,
    });
  } else {
    return res.status(400).json({
      err: ["Could not read order"],
    });
  }
};

exports.readAll = async (req, res) => {
  try {
    var orders = await Order.find({});

    var prototype = Object.keys(Order.schema.paths);

    let model = Order.collection.collectionName

    if (Order.schema.$timestamps) {
      prototype = prototype.concat(["updatedAt", "createdAt"]);
    }

    return res.json({ orders: orders, prototype, model });
  } catch (e) {
    return res.status(400).json({
      err: errorHandler(e),
    });
  }
};

exports.create = async function (req, res, next) {
  try {
    var order = await Order.findOne({ slug: req.body.slug });
    if (order) {
      return res.status(400).json({
        err: ["Title is taken"],
      });
    }

    var newOrder = await Order.createOrder(req.body);
    await newOrder.save();

    res.status(200).json({ newOrder: newOrder });
  } catch (e) {
    return res.status(400).json({
      err: errorHandler(e),
    });
  }
};

exports.editOne = async function (req, res, next) {
  try {
    var order = await Order.findOne({ _id: req.body._id });
    if (order) {
      order.editOrder(req.body);
      await order.save();

      res.status(200).json({ order: order });
    } else {
      return res.status(400).json({
        err: ["No Order found"],
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
    req.body.selected.map(async (order) => {
      var OrderToDelete = await Order.findOne({ title: order.title });
      return OrderToDelete.id;
    })
  );

  try {
    await Order.deleteMany({
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

exports.createIntent = async (req, res) => {
  const intent = await stripe.paymentIntents.create({
    amount: parseFloat(req.params.amount) * 100,
    currency: "gbp",
    automatic_payment_methods: { enabled: true },
  });

  try {
    var order = await Order.createOrder(req.body, intent);
    await order.save();
    res.json({ client_secret: intent.client_secret });
  } catch (e) {
    console.log(e);
  }
};
