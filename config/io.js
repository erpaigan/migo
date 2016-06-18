
var User = require('../config/models/user');

module.exports = function(app, io) {
	var clients = [];
	
	/*function grindData(data, i, z, list, callback) {
		if (z < clients.length) {
			if (data[i].contactId == clients[z]._id) {
				list.push(data[i].contactId);
			}
			
			grindData(data, i, z + 1, list, callback);
		} else {
			// no more items to send, execute the callback
			if (typeof callback === "function") {
				callback(list);
			}
		}
	}
	
	function sendData(data, i, list, callback) {
		if (i < data.length) {
			grindData(data, i, 0, list, function(result) {
				sendData(data, i + 1, list, callback);
			});
		} else {
			// no more items to send, execute the callback
			if (typeof callback === "function") {
				callback(list);
			}
		}
	}
	
	function grindContacts(data, i, z, id, type, callback) {
		if (z < clients.length) {
			if (data[i] == clients[z]._id) {
				var update = {};
				
				if (type != 'displayNameChanged') {
					update.id = id;
					update.type = type;
				} else {
					update.id = id._id;
					update.displayName = id.local.displayName;
					update.type = type;
				}
				
				io.sockets.connected[clients[z].socketId].emit('updateContacts', update);
			}
			
			grindContacts(data, i, z + 1, id, type, callback);
		} else {
			// no more items to send, execute the callback
			if (typeof callback === "function") {
				callback();
			}
		}			
	}
	
	function updateContacts(data, i, id, type, callback) {
		if (i < data.length) {
			grindContacts(data, i, 0, id, type, function() {
				updateContacts(data, i + 1, id, type);
			});
		}
	}*/
	
	function getOnlineClients(i, list, callback) {
		if (i < clients.length) {
			User.findOne({ '_id': clients[i]._id }, function(err, client) {
				if (err)
					throw err;

				if (client) {
					// check kung naa ba sa list. aha pa i add
					checkIfListed(client._id, list, 0, false, function(response) {
						if (!response) {
							var newClient = {};

							newClient._id = client._id;
							newClient.displayName = client.local.displayName;

							list.push(newClient);
						}
						
						getOnlineClients(i + 1, list, callback);
					});
				}
			});
		} else {
			runCallback(callback, list);
		}
	}
	
	function setOnlineClients(user, i, type, callback) {
		if (i < clients.length) {
			var newUpdate = {};
						
			newUpdate._id = user._id;
			newUpdate.displayName = user.local.displayName;
			newUpdate.type = type;
			
			if (clients[i]._id != user._id && type != 'displayNameChanged') {
				io.sockets.connected[clients[i].socketId].emit('setOnlineClients', newUpdate); //para ni di magbalik2 ang ngalan sa lista. i.explain pa ni angay bay kay para puhon di ka maloko.
			} else if (type == 'displayNameChanged') {
				io.sockets.connected[clients[i].socketId].emit('setOnlineClients', newUpdate); //para ni nga tanan taw maupdate.
			}
			
			setOnlineClients(user, i + 1, type, callback);
		} else {
			runCallback(callback);
		}
	}
	
	function checkIfListed(id, list, i, found, callback) {		
		if (list == clients) {
			if (i < list.length) {
				if (list[i]._id == id) {
					checkIfListed(id, list, list.length, true, callback);
				} else {
					checkIfListed(id, list, i + 1, found, callback);
				}
			} else {
				runCallback(callback, found);
			}
		} else {
			if (i < list.length) {
				if (list[i]._id.equals(id)) {
					checkIfListed(id, list, list.length, true, callback);
				} else {
					checkIfListed(id, list, i + 1, found, callback);
				}
			} else {
				runCallback(callback, found);
			}
		}
	}
	
	function runCallback(callback, response) {
		if (typeof callback === 'function') {
			callback(response);
		}
	}

	io.on('connect', function(socket){
		var colorCounter;

		colorCounter = 0;
		
		console.log(socket.request.connection.remoteAddress + ' connected at port ' + app.get('port'));
		
		socket.on('connected', function(id) {
			User.findOne({ '_id': id }, function(err, user) {
				var client = {};

				client._id = id;
				client.socketId = socket.id;
						
				clients.push(client);

				getOnlineClients(0, [], function(res) {						
					io.sockets.connected[socket.id].emit('connected', res);
						
					setOnlineClients(user, 0, 'push', function() {
							console.log('Connected clients:');

						for (var i = 0; i < clients.length; i++) {
							console.log('clientId: ' + clients[i]._id + ' socketId: ' + clients[i].socketId);
						}
					});
				});
			});
		});
		
		socket.on('displayNameChanged', function(id) {
			User.findOne({ '_id': id }, function(err, user) {
				setOnlineClients(user, 0, 'displayNameChanged');
			});
		});
		
		/*socket.on('updateContactList', function(id) {
			User.findOne({ '_id': id }, function(err, user) {
				sendData(user.local.contacts, 0, [], function(result) {
					io.sockets.connected[socket.id].emit('updateContactList', result);
				});
			});
		});
		
		socket.on('updateContacts', function(id) {
			User.findOne({ '_id': id }, function(err, user) {
				updateContacts(user.local.contactOf, 0, user._id, 'connect');
			});
		});
		
		socket.on('updateNewDisplayName', function(id) {
			User.findOne({ '_id': id }, function(err, user) {
				updateContacts(user.local.contactOf, 0, user, 'displayNameChanged');
			});
		});
		
		socket.on('userRemoved', function(userRemoved) {
			for (var i = 0; i < clients.length; i++) {
				if (clients[i]._id == userRemoved._id) {
					clients.splice(i, 1);
				}
			}
		});*/
		
		socket.on('chat', function(chat) {
			chat._id = generateId();
			
			io.sockets.connected[socket.id].emit('chat', chat);
			
			for (var i = 0; i < clients.length; i++) {
				if (clients[i].socketId != socket.id) {
					io.sockets.connected[clients[i].socketId].emit('chat', chat);
				}
			}
			
			/*for (var i = 0; i < clients.length; i++) {
				if (clients[i]._id == msg.receiverId) {
					io.sockets.connected[clients[i].socketId].emit('chatMessage', msg);
					io.sockets.connected[socket.id].emit('chatMessage', msg);
				}
			}*/
		});
		
		socket.on('chatBubbleBlink', function(chatBubbleBlink){
			if (colorCounter > 5) {
				colorCounter = 0;
			}
			
			chatBubbleBlink.color = generateColor(colorCounter);
			
			colorCounter++;
			
			io.sockets.connected[socket.id].emit('chatBubbleBlink', chatBubbleBlink);
			
			for (var i = 0; i < clients.length; i++) {
				if (clients[i].socketId != socket.id) {
					io.sockets.connected[clients[i].socketId].emit('chatBubbleBlink', chatBubbleBlink);
				}
			}
		});
		
		socket.on('disconnect', function() {		
			console.log(socket.request.connection.remoteAddress + ' disconnected');
			
			for (var i = 0; i < clients.length; i++) {
				if (clients[i].socketId == socket.id) {
					console.log(clients[i].socketId);
					User.findOne({ '_id': clients[i]._id }, function(err, user) {
						if (err)
							throw err;

						if (user) {							
							checkIfListed(user._id, clients, 0, false, function(response) {
								if (!response) {
									setOnlineClients(user, 0, 'pull');
								}
							});
						}
					});
					
					clients.splice(i, 1);
				}
			}
			
			/*for (var i = 0; i < clients.length; i++) {
				if (clients[i].socketId == socket.id) {
					User.findOne({ '_id': clients[i]._id }, function(err, user) {
						if (err)
							throw err;

						if (user) {
							updateContacts(user.local.contactOf, 0, user._id, 'disconnect');
						}
					});
					
					clients.splice(i, 1);
				}
			}*/
		});
	});
};

function generateId() {
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
	
	while(code.length < 5) {
          buildCode();
     }
	
	return code;
}

function generateColor(counter) {
	var colors = ['#6DC8C8', '#FFB2FF', '#94B8FF', '#FF9494', '#FFFF94', '#A3FFA3'];

	return colors[counter];
}
