const express = require('express');
const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid'); // only for Windows
const MONGODB_URI = "mongodb+srv://BahaaBakri:13010111551a5b0c1d1ATLAS@cluster0.xz8ic.mongodb.net/messages"

const app = express();

// multer fileStorage and filter

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toDateString().replace(/\s/g, '_')  + '_' + new Date().toTimeString().replace(/[\s:]/g, '_') + file.originalname);
    }
})

const fileFilter = ((req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
            cb(null, true)
        } else {
            cb(null, false)
        }
})


// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'))
// Serve Images
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// routers
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => { // It will call once EITHER calling next(error) inside then, catch, or callback OR calling throw Error() outside async code
    const statusCode = error.statusCode || 500
    const errorMessage = error.message || 'Internal Server Error'
    res.status(statusCode).json({message:errorMessage, statusCode: statusCode, error: error});
})

// MONGOOSE
mongoose.connect(MONGODB_URI)
    .then(_ => {
        console.log("CONNECTED SUCCESSFULLY");
        app.listen(8080)
    })
    .catch(err => {
        throw new Error('Error While connecting to data base, try again')
    })