var assert = require("assert");
var adapter = require("./adapter");
var resolved = adapter.resolved;
var deferred = adapter.deferred;
var dummy = { dummy: "dummy" }; 

var promise = resolved(dummy).then(function onBasePromiseFulfilled() {
    return Object.create(Object.prototype, {
        then: {
            get: function () {
                throw e;
            }
        }
    });;
});

promise.then(null, function (reason) {
    assert.strictEqual(reason, e);
    done();
});









