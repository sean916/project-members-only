var User = require('../models/user');
var Message = require('../models/message');
var async = require('async');
const { body, validationResult } = require('express-validator');
const { DateTime } = require('luxon');

// Display list of all Messages
exports.message_list = function(req, res, next) {

    Message.find()
    .populate('user')
    .exec(function (err, list_messages) {
        if (err) { return next(err); }
        // successful so render
        res.render('message_list', { title: 'All Messages', message_list: list_messages });
    });

};

// Display detail page for a specific Message
exports.message_detail = function(req,res, next) {
    
    Message.findById(req.params.id)
    .populate('user')
    .exec(function (err, message) {
        if (err) { return next(err); }
        // successful so render
        res.render('message_detail', { title: 'Message Detail', message: message });
    })
};

// Display Message create form on GET
exports.message_create_get = function(req, res, next) {
    res.render('message_create', { title: 'Create a new message'});
};

// Handle Message create on POST
exports.message_create_post = [

    // Validate and sanitize values
    body('title', 'Must include a title.').trim().isLength({ min: 1 }).escape(),
    body('body', 'Must include a body.').trim().isLength({ min: 1 }).escape(),

    // Process request with sanitized values
    (req, res, next) => {

        // Extract validation errors from request
        const errors = validationResult(req);

        // Create a new message with values
        var message = new Message({
                title: req.body.title,
                body: req.body.body,
                user: req.body.user,
                timestamp: Date.now()
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form with sanitized values and error messages
            res.render('message_create', { title: 'Create a new message', message: message, errors: errors.array() });
        } else {
            // Data from form is valid
            message.save(function (err) {
                if (err) { return next(err); }
                res.redirect('/catalog/messages');
            });
        }
    }
];

// Display Message delete form on GET
exports.message_delete_get = function(req, res, next) {
    Message.findById(req.params.id).exec(function(err, message) {
        if (err) { return next(err) }
        if(message == null) {
            res.redirect('/catalog/messages');
        }
        res.render('message_delete', { title: 'Delete Message', message: message });
    });
};

// Handle Message delete on POST
exports.message_delete_post = function(req, res, next) {
    
    Message.findById(req.body.messageid).exec(function(err, message) {
        if (err) { return next(err); }
        if (message == null) {
            res.redirect('/catalog/messages');
        }
        else {
            Message.findByIdAndRemove(req.body.messageid, function deleteMessage(err) {
                if (err) { return next(err); }
                // success - redirect to messages
                res.redirect('/catalog/messages')
            })
        }
    });
};