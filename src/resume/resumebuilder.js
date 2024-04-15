/*
 *********************************************
 *** BBCodeParser created by Andrew Gerst ****
 *********************************************
 */

function bbcode(str){
	var search, replace, i;

	search = [
		/\[b\](.*?)\[\/b\]/ig,
		/\[i\](.*?)\[\/i\]/ig,
		/\[u\](.*?)\[\/u\]/ig,
		/\[img\](.*?)\[\/img\]/ig,
		/\[url\](.*?)\[\/url\]/ig
	];

	replace = [
		'<strong>$1</strong>',
		'<em>$1</em>',
		'<u>$1</u>',
		'<img src="$1"/>',
		'<a href="$1" target="_blank">$1</a>'
	];

	for (i = 0; i < search.length; i++) {
		str = str.replace(search[i], function(match, p1, offset, string){
			return replace[i].replace(/\$1/ig, p1);
		});
	}

	search = [
		/\[url\=(.*?)\](.*?)\[\/url\]/ig
	];

	replace = [
		'<a href="$1" target="_blank">$2</a>'
	];

	for (i = 0; i < search.length; i++) {
		str = str.replace(search[i], function(match, p1, p2, offset, string){
			return replace[i].replace(/\$1/ig, p1).replace(/\$2/ig, p2);
		});
	}

	return str;
}

/*
 *********************************************
 *** ResumeBuilder created by Andrew Gerst ***
 *********************************************
 */

var ResumeBuilder = function(){
	this.data = {};
	this.selector = "";
	this.modules = [];
	this.output = [];
	this.moduleAliases = {
		"title": this.addTitleModule,
		"skills": this.addSkillsModule,
		"certifications": this.addCertificationsModule,
		"experience": this.addExperienceModule,
		"education": this.addEducationModule,
		"projects": this.addProjectsModule
	};

	this.config = function(selector){
		this.selector = selector;
		return this;
	};

	this.run = function(){
		this.parseData();
		this.addModules();
		this.printResume();
		this.addClickHandlers();
	};
};

ResumeBuilder.prototype.parseData = function(){
	var data = this.data;

	//TODO: Extract this info directly from this.data using Object.keys?
	if (data.name || data.title || data.address || data.location || data.number || data.email || data.url || data.statement) {
		this.modules.push('title');
	}
	if ((data.skills && (data.skills.length || Object.key(data.skills).length)) || (data.main_skills && data.main_skills.length)) {
		this.modules.push('skills');
	}
	if (data.certifications && data.certifications.length) {
		this.modules.push('certifications');
	}
	if (data.experience && data.experience.length) {
		this.modules.push('experience');
	}
	if (data.education && data.education.length) {
		this.modules.push('education');
	}
	if (data.projects && data.projects.length) {
		this.modules.push('projects');
	}
};

ResumeBuilder.prototype.addModules = function(){
	for (var i = 0; i < this.modules.length; i++) {
		this.moduleAliases[this.modules[i]].call(this);
	}
};

ResumeBuilder.prototype.setData = function(data){
	this.data = data;
	return this;
};

ResumeBuilder.prototype.updateData = function(data){
	if (data) {
		this.modules.length = 0;
		this.output.length = 0;
		if (typeof data == "object") {
			this.data = data;
		} else if (typeof data == "string") {
			this.data = JSON.parse(data);
		}
		this.run();
	}
};

ResumeBuilder.prototype.createModule = function(){

};

ResumeBuilder.prototype.addTitleModule = function(){
	var html = [], data = this.data;
	document.title = ['Resume', data.name, data.title].join(' - ');
	html.push('<div id="titleModule" class="resumemodule clear">');
	html.push('<div id="titlehead" class="clear">');
	html.push('<div id="nametitle">');
	html.push('<div id="name">' + data.name + '</div>');
	html.push('<div id="title">' + data.title + '</div>');
	html.push('</div>');
	html.push('<div id="contact">');
	if (data.address && data.address.length) {
		html.push('<div>' + data.address + '</div>');
	}
	if (data.location && data.location.length) {
		html.push('<div>' + data.location + '</div>');
	}
	if (data.number && data.number.length) {
		html.push('<div>' + data.number + '</div>');
	}
	if (data.email && data.email.length) {
		html.push('<div>' + data.email + '</div>');
	}
	if (data.url && data.url.length) {
		if (typeof data.url === 'string') {
			html.push('<div>' + data.url + '</div>');
		} else {
			data.url.forEach(url => {
				html.push('<div>' + url + '</div>');
			});
		}
	}
	html.push('</div>');
	html.push('</div>');
	if (data.statement && data.statement.length) {
		var isStatementString = typeof data.statement === 'string';
		var statementId = isStatementString ? 'statementString' : 'statementList';
		html.push('<div id="' + statementId + '" class="clear">');
		if (isStatementString) {
			html.push(data.statement);
		} else {
			html.push('<ul>');
			html.push('<li>' + data.statement.join('</li><li>') + '</li>');
			html.push('</ul>');
		}
		html.push('</div>');
	}
	html.push('</div>');
	this.output.push(bbcode(html.join('')));
};

ResumeBuilder.prototype.addSkillsModule = function(){
	var html = [];
	html.push('<div id="skillsModule" class="resumemodule clear">');
	html.push('<div class="leftcol"><div>Skills</div></div>');
	var isSkillsAnArray = this.data.skills && this.data.skills.length;
	var isSkillsAnArrayOfObjects = isSkillsAnArray && typeof this.data.skills === 'object';
	if (isSkillsAnArrayOfObjects) {
		var hasFullSkillsList = !!this.data.skills.find(skill => skill.show === false && skill.full === true);
		this.data.skills.filter(skill => skill.show).forEach(skill => {
			html.push('<div class="rightcol"><b>' + skill.name + ': </b>');
			html.push(skill.list.join(', '));
			html.push('</div>');
		});
		if (hasFullSkillsList) {
			html.push('<div id="fullSkillsList" class="rightcol"><br><a id="showFullSkillsList" href="#">Show Full Skills List</a></div>');
		}
	} else {
		var hasMainSkills = this.data.main_skills && this.data.main_skills.length;
		if (hasMainSkills) {
			html.push('<div class="rightcol"><b>Main: </b>');
			html.push(this.data.main_skills.join(', '));
			html.push('</div>');
		}
		if (isSkillsAnArray) {
			if (hasMainSkills) {
				html.push('<br>');
			}
			html.push('<div class="rightcol"><b>Like: </b>');
			html.push(this.data.skills.join(', '));
			html.push('</div>');
		}
	}
	html.push('</div>');
	this.output.push(bbcode(html.join('')));
};

ResumeBuilder.prototype.addCertificationsModule = function(){
	var html = [];
	html.push('<div id="certificationsModule" class="resumemodule clear">');
	html.push('<div class="leftcol"><div>Certifications</div></div>');
	html.push('<div class="rightcol">' + this.data.certifications.join(', ') + '</div>');
	html.push('</div>');
	this.output.push(bbcode(html.join('')));
};

ResumeBuilder.prototype.addExperienceModule = function(){
	var html = [], experience = this.data.experience, i;
	html.push('<div id="experienceModule" class="resumemodule clear">');
	html.push('<div class="leftcol"><div>Experience</div></div>');
	html.push('<div class="rightcol">');
	for (i = 0; i < experience.length; i++) {
		html.push('<div class="experiencecontainer">');
		html.push('<div>');
		html.push('<b>' + experience[i].title + '</b>');
		if (experience[i].organization) {
			html.push(' – ' + experience[i].organization);
		}
		html.push('<span class="datespan">' + experience[i].startDate + ' - ' + experience[i].endDate + '</span>');
		html.push('</div>');
		if (experience[i].technologies && experience[i].technologies.length) {
			html.push('<div>' + experience[i].technologies.join(', ') + '</div>');
		}
		if (experience[i].highlights) {
			html.push('<div id="highlightscontainer">');
			Object.keys(experience[i].highlights).forEach(highlight => {
				html.push('<div class="highlight">');
				html.push('<b>' + highlight + '</b>');
				html.push('<ul>');
				html.push('<li>' + experience[i].highlights[highlight].join('</li><li>') + '</li>');
				html.push('</ul>');
				html.push('</div>');
			});
			html.push('</div>');
		}
		if (experience[i].responsibilities && experience[i].responsibilities.length) {
			html.push('<div class="responsibilities">');
			if (typeof experience[i].responsibilities === 'string') {
				html.push(experience[i].responsibilities);
			} else {
				html.push('<ul>');
				html.push('<li>' + experience[i].responsibilities.join('</li><li>') + '</li>');
				html.push('</ul>');
			}
			html.push('</div>');
		}
		html.push('</div>');
	}
	html.push('</div>');
	html.push('</div>');
	this.output.push(bbcode(html.join('')));
};

ResumeBuilder.prototype.addEducationModule = function(){
	var html = [], education = this.data.education, i;
	html.push('<div id="educationModule" class="resumemodule clear">');
	html.push('<div class="leftcol"><div>Education</div></div>');
	html.push('<div class="rightcol">');
	for (i = 0; i < education.length; i++) {
		html.push('<div class="educationcontainer">');
		html.push('<div><b>' + education[i].degree + '</b> – ' + education[i].university + '<span class="datespan">' + education[i].startYear + ' - ' + education[i].endYear + '</span></div>');
		if (education[i].technologies && education[i].technologies.length) {
			html.push('<div>' + education[i].technologies.join(', ') + '</div>');
		}
		if (education[i].achievements && education[i].achievements.length) {
			html.push('<div class="achievements">' + education[i].achievements + '</div>');
		}
		html.push('</div>');
	}
	html.push('</div>');
	html.push('</div>');
	this.output.push(bbcode(html.join('')));
};

ResumeBuilder.prototype.addProjectsModule = function(){
	var html = [], projects = this.data.projects, i;
	html.push('<div id="projectsModule" class="resumemodule clear">');
	html.push('<div class="leftcol"><div>Projects</div></div>');
	html.push('<div class="rightcol">');
	for (i = 0; i < projects.length; i++) {
		html.push('<div class="projectcontainer">');
		html.push('<div><b>' + projects[i].name + '</b> – ' + projects[i].url + '</div>');
		if (projects[i].technologies && projects[i].technologies.length) {
			html.push('<div>' + projects[i].technologies.join(', ') + '</div>');
		}
		if (projects[i].desc && projects[i].desc.length) {
			html.push('<div class="desc">' + projects[i].desc + '</div>');
		}
		html.push('</div>');
	}
	html.push('</div>');
	html.push('</div>');
	this.output.push(bbcode(html.join('')));
};

ResumeBuilder.prototype.printResume = function(){
	var _this = this;
	$(this.selector).html(function(){
		return _this.output.join('');
	});
};

ResumeBuilder.prototype.addClickHandlers = function(){
	var _this = this;
	$(this.selector).find('#skillsModule').on('click', '#showFullSkillsList', function(e){
		e.preventDefault();
		var fullSkills = _this.data.skills.find(skill => skill.show === false && skill.full === true);
		if (fullSkills && fullSkills.list && fullSkills.list.length) {
			$('#fullSkillsList').html('<br>' + fullSkills.list.join(', '));
		}
	});
};
