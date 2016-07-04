// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// define the schema for our user model
var messageSchema = mongoose.Schema({
	   author	 : Schema.Types.ObjectId, // mao ni ang ga.suwat sa message
       message     : String, // mao ni ang message mismo
	   sendDate     : { type: Date, default: Date.now }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Message', messageSchema);