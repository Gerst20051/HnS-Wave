/*
 *********************************************
 **** SoundEngine created by Andrew Gerst ****
 *********************************************
 */

var mySound,
	sound = nop,
	loadCollection = nop,
	loadCollections = nop,
	SoundEngine = function(){
	this.pathToSounds = 'audio/';
	this.soundCollections = {
		'aliens': [
			[]
		],
		'background': [
			['digital_soldier','.mp3'],
			['house_motion','.mp3'],
			['joy_ride','.mp3'],
			['techno','.mp3']
		],
		'doors': [
			[]
		],
		'explosions': [
			[]
		],
		'main': [
			['click','.wav'],
			['cling','.mp3'],
			['heartbeat','.mp3'],
			['jump','.mp3'],
			['snore','.wav'],
			['stomp','.mp3']
		],
		'monsters': [
			[]
		],
		'sci-fi': [
			[]
		],
		'weapons': [
			[]
		],
	};

	this.init = function(){
		this.loadAllSoundsFromCollection('main');
		window.loadSound = this.loadSoundFromCollection.bind(this);
		window.loadCollection = this.loadAllSoundsFromCollection.bind(this);
		window.loadCollections = this.loadSoundCollections.bind(this);
		window.sound = this.playAudio.bind(this);
	};

	this.getAudioArray = function(soundname){
		var collections = this.soundCollections, collection, sound;
		for (collection in collections) {
			for (sound in collections[collection]) {
				if (collections[collection][sound][0] === soundname) {
					return collections[collection][sound];
				}
			}
		}
	};

	this.getAudio = function(audioArray){
		return audioArray[2];
	};

	this.loadAudio = function(url){
		var audio = new Audio();
		//audio.addEventListener('canplaythrough', this.addToAudioLoaded.bind(this), false);
		audio.src = url;
		return audio;
	};

	this.loadSoundFromCollection = function(soundname, collection){
		var sounds = this.soundCollections[collection], sound, key;
		if (sounds) {
			for (key in sounds) {
				if (sounds[key][0] === soundname) {
					sound = sounds[key];
					sound[2] = this.loadAudio(this.pathToSounds + collection + '/' + sound.join(''));
					break;
				}
			}
			if (!sound) {
				console.log('Sound: "' + soundname + '" Unavailable in Collection: "' + collection + '".');
			}
		} else {
			console.log('Sound Collection: "' + collection + '" Unavailable.');
		}
	};

	this.loadAllSoundsFromCollection = function(collection){
		var sounds = this.soundCollections[collection], sound, key;
		if (sounds) {
			for (key in sounds) {
				sounds[key][2] = this.loadAudio(this.pathToSounds + collection + '/' + sounds[key].join(''));
			}
		} else {
			console.log('Sound Collection: "' + collection + '" Unavailable.');
		}
	};

	this.loadSoundCollections = function(collections){
		var _this = this;
		collections.forEach(function(collection, index){
			_this.loadAllSoundsFromCollection(collection);
		});
	};

	this.playAudio = function(soundname, num){
		var audioArray = this.getAudioArray(soundname), audio;
		if (audioArray) {
			audio = this.getAudio(audioArray);
			audio.play();
			if (num && 0 < --num) {
				audio.remaining = num;
				audio.addEventListener('ended', function handler(){
					this.currentTime = 0;
					this.play();
					if (!--this.remaining) {
						audio.removeEventListener('ended', handler);
					}
				}, false);
			}
		}
	};
};

mySound = new SoundEngine();
mySound.init();
