const User = require('../../server/models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//Show the list of Users
const index = (req, res, next) => {
    User.find()
    .then(response => {
        res.json({
            response
        })
    })
    .catch(error => {
        res.json({
            message: 'An error Occured!'
        })
    })
}

//Show single user
const show = (req, res, next) => {
    let userID = req.body.userID
    User.findById(userID)
    .then(response => {
        res.json({
            response
        })
    })
    .catch(error => {
        res.json({
            message: 'An error Occured!'
        })
    })
}

//Add a user
const register = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, function(err, hashedPass){
        if(err){
            res.json({
                error: err
            })
        }

        let user = new User({
            name: req.body.name,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPass,
            product: req.body.product,
            homeID: req.body.homeID
        })
        user.save()
        .then(response => {
            res.json({
                message: 'User added successfully'
            })
        })
        .catch(error => {
            res.json({
                message: 'An error Occured!'
            })
        })
    })

    
}

//Update a user
const update = (req, res, next) => {
    let userID = req.body.userID

    let updateData = {
        name: req.body.name,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPass,
        product: req.body.product,
        homeID: req.body.homeID
    }

    User.findByIdAndUpdate(userID, {$set: updatedData})
    .then(() => {
        res.json({
            message: 'User updated successfully!'
        })
    })
    .catch(error => {
        res.json({
            message: 'An error Occured!'
        })
    })
}

//Delete a user
const destroy = (req, res, next) => {
    let userID = req.body.userID
    User.findByIdAndRemove(userID)
    .then(() => {
        res.json({
            message: 'User deleted successfully'
        })
    })
    .catch(error => {
        res.json({
            message: 'An error Occured!'
        })
    })
}

module.exports = {
    index, show, register, update, destroy
}