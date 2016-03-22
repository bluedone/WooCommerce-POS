var Route = require('lib/config/route');
var Layout = require('./layout');
var Actions = require('./views/actions');
var List = require('./views/list');
var Pagination = require('lib/components/pagination/view');
var Radio = require('backbone.radio');
var _ = require('lodash');
var polyglot = require('lib/utilities/polyglot');

module.exports = Route.extend({

  initialize: function (options) {
    this.container  = options.container;
    this.collection = Radio.request('entities', 'get', 'products');
    this.setTabLabel( polyglot.t('titles.products') );
  },

  fetch: function() {
    //var collection = this.filtered.superset();
    //if( collection.isNew() ){
    //  return collection.firstSync();
    //} else {
    //  this.filtered.removeTransforms();
    //}
    this.collection.fetch();
  },

  render: function() {
    this.layout = new Layout();

    this.listenTo(this.layout, 'show', function () {
      this.showActions();
      this.showTabs();
      this.showProducts();
      this.showPagination();
    });

    this.container.show( this.layout );
  },

  showActions: function() {
    var view = new Actions({ collection: this.collection });
    this.layout.getRegion('actions').show(view);
  },

  showTabs: function() {
    var tabSettings = Radio.request('entities', 'get', {
      type: 'option',
      name: 'tabs'
    });

    var view = Radio.request('tabs', 'view', {
      collection: _.map( tabSettings, function( obj ){
        return obj;
      })
    });

    this.listenTo(view, 'childview:click', function(tab) {
      this.collection.setFilter('tab', tab.model.id);
    });

    this.layout.getRegion('tabs').show(view);
  },

  showProducts: function() {
    var view = new List({ collection: this.collection });
    this.layout.getRegion('list').show(view);
  },

  showPagination: function(){
    var view = new Pagination({ collection: this.collection });
    this.layout.getRegion('footer').show(view);
  }

});