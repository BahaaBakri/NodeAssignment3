const express = require('express');
const authController = require('../controllers/auth');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const router = express.Router();
const isAuth = require('../middleware/isAuth')

const authValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address!!')
        .custom((value, {req}) => {
            return User.findOne({email:value})
            .then(user => {
                if (user) {
                    return Promise.reject('User is exsisted, try again')
                }
            })
        })
    ,
    body('password').trim().isLength({min:5}),
    body('name').trim().notEmpty()
]

router.put('/login', authController.login);

router.put('/signup', authValidation, authController.signup);

// router.put('/logout', authController.logout)

router.patch('/status',isAuth,
    [
        body('status').trim().notEmpty()
    ],
    authController.updateStatus);

router.get('/status',isAuth, authController.getStatus);

module.exports = router;