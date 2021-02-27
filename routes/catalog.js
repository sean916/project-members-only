var express = require('express');
var router = express.Router();

// require controller modules

var user_controller = require('../controllers/userController');
var message_controller = require('../controllers/messageController');

// USER ROUTES //

// GET catalog home page
router.get('/', user_controller.index);

// GET request for creating User
router.get('/user/create', user_controller.user_create_get);

// POST request for creating User
router.post('/user/create', user_controller.user_create_post);

// GET request for login User
router.get('/user/login', user_controller.user_login_get);

// POST request for login User
router.post('/user/login', user_controller.user_login_post);

// GET request for logout User
router.get('/user/logout', user_controller.user_logout_get);

// GET request for one User
router.get('/user/:id', user_controller.user_detail);

// GET request for all Users
router.get('/users', user_controller.user_list);

// GET request for true member
router.get('/users/member', user_controller.member_get);

// POST request for true member
router.post('/users/member', user_controller.member_post);

// MESSAGE ROUTES //

// GET request for creating Message
router.get('/message/create', message_controller.message_create_get);

// POST request for creating Message
router.post('/message/create', message_controller.message_create_post);

// GET request for deleting Message
router.get('/message/:id/delete', message_controller.message_delete_get);

// POST request for deleting Message
router.post('/message/:id/delete', message_controller.message_delete_post);

// GET request for one Message
router.get('/message/:id', message_controller.message_detail);

// GET request for all Messages
router.get('/messages', message_controller.message_list);

module.exports = router;