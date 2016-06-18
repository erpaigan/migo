
var toggled = false;

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

$('.spanButton').on('click', function() {
	if ($('.ulNavChild').css('visibility') == 'visible') {
		$(this).siblings().css('visibility', 'hidden');
	} else {
		$(this).siblings().css('visibility', 'visible');
	}
});

$(document).click(function(event) {
	if ($(event.target).attr('id') != 'spanButtonUser') {
		$('#spanButtonUser').siblings('.ulNavChild').css('visibility', 'hidden');
	}
});

jQuery(window).load(function() {
	$('.divLogo').fadeToggle();
	$('.spanFooterLogo').fadeToggle();
	$('.bonfire').fadeToggle(1000);
	
	if ($(window).scrollTop() == 0) {
		$('.divNav').removeClass('on off').addClass('off');
		
		toggled = false;
	} else {
		$('.divNav').removeClass('off on').addClass('on');
		
		toggled = true;
	}
});