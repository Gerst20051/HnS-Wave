window.App = Ember.Application.create({
	LOG_TRANSITIONS: true
});
window.aC = {
	isLocal: true,
	getNamespace: function(){
		return (this.isLocal) ? 'git/hns-wave/src/stations/rest' : 'stations/rest';
	}
};

Ember.onerror = function(error){
	console.log(error);
};

// Routes

App.Router.map(function(){
	this.resource('artists', function(){
		this.resource('artists.tracks', { path: ':artist_id/tracks' }, function(){
			this.route('playing', { path: ':tracks_id' });
		});
	});
	this.route('profile');
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

App.ArtistsTracksRoute = Ember.Route.extend({
	model: function(param){
		return App.Artist.find(param['artist_id']);
	},
	setupController: function(controller, model){
		controller.set('content', model);
	}
});

App.ArtistsTracksPlayingRoute = Ember.Route.extend({
	setupController: function(controller, model){
		controller.set('content', model);
	}
});

// Controllers

App.ArtistsController = Ember.ArrayController.extend({
	addAndSearch: function(artist){
		App.addArtist(artist);
	}
});

App.SearchController = Ember.Controller.extend({
	needs: 'artists',
	search: function(query) {
		this.get('controllers.artists').addAndSearch(query);
	}
});

// Views

App.ArtistsTracksPlayingView = Ember.View.extend({
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
	revision: 12,
	adapter: DS.RESTAdapter.create({
		namespace: window.aC.getNamespace()
	})
});
/*
DS.RESTAdapter.configure("plurals", {
	tracks: "tracks"
});
*/
App.Artist = DS.Model.extend({
	name: DS.attr('string'),
	tracks: DS.hasMany('App.Tracks')
});

App.Tracks = DS.Model.extend({
	artistid: DS.belongsTo('App.Artist'),
	videoid: DS.attr('string'),
	title: DS.attr('string'),
	url: DS.attr('string'),
	img: DS.attr('string'),
	duration: DS.attr('number')
});

App.addArtist = function(name){
	var artist = App.Artist.createRecord({ id: 3, name: name });
	var track = App.Tracks.createRecord({
		id: 300,
		artistid: 3,
		videoid: "vid",
		title: 'Jungle Mix',
		url: 'https://api.soundcloud.com/justin-martin-music/justin-martin-jungle-mix',
		img: 'http://i.ytimg.com/vi/zWktTuB41Ww/default.jpg',
		duration: 259
	});
	artist.get('tracks').pushObject(track);
};

