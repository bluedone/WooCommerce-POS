var ItemView = require('lib/config/item-view');
var CollectionView = require('lib/config/collection-view');
var hbs = require('handlebars');
var Collection = require('./entities');
var POS = require('lib/utilities/global');
var Backbone = require('backbone');
var _ = require('lodash');

var Tab = ItemView.extend({
  tagName: 'li',

  initialize: function () {
    this.template = hbs.compile('' +
      '{{#unless fixed}}' +
      '<a href="#" data-action="remove">' +
        '<i class="icon icon-times-circle"></i>' +
      '</a>' +
      '{{/unless}}' +
      '{{{ label }}}'
    );
  },

  className: function () {
    if (this.model.get('active')) {
      return 'active';
    }
  },

  modelEvents: {
    'change:active': 'toggleClass',
    'change:label': 'render'
  },

  triggers: {
    'click': 'tab:clicked',
    'click *[data-action="remove"]': 'remove:tab'
  },

  toggleClass: function(){
    this.$el.toggleClass('active', this.model.get('active'));
  },

  onTabClicked: function () {
    if (!this.model.get('active')) {
      this.model.collection.setActive(this.model.id);
    }
  },

  onRemoveTab: function(){
    this.model.collection.remove(this.model);
  }

});

var Tabs = CollectionView.extend({
  tagName: 'ul',
  childView: Tab,
  attributes: {
    'role' : 'tablist'
  },

  initialize: function(options) {
    options = options || {};

    // todo: refactor to service?
    // allows view to be init with bb collection or
    // attributes in an array or object
    if (options.collection instanceof Backbone.Collection) {
      this.collection = options.collection;
    } else {
      this.collection = new Collection();
      _.each(options.collection, function(attributes){
        this.collection.add(attributes);
      }, this);
    }
  }

});

module.exports = Tabs;
POS.attach('Components.Tabs.View', Tabs);