// app/models/convo.js
// load the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// define the schema for our convo model
var convoSchema = mongoose.Schema({
		header				: String,
       participants        : [Schema.Types.ObjectId],
	   messages				: [Schema.Types.ObjectId]
});

// create the model for convo and expose it to our app
module.exports = mongoose.model('Convo', convoSchema);