const { Number } = require("mongoose");
const mongoose = require ("mongoose")

const orderSchema = mongoose.Schema(
  {
    user: {},
    username: '',
    id: '',
    created: 'number',
    status: '',
    shippingAddress: {},
    cart: [{}],
  },
  {
    timestamps: true,
  }
)

orderSchema.statics.createOrder = async function (body, intent = null) {
  var order = new this({
    id: intent.id,
    user: body.user,
    cart: body.cart,
    status: intent.status,
    created: intent.created,
    shippingAddress: body.shippingAddress,
    username: body.username
  });

  return order;
};

orderSchema.methods.editOrder = async function (body, paymentIntent) {
  var order = this;
  order.id = paymentIntent.id
  order.user = body.user;
  order.cart = body.cart;
  order.status = paymentIntent.status;
  order.shippingAddress = body.shippingAddress
  order.username = body.username
  return order;
};


module.exports = mongoose.model('Order', orderSchema)