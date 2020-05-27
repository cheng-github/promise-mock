var assert = require("assert");
var adapter = require("./adapter");
var resolved = adapter.resolved;
var deferred = adapter.deferred;
var dummy = { dummy: "dummy" }; 

var promise = resolved(dummy).then(function onBasePromiseFulfilled() {
    return deferred().promise;
});

var wasFulfilled = false;
var wasRejected = false;

promise.then(
    function onPromiseFulfilled() {
        wasFulfilled = true;
    },
    function onPromiseRejected() {
        wasRejected = true;
    }
);

setTimeout(function () {
    assert.strictEqual(wasFulfilled, false);
    assert.strictEqual(wasRejected, false);
}, 100);









