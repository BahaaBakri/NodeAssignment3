const { body, validationResult } = require('express-validator');
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.signup = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const name = req.body.name
    const validationError = validationResult(req)
    try {
        if (!validationError.isEmpty()) {
            error = new Error ('Validation Errors!!')
            error.statusCode = 422;
            error.data = validationError.array()
            throw error
        }
        // all data is OK
        const hashedPassword = await bcrypt.hash(password, 12)
        let user = new User({
            email: email,
            password:hashedPassword,
            name:name
        })
        user = await user.save()
        console.log('User added successfully');
        res.status(201).json({message:'Created User Successfully', userId: user._id})
    }
    catch(err) {
        next(err);
    }
}

exports.login = async (req, res, next) => {
    let loadedUser;
    const email = req.body.email
    const password = req.body.password
    try {
        const user = await User.findOne({email:email})
        // check user if exsist
        if (!user) {
            const error = new Error('Email address is not exsist')
            error.statusCode = 401
            throw error;
        }
        loadedUser = {
            email: user.email,
            name: user.name,
            _id: user._id.toString()
        }
        // user is exsists => check password
        const isHaveCorrectPassword =  await bcrypt.compare(password, user.password)
        if (!isHaveCorrectPassword) {
            const error = new Error('Password is incorrect, try again')
            error.statusCode = 401
            throw error;
        }
        // user correct and password correct
        // create json web token
        const token = jwt.sign(loadedUser, 'secret5011', {
            expiresIn: '1h'
        })
        res.status(200).json({
            token:token,
            user: loadedUser,
            userId: loadedUser._id
        })
    }
    catch(err) {
        next(err)
    }
    
}

exports.logout = (req, res, next) => {
    
}

exports.updateStatus = async (req, res, next) => {
    const status = req.body.status;
    try {
        let user = await User.findById(req.userId)
        user.status = status
        user = await user.save()
        if (!user) {
            const error = new Error('User is Not exsist')
            error.statusCode = 404
            throw error
        }
        res.status(200).json({
            message: 'user status has been updated successfully',
            status: user.status
        })
    }
    catch(err) {
      next(err)
    }
  };
  exports.getStatus = async (req, res, next) => {
      try {
        const user = await User.findById(req.userId)
        if (!user) {
            const error = new Error('User is Not exsist')
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            status: user.status
        })
    }
    catch(err) {
        next(err)
    }
  }