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
ajaxURL: "ajax.php",
loaded: false,
logged: false,
loginFocus: false,
registerFocus: false,
user: {},
timezones: [],
birthdays: [],
init: function(){
	if (this.loaded !== false) return;
	var _this = this;
	$.getJSON(this.ajaxURL, {action: "logged"}, function(response){
		_this.loaded = true;
		if (response.logged === true) {
			_this.logged = true;
			_this.loggedIn();
		} else {
			_this.loggedOut();
		}
		_this.loadTimezones();
	});
	this.dom();
},
loggedIn: function(){
	if (this.logged !== true) return;
	var _this = this;
	$.getJSON(this.ajaxURL, {action: "userdata"}, function(response){
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
loadTimezones: function(){
	var _this = this;
	$.getJSON(this.ajaxURL, {action: "timezones"}, function(response){
		var select;
		_this.timezones = response.timezones;
		if (_this.logged === false) {
			select = document.getElementById("reg_timezone");
			_this.timezones.forEach(function(timezone){
				select.add(new Option(timezone.timezone_location, timezone.id));
			});
		}
	});
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
		$.post(this.ajaxURL, {action: "login", form: output}, function(response){
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
	$.post(this.ajaxURL, {action: "logout"}, function(response){
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

	if (isEmpty(timezone_trim)) {
		$timezone.addClass('error');
		e = true;
	} else $timezone.removeClass('error');
	
	return !e;
},
register: function(){
	if (!this.regValidate()) return;
	var _this = this, output = {}, $f_register = $("#f_register"), inputs = $f_register.find("input, select").filter("[name]");
	$f_register.find("input").attr('disabled', true);
	$.map(inputs, function(n, i){
		output[n.name] = $.trim($(n).val());
	});
	$.post(this.ajaxURL, {action: "register", form: output}, function(response){
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
		$.getJSON(this.ajaxURL, {action: "checkemail", email: email}, function(response){
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
		var currentDate = new Date(),
			month = currentDate.getMonth() + 1,
			day = currentDate.getDate(),
			year = currentDate.getFullYear();
		$.post(_this.ajaxURL, {action: "createbirthday", name: "New Birthday", month: month, day: day, year: year}, function(response){
			if (!empty(response)) {
				//_this.birthdays.unshift(response);
				//birthdays.prepend(_this.addBirthday(response.id, response.name, response.month, response.day, response.year));
			} else _this.alert("Error: Couldn't create a new birthday.");
		});
	});
}
};

$(document.documentElement).keydown(aC.onKeyDown.bind(aC));
$(document).ready(aC.init.bind(aC));

return true;
}
})(this, this.document, this.jQuery);
