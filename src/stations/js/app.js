window.App = Ember.Application.create({
	LOG_ACTIVE_GENERATION: true,
	LOG_TRANSITIONS: true,
	LOG_VIEW_LOOKUPS: true,
	isLocal: true,
	namespace: function(){
		return (App.get('isLocal')) ? 'git/hns-wave/src/stations/rest' : 'stations/rest';
	}
});

Ember.onerror = function(error){
	console.log(error);
	console.log(App.Router.router.recognizer.names);
};

// Routes

App.Router.map(function(){
	this.resource('profile');
	this.resource('artists', function(){
		this.resource('artists.tracks', { path: ':artist_id/tracks' }, function(){
			this.route('playing', { path: ':tracks_id' });
		})
	});
});

App.IndexRoute = Ember.Route.extend({
	redirect: function(){
		this.transitionTo('artists');
	}
});

App.ProfileRoute = Ember.Route.extend();

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

// Models

App.Store = DS.Store.extend({
	revision: 13,
	adapter: DS.RESTAdapter.create({
		namespace: App.get('namespace')()
	}),
	adapter: 'DS.FixtureAdapter'
});

App.Artist = DS.Model.extend({
	name: DS.attr('string'),
	tracks: DS.hasMany('App.Tracks')
});

App.Tracks = DS.Model.extend({
	artistid: DS.attr('number'),
	videoid: DS.attr('string'),
	title: DS.attr('string'),
	img: DS.attr('string'),
	duration: DS.attr('number')
});

App.Artist.FIXTURES = [];
App.Tracks.FIXTURES = [];

App.loadFixtures = function(){
	$.getJSON('/'+App.get('namespace')()+'/artists', function(data){
		$.each(data.artists, function(i,v){
			console.log(v);
			App.Artist.createRecord(v);
		});
	});
	$.getJSON('/'+App.get('namespace')()+'/tracks', function(data){
		$.each(data.tracks, function(i,v){
			console.log(v);
			App.Tracks.createRecord(v);
		});
	});
};

App.loadFixtures();