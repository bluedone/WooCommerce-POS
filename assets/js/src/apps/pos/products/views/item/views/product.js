var ItemView = require('lib/config/item-view');
var App = require('lib/config/application');
var $ = require('jquery');
var _ = require('lodash');
var Tooltip = require('lib/behaviors/tooltip');
var Radio = require('backbone.radio');
var Variations = require('./popover/variations');

var Item = ItemView.extend({
  template: 'pos.products.product',

  className: 'list-row',

  ui: {
    add      : 'a[data-action="add"]',
    vpopover : 'a[data-action="variations"]',
    vdrawer  : '.title dl.variations dd a'
  },

  events: {
    'click @ui.add'      : 'addToCart',
    'click @ui.vpopover' : 'variationsPopover',
    'click @ui.vdrawer'  : 'variationsDrawer'
  },

  modelEvents: {
    'change:updated_at': 'render'
  },

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip,
      html: true
    }
  },

  addToCart: function(e){
    e.preventDefault();
    Radio.request('router', 'add:to:cart', this.model);
  },

  variationsPopover: function(e){
    e.preventDefault();

    var view = new Variations({
      model: this.model
    });

    this.listenTo(view, 'add:to:cart', function(args){
      var product = args.collection.models[0].toJSON();
      Radio.request('router', 'add:to:cart', product);
      Radio.request('popover', 'close');
    });

    var options = _.extend({
      view      : view,
      target    : e.target,
      position  : 'right middle'
    }, view.popover);

    Radio.request('popover', 'open', options);
  },

  variationsDrawer: function(e){
    e.preventDefault();
    var options = {};

    var name = $(e.target).data('name');
    if(name){
      options.filter = {
        name: name,
        option: $(e.target).text()
      };
    }

    this.trigger('toggle:drawer', options);
  },

  templateHelpers: function(){
    var data = {
      product_attributes:  this.model.getProductAttributes()
    };

    if( this.model.get('type') === 'variable' ){
      _.extend( data, {
        price: this.model.getRange('price'),
        sale_price: this.model.getRange('sale_price'),
        regular_price: this.model.getRange('regular_price'),
        product_variations: this.model.getVariationOptions()
      });
    }

    return data;
  }

});

module.exports = Item;
App.prototype.set('POSApp.Products.Item', Item);