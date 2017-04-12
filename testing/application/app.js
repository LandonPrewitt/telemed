// Load Twilio configuration from .env into environment
require('dotenv').load();
var AccessToken = require('twilio').AccessToken;
var VideoGrant = AccessToken.VideoGrant;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stylus = require('stylus');
var nib = require('nib');
var mongoose = require('mongoose');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//--------------------------------------------

// Generate access token for chat application
app.get('/token', function(req, res) {

	console.log('generating API key');

	var identity = 'telemed';

	var token = new AccessToken(
		process.env.TWILIO_ACCOUNT_SID,
		process.env.TWILIO_API_KEY,
		process.env.TWILIO_API_SECRET

	);

	token.identity = identity;

	// grant the access token Twilio Video capabilities
	var grant = new VideoGrant();
	grant.configurationProfileSid = process.env.TWILIO_CONFIGURATION_SID;
	
	token.addGrant(grant);

	res.send({
		identity: identity, 
		token: token.toJwt()
	});
});

//--------------------------------------------

mongoose.connect('mongodb://localhost/', function(err){
	if(err){
		console.log(err);
	} else {
		console.log('Connected to mongodb!');
	}
});

var userSchema = mongoose.Schema({
	nick:String,
	pw:String,
	name:String,
	email:String,
	phone:String,
	isDoctor:Boolean,
	created: {type: Date, default: Date.now}
});

var chatSchema = mongoose.Schema({
	nick:String,
	msg: String,
	created: {type: Date, default: Date.now}
});

var Chat = mongoose.model('Message', chatSchema); 
var User = mongoose.model('User', userSchema);

//--------------------------------------------

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware({src: path.join(__dirname, 'public'), compile: compile}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
//module.exports = mongoose;
