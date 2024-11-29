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
	if (this.data.settings.skills_labels[skill]) {
		return this.data.settings.skills_labels[skill];
	}
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
	document.title = ['Skills', this.data.info.name, this.data.info.title].join(' - ');
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

SkillsBuilder.prototype.convertRankToLabel = function(rank){
	if (this.data.settings.ranking_labels[rank]) return this.data.settings.ranking_labels[rank];
	return 'Rank ' + rank;
};

SkillsBuilder.prototype.buildSkills = function(){
	var html = [];
	this.rankedSkills.forEach((rankSkills, rank) => {
		if (rank === 0 && this.data.settings.skip_zero_rank) return;
		html.push('<div id="skillsModule" class="skillsmodule clear">');
		html.push('<div class="leftcol"><div>' + this.convertRankToLabel(rank) + '</div></div>');
		html.push('<div class="rightcol">' + rankSkills.join(', ') + '</div>');
		html.push('</div>');
	});
	Object.keys(this.taggedSkills).forEach(taggedSkill => {
		html.push('<div id="skillsModule" class="skillsmodule clear">');
		html.push('<div class="leftcol"><div>' + this.toTitleCase(taggedSkill) + '</div></div>');
		html.push('<div class="rightcol">' + this.taggedSkills[taggedSkill].join(', ') + '</div>');
		html.push('</div>');
	});
	this.output.push(html.join(''));
};

SkillsBuilder.prototype.printSkills = function(){
	var _this = this;
	$(this.selector).html(function(){
		return _this.output.join('');
	});
};

// Reference Skills Builder Notes In Google Doc "Weekly Reports 2024 (Q3)"
// https://docs.google.com/document/d/1hPwo5w2lj39YjRXR-zct8d75jxMXYbleN4KWhopPbrY/edit?tab=t.0#heading=h.j7l4wd1x4eh

// Ranking Labels
// Advisory (5 Stars)
// Distinguished (5 Stars)
// Superior (5 Stars)
// Expert (5 Stars)
// Excellent (5 Stars)
// Professional (5 Stars)
// Outstanding (5 Stars)
// Very Good (4 Stars)
// Advanced (4 Stars)
// Specialist (4 Stars)
// Enriched Proficient (4 Stars)
// Skilled (4 Stars)
// Intermediate (3 Stars)
// Proficient (3 Stars)
// Competent (3 Stars)
// Good (3 Stars)
// Average (3 Stars)
// Advanced Beginner (2 Stars)
// Developing (2 Stars)
// Developer (2 Stars)
// Awareness (1 Star)
// Emerging (1 Star)
// Beginner (1 Star)
// Junior (1 Star)
// Novice (1 Star)
// Newbie (1 Star)
// Basic (1 Star)
// Entry (1 Star)
// Weak (1 Star)
// Fair (1 Star)
// No Knowledge (0 Stars)
