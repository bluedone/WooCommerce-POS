var Collection = require('lib/config/collection');
var Model = require('./model');
var $ = require('jquery');

var gateways = [];
$('.tmpl-checkout-gateways').each(function(){
  gateways.push({
    method_id    : $(this).data('gateway'),
    method_title : $(this).data('title'),
    icon         : $(this).data('icon'),
    active       : (1 === $(this).data('default'))
  });
});

module.exports = Collection.extend({
  model: Model,

  initialize: function() {
    this._isNew = false;
    this.on( 'change:active', this.onChangeActive );
  },

  fetch: function(){
    this.add(gateways);
  },

  onChangeActive: function(model, active) {
    if(!active){ return; }
    this.each( function(tab) {
      if( model.id !== tab.id ) {
        tab.set({ active: false });
      }
    });
  }
});