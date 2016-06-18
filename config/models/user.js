// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var contactSchema = require('../models/contact');

var Schema = mongoose.Schema;

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
	   favor		 : String,
	   displayName  : String,
	   contacts     : [contactSchema],
	   contactOf	 : [Schema.Types.ObjectId] //<-- Gi.add ko ani mga tawhana. inig add contact, i add nako sila sa ako contacts array. i add pd nako ako kaugalingon sa ila contact_of array so kani ra sila ako i.update inig online nako.
									  //    Inig delete nako sa account nako. ako i check akong contact_of array unya i.delete
									  //    nako tagsa2 akong kaugalingon sa ila contacts array.
    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);