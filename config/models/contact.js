// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var messageSchema = require('../models/message');

var Schema = mongoose.Schema;

// define the schema for our user model
var contactSchema = mongoose.Schema({
        contactId        : Schema.Types.ObjectId,
	   nick			: String
});

// create the model for users and expose it to our app
module.exports = contactSchema;