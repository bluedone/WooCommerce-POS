var DualCollection = require('lib/config/dual-collection');
var Model = require('./model');
var $ = require('jquery');
var _ = require('lodash');
var bb = require('backbone');

module.exports = DualCollection.extend({
  model: Model,
  name: 'orders',
  _syncDelayed: false,

  /**
   * Open orders first
   */
  //comparator: function( model ){
  //  if( model.get('id') === undefined ) { return 0; }
  //  return 1;
  //},

  /**
   *
   */
  setActiveOrder: function(id){
    var order = this.get(id);

    if( !order && id !== 'new' ){
      order = _.first( this.openOrders() );
    }

    this.active = order;
    return order;
  },

  /**
   * Promise of an active order
   */
  getActiveOrder: function(){
    var self = this;
    var deferred = new $.Deferred();

    if(!this.active){
      this.create().then(function(order){
        order.cart.order_id = order.id;
        self.active = order;
        if(bb.history.getHash() === 'cart/new') {
          bb.history.navigate('cart/' + order.id);
        }
        deferred.resolve(order);
      });
    } else {
      deferred.resolve(this.active);
    }

    return deferred.promise();
  },

  addToCart: function(options){
    this.getActiveOrder()
      .then(function(order){
        order.cart.addToCart(options);
      });
  },

  create: function(){
    var deferred = new $.Deferred();

    // Safari has a problem with create, perhaps an autoincrement problem?
    // Set local_id as timestamp milliseconds
    DualCollection.prototype.create.call(this, { local_id: Date.now() }, {
      wait: true,
      success: deferred.resolve,
      error: deferred.reject
    });

    return deferred.promise();
  },

  /**
   *
   */
  openOrders: function(){
    return this.filter(function(model){
      return model.isEditable();
    });
  }

});