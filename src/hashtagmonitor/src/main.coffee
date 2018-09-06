class HashTagMonitor
  constructor: (@hashtag) ->

  monitor: ->
    "searching instagram for #{@hashtag}!"

hashtagmonitor = new HashTagMonitor "Andrew"
console.log hashtagmonitor.monitor()
