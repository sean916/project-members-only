require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { body, validationResult } = require('express-validator');
var compression = require('compression');

var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./models/user');
var Message = require('./models/message');

var dev_db_url = `mongodb+srv://` + process.env.DB_USER + `:` + process.env.DB_PASS + `@cluster0.jgsd3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`; 
var mongoDb = process.env.MONGODB_URI || dev_db_url;
 

mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo conenection error'));

var indexRouter = require('./routes/index');
var catalogRouter = require('./routes/catalog');

var app = express();

app.use(compression()); 

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      };
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          return done(null, user)
        } else {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" })
        }
      })
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
