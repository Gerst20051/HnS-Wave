/*
 *********************************************
 **** SoundEngine created by Andrew Gerst ****
 *********************************************
 */

Function.prototype.curry = function(){
	var fn = this, args = Array.prototype.slice.call(arguments);
	return function(){
		return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
	};
};

var mySound,
	sound = nop, // play sound
	noSound = nop, // pause sound and reset to beginning
	pauseSound = nop, // pause sound
	stopSound = nop, // make sound unplayable
	unStopSound = nop, // make sound playable
	loadCollection = nop,
	loadCollections = nop,
	SoundEngine = function(){
	this.pathToSounds = 'audio/';
	this.soundCollections = {
		'aliens': [
			['alien_cyborg_roar','.mp3'],
			['alien_growl_melee','.mp3'],
			['alien_growl','.mp3'],
			['alien_steps_squishy','.mp3'],
			['alien_whoosh','.mp3']
		],
		'background': [
			['digital_soldier','.mp3'],
			['house_motion','.mp3'],
			['joy_ride','.mp3'],
			['techno','.mp3']
		],
		'doors': [
			['door_motorized_open','.mp3'],
			['door_motorized','.mp3'],
			['hatch_locking','.mp3'],
			['stone_door_slide','.mp3']
		],
		'explosions': [
			['castle_door_smash_crash','.mp3'],
			['earth_crack_rumble','.mp3'],
			['energy_explosion','.mp3'],
			['explosion_enormous','.mp3'],
			['explosion_ice','.mp3'],
			['explosion_shellflyin','.mp3'],
			['ice_cracking','.mp3'],
			['iceman_hit','.mp3'],
			['large_explosion','.mp3'],
			['lightning_strike','.mp3']
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
			['alien_squeal_1','.mp3'],
			['alien_squeal_2','.mp3'],
			['creature_hit','.mp3'],
			['creature_roar_1','.mp3'],
			['creature_roar_2','.mp3'],
			['creature_scream_1','.mp3'],
			['creature_scream_2','.mp3'],
			['creature_snarl_1','.mp3'],
			['creature_snarl_2','.mp3'],
			['dr_evil_rage_roar','.mp3'],
			['dragon_roar_1','.mp3'],
			['dragon_roar_2','.mp3'],
			['dragon_roar_3','.mp3'],
			['dragon_roar_wings','.mp3'],
			['dragon_roar','.mp3'],
			['giant_bug_attack','.mp3'],
			['giant_bug_die','.mp3'],
			['giant_bug_roar','.mp3'],
			['giant_snake_attack','.mp3'],
			['giant_snake_pain','.mp3'],
			['giant_snake_rattle','.mp3'],
			['giant_snake_roar','.mp3'],
			['hairy_monster_die','.mp3'],
			['hairy_monster_pain','.mp3'],
			['hairy_monster_roar','.mp3'],
			['hit_blood_spat','.mp3'],
			['monster_demon_growl_breathe_1','.mp3'],
			['monster_demon_growl_breathe_2','.mp3'],
			['monster_demon_growl_talk','.mp3'],
			['monster_growl_agitate','.mp3'],
			['monster_growl_stress','.mp3'],
			['monster_ice_freeze','.mp3'],
			['monster_squidbaby_attacks','.mp3'],
			['monster_squidbaby_death','.mp3'],
			['monster_squidbaby_scream','.mp3'],
			['rockbeast_die','.mp3'],
			['rockbeast_hit','.mp3'],
			['tree_monster_die','.mp3'],
			['tree_monster_pain','.mp3']
		],
		'sci-fi': [
			['crash_robot_debris','.mp3'],
			['futuristic_scanner','.mp3'],
			['giant_fan_activate','.mp3'],
			['liftoff_jet_fly','.mp3'],
			['robot_activate','.mp3'],
			['robot_explode','.mp3'],
			['robot_smash','.mp3'],
			['robot_walk','.mp3'],
			['saucer_fly','.mp3'],
			['servo_robotic_small','.mp3'],
			['space_jet_fly','.mp3'],
			['spell_decay_dust','.mp3'],
			['teleport_activate','.mp3'],
			['vehicle_troop_carrier','.mp3'],
			['vtol_jet_flying','.mp3']
		],
		'weapons': [
			['archer_kill_soldier','.mp3'],
			['arrow_hit_bloody','.mp3'],
			['cannon_blast','.mp3'],
			['energy_charge_gun','.mp3'],
			['flakgun_shoot','.mp3'],
			['gooprifle_charge','.mp3'],
			['grenade_launch','.mp3'],
			['gun_change_1','.mp3'],
			['gun_change_2','.mp3'],
			['gun_change_3','.mp3'],
			['gun_change_4','.mp3'],
			['gun_pistol_1','.mp3'],
			['gun_pistol_2','.mp3'],
			['gun_plasmafire','.mp3'],
			['gun_shell_drop','.mp3'],
			['gun_shoot_metal','.mp3'],
			['gun_shotgun_1','.mp3'],
			['gun_shotgun_2','.mp3'],
			['laserbeam_large','.mp3'],
			['laserbeam','.mp3'],
			['lasergun_cannon','.mp3'],
			['lasergun_fire','.mp3'],
			['laserpulse_shot','.mp3'],
			['laserpulse_weapon','.mp3'],
			['missle_firing_1','.mp3'],
			['missle_firing_2','.mp3'],
			['missle_gasfire','.mp3'],
			['missle_launch_1','.mp3'],
			['missle_launch_2','.mp3'],
			['missle_shoot_large','.mp3'],
			['missle_shoot_small','.mp3'],
			['rocket_launcher','.mp3'],
			['shockrifle_shoot','.mp3'],
			['shotgun_pump_action','.mp3'],
			['sword_metal_swing_hit','.mp3']
		],
	};

	this.init = function(){
		this.loadAllSoundsFromCollection('main');
		window.loadSound = this.loadSoundFromCollection.bind(this);
		window.loadCollection = this.loadAllSoundsFromCollection.bind(this);
		window.loadCollections = this.loadSoundCollections.bind(this);
		window.sound = this.playSound.bind(this);
		window.noSound = this.resetAudio.bind(this);
		window.pauseSound = this.pauseAudio.bind(this);
		window.stopSound = this.makeAudioUnPlayable.bind(this);
		window.unStopSound = this.makeAudioPlayable.bind(this);
	};

	this.getAudioArray = function(soundname, returnCollection){
		var collections = this.soundCollections, collection, sound;
		for (collection in collections) {
			for (sound in collections[collection]) {
				if (collections[collection][sound][0] === soundname) {
					if (returnCollection === true) {
						return [collections[collection][sound], collection];
					} else {
						return collections[collection][sound];
					}
				}
			}
		}
	};

	this.getAudioFromArray = function(audioArray){
		return audioArray[2];
	};

	this.loadAudio = function(url){
		var audio = new Audio();
		audio.canplay = false;
		audio.playable = true;
		audio.addEventListener('canplaythrough', function(){
			audio.canplay = true;
			audio.callback && audio.callback();
		}, false);
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

	this.loadSoundCollections = function(){
		var _this = this, collections = [].slice.call(arguments);
		collections.forEach(function(collection, index){
			_this.loadAllSoundsFromCollection(collection);
		});
	};

	this.playAudio = function(audio, num){
		if (audio && audio.playable && audio.canplay) {
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

	this.playSound = function(soundname, num){
		var audioArray = this.getAudioArray(soundname), audio;
		if (audioArray) {
			audio = this.getAudioFromArray(audioArray);
			if (audio && audio.canplay) {
				this.playAudio(audio, num);
				return audio;
			} else {
				return this.loadAndPlaySound(soundname, num);
			}
		}
	};

	this.loadAndPlaySound = function(soundname, num){
		var audioArrayAndCollection = this.getAudioArray(soundname, true), audioArray, audio;
		if (audioArrayAndCollection && audioArrayAndCollection.length === 2 && audioArrayAndCollection[0]) {
			audioArray = audioArrayAndCollection[0];
			audio = this.getAudioFromArray(audioArray);
			collection = audioArrayAndCollection[1];
			if (audio && audio.canplay === false) {
				audio.callback = this.playAudio.curry(audio, num);
				return audio;
			} else {
				audioArray[2] = this.loadAudio(this.pathToSounds + collection + '/' + audioArray.join(''));
				audioArray[2].callback = this.playAudio.curry(audioArray[2], num);
				return audioArray[2];
			}
		}
	};

	this.resetAudio = function(soundname){
		var audioArray = this.getAudioArray(soundname), audio;
		if (audioArray) {
			audio = this.getAudioFromArray(audioArray);
			if (audio && audio.canplay) {
				audio.pause();
				audio.currentTime = 0;
			}
		}
	};

	this.pauseAudio = function(soundname){
		var audioArray = this.getAudioArray(soundname), audio;
		if (audioArray) {
			audio = this.getAudioFromArray(audioArray);
			if (audio && audio.canplay) {
				audio.pause();
			}
		}
	};

	this.makeAudioUnPlayable = function(soundname){
		var audioArray = this.getAudioArray(soundname), audio;
		if (audioArray) {
			audio = this.getAudioFromArray(audioArray);
			if (audio) {
				audio.playable = false;
				audio.pause();
			}
		}
	};

	this.makeAudioPlayable = function(soundname){
		var audioArray = this.getAudioArray(soundname), audio;
		if (audioArray) {
			audio = this.getAudioFromArray(audioArray);
			if (audio) {
				audio.playable = true;
			}
		}
	};
};

mySoundEngine = new SoundEngine();
mySoundEngine.init();
