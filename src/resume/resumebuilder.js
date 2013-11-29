/*
 *********************************************
 *** ResumeBuilder created by Andrew Gerst ***
 *********************************************
 */

function bbcode(str){
	/*
	var matches = [
		'[url={URL}]{TEXT}[/url]'
	],
	templates = [
		'<a href="{URL}">{TEXT}</a>'
	],
	i;

	for (i = 0; i < matches.length; i++) {
		str = str.replace(matches[i], templates[i]);
	}
	*/
	return str;
}

var ResumeBuilder = function(){
	this.data = {};
	this.selector = "";
	this.modules = [];
	this.output = [];
	this.moduleAliases = {
		"title": this.addTitleModule,
		"skills": this.addSkillsModule,
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
	};
};

ResumeBuilder.prototype.parseData = function(){
	var data = this.data;

	//TODO: Extract this info directly from this.data using Object.keys?
	if (data.name || data.title || data.location || data.number || data.email || data.url || data.statement) {
		this.modules.push('title');
	}
	if (data.skills && data.skills.length) {
		this.modules.push('skills');
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
	this.data = data;
	this.run();
};

ResumeBuilder.prototype.createModule = function(){

};

ResumeBuilder.prototype.addTitleModule = function(){
	var html = [], data = this.data;
	html.push('<div id="titleModule" class="resumemodule clear">');
	html.push('<div id="nametitle">');
	html.push('<div id="name">' + data.name + '</div>');
	html.push('<div id="title">' + data.title + '</div>');
	html.push('</div>');
	html.push('<div id="contact">');
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
		html.push('<div>' + data.url + '</div>');
	}
	html.push('</div>');
	if (data.statement && data.statement.length) {
		html.push('<div id="statement" class="clear">' + bbcode(data.statement) + '</div>');
	}
	html.push('</div>');
	this.output.push(html.join(''));
};

ResumeBuilder.prototype.addSkillsModule = function(){
	var html = [];
	html.push('<div id="skillsModule" class="resumemodule clear">');
	html.push('<div class="leftcol"><div>Skills</div></div>');
	html.push('<div class="rightcol"><b>Like: </b>');
	html.push(this.data.skills.join(', '));
	html.push('</div>');
	html.push('</div>');
	this.output.push(html.join(''));
};

ResumeBuilder.prototype.addExperienceModule = function(){
	var html = [], experience = this.data.experience, i;
	html.push('<div id="experienceModule" class="resumemodule clear">');
	html.push('<div class="leftcol"><div>Experience</div></div>');
	html.push('<div class="rightcol">');
	for (i = 0; i < experience.length; i++) {
		html.push('<div class="experiencecontainer">');
		html.push('<div><b>' + experience[i].title + '</b> – ' + experience[i].organization + '<span class="datespan">' + experience[i].startDate + ' - ' + experience[i].endDate + '</span></div>');
		if (experience[i].technologies && experience[i].technologies.length) {
			html.push('<div>' + experience[i].technologies.join(', ') + '</div>');
		}
		html.push('<div class="responsibilities">' + experience[i].responsibilities + '</div>');
		html.push('</div>');
	}
	html.push('</div>');
	html.push('</div>');
	this.output.push(html.join(''));
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
		html.push('<div class="achievements">' + education[i].achievements + '</div>');
		html.push('</div>');
	}
	html.push('</div>');
	html.push('</div>');
	this.output.push(html.join(''));
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
		html.push('<div class="desc">' + projects[i].desc + '</div>');
		html.push('</div>');
	}
	html.push('</div>');
	html.push('</div>');
	this.output.push(html.join(''));
};

ResumeBuilder.prototype.printResume = function(){
	_this = this;
	$(this.selector).html(function(){
		return _this.output.join('');
	});
};
