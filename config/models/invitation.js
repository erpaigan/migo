// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var invitationSchema = mongoose.Schema({

    local            : {
        code        : String,
	   email		: String,
	   favor		: String//<--- puhon i.implement nato ni nga pwede na ang chosen muhimu ug code unya generate
    }					//	  ug hash unya i.validate ang invitation code gihatag sa user inig join.

});

// methods ======================
invitationSchema.methods.generateCode = function() {
     var code = '';
     var length = code.length;
     var result;
     var letter = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
     
	function generateLetter() {
		var random;
		var result;
		
		random = Math.floor(Math.random() * 26);
		result = letter[random];
		
		code = code.concat(result);
     }

     function generateNumber() {
          var random;
		var result;
		
		random = Math.floor(Math.random() * 10);
		result = random.toString();

		code = code.concat(result);
     }

     function buildCode() {
          var choice;
            
          choice = Math.floor(Math.random() * 2);

          if(choice === 0) {
               generateLetter();
          } else {
               generateNumber();
          }
     }

     function finishingTouch() {
          var chop;
          var chopResult;

          chop = code.substring(0, 4);
          chopResult = chop.concat('-');
          chop = code.substring(4, 8);
          chopResult = chopResult.concat(chop);
          chopResult = chopResult.concat('-');
          chop = code.substring(8, 12);
          chopResult = chopResult.concat(chop);

          code = chopResult;
     }
     while(code.length < 15) {
          buildCode();
     }

     finishingTouch();
	
	return code;
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Invitation', invitationSchema);