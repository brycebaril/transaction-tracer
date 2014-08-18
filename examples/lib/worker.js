module.exports = fetch

var http = require("http")
var terminus = require("terminus")
var tx = require("../../transaction_tracer")

// passing the id here not because that's a good practice
// but intead to show that the transaction tracer is idempotent accross
// requires by different files. it would probably make more sense
// to simply have all the tracing logic in one of the two places used here
// for a real application.
function fetch(url, id) {
  var req = http.request(url, function (res) {
    res.pipe(terminus.concat(function (contents) {
      tx.end(id, {type: "fetch", url: url, code: res.statusCode})
    }))
  })
  req.end()
}
