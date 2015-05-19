var ItemView = require('lib/config/form-view');
var $ = require('jquery');
var hbs = require('handlebars');
var Radio = require('backbone.radio');

module.exports = ItemView.extend({
  tagName: 'ul',
  template: hbs.compile( $('#tmpl-cart-totals').html() ),

  initialize: function() {
    this.tax = Radio.request('entities', 'get', {
      type : 'option',
      name : 'tax'
    }) || {};
  },

  // todo: why is this necessary?!
  // view should re-render automatically on model change
  modelEvents: {
    'change': 'render'
  },

  /**
   *
   */
  templateHelpers: function(){
    var data = {
      itemized: this.tax.tax_total_display === 'itemized',
      has_discount: 0 !== this.model.get('cart_discount')
    };

    if( this.tax.tax_display_cart === 'incl' ) {
      data.subtotal = this.model.sum(['subtotal', 'subtotal_tax']);
      data.cart_discount = this.model.get('subtotal') - this.model.get('total');
      data.incl_tax = true;
    }

    return data;
  }

});