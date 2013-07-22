window.App = Ember.Application.create({
	LOG_TRANSITIONS: true,
	currentPath: '',
	isLocal: true,
	namespace: function(){
		return (App.get('isLocal')) ? 'git/hns-wave/src/stations/rest' : 'stations/rest';
	}
});

Ember.onerror = function(error){
	console.log(error);
};

/*
App.ApplicationController = Ember.Controller.extend({
	updateCurrentPath: function() {
		App.set('currentPath', this.get('currentPath'));
	}.observes('currentPath')
});
*/

// Routes

App.Router.map(function(){
	/*
	this.route('artists', { path: '/artists' });
	this.route('artist', { path: '/artists/:artist_id' });
	this.route('artists.tracks', { path: '/artists/:artist_id/tracks' });
	*/
	this.resource('profile');
	this.resource('artists', { path: '/artists' }, function(){
		this.resource('artist', { path: '/:artist_id' }, function(){
			this.resource('tracks', { path: '/tracks' }, function(){
				this.route('playing', { path: '/:track_id' });
			});
		});
	});
});

App.IndexRoute = Ember.Route.extend({
	redirect: function(){
		this.transitionTo('artists');
	}
});

App.ArtistsRoute = Ember.Route.extend({
	model: function(){
		return App.Artist.find();
	}
});
/*
App.ArtistRoute = Ember.Route.extend({
	redirect: function(){
		this.transitionTo('tracks');
	}
});
*/
App.ArtistTracksIndexRoute = Ember.Route.extend({
	model: function(params){
		return App.Artist.find(params.artist_id);
	},
	setupController: function(controller, tracks){
		controller.set('content', tracks);
	}
});

App.TracksIndexRoute = Ember.Route.extend({
	model: function(params){
		return App.Artist.find(params.artist_id);
	},
	setupController: function(controller, tracks){
		controller.set('content', tracks);
	}
});

App.TracksRoute = Ember.Route.extend({
	model: function(params){
		return App.Artist.find(params.artist_id);
	},
	setupController: function(controller, tracks){
		controller.set('content', tracks);
	}
});

App.ArtistPlayingRoute = Ember.Route.extend({
	setupController: function(controller, track){
		controller.set('content', track);
	}
});

// Controllers

App.ArtistsController = Ember.ArrayController.extend({
	addAndSearch: function(artist){
		App.addArtist(artist);
	}
});

App.TrackController = Ember.ObjectController.extend({
	needs: "artist"
});

/*
App.ArtistsTracksController = Ember.Object.create({
	content: null,
	populate: function(){
		var controller = this;
		$.getJSON(App.get('currentPath'), function(data){
			controller.set('content', data);
		});
	}
});
*/

App.SearchController = Ember.Controller.extend({
	needs: 'artists',
	search: function(query){
		this.get('controllers.artists').addAndSearch(query);
	}
});

// Views

App.TracksPlayingView = Ember.View.extend({
	scBaseUrl: 'https://w.soundcloud.com/player/',
	scTrackSourceUrlBinding: 'controller.model.url',
	scIframeSourceUrl: function(){
		return this.scBaseUrl + '?url=' + this.scTrackSourceUrl;
	}.property()
});

App.SearchView = Ember.TextField.extend({
	valueBinding: 'query',
	didInsertElement: function(){
		this.$().focus();
	},
	clearTextBox: function(){
		this.$().val('');
	},
	change: function(e){
		this.controller.search(this.query);
		this.clearTextBox();
	}
});

App.Store = DS.Store.extend({
	revision: 13,
	adapter: DS.RESTAdapter.create({
		namespace: App.get('namespace')()
	})
});
/*
DS.RESTAdapter.configure("plurals", {
	tracks: "tracks"
});
*/
App.Artist = DS.Model.extend({
	name: DS.attr('string'),
	tracks: DS.hasMany('App.Track')
});

App.Track = DS.Model.extend({
	artistid: DS.attr('number'),
	videoid: DS.attr('string'),
	title: DS.attr('string'),
	url: DS.attr('string'),
	img: DS.attr('string'),
	duration: DS.attr('number'),
	tracks: DS.belongsTo('App.Artist')
});

App.addArtist = function(name){
	var artist = App.Artist.createRecord({ id: 33333, name: name });
	var track = App.Track.createRecord({
		id: 300333,
		artistid: 33333,
		videoid: "vid",
		title: 'Jungle Mix',
		url: 'https://api.soundcloud.com/justin-martin-music/justin-martin-jungle-mix',
		img: 'http://i.ytimg.com/vi/zWktTuB41Ww/default.jpg',
		duration: 259
	});
	artist.get('tracks').pushObject(track);
};

