const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const sendgridmail = require('@sendgrid/mail');
sendgridmail.setApiKey(process.env.SENDGRID_API_KEY);
const shortId = require('shortid')
const Category = require('./category')

require("dotenv").config();

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        trim: true,
        required: true
    },
    surname: {
        type: String,
        trim: true,
        required: true
    },
    username: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
        unique: true,
        index: true,
        lowercase: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true
    },
    hashed_password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    resetPasswordLink: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
})

userSchema.virtual('password')
    .set(function (password) {
        this.hashed_password = bcryptjs.hashSync(password, 8);
    })
    .get(function () {
        return this.hashed_password;
    })

// use this to create a user and save to a database
userSchema.statics.createUser = async function (body) {

    var username = body.username ? body.username : shortId.generate();

    var category = body.category ? await Category.findOne({title: body.category}) : await Category.findOne({title: "member"})
    

    var user = new this({
        firstname: body.firstname,
        surname: body.surname,
        username: username,
        email: body.email,
        image: body.image,
        profile: `${process.env.CLIENT_URL}/profile/${username}`,
        description: body.description,
        category
    })

    if (body.hashed_password) {
        user.hashed_password = body.hashed_password;
    } else {
            user.password = body.password;
    }
    return user;
}

userSchema.statics.authenticateUser = async function (body, res) {

    const user = await this.model('User').findOne({ email: body.email });
    if (!user) {
        return res.status(400).json({
            errors: [{ message: 'Email is taken' }]
        });
    }

    const isMatch = await bcryptjs.compare(body.password, user.password);

    if (!isMatch) {
        // throw new Error('Unable to login')
        return res.status(400).json({
            errors: [{ message: 'Username/password incorrect, please try again' }]
        })
    }

    return user;

}

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.hashed_password
    return userObject
}

module.exports = mongoose.model('User', userSchema)