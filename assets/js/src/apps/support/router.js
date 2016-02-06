var Router = require('lib/config/router');
var FormRoute = require('./form/route');
var StatusRoute = require('./status/route');
var Radio = require('backbone.radio');
var Collection = require('lib/config/collection');
var $ = require('jquery');

module.exports = Router.extend({

  columns: ['left', 'right'],

  routes: {
    'support' : 'showStatus'
  },

  initialize: function(options) {
    this.container = options.container;
    this.collection = new Collection();
  },

  onBeforeEnter: function() {
    this.container.show(this.layout);
    this.updateTitle();
    this.showForm();
  },

  updateTitle: function(){
    // TODO: put menu into params
    var title = $('#menu li.support').text();
    Radio.request('header', 'update:title', title);
  },

  showForm: function(){
    var route = new FormRoute({
      container : this.layout.getRegion('left'),
      column    : this.columns[0]
    });
    route.enter();
  },

  showStatus: function(){
    return new StatusRoute({
      container  : this.layout.getRegion('right'),
      collection : this.collection,
      column     : this.columns[1]
    });
  }

});