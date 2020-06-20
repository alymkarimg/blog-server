const { validationResult, check, oneOf } = require('express-validator');
const Category = require('../models/category')

const validate = (req, res, next) => {

    const errors = validationResult(req)

    errors.errors.forEach(function(error, index){
        if(error.nestedErrors){
            error.nestedErrors.forEach(function(nestedError){
                if(nestedError.msg != "Invalid value")
                errors.errors.push(nestedError)
            })
        errors.errors.splice(index, 1);
        }
    })

    if (errors.isEmpty()) {
        return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({
        message: err.msg
        // [err.param]
    }))

    return res.status(422).json({
        errors: extractedErrors,
    })
}

const userSignUpValidator = [
    check('firstname', 'Firstname is required').notEmpty(),
    check('surname', 'Surname is required').notEmpty(),
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password must be at least 6 characters ').isLength({ min: 6 }).matches(/\d/).withMessage('Password must contain a number.')
        .custom((value, { req, loc, path }) => {
            if (value !== req.body.confirmPassword) {
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        })
]

const userUpdateValidator = [
    check('firstname', 'Firstname is required').notEmpty(),
    check('surname', 'Surname is required').notEmpty(),
    check('username', 'Username is required').notEmpty(),
    oneOf([
        check('password', 'Password must be at least 6 characters ').isLength({ min: 6 }).matches(/\d/).withMessage('Password must contain a number.')
            .custom((value, { req, loc, path }) => {
                if (value !== req.body.confirmPassword) {
                    throw new Error("Password confirmation is incorrect");
                } else {
                    return true;
                }
            }),
        check('password').isEmpty()
    ])
]

const userSignInValidator = [
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password is required and must be at least 6 characters ').isLength({ min: 6 }).matches(/\d/).withMessage('Password must contain a number.')
]

const forgotPasswordValidator = [
    check('email', 'Email is not valid').isEmail(),
]

const resetPasswordValidator = [
    check('password', 'Password must be at least 6 characters ').isLength({ min: 6 }).matches(/\d/).withMessage('Password must contain a number.')
        .custom((value, { req, loc, path }) => {
            if (value !== req.body.confirmPassword) {
                throw new Error("Password confirmation is incorrect");
            } else {
                return true;
            }
        })
]

const bannerValidator = [
    check('title', 'Title is required').notEmpty(),
]

const categoryCreateValidator = [
    check('title', 'Title is required').notEmpty()
]

const blogValidator = [
    check('title', 'Title is required').notEmpty(),
]

module.exports = {
    validate,
    userSignUpValidator,
    userSignInValidator,
    userUpdateValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    bannerValidator,
    categoryCreateValidator,
    blogValidator
}