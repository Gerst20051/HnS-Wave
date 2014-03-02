(function(window, document, $, undefined){
($ && main($) && jQueryPlugins()) || !function(){
	var s = document.createElement("script"), h = document.head || document.getElementsByTagName("head")[0] || document.documentElement, done = false;
	s.src = "jquery.js";
	s.onload = s.onreadystatechange = function(){
		if (!this.readyState || this.readyState == "complete" || this.readyState == "loaded") {
			if (!done && (done=true)) {
				main(window.jQuery) && jQueryPlugins();
				s.onload = s.onreadystatechange = null;
				if (h && s.parentNode) h.removeChild(s);
				s = undefined;
			}
		}
	};
	h.insertBefore(s, h.firstChild);
}();

function main($){
'use strict';
if (main.run) return;
else main.run = true;

window.aC = {
title: "Birthday Reminder",
ajaxurl: "ajax.php",
loaded: false,
logged: false,
loginFocus: false,
registerFocus: false,
user: {},
birthdays: [],
init: function(){
	if (this.loaded !== false) return;
	var _this = this;
	$.getJSON(this.ajaxurl, {action: "logged"}, function(response){
		_this.loaded = true;
		if (response.logged === true) {
			_this.logged = true;
			_this.loggedIn();
		} else {
			_this.loggedOut();
		}
	});
	this.dom();
},
loggedIn: function(){
	if (this.logged !== true) return;
	var _this = this;
	$.getJSON(this.ajaxurl, {action: "userdata"}, function(response){
		if (response.user !== false) {
			_this.user = response.user;
			$("#authpanel").parent().css('visibility', 'hidden');
			$("body").addClass("in").removeClass("out");
			$("#nav").slideDown();
		} else _this.logout();
	});
},
loggedOut: function(){
	if (this.logged !== false) return;
	$("body").addClass("out").removeClass("in");
	$("#nav").slideDown();
},
login: function(){
	var _this = this, e = false, $login = $("#f_login"), $email = $login.find("#lemail"), $password = $login.find("#lpassword");
	if (!$.trim($email.val()).length) { $email.addClass('error'); e = true; } else $email.removeClass('error');
	if (!$.trim($password.val()).length) { $password.addClass('error'); e = true; } else $password.removeClass('error');
	if (!e) {
		$login.find("input").attr('disabled', true);
		var output = {}, inputs = $login.find("input").filter("[name]");
		$.map(inputs, function(n, i){
			output[n.name] = $.trim($(n).val());
		});
		$.post(this.ajaxurl, {action: "login", form: output}, function(response){
			$login.find("input").attr('disabled', false);
			if (stringToBoolean(response.logged)) {
				$login.find(".error").removeClass('error');
				$("#f_register").clearForm();
				$login.clearForm();
				_this.logged = true;
				_this.loggedIn();
			} else {
				$login.find("#b_login_splash").addClass('error');
				$password.val('');
			}
		});
	}
},
logout: function(){
	var _this = this;
	$.post(this.ajaxurl, {action: "logout"}, function(response){
		if (!stringToBoolean(response.logged)) {
			_this.logged = false;
			_this.user = {};
			_this.loggedOut();
		}
	});
},
regValidate: function(){
	var e = false,
	$reg = $("#f_register"),
	$name = $reg.find("#reg_name"), name_trim = $.trim($name.val()),
	$email = $reg.find("#reg_email"), email_trim = $.trim($email.val()),
	$password = $reg.find("#reg_password"), password_trim = $.trim($password.val()),
	$timezone = $reg.find("#reg_timezone"), timezone_trim = $.trim($timezone.val()),
	nameReg = /[A-Za-z'-]/,
	emailReg = /^[^0-9][a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[@][a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,4}?$/i;

	if (!name_trim.length || !nameReg.test(name_trim) || name_trim.split(' ').length < 2) {
		$name.addClass('error');
		e = true;
	} else $name.removeClass('error');

	if (!email_trim.length || !emailReg.test(email_trim) || this.isEmailRegistered(email_trim)) {
		$email.addClass('error');
		e = true;
	} else $email.removeClass('error');
	
	if (!password_trim.length) {
		$password.addClass('error');
		e = true;
	} else $password.removeClass('error');

	//TODO: Add timezone check
	
	return !e;
},
register: function(){
	if (!this.regValidate()) return;
	var _this = this, output = {}, $f_register = $("#f_register"), inputs = $f_register.find("input").filter("[name]");
	$f_register.find("input").attr('disabled', true);
	$.map(inputs, function(n, i){
		output[n.name] = $.trim($(n).val());
	});
	$.post(this.ajaxurl, {action: "register", form: output}, function(response){
		$f_register.find("input").attr('disabled', false);
		if (stringToBoolean(response.registered)) {
			$f_register.find(".error").removeClass('error');
			$f_register.clearForm();
			$("#authpanel").parent().css('visibility', 'hidden');
			_this.alert('Please Check Your Email For Verification Link To Activate Your Account!');
		} else {
			$f_register.find("#b_register").addClass('error');
		}
	});
},
alert: function(message){
	alert(message);
},
isEmailRegistered: function(email){
	email = $.trim(email);
	if (email.length) {
		$.get(this.ajaxurl, {action: "checkemail", email: email}, function(response){
			if (stringToBoolean(response.email)) return true;
			else return false;
		});
	}
},
onKeyDown: function(e){
	var keyCode = e.which;
	if (this.logged === false) {
		if (keyCode == keys.ENTER) {
			e.preventDefault();
			if (this.loginFocus) this.login();
			else if (this.registerFocus) this.register();
		} else if (keyCode == keys.ESCAPE) {
			$("#authpanel").parent().css('visibility', 'hidden');
		}
	}
},
dom: function(){
	var _this = this, birthdays = $("#birthdays");
	$("#nav").on('click', '.login-link', function(){
		$("#authpanel").center().parent().hide().css('visibility', 'visible').fadeIn('slow');
	});
	$("#nav").on('click', '.logout-link', function(){
		_this.logout();
	});
	$("#authpanel").on({
		focus: function(){
			_this.loginFocus = true;
		},
		blur: function(){
			_this.loginFocus = false;
		}
	},'#lemail, #lpassword');
	$("#authpanel").on({
		focus: function(){
			_this.registerFocus = true;
		},
		blur: function(){
			_this.registerFocus = false;
			_this.regValidate();
		}
	},'#reg_name, #reg_email, #reg_password, #reg_username');
	$("#authpanel").on('click', '#b_login_splash', function(){
		_this.login();
	});
	$("#authpanel").on('click', '#b_register_splash', function(){
		$("#register").show();
		$("#login").hide();
	});
	$("#authpanel").on('click', '#b_register', function(){
		_this.register();
	});
	$("#authpanel").on('click', '#b_login', function(){
		$("#login").show();
		$("#register").hide();
	});
	$("#nav").on('click', '.mybirthdays-link', function(){
		$(this).parent().find(".selected").removeClass("selected").end().end().addClass("selected");
	});
	$("footer").on('click', '.backtotop-link', function(){
		$.scrollTo(0, 1000);
	});
	$("article > header").on('click', '#logoaction', function(){
		var name = $.trim($("article > header #search").val());
		if (name.length == 0) name = "New Quote";
		else $("article > header #search").val('');
		var birthday = {"name": name, "month": month};
		$.post(_this.ajaxurl, {quote: quote, timestamp: getTimestampPHP()}, function(response){
			if (!empty(response)) {
				_this.birthdays.unshift(response);
				birthdays.prepend(_this.addBirthday(response.id, response.quote.name, response.quote.quote)).find("li:first").fadeIn().find("header").click();
			} else _this.alert("Error: Couldn't create a new quote.");
		});
	});
}
};

$(document.documentElement).keydown(aC.onKeyDown.bind(aC));
$(document).ready(aC.init.bind(aC));

return true;
}
})(this, this.document, this.jQuery);
