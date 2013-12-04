/*
 ********************************************
 *** CanvasEngine created by Andrew Gerst ***
 ********************************************
 */

function addEvent(obj, type, fn){
	if (obj.attachEvent) {
		obj['e'+type+fn] = fn;
		obj[type+fn] = function(){obj['e'+type+fn](window.event);}
		obj.attachEvent('on'+type, obj[type+fn]);
	} else {
		obj.addEventListener(type, fn, false);
	}
}

function removeEvent(obj, type, fn) {
	if (obj.detachEvent) {
		obj.detachEvent('on'+type, obj[type+fn]);
		obj[type+fn] = null;
	} else {
		obj.removeEventListener(type, fn, false);
	}
}

function calculateOffset(curElement, event){
	var element = curElement, offsetX = 0, offsetY = 0;
	pmouseX = mouseX;
	pmouseY = mouseY;

	if (element.offsetParent) {
		do {
			offsetX += element.offsetLeft;
			offsetY += element.offsetTop
		} while ( !! (element = element.offsetParent));
	}

	element = curElement;

	do {
		offsetX -= element.scrollLeft || 0;
		offsetY -= element.scrollTop || 0;
	} while ( !! (element = element.parentNode));

	offsetX += stylePaddingLeft;
	offsetY += stylePaddingTop;
	offsetX += styleBorderLeft;
	offsetY += styleBorderTop;
	offsetX += window.pageXOffset;
	offsetY += window.pageYOffset;

	return {
		"X": offsetX,
		"Y": offsetY
	};
}

function updateMousePosition(curElement, e){
	var offset = calculateOffset(curElement, e);
	mouseX = e.pageX - offset.X;
	mouseY = e.pageY - offset.Y;
}

(function(){
	var lastTime = 0,
		vendors = ['webkit', 'moz', 'ms', 'o'];

	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element){
		var currTime = +new Date;
		var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = window.setTimeout(function(){ callback(currTime + timeToCall); }, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};

	if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id){
		clearTimeout(id);
	};
}());

var colors = {
	aliceblue: "#f0f8ff",
	antiquewhite: "#faebd7",
	aqua: "#00ffff",
	aquamarine: "#7fffd4",
	azure: "#f0ffff",
	beige: "#f5f5dc",
	bisque: "#ffe4c4",
	black: "#000000",
	blanchedalmond: "#ffebcd",
	blue: "#0000ff",
	blueviolet: "#8a2be2",
	brightskyblue: "#00bfff",
	brown: "#a52a2a",
	burlywood: "#deb887",
	cadetblue: "#5f9ea0",
	carolinablue: "#56A0D3",
	chartreuse: "#7fff00",
	chocolate: "#d2691e",
	coral: "#ff7f50",
	cornflowerblue: "#6495ed",
	cornsilk: "#fff8dc",
	crimson: "#dc143c",
	cyan: "#00ffff",
	darkblue: "#00008b",
	darkcyan: "#008b8b",
	darkgoldenrod: "#b8860b",
	darkgray: "#a9a9a9",
	darkgreen: "#006400",
	darkkhaki: "#bdb76b",
	darkmagenta: "#8b008b",
	darkolivegreen: "#556b2f",
	darkorange: "#ff8c00",
	darkorchid: "#9932cc",
	darkred: "#8b0000",
	darksalmon: "#e9967a",
	darkseagreen: "#8fbc8f",
	darkslateblue: "#483d8b",
	darkslategray: "#2f4f4f",
	darkturquoise: "#00ced1",
	darkviolet: "#9400d3",
	deeppink: "#ff1493",
	deepskyblue: "#00bfff",
	dimgray: "#696969",
	dodgerblue: "#1e90ff",
	firebrick: "#b22222",
	floralwhite: "#fffaf0",
	forestgreen: "#228b22",
	fuchsia: "#ff00ff",
	gainsboro: "#dcdcdc",
	ghostwhite: "#f8f8ff",
	gold: "#ffd700",
	goldenrod: "#daa520",
	gray: "#808080",
	green: "#008000",
	greengrass: "#55dd00",
	greenyellow: "#adff2f",
	honeydew: "#f0fff0",
	hotpink: "#ff69b4",
	indianred: "#cd5c5c",
	indigo: "#4b0082",
	ivory: "#fffff0",
	khaki: "#f0e68c",
	lavender: "#e6e6fa",
	lavenderblush: "#fff0f5",
	lawngreen: "#7cfc00",
	lemonchiffon: "#fffacd",
	lightblue: "#add8e6",
	lightcoral: "#f08080",
	lightcyan: "#e0ffff",
	lightgoldenrodyellow: "#fafad2",
	lightgrey: "#d3d3d3",
	lightgreen: "#90ee90",
	lightpink: "#ffb6c1",
	lightsalmon: "#ffa07a",
	lightseagreen: "#20b2aa",
	lightskyblue: "#87cefa",
	lightslategray: "#778899",
	lightsteelblue: "#b0c4de",
	lightyellow: "#ffffe0",
	lime: "#00ff00",
	limegreen: "#32cd32",
	linen: "#faf0e6",
	magenta: "#ff00ff",
	maroon: "#800000",
	mediumaquamarine: "#66cdaa",
	mediumblue: "#0000cd",
	mediumorchid: "#ba55d3",
	mediumpurple: "#9370d8",
	mediumseagreen: "#3cb371",
	mediumslateblue: "#7b68ee",
	mediumspringgreen: "#00fa9a",
	mediumturquoise: "#48d1cc",
	mediumvioletred: "#c71585",
	midnightblue: "#191970",
	mintcream: "#f5fffa",
	mistyrose: "#ffe4e1",
	moccasin: "#ffe4b5",
	navajowhite: "#ffdead",
	navy: "#000080",
	oldlace: "#fdf5e6",
	olive: "#808000",
	olivedrab: "#6b8e23",
	orange: "#ffa500",
	orangered: "#ff4500",
	orchid: "#da70d6",
	palegoldenrod: "#eee8aa",
	palegreen: "#98fb98",
	paleturquoise: "#afeeee",
	palevioletred: "#d87093",
	papayawhip: "#ffefd5",
	peachpuff: "#ffdab9",
	peru: "#cd853f",
	pink: "#ffc0cb",
	plum: "#dda0dd",
	powderblue: "#b0e0e6",
	purple: "#800080",
	red: "#ff0000",
	rosybrown: "#bc8f8f",
	royalblue: "#4169e1",
	saddlebrown: "#8b4513",
	salmon: "#fa8072",
	sandybrown: "#f4a460",
	seagreen: "#2e8b57",
	seashell: "#fff5ee",
	sienna: "#a0522d",
	silver: "#c0c0c0",
	skyblue: "#87ceeb",
	slateblue: "#6a5acd",
	slategray: "#708090",
	snow: "#fffafa",
	springgreen: "#00ff7f",
	steelblue: "#4682b4",
	tan: "#d2b48c",
	teal: "#008080",
	thistle: "#d8bfd8",
	tomato: "#ff6347",
	turquoise: "#40e0d0",
	violet: "#ee82ee",
	wheat: "#f5deb3",
	white: "#ffffff",
	whitesmoke: "#f5f5f5",
	yellow: "#ffff00",
	yellowgreen: "#9acd32"
};

var undef,
	docElem = document.documentElement,
	docBody = document.getElementsByTagName('body')[0],
	maxWidth = window.innerWidth || docElem.clientWidth || docBody.clientWidth,
	maxHeight = window.innerHeight|| docElem.clientHeight|| docBody.clientHeight,
	constants = {
	EPSILON: 1.0E-4,
	MAX_FLOAT: 3.4028235E38,
	MIN_FLOAT: -3.4028235E38,
	MAX_INT: 2147483647,
	MIN_INT: -2147483648,
	PI: Math.PI,
	TWO_PI: 2 * Math.PI,
	HALF_PI: Math.PI / 2,
	THIRD_PI: Math.PI / 3,
	QUARTER_PI: Math.PI / 4,
	DEG_TO_RAD: Math.PI / 180,
	RAD_TO_DEG: 180 / Math.PI,
	WHITESPACE: " \t\n\r\u000c\u00a0",
	BACKSPACE: 8,
	TAB: 9,
	ENTER: 10,
	RETURN: 13,
	ESC: 27,
	DELETE: 127,
	SHIFT: 16,
	CONTROL: 17,
	ALT: 18,
	PGUP: 33,
	PGDN: 34,
	END: 35,
	HOME: 36,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	F1: 112,
	F2: 113,
	F3: 114,
	F4: 115,
	F5: 116,
	F6: 117,
	F7: 118,
	F8: 119,
	F9: 120,
	F10: 121,
	F11: 122,
	F12: 123,
	ARROW: "default",
	CROSS: "crosshair",
	HAND: "pointer",
	MOVE: "move",
	TEXT: "text",
	WAIT: "wait",
	NOCURSOR: "url('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='), auto",
},
c = {
	W: 0,
	H: 0,
	X: 0,
	Y: 0,
	O: 0.5,
	grid: false,
	background: "rgba(0, 0, 0, 1)",
	fillStyle: "rgba(0, 0, 0, 1)",
	doFill: true,
	strokeStyle: "rgba(0, 0, 0, 1)",
	lineWidth: 1,
	lineWidthHalf: 0.5,
	lineCap: "round",
	doStroke: true,
	color: [0, 0, 0, 0],
	font: "12px Arial",
	fontSize: 12,
	fontStyle: "Arial"
},
pmouseX = 0,
pmouseY = 0,
mouseX = 0,
mouseY = 0,
mouseIsPressed = false,
keyIsPressed = false,
curElement,
stylePaddingLeft,
stylePaddingTop,
styleBorderLeft,
styleBorderTop,
looping = 0,
doLoop = true,
loopStarted = false,
nop = function(){},
debug = function(){
	if ("console" in window) return function(msg){
		window.console.log("Debug: " + msg);
	};
	return nop;
}(),
noLoop = function(){
	doLoop = false;
	loopStarted = false;
	cancelAnimationFrame(looping);
},
loop = function(){
	if (loopStarted) return;
	looping = window.requestAnimationFrame(canvas.animloop);
	doLoop = true;
	loopStarted = true;
},
size = function(w, h){
	canvas.size(w, h);
},
fullScreen = function(){
	size(maxWidth, maxHeight);
},
engage = function(){
	ctx.fillStyle = c.fillStyle;
	ctx.strokeStyle = c.strokeStyle;
	ctx.lineWidth = c.lineWidth;
	ctx.lineCap = c.lineCap;
	ctx.font = c.font;
	ctx.beginPath();
},
paint = function(){
	ctx.closePath();
	if (c.doFill) {
		ctx.fill();
	}
	if (c.doStroke) {
		ctx.stroke();
	}
},
clearRect = function(x, y, w, h){ // clears the canvas in the specified rectangle.
	ctx.clearRect(x, y, w, h);
},
clear = function(){ // clears the entire canvas.
	ctx.clearRect(0, 0, c.W, c.H);
},
save = function(){ // saves the current canvas transform state.
	ctx.save();
},
restore = function(){ // restores the saved canvas transform state.
	ctx.restore();
},
translate = function(x, y){ // translates the canvas transform.
	ctx.translate(x, y);
},
rotate = function(degs){ // rotates the canvas transform.
	ctx.rotate(degs);
},
begin = function(x, y){
	ctx.moveTo(x, y);
},
/* Shapes */
point = function(x, y){ // draw a point
	engage();
	ctx.fillRect(x + c.O, y + c.O, c.lineWidth, c.lineWidth);
	paint();
},
line = function(x1, y1, x2, y2){ // draw a line
	engage();
	ctx.moveTo(x1 + c.O + c.lineWidthHalf, y1 + c.O + c.lineWidthHalf);
	ctx.lineTo(x2 + c.O + c.lineWidthHalf, y2 + c.O + c.lineWidthHalf);
	paint();
},
rect = function(x, y, w, h){ // draw a rectangle
	engage();
	if (c.doStroke && !c.doFill) {
		ctx.strokeRect(x + c.O, y + c.O, w, h);
	} else if (c.doFill && !c.doStroke) {
		ctx.fillRect(x + c.O, y + c.O, w, h);
	} else if (c.doStroke && c.doFill) {
		if (c.fillStyle === c.strokeStyle) {
			ctx.fillRect(x + c.O, y + c.O, w, h);
		} else {
			ctx.fillRect(x + c.O, y + c.O, w, h);
			ctx.strokeRect(x + c.O, y + c.O, w, h);
		}
	}
	paint();
},
arc = function(x, y, radius, start, stop, clockwise){ // draw an arc
	engage();
	ctx.arc(x, y, radius, start, stop, clockwise);
	paint();
},
circle = function(x, y, radius){ // draw a circle
	engage();
	ctx.arc(x + c.O, y + c.O, radius, 0, constants.PI * 2, false);
	paint();
},
ellipse = function(x, y, w, h){ // draw an ellipse
	engage();
	x -= 0.5 * w;
	y -= 0.5 * h;
	var k = 0.55; // kappa = (-1 + sqrt(2)) / 3 * 4 
	var dx = k * 0.5 * w;
	var dy = k * 0.5 * h;
	var x0 = x + 0.5 * w;
	var y0 = y + 0.5 * h;
	var x1 = x + w;
	var y1 = y + h;
	ctx.moveTo(x, y0);
	ctx.bezierCurveTo(x, y0 - dy, x0 - dx, y, x0, y);
	ctx.bezierCurveTo(x0 + dx, y, x1, y0 - dy, x1, y0);
	ctx.bezierCurveTo(x1, y0 + dy, x0 + dx, y1, x0, y1);
	ctx.bezierCurveTo(x0 - dx, y1, x, y0 + dy, x, y0);
	paint();
},
triangle = function(x1, y1, x2, y2, x3, y3){ // draw a triangle
	engage();
	ctx.moveTo(x1 + c.O, y1 + c.O);
	ctx.lineTo(x2 + c.O, y2 + c.O);
	ctx.lineTo(x3 + c.O, y3 + c.O);
	paint();
},
bezier = function(x1, y1, cx1, cy1, cx2, cy2, x2, y2){ // draw a bezier curve
	engage();
	ctx.moveTo(x1, x2);
	ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
	paint();
},
bezierCurve = function(cx1, cy1, cx2, cy2, x2, y2){ // draw a bezier curve
	ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
},
quad = function(x1, y1, x2, y2, x3, y3, x4, y4){ // draw any quadrilateral
	engage();
},
image = function(image, x, y){ // display an image
	engage();
},
path = function(steps){
	var length = steps.length, i;
	engage();
	ctx.moveTo(steps[0].x, steps[0].y);
	for (i = 1; i < length; i++) {
		ctx.lineTo(steps[i].x, steps[i].y);
	}
	paint();
},
/* Coloring */
background = function(r, g, b, a){ // set the background color
	var oldFillStyle = c.fillStyle;
	c.background = "rgba(" + r + ", " + g + ", " + b + ", 1)";
	c.fillStyle = c.background;
	engage();
	ctx.fillRect(0, 0, c.W, c.H);
	paint();
	c.fillStyle = oldFillStyle;
},
fill = function(r, g, b, a){ // fill color for shapes / text color
	c.doFill = true;
	c.fillStyle = "rgba(" + r + ", " + g + ", " + b + ", 1)";
},
noFill = function(){ // no fill for shapes
	c.doFill = false;
},
stroke = function(r, g, b, a){ // outline color for shapes / text color
	c.doStroke = true;
	c.strokeStyle = "rgba(" + r + ", " + g + ", " + b + ", 1)";
},
strokeWeight = function(thickness){ // no outline for shapes
	c.doStroke = true;
	c.lineWidth = thickness;
	c.lineWidthHalf = thickness / 2;
},
noStroke = function(){ // no outline for shapes
	c.doStroke = false;
},
color = function(r, g, b, a){ // store a color in a variable
	return "rgba(" + r + ", " + g + ", " + b + ", 1)";
},
/* Text */
text = function(text, x, y){ // draw some text
	var oldStrokeWeight = c.strokeWeight;
	c.strokeWeight = 1;
	engage();
	if (c.doStroke && !c.doFill) {
		ctx.strokeText(text, x, y);
	} else if (c.doFill) {
		ctx.fillText(text, x, y);
	}
	stroke();
	c.strokeWeight = oldStrokeWeight;
},
textFont = function(font, size){ // changes the font of the text
	c.fontStyle = font;
	c.fontSize = size;
	c.font = size + "px " + font;
},
textSize = function(size){ // change the size of text
	c.textSize = size;
	c.font = size + "px " + c.fontStyle;
},
/* Math */
random = function(low, high){ // generate a random number
	return Math.floor(Math.random() * (high - low + 1)) + low;
},
floor = function(num){
	return Math.floor(num);
},
ceil = function(num){
	return Math.ceil(num);
},
round = function(num){
	return Math.round(num);
},
dist = function(x1, y1, x2, y2){ // calculates the distance between two points
	var xs = x2 - x1, ys = y2 - y1;
	return Math.sqrt(xs * xs + ys * ys);
},
abs = function(num){ // take the absolute value of a number
	return Math.abs(num);
},
log = function(num){ // take the logarithm of a number
	return Math.log(num);
},
pow = function(num, exponent){ // raise a number to an exponent
	return Math.pow(num, exponent);
},
cos = function(deg){ // cake the cosine of an angle
	return Math.cos(deg);
},
sin = function(deg){ // take the sin of an angle
	return Math.sin(deg);
},
tan = function(deg){ // take the tangent of an angle
	return Math.tan(deg);
},
hour = function(){
	return new Date().getHours();
},
minute = function(){
	return new Date().getMinutes();
},
second = function(){
	return new Date().getSeconds();
},
grid = function(interval){
	engage();
	if (!interval) {
		interval = 10;
	}
	for (var x = c.O; x <= c.W; x += interval) { // vertical
		ctx.moveTo(x, 0);
		ctx.lineTo(x, c.H);
	}
	for (var y = c.O; y <= c.H; y += interval) { // horizontal
		ctx.moveTo(0, y);
		ctx.lineTo(c.W, y);
	}
	c.grid = true;
	paint();
};

function Canvas(canvas){
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
	this.setup = nop;
	this.draw = nop;

	this.run = function(){
		curElement = canvas;
		this.size(400, 400);
		this.compute();
		this.attachHandlers();
		this.setup();
		this.animloop();
		loopStarted = true;
	};

	this.animloop = function(){
		looping = window.requestAnimationFrame(this.animloop);
		this.draw();
	}.bind(this);

	this.size = function(w, h){
		if (this.ctx) {
			canvas.width = c.W = ++w;
			canvas.height = c.H = ++h;
		}
		c.X = this.canvas.offsetLeft;
		c.Y = this.canvas.offsetTop;
	};

	this.compute = function(){
		if (document.defaultView && document.defaultView.getComputedStyle) {
			stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(curElement, null)["paddingLeft"], 10) || 0;
			stylePaddingTop = parseInt(document.defaultView.getComputedStyle(curElement, null)["paddingTop"], 10) || 0;
			styleBorderLeft = parseInt(document.defaultView.getComputedStyle(curElement, null)["borderLeftWidth"], 10) || 0;
			styleBorderTop = parseInt(document.defaultView.getComputedStyle(curElement, null)["borderTopWidth"], 10) || 0
		}
	};

	this.attachHandlers = function(){
		addEvent(canvas, 'mousemove', onMouseMove || nop);
		addEvent(canvas, 'mousedown', onMouseDown || nop);
		addEvent(canvas, 'mouseup', onMouseUp || nop);
		addEvent(canvas, 'click', mouseClicked || nop);
	};
}

var onMouseMove = function(e){
	updateMousePosition(curElement, e);
};

var onMouseDown = function(e){
	mouseIsPressed = true;
};

var onMouseUp = function(e){
	mouseIsPressed = false;
};
