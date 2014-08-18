var worker = require("./lib/worker")
var tx = require("../transaction_tracer")

var txlog = {}
tx.onStart(function (event) {
  console.log("[%s] started a transaction (%s)", event.id, event.metadata.type)
  txlog[event.id] = Date.now()
})
tx.onEnd(function (event) {
  var elapsed = Date.now() - txlog[event.id]
  var message = (event.metadata.type == "fetch") ? event.metadata.url + " (status code " + event.metadata.code + ") " : ""
  console.log("[%s] %s %stook %s millis.", event.id, event.metadata.type, message, elapsed)
})

var urls = [
  "http://npmjs.org",
  "http://nodejs.org",
  "http://npm.im",
  "http://brycebaril.com"
]

urls.forEach(function (url) {
  worker(url, tx.start({type: "fetch", url: url}))
})

function simpleTimer() {
  var id = tx.start({type: "timer"})
  setTimeout(function () {
    tx.end(id, {type: "timer"})
  }, 1000)
}

simpleTimer()
