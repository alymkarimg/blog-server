const { hasBrowserCrypto } = require("google-auth-library/build/src/crypto/crypto")
const mongoose =require ("mongoose")

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
  }],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

productSchema.statics.createProduct = async function (body) {

  if(body.categories){
      var categories = await Category.find({slug: {$in: body.categories}})
  }

  var product = new this({
      title: body.title,
      slug: body.slug,
      categories: categories,
      price: body.price,
      countInStock: body.countInStock
  })

  return product;
}

productSchema.methods.editProduct = async function (body) {

  if(body.categories){
      var categories = await Category.find({slug: {$in: body.categories}})
  }
      var product = this
      product.title =  body.title,
      product.slug = body.slug,
      product.categories = categories,
      product.price =  body.price,
      product.countInStock= body.countInStock

  return product;
}

module.exports = mongoose.model('Product', productSchema)