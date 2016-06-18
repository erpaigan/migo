
var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
//var sendgrid = require('sendgrid')('migo', '!qazXsw2');

//var nodemailer = require('nodemailer');
var configGenerator = require('./config/generator.js');
var generator = require('xoauth2').createXOAuth2Generator(configGenerator);

var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

app.set('port', process.env.PORT || 80);
app.set('view engine', 'ejs'); // set up ejs for templating

// listen for token updates
// you probably want to store these to a db
generator.on('token', function(token){
    console.log('New token for %s: %s', token.user, token.accessToken);
});

// login
var transporter = nodemailer.createTransport(({
    service: 'gmail',
    auth: {
        xoauth2: generator
    }
}));

// configuration ===============================================================
mongoose.connect(configDB.url, function(err, db) {
	console.log('Connecting to database: ' + process.env.MIGO_DB);
	
	if(err) {
		console.warn(err.message);
	} else {
		console.log('Connected to ' + process.env.MIGO_DB + ' with great success!\n\n' + 'Now serving, migo. =3' + '\n');
	}
}); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(express.static(path.join(__dirname, 'public'))); //<--- murefer sa public folder tanan static files ex.javascript, css, etc.
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

// required for passport
app.use(session({ secret: process.env.SESSION_SECRET })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./routes/routes.js')(app, passport, transporter); // load our routes and pass in our app and fully configured passport

// real-time ===================================================================
require('./config/io.js')(app, io);

// launch ======================================================================

http.listen(app.get('port'), function() {
	console.log('At your service on port: ' + app.get('port'));
});
