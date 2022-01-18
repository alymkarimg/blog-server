const { validationResult, check, oneOf } = require("express-validator");
const Category = require("../models/category");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  errors.errors.forEach(function (error, index) {
    if (error.nestedErrors) {
      error.nestedErrors.forEach(function (nestedError) {
        if (nestedError.msg != "Invalid value") errors.errors.push(nestedError);
      });
      errors.errors.splice(index, 1);
    }
  });

  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push(err.msg));

  return res.status(422).json({
    err: extractedErrors,
  });
};

const userSignUpValidator = [
  check("firstname", "Firstname is required").notEmpty(),
  check("surname", "Surname is required").notEmpty(),
  check("email", "Email is not valid").isEmail(),
  check("password", "Password must be at least 6 characters ")
    .isLength({ min: 6 })
    .matches(/\d/)
    .withMessage("Password must contain a number.")
    .custom((value, { req, loc, path }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error("Passwords don't match");
      } else {
        return value;
      }
    }),
];

const userUpdateValidator = [
  check("firstname", "Firstname is required").notEmpty(),
  check("surname", "Surname is required").notEmpty(),
  check("username", "Username is required").notEmpty(),
  oneOf([
    check("password", "Password must be at least 6 characters ")
      .isLength({ min: 6 })
      .matches(/\d/)
      .withMessage("Password must contain a number.")
      .custom((value, { req, loc, path }) => {
        if (value !== req.body.confirmPassword) {
          throw new Error("Password confirmation is incorrect");
        } else {
          return true;
        }
      }),
    check("password").isEmpty(),
  ]),
];

const userSignInValidator = [
  check("email", "Email is not valid").isEmail(),
  check("password", "Password is required and must be at least 6 characters ")
    .isLength({ min: 6 })
    .matches(/\d/)
    .withMessage("Password must contain a number."),
];

const forgotPasswordValidator = [
  check("email", "Email is not valid").isEmail(),
];

const resetPasswordValidator = [
  check("password", "Password must be at least 6 characters ")
    .isLength({ min: 6 })
    .matches(/\d/)
    .withMessage("Password must contain a number.")
    .custom((value, { req, loc, path }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error("Password confirmation is incorrect");
      } else {
        return true;
      }
    }),
];

const bannerValidator = [check("title", "Title is required").notEmpty()];

const categoryCreateValidator = [
  check("title", "Title is required").notEmpty(),
];

const blogValidator = [
  check("title", "Title is required").notEmpty(),
  check("publishedDate").custom((value, { req, loc, path }) => {
    if (value == undefined) return Promise.reject("Published Date is required");
    const date = new Date(value);
    if (!date.getTime()) return Promise.reject("Published Date is required");
    var testDate = date.toISOString().slice(0, 16);
    if (testDate === value) {
      return true;
    } else {
      return false;
    }
  }),
  check("author", "Author is required").notEmpty(),
  // image validator - yay
  check("image").custom((value, { req }) => {
    if (
      req.files && // 👈 null and undefined check
      Object.keys(req.files).length !== 0 &&
      Object.getPrototypeOf(req.files) === Object.prototype
    ) {
      var validationResult = [];
      for (const fileProperty in req.files) {
        var file = req.files[fileProperty];
        var extension = file.name
          .substr(file.name.lastIndexOf(".") + 1)
          .toLowerCase();
        switch (extension) {
          case "jpg":
            validationResult.push(true);
            break;
          case "jpeg":
            validationResult.push(true);
            break;
          case "png":
            validationResult.push(true);
            break;
          default:
            return false;
        }
      }
      // if one false value is returned, fails validatiom
      console.log(!validationResult.includes((q) => q == false));
      return !validationResult.includes((q) => q == false);
    } else {
      return true;
    }
  }),
];

const productValidator = [
  check("title", "Title is required").notEmpty(),
  check("price", "Price is required").notEmpty(),
  check("countInStock", "Stock count is required").notEmpty(),
];

module.exports = {
  validate,
  userSignUpValidator,
  userSignInValidator,
  userUpdateValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  bannerValidator,
  categoryCreateValidator,
  blogValidator,
  productValidator,
};
