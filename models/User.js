/** Start require */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config').get(process.env.NODE_ENV);
const SALT_I = 10;

/** End Require */

const userSchema = mongoose.Schema({
    email: {
        type: String,
        // required: true,
        trim: true,
        unique: 1
    },
    avatar: {
        type: String
    },
    prefLocation:{
        type: String
    },
    password: {
        type: String,
        // required: true,
        minlength: 6
    },
    name: {
        type: String,
        maxlength: 50
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    phone: {
        type: String
    },
    role: {
        type: Number,
        default: 0 // 0 es usuario, 1 es dueño, 2 es admin
    },
    isLocal:{
        type: Boolean,
        default: true
    },
    reservations:[{
        type: String
    }],
    token: {
        type: String
    },
    googleId: {
        type: String
    },
    active: {
        type: Boolean,
        default: false,
    }
})

userSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(SALT_I, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
})

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function (cb) {
    var user = this;
    var token = jwt.sign(user._id.toHexString(), config.SECRET);
    user.token = token;
    user.save(function (err, user) {
        if (err) return cb(err);
        cb(null, user);
    })
}

userSchema.methods.deleteToken = function (token, cb) {
    var user = this;
    user.update({ $unset: { token: 1 } }, function (err, user) {
        if (err) return cb(err);
        cb(null, user)
    })
}

userSchema.statics.findByToken = function (token, cb) {
    var user = this;
    jwt.verify(token, config.SECRET, function (err, decode) {
        user.findOne({ "_id": decode, "token": token }, function (err, user) {
            if (err) return cb(err);
            cb(null, user)
        })
    })
}


const User = mongoose.model('User', userSchema);

module.exports = { User }