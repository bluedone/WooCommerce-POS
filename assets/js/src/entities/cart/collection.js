//var bb = require('backbone');
var Collection = require('lib/config/collection');
var Model = require('./model');
//var Utils = require('lib/utilities/utils');
var _ = require('lodash');
//var Radio = require('backbone.radio');
var IndexedDB = require('lib/config/indexeddb');

module.exports = Collection.extend({
  name: 'cart',
  model: Model,

  comparator: function( model ){
    var type = model.get( 'type' );
    if( type === 'fee' ) { return 2; }
    if( type === 'shipping' ) { return 1; }
    return 0;
  },

  initialize: function (models, options) {
    options = options || {};
    this.order_id = options.order_id;

    this.indexedDB = new IndexedDB({
      storeName: 'cart',
      storePrefix: 'wc_pos_',
      dbVersion: 1,
      keyPath: 'local_id',
      autoIncrement: true,
      indexes: [
        {name: 'local_id', keyPath: 'local_id', unique: true},
        {name: 'order', keyPath: 'order', unique: false},
        {name: 'type', keyPath: 'type', unique: false}
      ]
    }, this);

  },

  /**
   * If collection has order_id, query idb for index: 'order' = order_id
   * onSuccess add items to collection
   */
  fetchCartItems: function () {
    if(!this.order_id){
      return;
    }

    var onSuccess = this.add.bind(this);
    var keyRange = this.indexedDB.store.makeKeyRange({
      only: this.order_id
    });

    this.indexedDB.store.query(onSuccess, {
      index: 'order',
      keyRange: keyRange
    });
  },

  // convenience method to sum attributes in collection
  sum: function(attribute, type){
    var col = this.toJSON();
    if(type){ col = _.where(col, {type: type}); }
    return _.pluck(col, attribute).reduce(function(a, b){return a + b;}, 0);
  },

  /**
   * add/increase item
   * also prune attributes
   */
  addToCart: function(options){
    options = options || {};
    var model,
        attributes = options.model ? options.model.toJSON() : options;

    if(attributes.id){
      model = this.findWhere({ product_id: attributes.id });
    }

    var props = [
      'order',
      'title',
      'local_id',
      'product_id',
      'type',
      'price',
      'regular_price',
      'sale_price',
      'taxable',
      'tax_status',
      'tax_class',
      'attributes',
      'method_title', // shipping
      'method_id'     // shipping
    ];

    if(model){
      model.quantity('increase');
    } else {
      attributes.order = this.order_id;
      attributes.product_id = attributes.id;
      delete attributes.id;
      model = this.add(_.pick(attributes, props));
    }

    model.trigger('focus');
  },

  itemizedTax: function(){
    var items = _.deepClone(this.toJSON());
    var taxes = _.map(items, function(item){
      if(!item.tax) { return; }
      _.each(item.tax, function(tax){
        tax.shipping = item.type === 'shipping' ? tax.total : 0 ;
      });
      return item.tax;
    });
    var obj = this.sumTaxes(taxes);

    // convert obj to array to be consistent with WC REST API output
    var arr = [];
    _.each(obj, function(value, key){
      value.rate_id = parseInt(key, 10);
      arr.push(value);
    });

    return arr;
  },

  sumTaxes: function(taxes){
    return _.reduce(taxes, function(result, tax){
      return _.merge(result, tax, function(a, b){
        if(a){
          b.total += a.total;
          b.subtotal += a.subtotal;
          b.shipping += a.shipping;
        }
        return b;
      });
    }, {});
  }

});