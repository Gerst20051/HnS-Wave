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
title: "WebSnapChat",
ajaxurl: "ajax.php",
loaded: false,
logged: false,
loginFocus: false,
registerFocus: false,
showingSnap: false,
user: {},
home: [],
profile: {},
members: [],
feed: [],
dateIntervalId: 0,
snapIntervalId: 0,
snapTimeoutId: 0,
screenCast: false,
init: function(){
	if (this.loaded !== false) return;
	var self = this;
	Hash.parse();
	$.getJSON(this.ajaxurl, {action:"logged"}, function(response){
		self.loaded = true;
		if (response.logged === true) {
			self.logged = true;
			self.loggedIn();
		} else self.loggedOut();
	});
	this.dom();
	self.dateIntervalId = window.setInterval(handleDates, 60000);
},
loggedIn: function(){
	if (this.logged !== true) return;
	var self = this;
	$.getJSON(this.ajaxurl, {action:"userdata"}, function(response){
		if (response.user !== false) {
			self.user = response.user;
			self.user.fullname = self.user.firstname+' '+self.user.lastname;
			$("#authpanel").parent().css('visibility','hidden');
			$("body").addClass("in").removeClass("out");
			$("#nav").slideDown();
			if (!Hash.has('p')) Hash.set('p','home');
			self.handleHash();
		} else self.logout();
	});
},
loggedOut: function(){
	if (this.logged !== false) return;
	$("body").addClass("out").removeClass("in");
	$("#nav").slideDown();
	this.handleHash();
},
login: function(){
	var self = this, e = false, $login = $("#f_login"), $email = $login.find("#lemail"), $password = $login.find("#lpassword");
	if (!$.trim($email.val()).length) { $email.addClass('error'); e = true; } else $email.removeClass('error');
	if (!$.trim($password.val()).length) { $password.addClass('error'); e = true; } else $password.removeClass('error');
	if (!e) {
		$login.find("input").attr('disabled',true);
		var output = {}, inputs = $login.find("input").filter("[name]");
		$.map(inputs, function(n, i){
			output[n.name] = $.trim($(n).val());
		});
		$.post(this.ajaxurl, {action:"login",form:output}, function(response){
			$login.find("input").attr('disabled',false);
			if (stringToBoolean(response.logged)) {
				$login.find(".error").removeClass('error');
				$("#f_register").clearForm();
				$login.clearForm();
				self.logged = true;
				self.loggedIn();
			} else {
				$login.find("#b_login_splash").addClass('error');
				$password.val('');
			}
		});
	}
},
logout: function(){
	var self = this;
	$.post(this.ajaxurl, {action:"logout"}, function(response){
		if (!stringToBoolean(response.logged)) {
			self.logged = false;
			self.user = {};
			Hash.clear();
			$("#content").children().hide().empty();
			self.loggedOut();
		}
	});
},
regValidate: function(){
	var e = false,
	$reg = $("#f_register"),
	$name = $reg.find("#reg_name"), name_trim = $.trim($name.val()),
	$email = $reg.find("#reg_email"), email_trim = $.trim($email.val()),
	$password = $reg.find("#reg_password"), password_trim = $.trim($password.val()),
	$username = $reg.find("#reg_username"), username_trim = $.trim($username.val()),
	nameReg = /[A-Za-z'-]/,
	emailReg = /^[^0-9][a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[@][a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,4}?$/i,
	usernameReg = /[A-Za-z0-9-_]/;

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

	if (!username_trim.length || !usernameReg.test(username_trim)) {
		$username.addClass('error');
		e = true;
	} else $username.removeClass('error');
	
	return !e;
},
registerPhoto: function(){
	var e = false;
	
	if (!this.regValidate()) e = true;
	if ($("input#reg_image").val().length < 30) e = true;

	return !e;
},
register: function(){
	if (!this.regValidate()) return;
	if (!this.registerPhoto()) return;
	var self = this, output = {}, $f_register = $("#f_register"), inputs = $f_register.find("input").filter("[name]");
	$f_register.find("input").attr('disabled',true);
	$.map(inputs, function(n, i){
		output[n.name] = $.trim($(n).val());
	});
	$.post(this.ajaxurl, {action:"register",form:output}, function(response){
		$f_register.find("input").attr('disabled',false);
		if (stringToBoolean(response.registered)) {
			$f_register.find(".error").removeClass('error');
			$f_register.clearForm();
			self.logged = true;
			self.registered();
		} else {
			$f_register.find("#b_register").addClass('error');
		}
	});
},
registered: function(){
	this.stopImage();
	this.loggedIn();
},
isEmailRegistered: function(email){
	email = $.trim(email);
	if (email.length) {
		$.get(this.ajaxurl, {action:"checkemail",email:email}, function(response){
			if (stringToBoolean(response.email)) return true;
			else return false;
		});
	}
},
startRegImage: function(){
	this.screenCast = new ScreenCast(document.querySelector('#reg_imagevideo'));
	this.screenCast.start();
},
startSnapImage: function(){
	this.screenCast = new ScreenCast(document.querySelector('#snapimagevideo'));
	this.screenCast.start();
},
stopImage: function(){
	this.screenCast.stop();
},
centerAuthPanel: function(){
	$("#authpanel").center();
},
resizeCanvasRegImage: function(source, callback){
	var c = document.getElementById('reg_canvasimg');
	c.width = 64;
	c.height = 64;
	var ctx = c.getContext('2d');
	var image = document.getElementById('reg_canvasspare');
	image.src = source.toDataURL();
	image.onload = function(){
		ctx.drawImage(image,0,0,c.width,c.height);
		$("input#reg_image").val(c.toDataURL().split(',')[1]);
		callback();
	};
},
resizeCanvasSnapImage: function(source, callback){
	var c = document.getElementById('snapcanvasimg');
	c.width = 400;
	c.height = 320;
	var ctx = c.getContext('2d');
	var image = document.getElementById('snapcanvasspare');
	image.src = source.toDataURL();
	image.onload = function(){
		ctx.drawImage(image,0,0,c.width,c.height);
		$("input#snapimage").val(c.toDataURL().split(',')[1]);
		callback();
	};
},
createSnapImage: function(){
	var self = this, output = {}, $f_createsnap = $("#f_createsnap"), inputs = $f_createsnap.find("input").filter("[name]");
	$.map(inputs, function(n, i){
		if (n.type == "checkbox") {
			output[n.name] = $.trim($(n).is(":checked"));
		} else {
			output[n.name] = $.trim($(n).val());
		}
	});
	var selectedfriends = $("#selectfriendslist li.selected");
	var selectedfriendsarray = [];
	$.each(selectedfriends, function(i,v){
		selectedfriendsarray.push(self.user.friends[$(v).index()]);
	});
	output.friends = selectedfriendsarray;
	$.post(self.ajaxurl, {action:"createsnap",form:output}, function(response){
		$("#nav .home-link").click();
	});
},
showSnapImage: function(index){
	var self = this;
	this.showingSnap = true;
	$.getJSON(this.ajaxurl, {action:"snapimage",id:this.home[index].id}, function(response){
		if (!empty(response)) {
			$("#viewsnapimage").attr('src','data:image/png;base64,'+response.data);
			$("#viewsnap").center().parent().hide().css('visibility','visible').fadeIn('slow');
			$("#snapcountdown").text(self.home[index].timelimit);
			$("#home_panel #messages_content li").eq(index).find(".snapinfo").empty();
		}
	});
	this.snapTimeoutId = window.setTimeout(bind(this, this.hideSnapImage), this.home[index].timelimit * 1E3);
	this.snapIntervalId = window.setInterval(function(){
		if (self.home[index].timelimit) $("#snapcountdown").text(--self.home[index].timelimit);
		else $("#snapcountdown").empty();
	}, 1E3);
},
hideSnapImage: function(){
	var self = this;
	$("#viewsnapimage").attr('src','blank.gif');
	window.setTimeout(function(){
		$("#viewsnap").parent().fadeOut(2000, function(){
			$(this).css('visibility','hidden');
		});
		$("#viewsnapimage").css('visibility','hidden');
	}, 2 * 1E3);
	window.setTimeout(function(){
		window.clearInterval(self.snapIntervalId);
	}, 1E3);
},
showPanel: function(panel){
	$("#content").children().hide().end().find("#"+panel+"_panel").empty().show();
},
onKeyDown: function(e){
	var keyCode = e.which;
	if (this.logged === false) {
		if (keyCode == keys.ENTER) {
			e.preventDefault();
			if (this.loginFocus) this.login();
			else if (this.registerFocus) $("#b_register").click();
		} else if (keyCode == keys.ESCAPE) {
			$("#authpanel").parent().css('visibility','hidden');
		}
	} else {
		if (keyCode == keys.ESCAPE) {
			if (this.showingSnap) {
				$("#viewsnap").parent().css('visibility','hidden');
				this.showingSnap = false;
				this.hideSnapImage();
			}
		}
	}
},
handleHash: function(){
	var self = this, p = Hash.get('p');
	if (p == "home") {
		self.showPanel("home");
		$.getJSON(this.ajaxurl, {action:"home"}, function(messages){
			if ($.isArray(messages) && messages.length) {
				self.home = messages;
				var messages_content = '', snapinfo = '', viewsnap_content = '';
				if ($.isArray(messages) && messages.length) {
					$.each(messages, function(i,v){
						messages_content += '<li>';
						if (v.sid == self.user.uid) {
							messages_content += '<img class="homearrow" src="rightarrow.png"/>';
						} else if (v.rid == self.user.uid) {
							messages_content += '<img class="homearrow" src="leftarrow.png"/>';
						}
						messages_content += '<img class="member" src="data:image/png;base64,'+v.image+'"/>';
						if (v.sid == self.user.uid) {
							if (v.opened == 0) {
								snapinfo = ' - Sent';
							} else {
								snapinfo = ' - Opened';
							}
						} else if (v.rid == self.user.uid) {
							if (v.opened == 0) {
								snapinfo = ' - Click here to view';
							}
						}
						messages_content += '<div class="member_content"><div class="member_name">'+v.name+'</div><div class="infoline"><span class="prettydate" data-date="'+v.timestamp+'000" title="'+formatDate(parseInt(v.timestamp+'000',10))+'"></span><span class="snapinfo">'+snapinfo+'</span>';
						messages_content += '</div></div></li>';
					});
				} else {
					messages_content = '<li class="empty">You don\'t have any messages. Send some snaps!</li>';
				}
				viewsnap_content = '<div class="newlightbox"><div id="viewsnap" class="newmodal"><img id="viewsnapimage" class="cf" src="blank.gif"/><div id="viewsnapbutton" class="shiny-button3">Hold to View<span></span></div><span id="snapcountdown"></span></div></div>';
				$("#home_panel").html('<ul id="messages_content">'+messages_content+'</ul>'+viewsnap_content);
				handleDates();
			}
		});
	} else if (p == "profile") {
		self.showPanel("profile");
		var id = Hash.get('id');
		$.getJSON(this.ajaxurl, {action:"profile",id:id}, function(response){
			if (!empty(response)) {
				self.profile = response;
				var friend_button = '<div id="addfriend" class="shiny-button3">Add Friend!<span></span></div>';
				if (response.user.uid === self.user.uid) {
					friend_button = '';
				} else if (-1 < $.inArray(response.user.uid, self.user.friends)) {
					friend_button = '<div id="addfriend" class="shiny-button1">Remove Friend<span></span></div>';
				}
				if (!self.logged) friend_button = '';
				var header = '<div id="profileheader"><img src="data:image/png;base64,'+response.user.image+'"/><div id="profilename">'+response.user.fullname+'</div>'+friend_button+'</div>';
				var friendslist = '';
				$.getJSON(self.ajaxurl, {action:"friends",friends:response.user.friends}, function(friends){
					if ($.isArray(friends)) {
						$.each(friends, function(i,v){
							friendslist += '<li><img src="data:image/png;base64,'+v.image+'"/><div class="friendname">'+v.fullname+'</div></li>';
						});
					} else {
						friendslist = '<li class="empty">No Friends</li>';
					}
					var friends = '<div id="profilefriends"><header>'+response.user.firstname+'\'s Friends</header><ul id="friends_content">'+friendslist+'</ul></div>';
					var snaps_content = '';
					if ($.isArray(response.snaps) && response.snaps.length) {
						$.each(response.snaps, function(i,v){
							snaps_content += '<li><img src="data:image/png;base64,'+v.data+'"/></li>';
						});
					} else {
						snaps_content = '<li class="empty">No Snaps</li>';
					}
					var snaps = '<div id="profilesnaps"><header>'+response.user.firstname+'\'s Snaps</header><ul id="snaps_content">'+snaps_content+'</ul></div>';
					$("#profile_panel").html(header+friends+snaps);
				});
			}
		});
	} else if (p == "members") {
		self.showPanel("members");
		$.getJSON(this.ajaxurl, {action:"members"}, function(response){
			if ($.isArray(response)) {
				self.members = response;
				var header = '<div id="membersheader"></div>';
				var memberslist = '';
				$.each(response, function(i,v){
					memberslist += '<li><img src="data:image/png;base64,'+v.image+'"/><div class="membername">'+v.fullname+'</div></li>';
				});
				var members = '<div id="members"><ul id="memberslist">'+memberslist+'</ul></div>';
				$("#members_panel").html(header+members);
			}
		});
	} else if (p == "feed") {
		self.showPanel("feed");
		$.getJSON(self.ajaxurl, {action:"feed"}, function(snaps){
			var snaps_content = '';
			if ($.isArray(snaps) && snaps.length) {
				self.feed = snaps;
				$.each(snaps, function(i,v){
					snaps_content += '<li><img src="data:image/png;base64,'+v.data+'"/></li>';
				});
			} else {
				snaps_content = '<li class="empty">No Snaps</li>';
			}
			$("#feed_panel").html('<ul id="snaps_content">'+snaps_content+'</ul>');
		});
	} else if (p == "createsnap") {
		$("#content").children().hide().end().find("#createsnap_panel").show();
		self.startSnapImage();
		if ($.isArray(self.user.friends)) {
			var friendslist = '';
			$.getJSON(self.ajaxurl, {action:"friends",friends:self.user.friends}, function(friends){
				if ($.isArray(friends)) {
					$.each(friends, function(i,v){
						friendslist += '<li><img src="data:image/png;base64,'+v.image+'"/><div class="friendname">'+v.fullname+'</div></li>';
					});
				} else {
					friendslist = '<li class="empty">No Friends</li>';
				}
				$("#selectfriendslist").html(friendslist);
			});
		}
	}
},
dom: function(){
	var self = this;
	$("#authpanel").on({
		focus: function(){
			self.loginFocus = true;
		},
		blur: function(){
			self.loginFocus = false;
		}
	},'#lemail, #lpassword');
	$("#authpanel").on({
		focus: function(){
			self.registerFocus = true;
		},
		blur: function(){
			self.registerFocus = false;
			self.regValidate();
		}
	},'#reg_name, #reg_email, #reg_password, #reg_username');
	$("#authpanel").on('click','#b_login_splash',function(){
		self.login();
	});
	$("#authpanel").on('click','#b_register_splash',function(){
		$("#register").show();
		$("#login").hide();
		self.centerAuthPanel();
	});
	$("#authpanel").on('click','#b_register',function(){
		if (!self.regValidate()) return;
		$("#registerimage").show();
		$("#registerform").hide();
		self.centerAuthPanel();
		self.startRegImage();
	});
	$("#authpanel").on('click','#b_regback',function(){
		$("#registerform").show();
		$("#registerimage").hide();
		self.centerAuthPanel();
		self.stopImage();
	});
	$("#authpanel").on('click','#b_takepicture',function(){
		var c = $("#reg_imagecanvas"), v = $("#reg_imagevideo");
		c[0].getContext('2d').drawImage(v[0],0,0,c[0].width,c[0].height);
		c.show();
		v.hide();
	});
	$("#authpanel").on('click','#b_retakepicture',function(){
		$("#reg_imagevideo").show();
		$("#reg_imagecanvas").hide();
	});
	$("#authpanel").on('click','#b_finalpicture',function(){
		self.resizeCanvasRegImage($("#reg_imagecanvas")[0], bind(self, self.register));
	});
	$("#authpanel").on('click','#b_login',function(){
		$("#login").show();
		$("#register").hide();
		self.centerAuthPanel();
	});
	$("#nav").on('click','.home-link',function(){
		$(this).parent().find(".selected").removeClass("selected").end().end().addClass("selected");
		Hash.clear();
		Hash.set('p','home');
		self.handleHash();
	});
	$("#nav").on('click','.profile-link',function(){
		$(this).parent().find(".selected").removeClass("selected").end().end().addClass("selected");
		Hash.clear();
		Hash.set('p','profile');
		Hash.set('id',self.user.uid);
		self.handleHash();
	});
	$("#nav").on('click','.members-link',function(){
		$(this).parent().find(".selected").removeClass("selected").end().end().addClass("selected");
		Hash.clear();
		Hash.set('p','members');
		self.handleHash();
	});
	$("#nav").on('click','.feed-link',function(){
		$(this).parent().find(".selected").removeClass("selected").end().end().addClass("selected");
		Hash.clear();
		Hash.set('p','feed');
		self.handleHash();
	});
	$("#nav").on('click','.logout-link',function(){
		self.logout();
	});
	$("#nav").on('click','.login-link',function(){
		$("#authpanel").center().parent().hide().css('visibility','visible').fadeIn('slow');
	});
	$("#heading").on('click','#logoaction',function(){
		$("#nav").find(".selected").removeClass("selected");
		Hash.clear();
		Hash.set('p','createsnap');
		self.handleHash();
	});
	$("#home_panel").on('click', '#messages_content li',function(e){
		if (e.target.className == "member") {
			e.preventDefault();
			return;
		}
		var index = $(this).index();
		if (self.home[index].opened === 0 && self.home[index].timelimit) self.showSnapImage(index);
	});
	$("#home_panel").on('click', '#messages_content li .member',function(){
		var index = $(this).index();
		Hash.clear();
		Hash.set('p','profile');
		Hash.set('id',self.home[index].tid);
		self.handleHash();
	});
	$("#home_panel").on({
		mousedown: function(){
			$("#viewsnapimage").css('visibility','visible');
		},
		mouseup: function(){
			$("#viewsnapimage").css('visibility','hidden');
		},
		mouseout: function(){
			$("#viewsnapimage").css('visibility','hidden');
		},
		blur: function(){
			$("#viewsnapimage").css('visibility','hidden');
		}
	}, '#viewsnapbutton');
	$("#profile_panel").on('click','#addfriend',function(){
		$.post(self.ajaxurl, {action:"addfriend",id:self.profile.user.uid}, function(response){
			if (!empty(response)) {
				if (response.action == 'added') {
					$("#addfriend").replaceWith('<div id="addfriend" class="shiny-button1">Remove Friend<span></span></div>');
					self.user.friends.push(self.profile.user.uid);
				} else if (response.action == 'removed') {
					$("#addfriend").replaceWith('<div id="addfriend" class="shiny-button3">Add Friend!<span></span></div>');
					self.user.friends.removeValues(self.profile.user.uid);
				}
			}
		});
	});
	$("#profile_panel").on('click','#friends_content li',function(){
		if ($(this).hasClass('empty')) return;
		var index = $(this).index();
		Hash.clear();
		Hash.set('p','profile');
		Hash.set('id',self.profile.user.friends[index]);
		self.handleHash();
	});
	$("#members_panel").on('click','#memberslist li',function(){
		var index = $(this).index();
		Hash.clear();
		Hash.set('p','profile');
		Hash.set('id',self.members[index].uid);
		self.handleHash();
	});
	$("#feed_panel").on('click','#snaps_content li',function(){
		var index = $(this).index();
		Hash.clear();
		Hash.set('p','profile');
		Hash.set('id',self.feed[index].oid);
		self.handleHash();
	});
	$("#createsnap_panel").on('click','#b_takesnappicture',function(){
		var c = $("#snapimagecanvas"), v = $("#snapimagevideo");
		c[0].getContext('2d').drawImage(v[0],0,0,c[0].width,c[0].height);
		c.show();
		v.hide();
	});
	$("#createsnap_panel").on('click','#b_retakesnappicture',function(){
		$("#snapimagevideo").show();
		$("#snapimagecanvas").hide();
	});
	$("#createsnap_panel").on('click','#b_selectfriends',function(){
		$("#selectfriends_container").show();
	});
	$("#createsnap_panel").on('click','#selectfriendslist li',function(){
		$(this).toggleClass('selected');
	});
	$("#createsnap_panel").on('click','#b_finalsnappicture',function(){
		self.resizeCanvasSnapImage($("#snapimagecanvas")[0], bind(self, self.createSnapImage));
		$("#selectfriends_container").hide();
	});
}
};

$(document.documentElement).keydown(bind(aC,aC.onKeyDown));
$(document).ready(bind(aC,aC.init));

return true;
}
})(this, this.document, this.jQuery);
