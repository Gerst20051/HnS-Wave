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
		this.resource('artist', { path: ':artist_id' }, function(){
			this.resource('tracks', function(){
				this.route('playing', { path: ':track_id' });
			});
		});
	});
});

App.IndexRoute = Ember.Route.extend({
	redirect: function(){
		this.transitionTo('artists');
	}
});

App.ProfileRoute = Ember.Route.extend({
	model: function(params){
		console.log(params);
	}
});

App.ArtistsRoute = Ember.Route.extend({
	model: function(params){
		alert("ArtistsRoute");
		console.log(params);
		return App.Artist.find();
	},
	setupController: function(controller, tracks){
		controller.set('content', tracks);
	}
});

App.ArtistRoute = Ember.Route.extend({
	model: function(params){
		alert("ArtistRoute");
		console.log(params);
		return App.Artist.find(params.artist_id);
	},
	setupController: function(controller, tracks){
		controller.set('content', tracks);
	},
	redirect: function(){
		// this.transitionTo('tracks');
	}
});

App.TracksRoute = Ember.Route.extend({
	model: function(params){
		alert("TracksRoute");
		console.log(params);
	},
	setupController: function(controller, tracks){
		controller.set('content', tracks);
	}
});

App.PlayingRoute = Ember.Route.extend({
	model: function(params){
		alert("PlayingRoute");
		console.log(params);
	},
	setupController: function(controller, tracks){
		controller.set('content', tracks);
	}
});

/*
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
*/

// Controllers

App.ProfileController = Ember.Controller.extend({

});

App.ArtistsController = Ember.ArrayController.extend({

});

App.ArtistController = Ember.Controller.extend({

});

App.TracksController = Ember.ObjectController.extend({
	needs: "artist"
});

App.PlayingController = Ember.Controller.extend({

});

// Views

App.TracksPlayingView = Ember.View.extend({

});

App.Store = DS.Store.extend({
	revision: 13,
	adapter: DS.RESTAdapter.create({
		namespace: App.get('namespace')()
	})
});

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

