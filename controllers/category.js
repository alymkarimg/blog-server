const Category = require('../models/category');
const _ = require('lodash');
const { errorHandler } = require('../helpers/dbErrorHandler')

exports.create = async (req, res) => {

    var category = await Category.findOne({ title: req.body.title });

    if (category) {
        res.status(400).json({
            errors: [{ message: 'Category with that title already exists' }]
        })
    }

    category = new Category({
        title: req.body.title,
        type: req.body.type
    })

    try {
        await category.save();

        res.status(200).json({
            category,
            message: "Category successfully created"
        })

    } catch (e) {
        res.status(200).json({
            errors: [{ message: 'Error saving category in the database' }]
        })
    }
}