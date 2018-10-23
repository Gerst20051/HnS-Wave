'use strict';

/*
 ********************************************
 *** CanvasEngine created by Andrew Gerst ***
 ********************************************
 */

function addEvent(obj, type, fn){
	if (obj.attachEvent) {
		obj['e'+type+fn] = fn;
		obj[type+fn] = function(){obj['e'+type+fn](window.event);};
		obj.attachEvent('on'+type, obj[type+fn]);
	} else {
		obj.addEventListener(type, fn, false);
	}
}

function removeEvent(obj, type, fn){
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
			offsetY += element.offsetTop;
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
	cloudblue: '#8ed6ff',
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
	mario: "fb8b15",
	mariobrown: "684602",
	mariored: "fb0007",
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

var keycode = {
	getKeyCode: function(e){
		var keycode = null;
		if (window.event) {
			keycode = window.event.keyCode;
		} else if (e) {
			keycode = e.which || e.keyCode;
		}
		return keycode;
	},
	getKeyCodeValue: function(keyCode, shiftKey){
		shiftKey = shiftKey || false;
		var value = null;
		if (shiftKey === true) {
			value = this.modifiedByShift[keyCode];
		} else {
			value = this.keyCodeMap[keyCode];
		}
		return value;
	},
	getValueByEvent: function(e){
		return this.getKeyCodeValue(this.getKeyCode(e), e.shiftKey);
	},
	keyCodeMap: {
		8:"backspace", 9:"tab", 13:"return", 16:"shift", 17:"ctrl", 18:"alt", 19:"pausebreak", 20:"capslock", 27:"escape", 32:" ", 33:"pageup",
		34:"pagedown", 35:"end", 36:"home", 37:"left", 38:"up", 39:"right", 40:"down", 43:"+", 44:"printscreen", 45:"insert", 46:"delete",
		48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 59:";",
		61:"=", 65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l",
		77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z",
		96:"0", 97:"1", 98:"2", 99:"3", 100:"4", 101:"5", 102:"6", 103:"7", 104:"8", 105:"9",
		106: "*", 107:"+", 109:"-", 110:".", 111: "/",
		112:"f1", 113:"f2", 114:"f3", 115:"f4", 116:"f5", 117:"f6", 118:"f7", 119:"f8", 120:"f9", 121:"f10", 122:"f11", 123:"f12",
		144:"numlock", 145:"scrolllock", 186:";", 187:"=", 188:",", 189:"-", 190:".", 191:"/", 192:"`", 219:"[", 220:"\\", 221:"]", 222:"'"
	},
	modifiedByShift: {
		192:"~", 48:")", 49:"!", 50:"@", 51:"#", 52:"$", 53:"%", 54:"^", 55:"&", 56:"*", 57:"(", 109:"_", 61:"+",
		219:"{", 221:"}", 220:"|", 59:":", 222:"\"", 188:"<", 189:">", 191:"?",
		96:"insert", 97:"end", 98:"down", 99:"pagedown", 100:"left", 102:"right", 103:"home", 104:"up", 105:"pageup"
	}
};

var undef,
	docElem = document.documentElement,
	docBody = document.getElementsByTagName('body')[0],
	maxWidth = window.innerWidth || docElem.clientWidth || docBody.clientWidth,
	maxHeight = window.innerHeight || docElem.clientHeight || docBody.clientHeight,
	isTouchEnabled = 'ontouchstart' in docElem || 'ontouchstart' in window,
	EPSILON = 1.0E-4,
	MAX_FLOAT = 3.4028235E38,
	MIN_FLOAT = -3.4028235E38,
	MAX_INT = 2147483647,
	MIN_INT = -2147483648,
	PI = Math.PI,
	TWO_PI = Math.PI * 2,
	HALF_PI = Math.PI / 2,
	THIRD_PI = Math.PI / 3,
	QUARTER_PI = Math.PI / 4,
	DEG_TO_RAD = Math.PI / 180,
	RAD_TO_DEG = 180 / Math.PI,
	WHITESPACE = " \t\n\r\u000c\u00a0",
	ARROW = "default",
	CROSS = "crosshair",
	HAND = "pointer",
	MOVE = "move",
	TEXT = "text",
	WAIT = "wait",
	NOCURSOR = "url('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='), auto",
keys = {
	BACKSPACE: 8,
	TAB: 9,
	ENTER: 10,
	RETURN: 13,
	ESC: 27,
	SHIFT: 16,
	CONTROL: 17,
	ALT: 18,
	SPACE: 32,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	A: 65,
	D: 68,
	P: 80,
	S: 83,
	W: 87,
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
	F12: 123
},
c = {
	W: 0,
	H: 0,
	X: 0,
	Y: 0,
	O: 0.5,
	grid: false,
	fullScreen: false,
	globalAlpha: 1,
	background: "rgba(0, 0, 0, 1)",
	fillStyle: "rgba(0, 0, 0, 1)",
	doFill: true,
	strokeStyle: "rgba(0, 0, 0, 1)",
	lineWidth: 1,
	lineWidthHalf: 0.5,
	lineCap: "round",
	doStroke: true,
	doClosePath: false,
	color: [0, 0, 0, 0],
	font: "12px Arial",
	fontSize: 12,
	fontStyle: "Arial",
	pathOffsetX: 0,
	pathOffsetY: 0
},
pmouseX = 0,
pmouseY = 0,
mouseX = 0,
mouseY = 0,
mouseIsPressed = false,
screenIsTouched = false,
numberOfTouches = 0,
touchesList = [],
keyCode = 0,
keyIsPressed = false,
keyCodeList = [],
currentOrientation,
curElement,
stylePaddingLeft,
stylePaddingTop,
styleBorderLeft,
styleBorderTop,
looping = 0,
doLoop = true,
loopStarted = false,
noop = function(){},
nop = function(){},
debug = function(){
	if ("console" in window) return function(msg){
		window.console.log("Debug: " + msg);
	};
	return nop;
}(),
mouseMoved = nop,
mouseClicked = nop,
mousePressed = nop,
mouseReleased = nop,
touchMoved = nop,
touchStart = nop,
touchEnd = nop,
keyDown = nop,
keyUp = nop,
keyPressed = nop,
orientationChanged = nop,
windowResized = nop,
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
	if (!c.fullScreen) {
		w++, h++;
	}
	canvas.size(w, h);
},
fullScreen = function(){ // adjust size of canvas to be fullscreen
	c.fullScreen = true;
	size(maxWidth, maxHeight);
},
engage = function(){
	ctx.globalAlpha = c.globalAlpha;
	ctx.fillStyle = c.fillStyle;
	ctx.strokeStyle = c.strokeStyle;
	ctx.lineWidth = c.lineWidth;
	ctx.lineCap = c.lineCap;
	ctx.font = c.font;
	ctx.beginPath();
},
paint = function(){
	if (c.doClosePath) {
		ctx.closePath();
	}
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
	ctx.arc(x + c.O, y + c.O, radius, 0, TWO_PI, false);
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
	ctx.moveTo(x1 + c.O, y1 + c.O);
	ctx.lineTo(x2 + c.O, y2 + c.O);
	ctx.lineTo(x3 + c.O, y3 + c.O);
	ctx.lineTo(x4 + c.O, y4 + c.O);
	ctx.lineTo(x1 + c.O, y1 + c.O);
	paint();
},
image = function(img, sx, sy, swidth, sheight, x, y, width, height){ // display an image
	var numArgs = arguments.length, image, drawImage;
	engage();

	drawImage = function(){
		if (numArgs === 3) {
			// img, x, y
			ctx.drawImage(image, sx, sy);
		} else if (numArgs === 5) {
			// img, x, y, width, height
			ctx.drawImage(image, sx, sy, swidth, sheight);
		} else if (numArgs === 7) {
			ctx.drawImage(image, sx, sy, swidth, sheight, x, y, swidth, sheight);
		} else if (numArgs === 9) {
			ctx.drawImage(image, sx, sy, swidth, sheight, x, y, width, height);
		}
	};

	if (typeof img === "string") {
		if (numArgs === 3 || numArgs === 5 || numArgs === 7 || numArgs === 9) {
			image = new Image();
			image.src = img;
			image.onload = drawImage;
		}
	} else {
		image = img;
		drawImage();
	}
},
pathOffset = function(x, y){
	c.pathOffsetX = x || 0;
	c.pathOffsetY = y || 0;
},
path = function(steps){
	var length = steps.length, i;
	engage();
	ctx.moveTo(steps[0].x, steps[0].y);
	for (i = 1; i < length; i++) {
		ctx.lineTo(c.pathOffsetX + steps[i].x, c.pathOffsetY + steps[i].y);
	}
	paint();
},
closePath = function(){
	c.doClosePath = true;
},
noClosePath = function(){
	c.doClosePath = false;
},
/* 3D Shapes */
Point3D = function(x, y, z){ // create a point in three dimensions
	this.x = x;
	this.y = y;
	this.z = z;
	this.rotateX = function(angle){
		var rad, cosa, sina, y, z;
		rad = angle * PI / 180;
		cosa = cos(rad);
		sina = sin(rad);
		y = this.y * cosa - this.z * sina;
		z = this.y * sina + this.z * cosa;
		return new Point3D(this.x, y, z);
	};
	this.rotateY = function(angle){
		var rad, cosa, sina, x, z;
		rad = angle * PI / 180;
		cosa = cos(rad);
		sina = sin(rad);
		z = this.z * cosa - this.x * sina;
		x = this.z * sina + this.x * cosa;
		return new Point3D(x, this.y, z);
	};
	this.rotateZ = function(angle){
		var rad, cosa, sina, x, y;
		rad = angle * PI / 180;
		cosa = cos(rad);
		sina = sin(rad);
		x = this.x * cosa - this.y * sina;
		y = this.x * sina + this.y * cosa;
		return new Point3D(x, y, this.z);
	};
	this.project = function(viewWidth, viewHeight, fov, viewDistance){
		var factor, x, y;
		factor = fov / (viewDistance + this.z);
		x = this.x * factor + viewWidth / 2;
		y = this.y * factor + viewHeight / 2;
		return new Point3D(x, y, this.z);
	};
},
cube3D = function(xPos, yPos, width, height, angle, cubePOV, cubeViewDistance, cubeFaceColors){ // draw a 3d cube
	var i = 0, t = [], avg_z = [], vertices, faces, f;
	xPos -= c.W / 2;
	yPos -= c.H / 2;
	vertices = [
		new Point3D(-1, 1, -1),
		new Point3D(1, 1, -1),
		new Point3D(1, -1, -1),
		new Point3D(-1, -1, -1),
		new Point3D(-1, 1, 1),
		new Point3D(1, 1, 1),
		new Point3D(1, -1, 1),
		new Point3D(-1, -1, 1)
	];
	faces = [
		[0, 1, 2, 3],
		[1, 5, 6, 2],
		[5, 4, 7, 6],
		[4, 0, 3, 7],
		[0, 4, 5, 1],
		[3, 2, 6, 7]
	];
	for (i = 0; i < vertices.length; i++) {
		var v = vertices[i];
		var r = v.rotateX(angle).rotateY(angle);
		var p = r.project(width, height, cubePOV, cubeViewDistance);
		t.push(p);
	}
	for (i = 0; i < faces.length; i++) {
		f = faces[i];
		avg_z[i] = {
			'index': i,
			'z': (t[f[0]].z + t[f[1]].z + t[f[2]].z + t[f[3]].z) / cubeViewDistance
		};
	}
	avg_z.sort(function(a, b) {
		return b.z - a.z;
	});
	for (i = 0; i < faces.length; i++) {
		f = faces[avg_z[i].index];
		fill(cubeFaceColors[avg_z[i].index]);
		engage();
		ctx.moveTo(t[f[0]].x + xPos, t[f[0]].y + yPos);
		ctx.lineTo(t[f[1]].x + xPos, t[f[1]].y + yPos);
		ctx.lineTo(t[f[2]].x + xPos, t[f[2]].y + yPos);
		ctx.lineTo(t[f[3]].x + xPos, t[f[3]].y + yPos);
		paint();
	}
},
/* Math */
random = function(low, high){ // generate a random number
	return Math.floor(Math.random() * (high - low + 1)) + low;
},
randomDouble = function(low, high){ // generate a random double
	if (arguments.length === 0) {
		return Math.random();
	}
	return Math.random() * (high - low) + low;
},
randomBoolean = function(){ // generate a random boolean
	return Math.random() < 0.5;
},
randomElement = function(array){ // return a random element from an array
	return array[random(0, array.length - 1)];
},
min = function(array){ // return min element from an array or arguments
	if (1 < arguments.length) {
		array = [].slice.call(arguments);
	}
	return Math.min.apply(null, array);
},
max = function(array){ // return max element from an array or arguments
	if (1 < arguments.length) {
		array = [].slice.call(arguments);
	}
	return Math.max.apply(null, array);
},
isOdd = function(num){ // return boolean for if number is odd
	return num & 1;
},
isEven = function(num){ // return boolean for if number is even
	return !(num & 1);
},
floor = function(num){ // return floor of number
	return Math.floor(num);
},
ceil = function(num){ // return ceil of number
	return Math.ceil(num);
},
round = function(num){ // return ronud of number
	return Math.round(num);
},
dist = function(x1, y1, x2, y2){ // calculates the distance between two points
	var xs = x2 - x1, ys = y2 - y1;
	return Math.sqrt(xs * xs + ys * ys);
},
diff = function(num1, num2){
	return num2 - num1;
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
time = function(){ // return current time in milliseconds
	return 1 * new Date();
},
timeSeconds = function(){ // return current time in seconds
	return 1 * new Date() / 1E3;
},
hour = function(){ // return current hour
	return new Date().getHours();
},
minute = function(){ // return current minute
	return new Date().getMinutes();
},
second = function(){ // return current second
	return new Date().getSeconds();
},
/* Coloring */
background = function(r, g, b, a){ // set the background color
	var oldFillStyle = c.fillStyle;
	if (1 < arguments.length) {
		c.background = "rgba(" + r + ", " + g + ", " + b + ", 1)";
	} else {
		c.background = r;
	}
	c.fillStyle = c.background;
	engage();
	ctx.fillRect(0, 0, c.W, c.H);
	paint();
	c.fillStyle = oldFillStyle;
},
fill = function(r, g, b, a){ // fill color for shapes / text color
	c.doFill = true;
	if (1 < arguments.length) {
		c.fillStyle = "rgba(" + r + ", " + g + ", " + b + ", 1)";
	} else {
		c.fillStyle = r;
	}
},
noFill = function(){ // no fill for shapes
	c.doFill = false;
},
stroke = function(r, g, b, a){ // outline color for shapes / text color
	c.doStroke = true;
	if (1 < arguments.length) {
		c.strokeStyle = "rgba(" + r + ", " + g + ", " + b + ", 1)";
	} else {
		c.strokeStyle = r;
	}
},
strokeWeight = function(thickness){ // outline width for shapes
	c.doStroke = true;
	c.lineWidth = thickness;
	c.lineWidthHalf = thickness / 2;
},
noStroke = function(){ // no outline for shapes
	c.doStroke = false;
},
color = function(r, g, b, a){ // store a color in a variable
	if (1 < arguments.length) {
		return "rgba(" + r + ", " + g + ", " + b + ", 1)";
	} else {
		return r;
	}
},
hexToRgb = function(hex){ // convert hex color code to rgb color code
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
},
hsvToRgb = function(h, s, v){ // convert hsv color code to rgb color code
	var r, g, b;
	var i = Math.floor(h * 6);
	var f = h * 6 - i;
	var p = v * (1 - s);
	var q = v * (1 - f * s);
	var t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
	return [Math.ceil(r * 255), Math.ceil(g * 255), Math.ceil(b * 255)];
},
rgbToHsl = function(r, g, b){ // convert rgb color code to hsl color code
	r /= 255, g /= 255, b /= 255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;
	if (max === min) {
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}
	return [h, s, l];
},
hslToRgb = function(h, s, l){ // convert hsl color code to rgb color code
	var r, g, b;
	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		var hue2rgb = function(p, q, t){
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};
		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	return [Math.ceil(r * 255), Math.ceil(g * 255), Math.ceil(b * 255)];
},
naiveRandomValueForColor = function(){ // naive random color value
	return random(0, 255);
},
randomValueForColor = function(){ // random color value using arc4random
	return (Math.random() * 4294967296) % 256.0;
},
randomColor = function(){ // store a random color in a variable
	return color(randomValueForColor(0, 255), randomValueForColor(0, 255), randomValueForColor(0, 255));
},
naiveRandomColor = function(){ // store a naive random color in a variable
	return color(naiveRandomValueForColor(), naiveRandomValueForColor(), naiveRandomValueForColor());
},
randomPastelColor = function(){ // store a random pastel color in a variable
	var r = (Math.round(Math.random() * 127) + 127).toString(16);
	var g = (Math.round(Math.random() * 127) + 127).toString(16);
	var b = (Math.round(Math.random() * 127) + 127).toString(16);
	return color('#' + r + g + b);
},
randomGoldenRatioColor = function(){ // store a random color in a variable using the golden ratio
	var goldenRatioConjugate = 0.618033988749895;
	var hue = Math.random();
	hue += goldenRatioConjugate;
	hue %= 1;
	return color.apply(null, hsvToRgb(hue, 0.5, 0.95));
},
randomToneByColor = function(r, g, b){ // store a random color in a variable with the same color tone
	var hsl = rgbToHsl(r, g, b);
	var newHsl = [Math.min(hsl[0] * randomDouble(0.95, 1.05), 1), hsl[1] * randomDouble(0.7, 1), Math.min(hsl[2] * randomDouble(0.8, 1.2), 1)];
	return color.apply(null, hslToRgb(newHsl[0], newHsl[1], newHsl[2]));
},
lineCap = function(lineCap){ // sets the style of end caps for a line [butt, round, square]
	c.lineCap = lineCap;
},
alpha = function(alpha){ // change the opacity of all elements in canvas
	c.globalAlpha = alpha;
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
	c.strokeWeight = oldStrokeWeight;
},
textFont = function(font, size){ // change the font of the text
	c.fontStyle = font;
	c.fontSize = size;
	c.font = size + "px " + font;
},
textSize = function(size){ // change the size of the text
	c.textSize = size;
	c.font = size + "px " + c.fontStyle;
},
/* Misc */
grid = function(interval){ // draw a grid of vertical and horizontal lines with equal spacing interval between each line
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
},
gridCoordinates = function(interval){ // return the coordinates of each line intersection that forms a grid
	var coordinates = [];
	if (!interval) {
		interval = 10;
	}
	for (var x = c.O; x <= c.W; x += interval) { // vertical
		for (var y = c.O; y <= c.H; y += interval) { // horizontal
			coordinates.push([x, y]);
		}
	}
	return coordinates;
},
cloneArray = function(array){ // return a copy of the supplied array
	return array.slice(0);
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
			canvas.width = c.W = w;
			canvas.height = c.H = h;
		}
		c.X = this.canvas.offsetLeft;
		c.Y = this.canvas.offsetTop;
	};

	this.compute = function(){
		if (document.defaultView && document.defaultView.getComputedStyle) {
			stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(curElement, null)["paddingLeft"], 10) || 0;
			stylePaddingTop = parseInt(document.defaultView.getComputedStyle(curElement, null)["paddingTop"], 10) || 0;
			styleBorderLeft = parseInt(document.defaultView.getComputedStyle(curElement, null)["borderLeftWidth"], 10) || 0;
			styleBorderTop = parseInt(document.defaultView.getComputedStyle(curElement, null)["borderTopWidth"], 10) || 0;
		}
	};

	this.attachHandlers = function(){
		addEvent(canvas, 'mousemove', onMouseMoved);
		addEvent(canvas, 'mousedown', onMousePressed);
		addEvent(canvas, 'mouseup', onMouseReleased);
		addEvent(canvas, 'click', onMouseClicked);
		if (isTouchEnabled) {
			addEvent(canvas, 'touchmove', onTouchMoved);
			addEvent(canvas, 'touchstart', onTouchStart);
			addEvent(canvas, 'touchend', onTouchEnd);
		}
		addEvent(window, 'keydown', onKeyDown);
		addEvent(window, 'keyup', onKeyUp);
		addEvent(window, 'keypress', onKeyPressed);
		addEvent(window, 'orientationchange', onOrientationChanged);
	};

	this.detachHandlers = function(detachCanvas, detachWindow){
		if (detachCanvas) {
			removeEvent(canvas, 'mousemove', onMouseMoved);
			removeEvent(canvas, 'mousedown', onMousePressed);
			removeEvent(canvas, 'mouseup', onMouseReleased);
			removeEvent(canvas, 'click', onMouseClicked);
			if (isTouchEnabled) {
				removeEvent(canvas, 'touchmove', onTouchMoved);
				removeEvent(canvas, 'touchstart', onTouchStart);
				removeEvent(canvas, 'touchend', onTouchEnd);
			}
		}
		if (detachWindow) {
			removeEvent(window, 'keydown', onKeyDown);
			removeEvent(window, 'keyup', onKeyUp);
			removeEvent(window, 'keypress', onKeyPressed);
			removeEvent(window, 'orientationchange', onOrientationChanged);
		}
	};

	this.destroy = function(){
		this.detachHandlers(true, true);
		this.ctx = null;
		this.setup = nop;
		this.draw = nop;
	};
}

var onMouseMoved = function(e){
	updateMousePosition(curElement, e);
	mouseMoved(e);
};

var onMousePressed = function(e){
	mouseIsPressed = true;
	mousePressed(e);
};

var onMouseReleased = function(e){
	mouseIsPressed = false;
	mouseReleased(e);
};

var onMouseClicked = function(e){
	mouseClicked(e);
};

var onTouchMoved = function(e){
	e.preventDefault();
	touchesList = e.targetTouches;
	touchMoved(e);
};

var onTouchStart = function(e){
	screenIsTouched = true;
	numberOfTouches = e.targetTouches.length;
	touchesList = e.targetTouches;
	touchStart(e);
};

var onTouchEnd = function(e){
	if (e.targetTouches.length === 0) {
		screenIsTouched = false;
	}
	numberOfTouches = e.targetTouches.length;
	touchesList = e.targetTouches;
	touchEnd(e);
};

// addEventListener('touchmove', function(e){
// 	if (e.targetTouches.length == 1) {
// 		var touch = e.targetTouches[0];
// 		console.log('Touch X', touch.pageX);
// 		console.log('Touch Y', touch.pageY);
// 	}
// }, false);

// addEventListener('touchmove', function(e){
// 	for (var i = 0; i < e.touches.length; i++) {
// 		var touch = e.touches[i];
// 		ctx.beginPath();
// 		ctx.arc(touch.pageX, touch.pageY, 20, 0, TWO_PI, true);
// 		ctx.fill();
// 		ctx.stroke();
// 	}
// }, false);

var onKeyDown = function(e){
	keyCode = keycode.getKeyCode(e);
	keyCodeList[keyCode] = true;
	keyDown(e);
	e.preventDefault();
};

var onKeyUp = function(e){
	keyCodeList[keycode.getKeyCode(e)] = false;
	keyIsPressed = false;
	keyCode = 0;
	keyUp(e);
	e.preventDefault();
};

var onKeyPressed = function(e){
	console.log(e);
	keyIsPressed = true;
	keyPressed(e);
	e.preventDefault();
};

var onOrientationChanged = function(){
	if (Math.abs(window.orientation) === 90) {
		currentOrientation = 'Landscape';
	} else {
		currentOrientation = 'Portrait';
	}
	maxWidth = window.innerWidth || docElem.clientWidth || docBody.clientWidth;
	maxHeight = window.innerHeight || docElem.clientHeight || docBody.clientHeight;
	if (c.fullScreen) {
		size(maxWidth, maxHeight);
	}
	orientationChanged();
};

window.onresize = function(){
	maxWidth = window.innerWidth || docElem.clientWidth || docBody.clientWidth;
	maxHeight = window.innerHeight || docElem.clientHeight || docBody.clientHeight;
	if (c.fullScreen) {
		size(maxWidth, maxHeight);
	}
	windowResized();
};
