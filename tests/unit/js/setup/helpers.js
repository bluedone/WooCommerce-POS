var _ = require('lodash');
var Backbone = require('backbone');
Backbone.$ = require('jquery');

global.fs = require('fs');
global.__VERSION__ = '';

before(function() {
  global._ = _;
  global.Backbone = Backbone;
});

beforeEach(function() {
  this.sinon = sinon.sandbox.create();
  //this.server = sinon.fakeServer.create();
  //this.clock = sinon.useFakeTimers();
  global.stub = this.sinon.stub.bind(this.sinon);
  global.spy  = this.sinon.spy.bind(this.sinon);
});

afterEach(function() {
  this.sinon.restore();
  //this.server.restore();
  //this.clock.restore();
});