const { Int32 } = require('mongodb')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    product: {
        type: String
    },
    homeID: {
        type: Number
    }
}, {timestamps: true})

const User = mongoose.model('User', userSchema)
module.exports = User