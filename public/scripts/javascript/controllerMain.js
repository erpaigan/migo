
var app = angular.module('migo', []);

app.controller('controllerOversee', ['$scope', '$http', function($scope, $http) {
	$scope.optionsFavor = [ { 'value': 'modest', 'text': 'Modest' },
	                        { 'value': 'watcher', 'text': 'Watcher' } ];
	
	$scope.invitation = {};
	$scope.invitation.favor = { 'value': 'modest', 'text': 'Modest' };	
	
	var refreshInvite = function() {
		$http.get('/invite').success(function(response) {
			$scope.invitationsList = response;
		});
	}

	$scope.sendInvite = function() {
		$scope.processing = true;

		$http.post('/invite', $scope.invitation).success(function(response) {
			goLogin(response);
			
			$scope.invitation.email = '';
			
			if(response.message != null) { console.log(response.message); }

			$scope.message = response.message;

			refreshInvite();
			
			$scope.processing = false;
		});
	};

	$scope.removeInvite = function(id) {
		$scope.processing = true;
		
		$http.delete('/invite/' + id).success(function(response) {
			goLogin(response);
			
			if(response.message != null) { console.log(response.message); }
			
			$scope.message = response.message;
			
			refreshInvite();
			
			$scope.processing = false;
		});
	};
    
	var refreshUser = function() {
		$http.get('/user').success(function(response) {
			$scope.usersList = response;
		});
	};

	$scope.removeUser = function(id) {
		$scope.processing = true;
		
		$http.delete('/user/' + id).success(function(response) {
			goLogin(response);
			
			if(response.message != null) { console.log(response.message); }

			$scope.message = response.message;

			//window.removeFromClients(id, response.contacts); //i remove siya sa online nga clients nga array sa io
			
			refreshUser();
			
			$scope.processing = false;
		});
	};

	refreshUser();
	refreshInvite();

	$scope.processing = false;
}]);

app.controller('controllerChat', ['$scope', '$http', function($scope, $http) {
	$scope.user = {};
	$scope.contact = {};
	$scope.receiver = { _id: '', displayName: '' };
	$scope.chatList = [{ _id: 'all', displayName: 'All' }];

	$scope.user.id = window.chat.senderId;
	$scope.processing = true;
	$scope.receiver._id = $scope.chatList[0]._id;
	$scope.receiver.displayName = $scope.chatList[0].displayName;

	/*var setActiveContacts = function(boolie, idie, i) {
		if (i < $scope.contactsList.length) {
			if ($scope.contactsList[i]._id == idie) {
				$scope.contactsList[i].active = boolie;
				
				setActiveContacts(boolie, idie, $scope.contactsList.length);
			} else {
				setActiveContacts(boolie, idie, i + 1);
			}
		}
	}
	
	var sortOnlineContacts = function(data, i) {
		if (i < $scope.contactsList.length) {
			sortOnlineContacts2(data, i, 0, function() {
				sortOnlineContacts(data, i + 1);
			});
		}
	}
	
	var sortOnlineContacts2 = function(data, i, z, callback) {
		if (z < data.length) {
			if ($scope.contactsList[i]._id == data[z]) {
				$scope.contactsList[i].online = false;
			} else {
				$scope.contactsList[i].online = true;
			}
			sortOnlineContacts2(data, i, z + 1, callback);
		} else {
			if (typeof callback === "function") {
				callback();
			}
		}
	}
	
	var updateSpecificContactsOnline = function (contact, i) {
		if (i < $scope.contactsList.length) {
			if ($scope.contactsList[i]._id == contact.id) {
				if (contact.type == 'connect') {
					$scope.contactsList[i].online = false;
				} else if (contact.type == 'disconnect') {
					$scope.contactsList[i].online = true;
				} else if (contact.type == 'displayNameChanged') {
					$scope.contactsList[i].displayName = contact.displayName;
					$scope.contactsList[i].online = false;
				}
				
				updateSpecificContactsOnline(contact, $scope.contactsList.length);
			} else {
				updateSpecificContactsOnline(contact, i + 1);
			}
		}
	}*/
	
	function checkIfListed(id, list, i, found, callback) {
		if (i < list.length) {
			if (list[i]._id == id) {
				checkIfListed(id, list, list.length, true, callback);
			} else {
				checkIfListed(id, list, i + 1, found, callback);
			}
		} else {
			runCallback(callback, found);
		}
	}
	
//<<<=============================================CALLBACK FUNCTIONS ABOVE=============================================>>>
//<<<=============================================NOT FOR THE FAINT OF HEART===========================================>>>
	
	$scope.setDisplayName = function() {
		$scope.processing = true;
		
		$scope.user.displayName = window.strip($scope.user.displayName);
		
		if (!(/\S/.test($scope.user.displayName))) {
			$scope.user.displayName = 'Migo';
		}
		
		$http.put('/displayname/' + $scope.user.id, $scope.user).success(function(response) {
			goLogin(response);
			
			$scope.user.displayName = '';
			
			if(response.message != null) { console.log(response.message); }
			
			$scope.message = response.message;
			
			$('#displayName').html(response.displayName);
			
			$(document).ready(function() {
				var req = {};
				
				req._id = $scope.user.id;
				req.type = 'displayNameChanged';
				req.displayName = response.displayName;
				
				window.chat.sender = response.displayName;
				//window.updateContactsDisplayNameChanged();
				window.updateClientsDisplayNameChanged();
				$scope.updateOnlineList(req);
			});
			
			$scope.processing = false;
		});
	};
	
	$scope.refreshOnline = function(response) {
		$scope.onlineList = response;

		$scope.processing = false;
	}
	
	$scope.updateOnlineList = function(response) {
		if (response.type === 'push') {
			checkIfListed(response._id, $scope.onlineList, 0, false, function(response2) {
				if (!response2) {
					$scope.onlineList.push(response);
				}
			});
		} else if (response.type === 'pull') {
			var newOnlineList = $scope.onlineList.filter(function(el) {
								return el._id !== response._id;
							});
							
			$scope.onlineList = newOnlineList;		
		} else if (response.type === 'displayNameChanged') {
			if (response._id == $scope.user.id) {
				$('#displayName').html(response.displayName);
			}
			
			if (response._id == $scope.receiver._id) {
				$scope.receiver.displayName = response.displayName;
			}
			
			for (var i = 0; i < $scope.onlineList.length; i++) {
				if ($scope.onlineList[i]._id == response._id) {
					$scope.onlineList[i].displayName = response.displayName;
				}
			}

			for (var i = 0; i < $scope.chatList.length; i++) {
				if ($scope.chatList[i]._id == response._id) {
					$scope.chatList[i].displayName = response.displayName;
				}
			}
		}
	}
	
	$scope.getClass = function(id, type) {
		if (type == 'display') {	
			if (id == $scope.user.id) {
				return 'tdUser';
			} else {
				return 'tdOnline';
			}
		} else if (type == 'option') {
			if (id != $scope.user.id) {
				return 'spanContactOption';
			}
		} else if (type =='td') {
			if (id == $scope.user.id) {
				return 'hidden';
			}
		} else if (type =='li') {
			if (id == 'all') {
				return 'hidden';
			} else {
				return 'spanLiRemoveReceiver';
			}
		}
	}
	
	$scope.setChatReceiver = function(id, displayName, source) {
		var id2 = '#' + id;
		
		if (id != $scope.receiver._id) {
			$scope.receiver._id = id;
			$scope.receiver.displayName = displayName;
			window.chat.receiverId = id;

			checkIfListed(id, $scope.chatList, 0, false, function(response) {
				if (!response) {
					$scope.chatList.push({ _id: id, 'displayName': displayName });
				}
			});
			
			if (id == 'all') {
				$('#spanRemoveReceiver').removeClass('spanRemoveReceiver').addClass('spanRemoveReceiver2');
			} else {
				$('#spanRemoveReceiver').removeClass('spanRemoveReceiver2').addClass('spanRemoveReceiver');
			}

			if ($('.spanShowChatList').css('visibility') == 'hidden') {
				$('.spanShowChatList').css('visibility', 'visible');
				$('.spanRemoveReceiver').css('visibility', 'visible');
			}
			
			check(0, id, function() {
				for (var i = 0; i < window.chatControl2.length; i++) {
					if (window.chatControl2[i]._id == id) {
						window.populateChat(id);
					}
				}
			});
			
			if ($scope.receiver._id == 'all') {
				$('#all').children('.spanLiChatListEnvelope').css('display', 'none');
			} else {
				$(id2).children('.spanLiChatListEnvelope').css('display', 'none');
			}
		}
		
		$('#inputChat').focus();
	};
	
	$scope.addToChatListOnMessage = function(id, displayName) {
		checkIfListed(id, $scope.chatList, 0, false, function(response) {
			if (!response) {				
				$scope.chatList.push({ _id: id, 'displayName': displayName });
				
				console.log($scope.chatList);
				
				if ($scope.receiver._id == 'all' && $scope.chatList.length == 2) {
					$('#spanRemoveReceiver').removeClass('spanRemoveReceiver').addClass('spanRemoveReceiver2');
					
					if ($('.spanShowChatList').css('visibility') == 'hidden') {
						$('.spanShowChatList').css('visibility', 'visible');
						$('#spanRemoveReceiver').css('visibility', 'visible');
					}
				}
			}
		});
	}
	
	function check(i, id, callback) {
		if (i < window.chatControl.messagesId.length) {
			var id = '#' + window.chatControl.messagesId[i];
				
			$(id).parent().remove();
			
			check(i + 1, id, callback);
		} else {
			runCallback(callback);
		}
	}

	$scope.removeReceiver = function(response) {
		var index = $scope.chatList.map( function(el) {return el._id; } ).indexOf(response._id);
		
		if (response._id != 'all') {
			var newChatList = $scope.chatList.filter(function(el) {
							   return el._id !== response._id;
						   });
		
			$scope.chatList = newChatList;
			
			if ($scope.chatList.length == 1) {
				$scope.receiver._id = $scope.chatList[0]._id;
				$scope.receiver.displayName = $scope.chatList[0].displayName;
				
				window.chat.receiverId = $scope.chatList[0]._id;
				
				$('#spanRemoveReceiver').css('visibility', 'hidden');
				$('.spanShowChatList').css('visibility', 'hidden');
				$('.ulChatList').css('visibility', 'hidden');
				
				check(0, window.chat.receiverId, function() {
					for (var i = 0; i < window.chatControl2.length; i++) {
						if (window.chatControl2[i]._id == window.chat.receiverId) {
							window.populateChat(window.chat.receiverId);
						}
					}
				});
			} else if (($scope.chatList.length == index) && (response._id == $scope.receiver._id)) {
				$scope.receiver._id = $scope.chatList[index - 1]._id;
				$scope.receiver.displayName = $scope.chatList[index - 1].displayName;
				
				window.chat.receiverId = $scope.chatList[index - 1]._id;
				
				check(0, window.chat.receiverId, function() {
					for (var i = 0; i < window.chatControl2.length; i++) {
						if (window.chatControl2[i]._id == window.chat.receiverId) {
							window.populateChat(window.chat.receiverId);
						}
					}
				});
			} else if (($scope.chatList[index]._id != undefined) && (response._id == $scope.receiver._id)) {
				$scope.receiver._id = $scope.chatList[index]._id;
				$scope.receiver.displayName = $scope.chatList[index].displayName;
				
				window.chat.receiverId = $scope.chatList[index]._id;
				
				check(0, window.chat.receiverId, function() {
					for (var i = 0; i < window.chatControl2.length; i++) {
						if (window.chatControl2[i]._id == window.chat.receiverId) {
							window.populateChat(window.chat.receiverId);
						}
					}
				});
			}
		}
		
		$('#inputChat').focus();
	};
	
	/*var refreshContacts = function() {		
		$http.get('/contacts/' + $scope.user.id).success(function(response) {
			$scope.contactsList = response;
			
			window.updateContactList();
		});
	}
	
	$scope.addContact = function() {
		$scope.processing = true;
		
		$http.put('/contacts/' + $scope.user.id, $scope.contact).success(function(response) {
			$scope.contact.email = '';
			if (response.message != null) { console.log(response.message); }
			
			refreshContacts();
			
			$scope.message = response.message;
			
			$scope.processing = false;
		});
	};
	
	$scope.removeContact = function(id) {				
		$scope.processing = true;
		
		$http.delete('/contacts/' + id, $scope.user.id).success(function(response) {
			if (response.message != null) { console.log(response.message); }			
			
			refreshContacts();
			
			$scope.processing = false;
			
			if (window.chat.receiverId == id) {
				$scope.setChatReceiver('');
			}
		});
	};
	
	$scope.setChatReceiver = function(contactId) {
		window.chat.receiverId = contactId;
		
		var eId = '#' + contactId;
		var color = $(eId).siblings().find('.spanConverseContact').css('color');
		
		if (color == 'rgb(34, 34, 34)') {
			setActiveContacts(false, contactId, 0); //gi false ra ni kay inig order nila kay unahun sa list ang false
		} else {
			setActiveContacts(true, contactId, 0);
		}
	};
	
	$scope.sortContacts = function(response) {		
		for (var i = 0; i < $scope.contactsList.length; i++ ) {
			$scope.contactsList[i].active = true;
		}
		
		sortOnlineContacts(response, 0);
	};
	
	$scope.updateContactsOnline = function(response) {
		updateSpecificContactsOnline(response, 0);
	}
	
	refreshContacts();*/
	
	window.connect();
}]);

function goLogin(response) {
	if (response.message == 'goLogIn') {
		window.location.replace('/');
	}
}

function runCallback(callback, response) {
	if (typeof callback === 'function') {
		callback(response);
	}
}