var assert = require('assert');

// GETTING STARTED
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

// DETECTS MULTIPLE CALLS TO DONE()
it('double done', function(done) {
    // Calling `done()` twice is an error
    setImmediate(done);
    setImmediate(done);
});


describe('User', function() {
    describe('#save()', function() {
      it('should save without error', function(done) {
        var user = new User('Luna');
        user.save(function(err) {
          if (err) done(err);
          else done();
        });
      });
    });
});

// ASYNCHRONOUS CODE TEST
describe('User', function() {
    describe('#save()', function() {
      it('should save without error', function(done) {
        var user = new User('Luna');
        user.save(function(err) {
          if (err) done(err);
          else done();
        });
      });
    });
});




