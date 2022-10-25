const express = require('express');

const feedController = require('../controllers/feed');

const { body, validationResult } = require('express-validator');

const isAuth = require('../middleware/isAuth')

const addEditValidation = [
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5})
]

const router = express.Router();
// http://localhost:8080/feed/posts

// GET /feed/posts
router.get('/posts',isAuth, feedController.getPosts);

// GET /feed/post/:id
router.get('/post/:id',isAuth, feedController.getPost);

// POST /feed/post
router.post('/post',isAuth, addEditValidation, feedController.createPost);

// POST /feed/post/:id
router.put('/post/:id',isAuth, addEditValidation, feedController.editPost);

// POST /feed/post/:id
router.delete('/post/:id',isAuth, feedController.deletePost);

module.exports = router;