// Generated by CoffeeScript 1.9.3
(function() {
  var HashTagMonitor, hashtagmonitor;

  HashTagMonitor = (function() {
    function HashTagMonitor(hashtag) {
      this.hashtag = hashtag;
    }

    HashTagMonitor.prototype.monitor = function() {
      return "searching instagram for " + this.hashtag + "!";
    };

    return HashTagMonitor;

  })();

  hashtagmonitor = new HashTagMonitor("Andrew");

  console.log(hashtagmonitor.monitor());

}).call(this);