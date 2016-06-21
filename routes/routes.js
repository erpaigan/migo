
var User = require('../config/models/user');
var Invitation = require('../config/models/invitation');

module.exports = function(app, passport, transporter) {
	
	// ------------- // mao ni mu process para madisplay ang login
	// LOGIN SECTION // kung wala pa ka.login i.redirect gyd sa login page inig type niya sa www.migo.com/ pero kung nakalog.in na
	// ------------- // ipa.adto sa / or home page nga www.migo.com/
	app.get('/login', function(req, res) {
		if (req.isAuthenticated()) { //<--- ang req.isAuthenticated() ang mucheck kung na.login na ba
			res.redirect('/'); //<--- balik sa homepage kung naka.sign in na. di pwede mu.log in ug lain account while logged in
		} else {
			// kanang flash message, mao nay mga warning2 kung mapalpak ang login attempt. pwede ra i.set ang
			// values ana sa config\passport.js
			res.render('login.ejs', { title: 'Migo Login', //<--- muhatag value sa <%= title %> sa page
								 message: req.flash('loginMessage') }); 
		}
	});

	// inig submit sa login mao ni mu.process. iproccess siya sa config\passport.js
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/', //<--- adto sa homepage
		failureRedirect: '/login', //<--- balik sa login form kung mapalpak
		failureFlash: true //<--- i.display ang flashmessage sa ('loginMessage')
	}));

	// ------------ // mao muprocess inig join ug pangdisplay pd sa join
	// JOIN SECTION //
	// ------------ //
	app.get('/join', function(req, res) {
		// pagawas ang join.ejs inig hit sa www.migo.com/join
		if (req.isAuthenticated()) {
			res.redirect('/'); //<--- balik sa homepage kung naka.sign in na. di pwede mu.himu ug lain account while logged in
		} else {
			res.render('join.ejs', { title: 'Join Migo',
							     message: req.flash('joinMessage') });
		}
	});

	// inig submit sa join, mao ni mu.process. iproccess siya sa config\passport.js
	app.post('/join', passport.authenticate('local-join', {
		successRedirect: '/', //<--- adto sa homepage
		failureRedirect: '/join', //<--- balik sa join form kung mapalpak
		failureFlash: true //<--- i.display ang flashmessage sa ('joinMessage')
	}));

	// ------------ // mao ni ang main nga page. ani mulagbas kung masakto ang
	// HOME SECTION // gi.submit sa login form sa www.migo.com/login. kung mu.type
	// ------------ // ang user ug www.migo.com/ unya wala malogin, maredirect sya sa
				 // www.migo.com/login. mao nay isa sa gamit sa isLoggedIn
	app.get('/', isLoggedIn, function(req, res) {
		res.render('main.ejs', { title: 'Migo.beta', 
							user : req.user, //<--- i.pasa sa page ang info sa passport
							messageInviteResult: '' });
	});

	app.get('/logout', function(req, res) {
		req.logout(); //<--- given na ni. murag sa passport mn guro or sa session or both
		res.redirect('/login'); //<--- balibag sa login inig human logout
	});

	app.get('/invite', isLoggedIn, function(req, res) {
		Invitation.find(function(err, invitations) {
			if (err)
				 return done(err);

			res.json(invitations);
		});
	});
	
	app.post('/invite', isLoggedIn, function(req, res) {
		var newCode;
		
		User.findOne({ 'local.email' :  req.body.email.toLowerCase() }, function(err, user) {
			if (err)
				return done(err);
				
			if(user) {
				res.json({ 'message': req.body.email + ' is already a member' });
			} else {					
				if (res) {
					Invitation.findOne({ 'local.email':  req.body.email }, function(err, code) {
						 if (err)
							return done(err);

						 if(code) {
							 res.json({ 'message': 'An invite with this email already exists' });
						 } else {										
							var newInvitation            = new Invitation();
							// set the user's local credentials
							newCode = newInvitation.generateCode();
							newInvitation.local.code     = newCode;
							newInvitation.local.email    = req.body.email.toLowerCase();
							newInvitation.local.favor    = req.body.favor.value; //<--- favor levels: modest(normal), watcher(admin)
							
							var mailOptions = {
								from: "'Migo Team'",
								to: req.body.email,
								subject: 'Join Migo',
								text: 'Servus! You may use this invitation code: ' + newCode + ' along with this email address to join. Enjoy your stay.'
							};

							transporter.sendMail(mailOptions, function(error, response) {
								if (error) { 
									console.log(error);
									//suwat code ani nga warning2 wala ma send ang email
								} else { 
									console.log(response);
								
									// save the user jail the pusher
									newInvitation.save(function(err) {
										if (err)
										    throw err;
										    
										res.json({ 'message': 'An invitation has been sent to ' + req.body.email });
									});
								}
								
								transporter.close();
							});

							/*newInvitation.save(function(err) {
								if (err)
								    throw err;
										    
								res.json({ 'message': 'An invitation has been sent to ' + req.body.email });
							});*/
						 }
					});
				}
			}
		});
		// TO DO:
		// - check kung mi.exist ba ang email gamit email-existence mn guro to. i.npm install
		// - dapat watchers ra maka.access sa /user ug /invite
	});
	
	app.delete('/invite/:id', isLoggedIn, function(req, res) {
		var id = req.params.id;

		Invitation.remove({ '_id': id }, function(err, id) {
			if (err)
				 return done(err);
			 
			res.json({ 'message': 'Invitation has been removed' });
		});
	});
	
	app.get('/user', isLoggedIn, function(req, res) {
		User.find(function(err, users) {
			if (err)
				 return done(err);
				
			res.json(users);
		});
	});
	
	app.delete('/user/:id', isLoggedIn, function(req, res) {
		var id = req.params.id;
		
		function removeContactOf(contact, i, callback) {
			if (i < contact.local.contacts.length) {
				User.findOne({ '_id':  contact.local.contacts[i].contactId }, function(err, userContactOf) {
					if (err)
						return done(err);
					if (userContactOf) {
						userContactOf.local.contactOf.remove(contact._id);
						userContactOf.save(function(err) {
							if (err) 
								throw err;
							
							console.log('saving');
							removeContactOf(contact, i + 1, callback);
						});
					}
				});
			} else {
				if (typeof callback === "function") {
					callback();
				}
			}
		}
		
		User.findOne({ '_id': id }, function(err, user) {
			if (err)
				return done(err);
			
			var contacts = user.local.contacts;
						
			if (user) {				
				for (var i = 0; i < user.local.contactOf.length; i++) {
					User.update({ '_id': user.local.contactOf[i] }, { $pull: { 'local.contacts' : { contactId: id } } }, function(err, user) {
						if (err) {
							res.json({ 'message': 'Failed to update database' });
						}
						console.log('updating');
					});
				}
				
				removeContactOf(user, 0, function() {
					User.remove({ '_id': id }, function(err, id) {
						if (err)
							return done(err);
		
						res.json({ 'message': 'User has been removed', 'contacts': contacts });
					});
				});
			}
		});		
	});
	
	app.put('/displayname/:id', isLoggedIn, function(req, res) {		
		var id = req.params.id;
		var newDisplayName = req.body.displayName;
		
		User.findOneAndUpdate({ '_id': id }, { '$set': { 'local.displayName': newDisplayName } }, function(err, user) {
			if (err) {
				res.json({ 'message': 'Failed to update database' });
			}
			
			res.json({ 'message': 'Display Name changed', 'displayName': newDisplayName });
		});
	});
	
	app.get('/contacts/:id', isLoggedIn, function(req, res) {
		var id = req.params.id;
		
		function sendData(data, i, list, callback) {
			if (i < data.local.contacts.length) {
				User.findOne({ '_id': data.local.contacts[i].contactId }, function(err, contact) {
					if (err)
						return done(err);
						
					var newItem = {};

					if (contact) {
						newItem._id = contact._id;
						newItem.email = contact.local.email;
						newItem.displayName = contact.local.displayName;
								
						list.push(newItem);

						sendData(data, i + 1, list, callback);
					}
				});
			} else {
				// no more items to send, execute the callback
				if (typeof callback === "function") {
					callback(list);
				}
			}
		}
		
		User.findOne({ '_id':  id }, function(err, user) {
			if (err)
				return done(err);

			if (user) {
				sendData(user, 0, [], function(result) {
					res.json(result);
				});
			} else {
				res.json({ 'message': 'You somehow disappeared' });
			}
		});
	});
	
	app.put('/contacts/:id', isLoggedIn, function(req, res) {
		var id = req.params.id;
		var contactEmail = req.body.email;
		
		function findContact(user, contact, found, i, callback) {
			if (i < user.local.contacts.length) {
				if (user.local.contacts[i].contactId.equals(contact._id)) {
					findContact(user, contact, true, user.local.contacts.length, callback);
				} else {
					findContact(user, contact, found, i + 1, callback);
				}
			} else {
				if (typeof callback === "function") {
					callback(found);
				}
			}
		}
		
		console.log(id + ' request ' + contactEmail);
		
		User.findOne({ 'local.email': contactEmail }, function(err, contact) {
			if (err)
				return done(err);

			if (contact) {
				User.findOne({ '_id':  id }, function(err, user) {
					if (err)
						return done(err);

					if (user) {
						if (user.local.email == contactEmail) {
							res.json({ 'message': 'You cannot add yourself, silly'});
						} else {
							findContact(user, contact, false, 0, function(result) {
								console.log(result);
								if (result) {
									res.json({ 'message': 'Contact already in list'});
								} else {
									user.local.contacts.push({ 'contactId': contact._id });
									user.save();
										
									contact.local.contactOf.push(user._id);
									contact.save();
											
									res.json({ 'message': 'Contact added'});
								}
							});
						}
					} else {
						res.json({ 'message': 'Someone deleted you'});
					}
				});
			} else {
				res.json({ 'message': 'User with that email does not exist'});
			}
		});
	});
	
	app.delete('/contacts/:id', isLoggedIn, function(req, res) {
		var contactIdToRemove = req.params.id;
		var userId = req.user.id;
		
		User.update({ '_id': userId }, { $pull: { 'local.contacts' : { contactId: contactIdToRemove } } }, function(err, user) {
			if (err) {
				res.json({ 'message': 'Failed to update database' });
			}
			
			User.findOne({ '_id':  contactIdToRemove }, function(err, userContactOf) {
				if (err)
					return done(err);
				if (userContactOf) {
					userContactOf.local.contactOf.remove(userId);
					userContactOf.save(function(err) {
						if (err) 
							throw err;
								
						res.json({ 'message': 'Removed contact' });
					});
				} else { res.json({ 'message': 'Failed to update database' }); }
			});
		});
	});
};

// mu check nga logged in ang user. kung wala, i.adto sa login page
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) { 
		return next(); 
	} else {
		if (req.method != 'GET') {
			res.json({ 'message': 'goLogIn' }); //<--- balibag sa login kung di ma.authenticate res.redirect('/login');
		} else {
			res.redirect('/login'); //<--- balibag sa login kung di ma.authenticate res.redirect('/login');
		}
	}
}

/*function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    else { res.redirect('/login'); } //<--- balibag sa login kung di ma.authenticate res.redirect('/login');
}*/