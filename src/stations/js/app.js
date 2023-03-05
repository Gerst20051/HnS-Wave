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
	model: function(param){
		return App.Artist.find();
	},
	setupController: function(controller, model){
		controller.set('content', model);
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
		$("#ytplayer").attr('src','http://www.youtube.com/embed/'+model.get('videoid')+'?autoplay=1');
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
	videoid: DS.attr('string'),
	title: DS.attr('string'),
	duration: DS.attr('number')
});

App.Artist.FIXTURES = [];
App.Tracks.FIXTURES = [];

App.loadFixtures = function(){
	$.getJSON('/'+App.get('namespace')()+'/loadFixtures', function(data){
		$.each(data.artists, function(i,v){
			var artist = App.Artist.createRecord({
				id: v.id,
				name: v.name
			});
			$.each(v.tracks, function(ii,vv){
				var track = App.Tracks.createRecord({
					id: vv.id,
					videoid: vv.videoid,
					title: vv.title,
					duration: vv.duration
				});
				artist.get('tracks').pushObject(track);
			});
		});
	});
};

App.loadFixtures();

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-42786295-1', 'hnswave.co');
ga('send', 'pageview');
