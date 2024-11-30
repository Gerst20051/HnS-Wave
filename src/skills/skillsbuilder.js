/*
 *********************************************
 *** SkillsBuilder created by Andrew Gerst ***
 *********************************************
 */

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

var SkillsBuilder = function(){
	this.data = {};
	this.rankedSkills = [[]];
	this.taggedSkills = {};
	this.selector = '';
	this.search = '';
	this.output = [];

	this.config = function(selector){
		this.selector = selector;
		return this;
	};

	this.run = function(){
		this.reset();
		this.addClickHandlers();
	};

	this.reset = function(){
		this.clearOutput();
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
	return str.replace(/-/g, ' ').replace(/\w\S*/g, function(txt){
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

SkillsBuilder.prototype.uncapitalizeSkill = function(skill){
	if (getKeyByValue(this.data.settings.skills_labels, skill)) {
		return getKeyByValue(this.data.settings.skills_labels, skill);
	}
	if (getKeyByValue(this.skillMap, skill)) {
		return getKeyByValue(this.skillMap, skill);
	}
	return skill.toLowerCase().replace(' ', '-');
};

SkillsBuilder.prototype.clearOutput = function(){
	this.output.length = 0;
};

SkillsBuilder.prototype.parseData = function(){
	this.rankedSkills = [[]];
	this.taggedSkills = {};

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
			// console.log(skill, metadata);
		});
	}
};

SkillsBuilder.prototype.updateData = function(data){
	if (data) {
		this.clearOutput();
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

SkillsBuilder.prototype.addSubSkills = function(skills){
	return skills.map(skill => {
		const skillKey = this.uncapitalizeSkill(skill);
		if (this.data.skills[skillKey] && this.data.skills[skillKey].skills) {
			return `${skill} (${this.data.skills[skillKey].skills.map(this.capitalizeSkill.bind(this)).join(', ')})`;
		}
		return skill;
	});
};

SkillsBuilder.prototype.buildSkills = function(){
	var html = [];
	html.push('<div id="searchContainer">');
	html.push('<input id="skillsSearch" name="skillsSearch" type="text" spellcheck="false" value="' + this.search + '" />');
	html.push('</div>');
	html.push('<div id="rankingsContainer">');
	html.push('<div class="skillsHeader">' + this.capitalizeSkill('Rankings') + '</div>');
	this.rankedSkills.forEach((rankSkills, rank) => {
		if (rank === 0 && this.data.settings.skip_zero_rank) return;
		let matchingSkills = rankSkills;
		if (this.search.length) {
			matchingSkills = rankSkills.filter(skill => skill.toLowerCase().match(this.search));
		}
		if (!matchingSkills.length) return;
		html.push('<div id="skillsModule" class="skillsmodule clear">');
		html.push('<div class="leftcol"><div>' + this.convertRankToLabel(rank) + '</div></div>');
		html.push('<div class="rightcol">' + this.addSubSkills(matchingSkills).join(', ') + '</div>');
		html.push('</div>');
	});
	html.push('</div>');
	html.push('<div id="categoriesContainer">');
	html.push('<div class="skillsHeader">' + this.capitalizeSkill('Categories') + '</div>');
	Object.keys(this.taggedSkills).sort().forEach(taggedSkill => {
		let matchingSkills = this.taggedSkills[taggedSkill];
		if (this.search.length) {
			matchingSkills = this.taggedSkills[taggedSkill].filter(skill => skill.toLowerCase().match(this.search));
		}
		if (!matchingSkills.length) return;
		html.push('<div id="skillsModule" class="skillsmodule clear">');
		html.push('<div class="leftcol"><div>' + this.capitalizeSkill(taggedSkill) + '</div></div>');
		html.push('<div class="rightcol">' + this.addSubSkills(matchingSkills).join(', ') + '</div>');
		html.push('</div>');
	});
	html.push('</div>');
	html.push('<div id="showCategoriesContainer">');
	html.push('<a id="showCategoriesLink" href="#">Show Categories</a>');
	html.push('</div>');
	html.push('<div id="hideCategoriesContainer">');
	html.push('<a id="hideCategoriesLink" href="#">Hide Categories</a>');
	html.push('</div>');
	this.output.push(html.join(''));
};

SkillsBuilder.prototype.printSkills = function(){
	var _this = this;
	$(this.selector).html(function(){
		return _this.output.join('');
	});
};

SkillsBuilder.prototype.addClickHandlers = function(){
	var _this = this;
	$(this.selector).on('click', '#showCategoriesLink', function(e){
		e.preventDefault();
		$('#showCategoriesContainer').hide();
		$('#categoriesContainer').show();
		$('#hideCategoriesContainer').show();
	});
	$(this.selector).on('click', '#hideCategoriesLink', function(e){
		e.preventDefault();
		$('#hideCategoriesContainer').hide();
		$('#categoriesContainer').hide();
		$('#showCategoriesContainer').show();
	});
	$(this.selector).on('input', '#skillsSearch', function(e){
		_this.search = e.target.value.toLowerCase();
		_this.reset()
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
