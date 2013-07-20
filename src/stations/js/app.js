var App = Ember.Application.create();

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
		setTimeout(function(){
			widget = SC.Widget(document.getElementById('sc-widget'));
			widget.play();
		}, 1000);
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
	revision: 11,
	adapter: 'DS.FixtureAdapter'
});

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

App.Artist.FIXTURES = [
	{
		id: 1,
		name: 'Carl Craig',
		tracks: [100,101,102]
	},
	{
		id: 2,
		name: 'Stacey Pullen',
		tracks: [200,201,202]
	}
];

App.Tracks.FIXTURES = [
	{
		id: 100,
		artistid: 1,
		videoid: "vid",
		title: '20 Years Of Planet E Essential Mix',
		url: 'https://api.soundcloud.com/r_co/carl-craig-20-years-of-planet',
		img: 'http://i.ytimg.com/vi/zWktTuB41Ww/default.jpg',
		duration: 259
	},
	{
		id: 101,
		artistid: 1,
		videoid: "vid",
		title: 'Live @ Mixmag Live',
		url: 'https://api.soundcloud.com/planetedetroit/carl-craig-live-mixmag-live-19',
		img: 'http://i.ytimg.com/vi/zWktTuB41Ww/default.jpg',
		duration: 259
	},
	{
		id: 102,
		artistid: 1,
		videoid: "vid",
		title: 'FACT mix 345',
		url: 'https://api.soundcloud.com/selftitledmag/carl-craig-fact-mix-345',
		img: 'http://i.ytimg.com/vi/zWktTuB41Ww/default.jpg',
		duration: 259
	},
	{
		id: 200,
		artistid: 2,
		videoid: "vid",
		title: 'Stacey Pullen Live',
		url: 'https://api.soundcloud.com/staceypullen/stacey-pullen-live',
		img: 'http://i.ytimg.com/vi/zWktTuB41Ww/default.jpg',
		duration: 259
	},
	{
		id: 201,
		artistid: 2,
		videoid: "vid",
		title: 'Get Up (Original)',
		url: 'https://api.soundcloud.com/staceypullen/stacey-pullen-get-up-original',
		img: 'http://i.ytimg.com/vi/zWktTuB41Ww/default.jpg',
		duration: 259
	},
	{
		id: 202,
		artistid: 2,
		videoid: "vid",
		title: 'Circus Act',
		url: 'https://api.soundcloud.com/staceypullen/sets/bfr007-circus-act-ep',
		img: 'http://i.ytimg.com/vi/zWktTuB41Ww/default.jpg',
		duration: 259
	}
];

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

