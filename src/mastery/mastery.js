
var addLink = (function(){
	window.links = [];
	return function(text, callback){
		document.write('<div class="link" onclick="window.links['+window.links.length+']();">'+text+'</div>');
		window.links.push(callback);
	}
})();

function printData(){
	var name, obj;
	if (!arguments.length) {
		return false;
	} else if (1 == arguments.length) {
		name = arguments[0].constructor.name;
		obj = arguments[0];
	} else if (2 == arguments.length) {
		name = arguments[0];
		obj = arguments[1];
	}
	document.writeln(name + " -> " + print_r(obj, true).trim() + "\n");
}

if (!String.prototype.trim) {
	String.prototype.trim = function(){
		return this.replace(/^\s+|\s+$/g,'');
	};
}

function path(){
	var args = arguments, result = [], i;

	for (i = 0; i < args.length; i++) {
		result.push(args[i].replace('@', 'http://agorbatchev.typepad.com/pub/sh/3_0_83/scripts/'));
	}

	return result;
};
 
SyntaxHighlighter.autoloader.apply(null, path(
	'applescript            @shBrushAppleScript.js',
	'actionscript3 as3      @shBrushAS3.js',
	'bash shell             @shBrushBash.js',
	'coldfusion cf          @shBrushColdFusion.js',
	'cpp c                  @shBrushCpp.js',
	'c# c-sharp csharp      @shBrushCSharp.js',
	'css                    @shBrushCss.js',
	'delphi pascal          @shBrushDelphi.js',
	'diff patch pas         @shBrushDiff.js',
	'erl erlang             @shBrushErlang.js',
	'groovy                 @shBrushGroovy.js',
	'java                   @shBrushJava.js',
	'jfx javafx             @shBrushJavaFX.js',
	'js jscript javascript  @shBrushJScript.js',
	'perl pl                @shBrushPerl.js',
	'php                    @shBrushPhp.js',
	'text plain             @shBrushPlain.js',
	'py python              @shBrushPython.js',
	'ruby rails ror rb      @shBrushRuby.js',
	'sass scss              @shBrushSass.js',
	'scala                  @shBrushScala.js',
	'sql                    @shBrushSql.js',
	'vb vbnet               @shBrushVb.js',
	'xml xhtml xslt html    @shBrushXml.js'
));

SyntaxHighlighter.defaults['gutter'] = false;
SyntaxHighlighter.all();

/**
 * Create Table of Contents by scanning for header tags.
 */
(function(){
	var toc = "";
	var level = 0;

	document.getElementById("contents").innerHTML =
		document.getElementById("contents").innerHTML.replace(
			/<h([\d])>([^<]+)<\/h([\d])>/gi,
			function(str, openLevel, titleText, closeLevel){
				if (openLevel != closeLevel) { return str; }
				if (openLevel > level) {
					toc += (new Array(openLevel - level + 1)).join("<ul>");
				} else if (openLevel < level) {
					toc += (new Array(level - openLevel + 1)).join("</ul>");
				}
				level = parseInt(openLevel);
				var anchor = titleText.replace(/ /g, "_");
				toc += "<li><a href=\"#" + anchor + "\">" + titleText + "</a></li>";
				return "<h" + openLevel + "><a name=\"" + anchor + "\">" + titleText + "</a></h" + closeLevel + ">";
			}
		);

	if (level) {
		toc += (new Array(level + 1)).join("</ul>");
	}

	document.getElementById("toc").innerHTML += toc;
})();

/**
 * Set target of external links (not table of contents / navigation links) to _blank so that
 * they open in new tab.
 */
(function(){
	var anchors = document.getElementById('contents').getElementsByTagName('a'), i, l;
	for (i = 0, l = anchors.length; i < l; i++){
		if (!anchors[i].hasAttribute("target")) {
			anchors[i].setAttribute('target', '_blank');
		}
	}
})();

var add_the_handlers = function(nodes){
	var helper = function(i){
		return function(e){
			window.links[i];
		};
	};
	var i;
	for (i = 0; i < nodes.length; i++) {
		nodes[i].addEventListener('click', helper(i), false);
	}
};

/**
 * Add click handlers to links on page that have callbacks and use the addLink function.
 */
(function(){
	//add_the_handlers(document.getElementsByClassName('link'));
})();

/**
 * Trim all pre tags. Log output adds extra newlines to the end.
 */
(function(){
	var pre = document.getElementsByTagName('pre'), i, l;
	for (i = 0, l = pre.length; i < l; i++) {
		pre[i].innerHTML = pre[i].innerHTML.trim();
	}
})();

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-42786295-1', 'hnswave.co');
ga('send', 'pageview');
