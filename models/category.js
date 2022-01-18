const mongoose = require("mongoose");
require("dotenv").config();

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    type: {
      type: String,
      trim: true,
      maxlength: 32,
    },
    slug: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    }
  },
  {
    timestamps: false,
  }
);

categorySchema.statics.createCategory = async function (body) {
  var category = new this({
    title: body.title,
    type: body.type,
    slug: body.title.toLowerCase()

  });

  return category;
};

categorySchema.methods.editCategory = async function (body) {
  var category = this;
  category.title = body.title;
  category.type = body.type;
  category.slug = body.title.toLowerCase();

  return category;
};

module.exports = mongoose.model("Category", categorySchema);
