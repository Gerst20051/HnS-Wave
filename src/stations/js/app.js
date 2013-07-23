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
	})//,
	//adapter: 'DS.FixtureAdapter'
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
    title: '20 Years Of Planet E Essential Mix',
    url: 'https://api.soundcloud.com/r_co/carl-craig-20-years-of-planet'
  },
  {
    id: 101,
    artistid: 1,
    title: 'Live @ Mixmag Live',
    url: 'https://api.soundcloud.com/planetedetroit/carl-craig-live-mixmag-live-19'
  },
  {
    id: 200,
    artistid: 2,
    title: 'Stacey Pullen Live',
    url: 'https://api.soundcloud.com/staceypullen/stacey-pullen-live'
  }
];