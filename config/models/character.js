// app/models/character.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our character model
var characterSchema = mongoose.Schema({

    local         	  : {
        ownerId       : String,
        characterName : String,
	   xLoc          :
	   yLoc          :
	   xColOffset    :
	   yColOffset    :
	   direction     :
	   image		  : String
    }

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Character', characterSchema);