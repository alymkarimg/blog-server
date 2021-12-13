const express = require('express');
const morgan = require('morgan');
const cookieparser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// app
const app = express();

// db
mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
}).then(() => {
    console.log('DB connected')
}).catch((err) => {
    console.log(err)
})

// cors - needs to be above routes
if (process.env.NODE_ENV == "development") {
    app.use(cors({ origin: `${process.env.ClIENT_URL}` }))
}

// middleware
app.use(morgan('dev'));
app.use(cookieparser());

// routes
const blogRouter = require('./routes/blog')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const bannerRouter = require('./routes/banner')
const editableAreaRouter = require('./routes/editableArea')
const categoryRouter = require('./routes/category')
const menuRouter = require('./routes/menu')
const orderRouter = require('./routes/order')
const shopRouter = require('./routes/product')

app.use('/api/blogs', blogRouter)
app.use('/api/shop', shopRouter)
app.use('/api/user', userRouter)
app.use('/api/', authRouter)
app.use('/api/editable-area', editableAreaRouter)
app.use('/api/category', categoryRouter)
app.use('/api/animated-banner', bannerRouter)
app.use('/api/menu', menuRouter)
app.use('/api/order', orderRouter)
app.use('/api/shop', shopRouter)


// port
var port = process.env.PORT || 8000

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})