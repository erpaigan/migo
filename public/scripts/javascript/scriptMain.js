
//hoy loko suwati nig comments para di ka masaag! ayaw pag.tinapuwan

var migoWindows = [];

var toggled = false;

var handlerPreventEvent = function(event) { 
	event.preventDefault();
	event.stopPropagation();
}

$(window).scroll(function (event) {
	navBarVision();
});

$(window).resize(function(){
	navBarVision();
});

function navBarVision() {	
	if ($(window).scrollTop() == 0) {
		$('.divNav').removeClass('on off').addClass('off');
		
		toggled = false;
	} else {
		if (toggled == false) {
			$('.divNav').removeClass('off on').addClass('on');
		}

		toggled = true;
	}
}

$('#liLogOut').click(function() {	
	window.location.replace('/logout');
});

$(document).click(function(event) {
	if ($(event.target).attr('id') != 'spanButtonUser') {
		$('#spanButtonUser').siblings('.ulNavChild').css('visibility', 'hidden');
	}
	
	if ($(event.target).attr('id') == 'divOverseeOverlay') {
		$('.divOverseeOverlay').css('visibility', 'hidden');
		$('.main').removeClass('blur');
		
		$('body').unbind('scroll touchmove mousewheel', handlerPreventEvent);
		
		$('body').css({
			'overflow': 'auto'
		});
	}
	
	if (($(event.target).attr('id') != 'spanShowChatList') && !($(event.target).hasClass('chatList'))) {
		$('.ulChatList').css('visibility', 'hidden');
	}
});

$('.spanButton').on('click', function() {
	if ($('.ulNavChild').css('visibility') == 'visible') {
		$(this).siblings().css('visibility', 'hidden');
	} else {
		$(this).siblings().css('visibility', 'visible');
	}
});

$('#spanButtonOversee').on('click', function() {
	if ($('.divOverseeOverlay').css('visibility') != 'visible') {		
		$('body').bind('scroll touchmove mousewheel', handlerPreventEvent);
		
		$('body').css({
			'overflow': 'hidden'
		});
		
		$('.divOverseeOverlay').css('visibility', 'visible');
		$('.main').addClass('blur');
	}
});

$('#spanButtonCloseOversee').on('click', function() {
	if ($('.divOverseeOverlay').css('visibility') == 'visible') {		
		$('.divOverseeOverlay').css('visibility', 'hidden');
		$('.main').removeClass('blur');
		
		$('body').unbind('scroll touchmove mousewheel', handlerPreventEvent);
		
		$('body').css({
			'overflow': 'auto'
		});
	}
});


$(window).bind("load", function() {

		$('.bonfire').fadeToggle(1000, function() {
			$('.divLogo').fadeToggle();
			$('.spanFooterLogo').fadeToggle();
			
			if ($(window).scrollTop() == 0) {
				$('.divNav').removeClass('on off').addClass('off');

				toggled = false;
			} else {
				$('.divNav').removeClass('off on').addClass('on');

				toggled = true;
			}
		});

});

	/*jQuery(window).load(function() {
		$('.spanFooterLogo').fadeToggle();
		$('.bonfire').fadeToggle(1000, function() {
			$('.divLogo').fadeToggle();
			
			if ($(window).scrollTop() == 0) {
				$('.divNav').removeClass('on off').addClass('off');

				toggled = false;
			} else {
				$('.divNav').removeClass('off on').addClass('on');

				toggled = true;
			}
		});
	});*/

