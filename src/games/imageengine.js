/*
 *********************************************
 **** ImageEngine created by Andrew Gerst ****
 *********************************************
 */

Function.prototype.curry = function(){
	var fn = this, args = Array.prototype.slice.call(arguments);
	return function(){
		return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
	};
};

var myImageEngine,
	canvasImage = image || nop,
	image = nop, // display image
	loadCollection = nop,
	loadCollections = nop,
	ImageEngine = function(){
	this.pathToImages = 'images/';
	this.imageCollections = {
		'duckhunt': [
			['background','.png'],
			['crosshair','.png'],
			['flare','.png'],
			['ink_splatter','.png'],
			['much_pain','.png'],
			['turkey','.png']
		],
		'main': [
			['zombie','.png']
		]
	};

	this.init = function(){
		this.loadAllImagesFromCollection('main');
		window.loadImage = this.loadImageFromCollection.bind(this);
		window.loadCollection = this.loadAllImagesFromCollection.bind(this);
		window.loadCollections = this.loadImageCollections.bind(this);
		window.image = this.playImageName.bind(this);
	};

	this.getImageArray = function(imagename, returnCollection){
		var collections = this.imageCollections, collection, image;
		for (collection in collections) {
			for (image in collections[image]) {
				if (collections[collection][image][0] === imagename) {
					if (returnCollection === true) {
						return [collections[collection][image], collection];
					} else {
						return collections[collection][image];
					}
				}
			}
		}
	};

	this.getImageFromArray = function(imageArray){
		return imageArray[2];
	};

	this.loadImage = function(url){
		var image = new Image();
		//image.canplay = false;
		//image.playable = true;
		/*
		audio.addEventListener('canplaythrough', function(){
			audio.canplay = true;
			audio.callback && audio.callback();
		}, false);
		*/
		image.src = url;
		return image;
	};

	this.loadImageFromCollection = function(imagename, collection){
		var images = this.imageCollections[collection], image, key;
		if (images) {
			for (key in images) {
				if (images[key][0] === imagename) {
					image = images[key];
					image[2] = this.loadImage(this.pathToImages + collection + '/' + image.join(''));
					break;
				}
			}
			if (!image) {
				console.log('Image: "' + imagename + '" Unavailable in Collection: "' + collection + '".');
			}
		} else {
			console.log('Image Collection: "' + collection + '" Unavailable.');
		}
	};

	this.loadAllImagesFromCollection = function(collection){
		var images = this.imageCollections[collection], image, key;
		if (images) {
			for (key in images) {
				images[key][2] = this.loadImage(this.pathToImages + collection + '/' + images[key].join(''));
			}
		} else {
			console.log('Image Collection: "' + collection + '" Unavailable.');
		}
	};

	this.loadImageCollections = function(){
		var _this = this, collections = [].slice.call(arguments);
		collections.forEach(function(collection, index){
			_this.loadAllImagesFromCollection(collection);
		});
	};

	this.playImage = function(image, duration){
		if (image && image.playable && image.canplay) {
			image.play();
			if (duration && 0 < --duration) {
				image.remaining = duration;
				/*
				audio.addEventListener('ended', function handler(){
					this.currentTime = 0;
					this.play();
				}, false);
				*/
			}
		}
	};

	this.playImageName = function(imagename, duration){
		if (!imagename) {
			return;
		}
		if (imagename.indexOf('.')) {
			canvasImage.apply(this, [].slice.call(arguments));
		} else {
			var imageArray = this.getImageArray(imagename), image;
			if (imageArray) {
				image = this.getImageFromArray(imageArray);
				if (image && image.canplay) {
					this.playImage(audio, duration);
					return image;
				} else {
					return this.loadAndPlayImage(imagename, duration);
				}
			}
		}
	};

	this.loadAndPlayImage = function(imagename, duration){
		var imageArrayAndCollection = this.getImageArray(imagename, true), imageArray, audio;
		if (imageArrayAndCollection && imageArrayAndCollection.length === 2 && imageArrayAndCollection[0]) {
			imageArray = imageArrayAndCollection[0];
			image = this.getImageFromArray(imageArray);
			collection = imageArrayAndCollection[1];
			if (image && image.canplay === false) {
				image.callback = this.playImage.curry(audio, duration);
				return audio;
			} else {
				imageArray[2] = this.loadImage(this.pathToImages + collection + '/' + imageArray.join(''));
				imageArray[2].callback = this.playImage.curry(imageArray[2], duration);
				return imageArray[2];
			}
		}
	};
};

myImageEngine = new ImageEngine();
myImageEngine.init();
