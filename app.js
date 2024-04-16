require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const Blog = require('./models/blog');

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');


const { checkForAuthenticationCookie } = require("./middlewares/authentication");


const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

if (!PORT) {
    console.error("PORT environment variable is not set.");
    process.exit(1);
}

if (!MONGO_URL) {
    console.error("MONGO_URL environment variable is not set.");
    process.exit(1);
}

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log("MongoDB connected!!!");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });


app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')));


app.get('/', async (req, res) =>{
    const allBlogs = await Blog.find({});
    res.render('home', {
        user: req.user,
        blogs: allBlogs
    });
});

app.use('/user', userRoute);
app.use('/blog', blogRoute);

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
})
