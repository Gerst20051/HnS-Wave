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
	this.resource('profile');
	// URL: /profile
	// RouteName: profile
	// Controller: ProfileController
	// Route: ProfileRoute
	// Template: profile
	this.resource('artists', function(){
		// URL: /artists
		// RouteName: artists OR artists.index
		// Controller: ArtistsController OR ArtistsIndexController
		// Route: ArtistsRoute OR ArtistsIndexRoute
		// Template: artists OR artists/index
		this.resource('artists.artist', { path: ':artist_id' }, function(){
			// URL: /artists/:artist_id
			// RouteName: artists.index OR artist.index
			// Controller: ArtistsIndexController OR ArtistIndexController
			// Route: ArtistsIndexRoute OR ArtistIndexRoute
			// Template: artists/index OR artist/index
			this.resource('artist.tracks', function(){
				// URL: /artists/:artist_id/tracks
				// RouteName: artists.tracks OR artists.artist.tracks OR artist.tracks
				// Controller: ArtistsTracksController OR ArtistsArtistTracksController OR ArtistTracksController
				// Route: ArtistsTracksRoute OR ArtistsArtistTracksRoute OR ArtistTracksRoute
				// Template: artists/tracks OR artists/artist/tracks OR artist/tracks
				this.route('playing', { path: ':track_id' });
					// URL: /artists/:artist_id/tracks/:track_id
					// RouteName: tracks.index
					// Controller: TracksIndexController
					// Route: TracksIndexRouteRoute
					// Template: tracks/index
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
	model: function(params){
		alert("Artists");
		console.log(params);
		return App.Artist.find();
	}
});

App.ArtistsIndexRoute = Ember.Route.extend({
	model: function(params){
		alert("ArtistsIndex");
		console.log(params);
		return App.Artist.find(params.artist_id);
	},
	setupController: function(controller, tracks){
		controller.set('content', tracks);
	},
	redirect: function(){
		//this.transitionTo('tracks');
	}
});

App.ArtistsArtistIndexRoute = Ember.Route.extend({
	model: function(params){
		alert("ArtistsArtistIndex");
		console.log(params);
		return App.Artist.find(params.artist_id);
	},
	setupController: function(controller, tracks){
		controller.set('content', tracks);
	},
	redirect: function(){
		this.transitionTo('tracks');
	}
});

App.ArtistIndexRoute = Ember.Route.extend({
	model: function(params){
		alert("ArtistIndex");
		console.log(params);
		return App.Artist.find(params.artist_id);
	},
	setupController: function(controller, tracks){
		controller.set('content', tracks);
	},
	redirect: function(){
		this.transitionTo('tracks');
	}
});

App.ArtistTracksRoute = Ember.Route.extend({
	model: function(params){
		alert("ArtistTracks");
		console.log(params);
		return App.Artist.find(params.artist_id);
	},
	setupController: function(controller, tracks){
		controller.set('content', tracks);
	}
});


App.ArtistTracksIndexRoute = Ember.Route.extend({
	model: function(params){
		alert("ArtistTracksIndex");
		console.log(params);
		return App.Artist.find(params.artist_id);
	},
	setupController: function(controller, tracks){
		controller.set('content', tracks);
	}
});

App.TracksPlayingRoute = Ember.Route.extend({
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

