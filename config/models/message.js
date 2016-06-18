// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// define the schema for our user model
var messageSchema = mongoose.Schema({
	   parties	 : [Schema.Types.ObjectId],
        messages     : String,
	   sendDate     : { type: Date, default: Date.now }
});

// create the model for users and expose it to our app
module.exports = messageSchema;