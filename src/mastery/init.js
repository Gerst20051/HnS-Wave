// TODO: replace "http://cdn.hnswave.co/cdn/" with "http://cdn.hnswave.co/"

(function(){
	var $w = window,
		$d = document,
		a = "link",
		b = "script",
		c = "stylesheet",
		d = "createElement",
		e = "setAttribute",
		f = "getElementsByTagName",
		g = $w.navigator.userAgent,
		h = g.indexOf("Firefox") !== -1 || g.indexOf("Opera") !== -1 ? true : false,
		i = ["http://hnswave.co/cdn/css/bootstrap.css", "http://hnswave.co/cdn/syntaxhighlighter/shThemeDefault.css", "mastery.css"],
		j = ["http://hnswave.co/cdn/syntaxhighlighter/shCore.js", "http://hnswave.co/cdn/syntaxhighlighter/shAutoloader.js", "http://hnswave.co/cdn/echo.js", "http://hnswave.co/cdn/print_r.js", "mastery.js"],
		l = 0,
		n,
		m;
	for (m = i.length; l < m; ++l) {
		if (h) {
			n = $d[d](a);
			n[e]("rel", c);
			n[e]("href", i[l]);
			$d[f]("head")[0].appendChild(n)
		} else {
			$d.write("<" + a + ' rel="' + c + '" href="' + i[l] + '" />')
		}
	}
	for (l = 0, m = j.length; l < m; ++l) {
		if (h) {
			n = $d[d](b);
			n[e]("src", j[l]);
			$d[f]("head")[0].appendChild(n)
		} else {
			$d.write("<" + b + ' src="' + j[l] + '"></' + b + ">")
		}
	}
})();

window.log = function(string){
	log.history = log.history || [];
	log.history.push(string);
	if (this.console) console.log(Array.prototype.slice.call(arguments));
};

window.log.clear = function(){
	log.history = log.history || [];
	log.history.length = 0;
};

window.contentLoaded = function(win, fn){
	var doc = win.document, done = false,
		add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
		rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
		pre = doc.addEventListener ? '' : 'on',
		init = function(e){
			if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
			(e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
			if (!done && (done = true)) fn.call(win, e.type || e);
		};
	if (doc.readyState == 'complete') fn.call(win, 'lazy');
	else {
		doc[add](pre + 'DOMContentLoaded', init, false);
		doc[add](pre + 'readystatechange', init, false);
		win[add](pre + 'load', init, false);
	}
};
