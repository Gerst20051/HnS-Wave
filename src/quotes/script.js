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
title: "HnS Quotes",
ajaxurl: "ajax.php",
loaded: false,
logged: false,
loginFocus: false,
registerFocus: false,
user: {},
quotes: [],
search: [],
searchQuery: "",
sresultLength: 0,
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
},
loggedIn: function(){
	if (this.logged !== true) return;
	var self = this;
	$.getJSON(this.ajaxurl, {action:"userdata"}, function(response){
		if (response.user !== false) {
			self.user = response.user;
			self.user.fullname = self.user.firstname+' '+self.user.lastname;
			$("#authpanel").parent().css('visibility','hidden');
			$("#logout-button").show();
			$("#login-button").hide();
			$("body").addClass("in").removeClass("out");
			$("#nav").slideDown();
			if (!Hash.has('p')) Hash.set('p','home');
			self.handleHash();
		} else self.logout();
	});
},
loggedOut: function(){
	if (this.logged !== false) return;
	$("#login-button").show();
	$("#logout-button").hide();
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
register: function(){
	if (!this.regValidate()) return;
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
onKeyDown: function(e){
	var keyCode = e.which;
	if (this.logged === false) {
		if (keyCode == keys.ENTER) {
			e.preventDefault();
			if (this.loginFocus) this.login();
			else if (this.registerFocus) this.register();
		} else if (keyCode == keys.ESCAPE) {
			$("#authpanel").parent().css('visibility','hidden');
		}
	}
},
doSearch: function(){
	var self = this, val = $.trim($("#search").val().replace(/[^a-zA-Z 0-9,.]+/g,'').replace('   ',' ').replace('  ',' '));
	Hash.set('q',val);
	if (2 < val.length && val != this.searchQuery) {
		this.searchQuery = val;
		var type = Hash.get('p'), p = "";
		if (Hash.has('p')) {
			if (type == "user" || type == "global") {
				p = Hash.get('p');
			} else {
				Hash.set('p','global');
			}
		} else {
			p = "global";
		}
		$.getJSON(this.ajaxurl, {action:"search",type:p,query:this.searchQuery}, function(response){
			if ($.isArray(response)) {
				self.quotes = response;
				var quotes = "";
				p = Hash.get('p');
				if (p == "" || p == "global" || p == "user") {
					$.each(response, function(i,v){
						var quote = v.quote;
						quotes += self.listQuote(v.id,quote.name,quote.quote,v.owner_name);
					});
				} else if (p == "home") {
					$.each(response, function(i,v){
						var quote = v.quote;
						quotes += self.addQuote(v.id,quote.name,quote.quote);
					});
				}
				$("#quotes").html(quotes);
			} else {
				$("#quotes").html('<li class="empty">No Quotes</li>');
			}
		});
	} else if (0 == val.length) {
		this.searchQuery = "";
		this.sresultLength = 0;
		$("#sresultcount").empty();
		this.handleHash();
	}
},
handleHash: function(){
	var self = this, p = Hash.get('p'), q = Hash.get('q'), qid = Hash.get('qid');
	if (Hash.has('q') && 2 < q.length) {
		$("#search").val(Hash.get('q'));
		this.doSearch();
		return false;
	}
	if (p == "" || p == "global") {
		$.getJSON(this.ajaxurl, {type:"global"}, function(response){
			if ($.isArray(response)) {
				self.quotes = response;
				var quotes = "";
				$.each(response, function(i,v){
					var quote = v.quote;
					quotes += self.listQuote(v.id,quote.name,quote.quote,v.owner_name);
				});
				$("#quotes").html(quotes);
			} else {
				$("#quotes").html('<li class="empty">No Quotes</li>');
			}
		});
	} else if (p == "user") {
		if (Hash.has('id')) {
			$.getJSON(this.ajaxurl, {type:"user",id:Hash.get('id')}, function(response){
				if ($.isArray(response)) {
					self.quotes = response;
					var quotes = "";
					$.each(response, function(i,v){
						var quote = v.quote;
						quotes += self.listQuote(v.id,quote.name,quote.quote);
					});
					$("#quotes").html(quotes);
				} else {
					$("#quotes").html('<li class="empty">No Quotes</li>');
				}
			});
		} else {
			$.getJSON(this.ajaxurl, {type:"user"}, function(response){
				if ($.isArray(response)) {
					self.quotes = response;
					var quotes = "";
					$.each(response, function(i,v){
						var quote = v.quote;
						quotes += self.listQuote(v.id,quote.name,quote.quote);
					});
					$("#quotes").html(quotes);
				} else {
					$("#quotes").html('<li class="empty">No Quotes</li>');
				}
			});
		}
	} else if (p == "home") {
		$.getJSON(this.ajaxurl, {type:"user"}, function(response){
			if ($.isArray(response)) {
				self.quotes = response;
				var quotes = "";
				$.each(response, function(i,v){
					var quote = v.quote;
					quotes += self.addQuote(v.id,quote.name,quote.quote);
				});
				$("#quotes").html(quotes);
			} else {
				$("#quotes").html('<li class="empty">No Quotes</li>');
			}
		});
	} else if (Hash.has('qid')) {
			$.getJSON(this.ajaxurl, {type:"quote",qid:qid}, function(response){
			if ($.isArray(response)) {
				self.quotes = response;
				var quotes = response[0];
				var quote = quotes.quote;
				quotes = self.listQuote(quotes.id,quote.name,quote.quote,quotes.owner_name);
				$("#quotes").html(quotes);
			} else {
				$("#quotes").html('<li class="empty">Invalid Quote ID</li>');
			}
			});
		}  {
		$("#quotes").html('<li class="empty">No Quotes</li>');
	}
},
dom: function(){
	var self = this, quotes = $("#quotes");
	$("#login-button").on('click',function(){
		$("#authpanel").center().parent().hide().css('visibility','visible').fadeIn('slow');
	});
	$("#logout-button").on('click',function(){
		self.logout();
	});
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
	});
	$("#authpanel").on('click','#b_register',function(){
		self.register();
	});
	$("#authpanel").on('click','#b_login',function(){
		$("#login").show();
		$("#register").hide();
	});
	$("#nav").on('click','.home-link',function(){
		$(this).parent().find(".selected").removeClass("selected").end().end().addClass("selected");
		Hash.clear();
		Hash.set('p','home');
		self.handleHash();
	});
	$("#nav").on('click','.myquotes-link',function(){
		$(this).parent().find(".selected").removeClass("selected").end().end().addClass("selected");
		Hash.clear();
		Hash.set('p','user');
		Hash.set('id',self.user.uid);
		self.handleHash();
	});
	$("#nav").on('click','.globalfeed-link',function(){
		$(this).parent().find(".selected").removeClass("selected").end().end().addClass("selected");
		Hash.clear();
		Hash.set('p','global');
		self.handleHash();
	});
	$("#nav").on('click','.logout-link',function(){
		self.logout();
	});
	$("#nav").on('click','.login-link',function(){
		$("#authpanel").center().parent().hide().css('visibility','visible').fadeIn('slow');
	});
	$("footer").on('click','.backtotop-link',function(){
		$.scrollTo(0, 1000);
	});
	$("article > header").on('keyup','#search',function(){
		self.doSearch();
	});
	$("article > header").on('click','#logoaction',function(){
		var name = $.trim($("article > header #search").val());
		if (name.length == 0) name = "New Quote";
		else $("article > header #search").val('');
		var quote = {"name":name,"quote":"The quote goes here."};
		$.post(self.ajaxurl, {quote:quote,timestamp:getTime(),type:3}, function(response){
			if (!empty(response)) {
				self.quotes.unshift(response);
				quotes.prepend(self.addQuote(response.id,response.quote.name,response.quote.quote)).find("li:first").fadeIn().find("header").click();
			} else alert("Error: Couldn't create a new quote.");
		});
	});
	quotes.on('click','li > header',function(){
		$(this).parent().find('.details').slideToggle('fast');
		if ($(this).find('.more').is(":visible")){
			$(this).find('.more').hide().parent().find('.less').show();
		} else {
			$(this).find('.less').hide().parent().find('.more').show();
		}
	});
	quotes.on('click','.details',function(){
		return false;
	});
	quotes.on('click','.save',function(){
		var target = $(this).parents('li');
		var index = target.index();
		var item = self.quotes[index];
		var quote = item.quote;
		var newname = target.find('#name').val();
		var newquote = target.find('#quote').val();
		item.quote = {"name":newname,"quote":newquote};
		$.post(self.ajaxurl, {pid:item.id,quote:item.quote,timestamp:getTime(),type:1}, function(response){
			if (stringToBoolean(response)) {
				target.find('.savespan').hide();
			} else alert("Error: Couldn't save this quote.");
		});
		return false;
	});
	quotes.on('click','.undo',function(){
		var target = $(this).parents('li');
		var item = self.quotes[target.index()];
		var quote = item.quote;
		target.find('.name').html(quote.name);
		target.find('#name').val(quote.name);
		target.find('#quote').val(quote.quote);
		target.find('.savespan').hide();
		return false;
	});
	quotes.on('click','.delete',function(){
		console.log(quotes.children());
		var target = $(this).parents('li');
		var index = target.index();
		var item = self.quotes[index];
		var quote = item.quote;
		if (confirm("Are you sure you want to delete "+html_decode_entities(quote.name)+"?")) {
			$.post(self.ajaxurl, {pid:item.id,type:2}, function(response){
				if (stringToBoolean(response)) {
					$("#quotes li:eq("+index+")").remove();
					self.quotes.splice(index-1,1);
					if (self.quotes.length == 0) $("#quotes").html('<li class="empty">No Quotes</li>');
				} else alert("Error: Couldn't delete this quote.")
			});
		}
		return false;
	});
	quotes.on('click','.quotename',function(){
		var target = $(this).parents('li');
		var index = target.index();
		var item = self.quotes[index];
		Hash.clear();
		Hash.set('p','quote');
		Hash.set('qid',item.id);
		self.handleHash();
		return false;
	});
	quotes.on('click','.quoteowner',function(){
		var target = $(this).parents('li');
		var index = target.index();
		var item = self.quotes[index];
		Hash.clear();
		Hash.set('p','user');
		Hash.set('id',item.owner_id);
		self.handleHash();
		return false;
	});
	quotes.on('change','li input',function(){
		$(this).parents('li').find('.savespan').show();
	}).on('click','input',function(){
		if (this.selected === true) return;
		else this.selected = true;
		$(this).select();
	});
	quotes.on('change','textarea',function(){
		$(this).parents('li').find('.savespan').show();
	}).on('click','textarea',function(){
		if (this.selected === true) return;
		else this.selected = true;
		$(this).select();
	});
	quotes.on('keyup','input#name',function(){
		var name = $(this).val();
		if (name == "") name = "No Name";
		$(this).parents('li').find('.name').html(name);
	});
},
addQuote: function(id,name,quote){
	if (this.quotes.length < 2) $("#quotes").find('.empty').remove();
	var html = '<li id="quote-'+id+'">';
	if (arguments.length == 2){ html = '<li id="quote-'+id+'" class="new">'; if ($.trim(name) == "") name="New Quote"; quote=""; }
	html += '<header><aside class="links"><span class="savespan"><a href="#" class="save">save</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="#" class="undo">undo</a>&nbsp;&nbsp;|&nbsp;&nbsp;</span><a href="#" class="more">more</a><a href="#" class="less">less</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="#" class="delete">delete</a></aside><aside class="name">'+name+'</aside></header>';
	html += '<div class="details">';
	html += '<div><label for="name">name</label><input id="name" type="text" value="'+name+'"/></div>';
	html += '<div><label for="quote">quote</label><textarea id="quote">'+quote+'</textarea></div>';
	html += '</div></li>';
	return html;
},
listQuote: function(id,name,quote,owner_name){
	if (this.quotes.length < 2) $("#quotes").find('.empty').remove();
	var html = '<li id="quote-'+id+'"><div class="quotelist">';
	if (owner_name) {
		html += '<div class="quotename"><h2>'+name+'</h2><div class="quoteuser"><div class="quoteowner">'+owner_name+'</div><img class="blankprofile" src="blank_profile.gif"/></div></div>';
	} else {
		html += '<div class="quotename"><h2>'+name+'</h2></div>';
	}
	html += '<div class="quotequote">"'+quote+'"</div>';
	html += '</div></li>';
	return html;
}
};

$(document.documentElement).keydown(bind(aC,aC.onKeyDown));
$(document).ready(bind(aC,aC.init));

return true;
}
})(this, this.document, this.jQuery);