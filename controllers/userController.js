require('dotenv').config();
var User = require('../models/user');
var Message = require('../models/message');
var async = require('async');
var bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// Display HOME PAGE
exports.index = function(req, res) {
    
    async.parallel({
        message_count: function(callback) {
            Message.countDocuments({}, callback);
        },
        user_count: function(callback) {
            User.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Members Only Home Page', error: err, data: results});
    });
};

// Display true member form GET
exports.member_get = function(req, res) {
    res.render('true_member', { title: 'True Member' });
};

// Handle true member POST
exports.member_post = [

    // validate and sanitize

    body('code', 'Must enter a valid code').trim().isLength({ min: 1 }).escape(),

    // Process request
    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // there are errors. Render form again 
            res.render('true_member', { title: 'True Member', errors: errors.array() });
        }
        else if (req.body.code == process.env.MEMBER_CODE) {
            User.findByIdAndUpdate(req.user._id, { member_status: true }, function(err, thismember) {
                if (err) { return next(err); }
                res.redirect(thismember.url);
            });
        }
        else if (req.body.code == process.env.ADMIN_CODE) {
            User.findByIdAndUpdate(req.user._id, {admin_status: true }, function(err, thismember) {
                if (err) { return next(err); }
                res.redirect(thismember.url);
            });
        }
        else { return next(err) };
    }
];

// Display list of all Users
exports.user_list = function(req, res, next) {
    
    User.find().exec(function (err, list_users) {
        if (err) { return next(err)};
        // successful so render
        res.render('user_list', { title: 'List of Users', user_list: list_users });
    });
};

// Display detail page of a specific User
exports.user_detail = function(req, res, next) {
    
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id).exec(callback)
        },
        listMessages: function(callback) {
            Message.find({ 'user': req.params.id }).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err)};

        // successful so render
        res.render('user_detail', { title: 'User Detail: ' + results.user.username, user: results.user, userMessages: results.listMessages });
    });
};

// Display User create form on GET
exports.user_create_get = function(req, res, next) {
    res.render('user_create', { title: 'New User Sign Up' });
};

// Handle User create on POST
exports.user_create_post = [

    // Validate and sanitize
    body('first_name', 'First name required').trim().isLength({ min: 1 }).escape(),
    body('last_name', 'Last name required').trim().isLength({ min: 1 }).escape(),
    body('username', 'Username required').trim().isLength({ min: 1 }).escape(),
    body('password', 'Password required').trim().isLength({ min: 1 }).escape(),

    // Process request after validation
    (req, res, next) => {

        // Extract validation errors from a request
        const errors = validationResult(req);

        // Hash password with bcrypt
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if (err) { return next(err); }
            var user = new User(
                {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    username: req.body.username,
                    password: hashedPassword
                }
            );
            if (!errors.isEmpty()) {
                // There are errors. Render form with sanitized values and error messages
                res.render('user_create', { title: 'New User Sign Up', user: user, errors: errors.array()});
                return;
            } 
            else {
                // Data from form is valid
                // Check if user with same username already exists
                User.findOne({ 'username': req.body.username })
                .exec( function(err, found_user) {
                    if (found_user) { // Username already in use
                        res.render('user_create', { title: 'New User Sign Up', user: user, errors: 'Username already in use, pick a different username.'});
                    }
                    else {
                        user.save(function (err) {
                            if (err) { return next(err); }
                            // User saved. Redirect to User detail page.
                            res.redirect(user.url);
                        });
                    }
                })
            }
        });

    }
];

exports.user_login_get = function(req, res, next) {
    res.render('user_login', { title: 'Existing user login' });
};

exports.user_login_post = passport.authenticate('local', {
    successRedirect: '/catalog',
    failureRedirect: '/catalog/user/login'
});

exports.user_logout_get = function(req, res) {
    req.logout();
    res.redirect('/catalog/user/login');
};