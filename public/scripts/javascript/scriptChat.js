
var socket = io();
var senderSpanClass = '';
var messageDivClass = '';
var chat = { message: '',
		   senderId: $('#userId').html(),
		   sender: $('#displayName').html(),
		   receiverId: [] };
var message = '';

var chatBubbleBlink = { bubble1Id: '',
				    bubble2Id: '',
				    blinking: false };

var chatControl = { messagesId: [] };

var chatBubbleClickCounter = 0;
var activeContacts = [];
var toggleChat = true;
var toggleChatVis = false;
var ngChat;
			
var soundChatHit = new Audio('res/sounds/chatHit.mp3');
soundChatHit.playbackRate = 1.5;
soundChatHit.volume = 0.3;
				
var soundChatFlip = new Audio('res/sounds/chatFlip.mp3');
soundChatFlip.playbackRate = 2;
				
$('#divButtonChat').click(function() {	
	toggleShow();
});
			
$('#spanButtonCloseChat').click(function() {
	toggleHide();
});
				
$('#spanButtonSettings').click(function() {
	toggleSettings();
});
				
$('#btnCancelChatSettings').click(function() {
	toggleSettings();
});

$('#spanButtonAddContact').click(function() {
	//toggleAddContact();
});

$('#btnCancelAddContact').click(function() {
	toggleAddContact();
});

$('#spanDisplayName').click(function() {
	$('#inputChat').focus();
});

$('#messages').on("click", "div.divChatBubble", function(){ // ang gamit sa on kay makuha niya ang mga generated elements	
	if (chatBubbleClickCounter === 2) {
		chatBubbleClickCounter = 1;
	} else {
		chatBubbleClickCounter++;
	}
	
	if (chatBubbleBlink.bubble1Id == '') {
		chatBubbleBlink.bubble1Id = $(this).attr('id');
		
		setDisplayBubbleSelect(this, 'add');
	} else if (chatBubbleBlink.bubble2Id == '') {
		var id1 = '#' + chatBubbleBlink.bubble1Id;
		
		if (chatBubbleBlink.bubble1Id == $(this).attr('id')) {
			chatBubbleBlink.bubble1Id = '';
			
			setDisplayBubbleSelect(id1, 'remove');
		} else {
			chatBubbleBlink.bubble2Id = $(this).attr('id');
			
			setDisplayBubbleSelect(this, 'add');
			
			socket.emit('chatBubbleBlink', chatBubbleBlink);
			
			chatBubbleBlink.bubble1Id = '';
			chatBubbleBlink.bubble2Id = '';
		}
	}

	if (window.getSelection) {
		if (window.getSelection().toString().length == 0) {
			$('#inputChat').focus();
		}
	} else if (document.selection && document.selection.type != "Control") {
		if (document.selection.createRange().text.length == 0) {
			$('#inputChat').focus();
		}
	}
});

$(document).click(function(event) {
	var id1 = '#' + chatBubbleBlink.bubble1Id;
	
	if (!($(event.target).hasClass('divBubble')) && (chatBubbleBlink.bubble1Id != '')) {
		chatBubbleBlink.bubble1Id = '';
		
		setDisplayBubbleSelect(id1, 'remove');
	}
});

$('tbody').on('click','tr', function(){
	if ($('span.spanRemoveContact:hover').length == 0) {
		if ($(this).find('.spanConverseContact').css('color') == 'rgb(77, 189, 51)') {
			$(this).find('.spanConverseContact').css('color', 'rgb(34, 34, 34)');
		} else {
			$(this).find('.spanConverseContact').css('color', 'rgb(77, 189, 51)');
		}
	}
});

$(this).keydown(function(e) {
	if (e.which == 13 || e.keyCode == 13) {
		if (($('#inputChat').val() == '') && (toggleChat)) {
			if (!toggleChatVis) {
				toggleShow();
			} else {
				if ($('#inputChat').is(':focus')) {
					toggleHide(); 
				}
			}
		} else {
			if ($('#inputChat').is(':focus')) {
				message = strip($('#inputChat').val());
							
				if (/\S/.test(message)) {
					chat.message = message;
					
					socket.emit('chat', chat);
					
					/*if (chat.receiverId != '') {
						socket.emit('chatMessage', chat);
					}*/
				}

				$('#inputChat').val('');
			} else {
				if (toggleChat && !toggleChatVis) {
					toggleShow(); 
				}
			}
		}
	}
					
});

function connect() {	
	socket.emit('connected', chat.senderId);
	/*socket.emit('updateContacts', chat.senderId);*/
	
	ngChat = angular.element(document.getElementById('divChat')).scope();
}

/*function updateContactList() {
	socket.emit('updateContactList', chat.senderId);
}

function updateContactsDisplayNameChanged() {
	socket.emit('updateNewDisplayName', chat.senderId);
}

function removeFromClients(id, removedUserContacts) {
	var userRemoved = {};

	userRemoved._id = id;
	userRemoved.contacts = removedUserContacts;

	socket.emit('userRemoved', userRemoved);
}*/

function updateClientsDisplayNameChanged() {
	socket.emit('displayNameChanged', chat.senderId);
}

socket.on('connected', function(response) {
	ngChat.$apply(function() {
		ngChat.refreshOnline(response);
	});
});

socket.on('setOnlineClients', function(response) {
	ngChat.$apply(function() {
		ngChat.updateOnlineList(response);
	});
});

/*socket.on('updateContactList', function(response) {
	activeContacts = response;

	for (var i = 0; i < activeContacts.length; i++) {
		var string = '#' + activeContacts[i];

		$(string).css('color', '#ffffff');
	}

	ngChat.$apply(function() {
		ngChat.sortContacts(activeContacts);
	});
});

socket.on('updateContacts', function(response) { //kani sya, makadawat ka ug mga pulse gkan sa mga taw nga hinconnect or dc
	var string = '#' + response.id;

	if (response.type == 'connect') {
		$(string).css('color', '#ffffff');
	} else if (response.type == 'disconnect') {
		$(string).css('color', '#aaaaaa');
	}
	
	ngChat.$apply(function() {			
		ngChat.updateContactsOnline(response);
	});
});*/

socket.on('chat', function(chat){
	var newMessage;
	var id = '#' + chatControl.messagesId[0];
	
	chatControl.messagesId.push(chat._id);

	if (chatControl.messagesId.length > 50) {
		$(id).parent().remove();

		chatControl.messagesId.splice(0, 1);
	}
	
	if (chat.senderId == $('#userId').html()) {
		senderSpanClass = 'spanChatDisplayName1stPerson';
		messageDivClass = 'divBubble divBubble1stPerson';
	} else {
		senderSpanClass = 'spanChatDisplayName2ndPerson';
		messageDivClass = 'divBubble divBubble2ndPerson';
	}
	
	newMessage = '<li><span class="' + senderSpanClass + ' select">' + chat.sender + '</span><div id="' + chat._id + '" class="' + messageDivClass + ' select divChatBubble">' + linkify(chat.message) + '</div>';

	$(newMessage).hide().appendTo('#messages').fadeIn(400);
	$('#divChatMessages').scrollTop($('#divChatMessages').prop("scrollHeight"));

	if (chat.sender != $('#displayName').html()) {
		playSound(soundChatHit);
	}
});

socket.on('chatBubbleBlink', function(chatBlink){
	var bubble1 = '#' + chatBlink.bubble1Id;
	var bubble2 = '#' + chatBlink.bubble2Id;
	
	chatBubbleBlink.blinking = true;
	
	goBlinkies(0, bubble1, chatBlink.color, function(id) {
		setDisplayBubbleSelect(id, 'removeSpecial');
		
		chatBubbleBlink.blinking = false;
	});
	
	goBlinkies(0, bubble2, chatBlink.color, function(id) {
		setDisplayBubbleSelect(id, 'removeSpecial');
		
		chatBubbleBlink.blinking = false;
	});
});
 
function strip(text) {
	text = '<p>' + text + '</p>';
	
	return jQuery(text).text();
}
				
function toggleShow() {
	toggleChat = false;
					
	$(divButtonChat).fadeToggle(0, function() {
		$('#divChat').slideToggle(100, function() {
			toggleChat = true;
			toggleChatVis = true;

			$('#divChatMessages').scrollTop($('#divChatMessages').prop("scrollHeight"));
			$('#inputChat').focus();
							
			playSound(soundChatFlip);
		});
	});
}
				
function toggleHide() {
	toggleChat = false;

	$('#divChat').slideToggle(100, function() {
		$('#divButtonChat').fadeToggle(0, function() {
			toggleChatVis = false;
			toggleChat = true;
							
			$('#inputChat').focus();
							
			playSound(soundChatFlip);
		});
	});
}
				
function playSound(sound) {
	soundChatFlip.pause();
	soundChatFlip.currentTime = 0;
					
	soundChatHit.pause();
	soundChatHit.currentTime = 0;
				
	sound.play();
}

function toggleAddContact() {
	if ((!($('#divSettingsChat').is(':hidden'))) && (!($('#divAddContactChat').is(':hidden')))) {
		if ($('#divAddContactChat').css('z-index') != 5) {			
			$('#divAddContactChat').css('z-index', 5);
			$('#divSettingsChat').css('z-index', 4);
			$('#inputAddContact').focus();
		} else {
			$('#divAddContactChat').toggle();
			$('#inputSetDisplayName').focus();
			
			$('#divAddContactChat').css('z-index', 4);
			$('#divSettingsChat').css('z-index', 5);
		}
	} else { 
		$('#divAddContactChat').toggle();
		
		if ($('#divAddContactChat').is(':hidden')) {
			if (!($('#divSettingsChat').is(':hidden'))) {
				$('#inputSetDisplayName').focus();
			} else { $('#inputChat').focus(); }
		} else {
			$('#inputAddContact').focus();
			
			$('#divAddContactChat').css('z-index', 5);
			$('#divSettingsChat').css('z-index', 4);
		}
	}
};

function toggleSettings() {			
	if ((!($('#divSettingsChat').is(':hidden'))) && (!($('#divAddContactChat').is(':hidden')))) {	
		if ($('#divSettingsChat').css('z-index') != 5) {
			$('#divAddContactChat').css('z-index', 4);
			$('#divSettingsChat').css('z-index', 5);
			$('#inputSetDisplayName').focus();
		} else {
			$('#divSettingsChat').toggle();
			$('#inputAddContact').focus();
			
			$('#divAddContactChat').css('z-index', 5);
			$('#divSettingsChat').css('z-index', 4);
		}
	} else { 
		$('#divSettingsChat').toggle(); 
	
		if ($('#divSettingsChat').is(':hidden')) {
			if (!($('#divAddContactChat').is(':hidden'))) {
				$('#inputAddContact').focus();
			} else { $('#inputChat').focus(); }
		} else {
			$('#inputSetDisplayName').focus();
			
			$('#divAddContactChat').css('z-index', 4);
			$('#divSettingsChat').css('z-index', 5);
		}	
	};
};

function goBlinkies(i, id, color, callback) {	
	if (i < 3) {
		$(id).stop();
		$(id).fadeOut(200, function() {
			if (i == 0) {
				$(id).css('background', color);
			}
			
			if (i == 2) {
				$(id).css('background', 'linear-gradient(#ffffff, #eeeeee, #cccccc)');
				$(id).after().css('background', 'linear-gradient(#ffffff, #eeeeee, #cccccc)');
				
				if (typeof callback === 'function') {
					callback(id);
				}
			}
			
			$(this).fadeIn(200, function() {
				goBlinkies(i + 1, id, color, callback);
			});
		});
	}
}

function linkify(inputText) {
	var replacedText, replacePattern1, replacePattern2, replacePattern3;

	replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	replacedText = inputText.replace(replacePattern1, '<a href="$1" class="aChat" target="_blank">Link</a>');

	replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" class="aChat" target="_blank">Link</a>');

	replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
	replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">Link</a>');

    return replacedText;
}

function setDisplayBubbleSelect(id, action) {
	id2 = '#' + chatBubbleBlink.bubble1Id;
	if (action === 'add') {
		if ($(id).hasClass('divBubble1stPerson')) {
			$(id).addClass('divBubble1stPersonClicked');
		} else {
			$(id).addClass('divBubble2ndPersonClicked');
		}
	} else if ((action === 'remove') && (chatBubbleBlink.blinking != true)) {
		if ($(id).hasClass('divBubble1stPerson')) {
			$(id).removeClass('divBubble1stPersonClicked');
		} else {
			$(id).removeClass('divBubble2ndPersonClicked');
		}
	}  else if ((action === 'removeSpecial') && (id != id2)) {
		console.log(id + ' ' + id2);
		if ($(id).hasClass('divBubble1stPerson')) {
			$(id).removeClass('divBubble1stPersonClicked');
		} else {
			$(id).removeClass('divBubble2ndPersonClicked');
		}
	}
}
