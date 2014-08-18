"use strict";

var test = require("tape")

var tx = require("../transaction_tracer")

test("no listeners", function (t) {
  var id = tx.start("hi")
  t.ok(id < Math.pow(2, 32) * 0.5 && id > Math.pow(2, 32) * -0.5)
  tx.continue(id, "zzz")
  tx.end(id, "bye")
  t.end()
})

test("sync", function (t) {
  tx.onStart(function (event) {
    t.ok(event.id, "start has id")
    t.ok(event.metadata, "start has metadata")
  })
  tx.start("hi")
  t.end()
})

test("async", function (t) {
  tx.onContinue(function (event) {
    t.ok(event.id, "continue has id")
    t.ok(event.metadata, "continue has metadata")
    t.end()
  })
  var id = tx.start("foo")
  setImmediate(function () {
    tx.continue(id, "continued")
  })
})

test("start/end", function (t) {
  var id
  tx.onStart(function (event) {
    setImmediate(function () {
      // sync EE means this happens before we set the variable, gotta defer the check
      t.equals(event.id, id, "start id matches")
    })
    t.equals(event.metadata, "ABC", "start metadata matches")
  })
  tx.onEnd(function (event) {
    t.equals(event.id, id, "end id matches")
    t.equals(event.metadata, "GHI", "end metadata matches")
    t.end()
  })
  setImmediate(function () {
    id = tx.start("ABC")
    t.ok(id, "have an id")
  })
  setTimeout(function () {
    tx.end(id, "GHI")
  }, 5)
})
