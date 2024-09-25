/*
 *********************************************
 *** SkillsBuilder created by Andrew Gerst ***
 *********************************************
 */

var SkillsBuilder = function(){
	this.data = {};
	this.rankedSkills = [[]];
	this.taggedSkills = {};
	this.selector = '';
	this.output = [];

	this.config = function(selector){
		this.selector = selector;
		return this;
	};

	this.run = function(){
		this.parseData();
		this.buildHeader();
		this.buildSkills();
		this.printSkills();
	};
};

SkillsBuilder.prototype.skillMap = {
	'adt': 'ADT',
	'ci/cd': 'CI/CD',
	'javascript': 'JavaScript',
	'mysql': 'MySQL',
	'php': 'PHP',
	'sqlite': 'SQLite',
};

SkillsBuilder.prototype.toTitleCase = function(str){
	return str.replace(/\w\S*/g, function(txt){
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};

SkillsBuilder.prototype.capitalizeSkill = function(skill){
	if (this.skillMap[skill]) {
		return this.skillMap[skill];
	}
	return this.toTitleCase(skill);
};

SkillsBuilder.prototype.parseData = function(){
	var data = this.data;

	var skills = Object.keys(data.skills);

	if (data.skills && skills.length) {
		skills.forEach(skill => {
			var capitalizedSkill = this.capitalizeSkill(skill);
			var metadata = data.skills[skill];
			if (metadata.rank) {
				if (!this.rankedSkills[metadata.rank]) {
					this.rankedSkills[metadata.rank] = [];
				}
				this.rankedSkills[metadata.rank].push(capitalizedSkill);
			} else {
				this.rankedSkills[0].push(capitalizedSkill);
			}
			if (metadata.tags) {
				metadata.tags.forEach(tag => {
					if (!this.taggedSkills[tag]) {
						this.taggedSkills[tag] = [];
					}
					this.taggedSkills[tag].push(capitalizedSkill);
				});
			}
			console.log(skill, metadata);
		});
	}
};

SkillsBuilder.prototype.updateData = function(data){
	if (data) {
		this.output.length = 0;
		if (typeof data == 'object') {
			this.data = data;
		} else if (typeof data == 'string') {
			this.data = JSON.parse(data);
		}
		this.run();
	}
};

SkillsBuilder.prototype.buildHeader = function(){
	var html = [];
	html.push('<div id="headerModule" class="skillsmodule clear">');
	html.push('<div id="titlehead" class="clear">');
	html.push('<div id="nametitle">');
	html.push('<div id="name">' + this.data.info.name + '</div>');
	html.push('<div id="title">' + this.data.info.title + '</div>');
	html.push('<div id="location">' + this.data.info.location + '</div>');
	html.push('</div>');
	html.push('</div>');
	html.push('</div>');
	this.output.push(html.join(''));
};
SkillsBuilder.prototype.buildSkills = function(){
	var html = [];
	html.push('<div id="skillsModule" class="skillsmodule clear">');
	html.push('<div class="leftcol"><div>Skills</div></div>');
	this.rankedSkills.forEach((rankSkills, rank) => {
		html.push('<div class="rightcol"><b>Rank ' + rank + ': </b>');
		html.push(rankSkills.join(', '));
		html.push('</div>');
	});
	Object.keys(this.taggedSkills).forEach(taggedSkill => {
		html.push('<div class="rightcol"><b>' + this.toTitleCase(taggedSkill) + ': </b>');
		html.push(this.taggedSkills[taggedSkill].join(', '));
		html.push('</div>');
	});
	html.push('</div>');
	this.output.push(html.join(''));
};

SkillsBuilder.prototype.printSkills = function(){
	var _this = this;
	$(this.selector).html(function(){
		return _this.output.join('');
	});
};
