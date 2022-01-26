const express = require("express");
const router = express.Router();

var {
  readOne,
  readAll,
  create,
  deleteSelected,
  editOne,
  createIntent,
} = require("../controllers/order");
const {
  requireSignin,
  validateAuthToken,
  isAdmin,
} = require("../controllers/auth");
const { parse } = require("../helpers/formParser");
var { categoryCreateValidator, validate } = require("../helpers/validator");

// load all categories
router.get("/", readAll);

// load one category
router.get("/:id", readOne);

// create a category
router.post("/create", create);

// delete selected categories
router.post("/delete", parse, deleteSelected);

// edit category
router.post("/edit", parse, editOne);

// insert fetch data thing
router.post("/secret/:amount", parse, createIntent);

module.exports = router;
