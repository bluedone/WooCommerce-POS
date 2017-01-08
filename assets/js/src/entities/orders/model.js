var Model = require('lib/config/model');
var Cart = require('../cart/collection');
var Gateways = require('../gateways/collection');
var _ = require('lodash');
var debug = require('debug')('order');
var Radio = require('backbone.radio');
var App = require('lib/config/application');
var Taxes = require('../tax/collection');
// var $ = require('jquery');
var polyglot = require('lib/utilities/polyglot');
var Utils = require('lib/utilities/utils');

/**
 * Have to make the Parent first to get access to the subclass prototype
 */
var Parent = Model.extend({
  extends: ['deep', 'dual']
});

var OrderModel = Parent.extend({
  name: 'order',

  /**
   * add tax settings early for use by cart
   * - always be parsin'
   */
  constructor: function (attributes, options) {
    // clone tax settings
    this.tax = _.clone(this.getSettings('tax'));

    // bug fix: total_discount = cart_discount
    // @todo: remove this hack
    if(attributes){
      attributes.cart_discount = attributes.total_discount;
    }

    Model.call(this, attributes, _.extend({parse: true}, options));
  },

  /**
   * convenience method to get settings
   */
  getSettings: function (name) {
    return Radio.request('entities', 'get', {
        type: 'option',
        name: name
      }) || {};
  },

  /**
   * @param state - allows checking of JSON data before instantiation
   */
  isEditable: function (state) {
    state = state || this.get('_state');
    return _.chain(this.collection)
      .get('states')
      .pick(['create', 'update', 'patch'])
      .includes(state)
      .value();
  },

  /**
   *
   */
  makeEditable: function() {
    this.save({ _state: this.collection.states['update'] });
  },

  /**
   * Order saves on any change to cart - calcs totals and saves to idb
   */
  /* jshint -W074 */
  save: function (attributes, options) {
    options = options || {};

    // Safari doesn't like empty keyPath, perhaps an autoincrement problem?
    // Set local_id as timestamp milliseconds
    if (this.id === 'new') {
      //this.set({ local_id: Date.now() });
      this.unset('local_id');
    }

    if (this.cart) {
      this.updateTotals();
    }

    debug('save order', this);
    return Parent.prototype.save.call(this, attributes, options);
  },
  /* jshint +W074 */

  /**
   * Attach cart during parse
   * - allows order to change status, ie: become editable
   */
  /* jshint -W071 */
  parse: function (resp) {
    resp = Parent.prototype.parse.apply(this, arguments);

    // if open order with no cart, ie: new from idb or changed state
    if (this.isEditable(resp._state) && !this.cart) {
      this.attachTaxes();
      this.attachCart(resp);
      this.attachGateways(resp);
      this.attachCustomer(resp);
      // this.attachCoupons(resp);
    }

    return resp;
  },
  /* jshint +W071 */

  /**
   * Attach cart during parse, allows updates from server
   */
  attachCart: function (attributes) {
    this.cart = new Cart(null, {order: this});

    // add line_items, shipping_lines and fee_lines
    this.cart.set(attributes.line_items,
      {parse: true, remove: false}
    );
    this.cart.set(attributes.shipping_lines,
      {parse: true, remove: false, type: 'shipping'}
    );
    this.cart.set(attributes.fee_lines,
      {parse: true, remove: false, type: 'fee'}
    );

    this.cart.on('change add remove', function () {
      if (this.cart && this.cart.length === 0) {
        this.destroy();
      } else {
        this.save();
      }
    }, this);
  },

  /**
   * Attach gateways
   */
  attachGateways: function (attributes) {
    this.gateways = new Gateways(attributes.payment_details, {order: this});
    if(this.gateways){
      this.listenTo(this.gateways, 'change', function(){
        this.save();
      });
    }

  },

  /**
   * Attach coupon collection
   */
  attachCoupons: function(attributes) {
    this.coupons = Radio.request('entities', 'get', {
      type: 'collection',
      name: 'coupons',
      init: true
    });

    if(this.coupons){
      this.coupons.add( _.get(attributes, 'coupon_lines') );
      this.listenTo(this.coupons, 'add remove', function(){
        this.save();
      });
    }
  },

  /**
   * Attach taxes
   * - parse tax_rates into bb Collections
   * - set enabled = true for each rate
   */
  attachTaxes: function () {
    var tax_rates = this.getSettings('tax_rates');
    this.tax_rates = {};

    // parse tax_rates
    _.each(tax_rates, function (tax_rate, tax_class) {
      var taxes = new Taxes(tax_rate, {order: this});
      this.tax_rates[tax_class] = taxes;
    }.bind(this));
  },

  /**
   *
   */
  /* jshint -W071, -W074 */
  toJSON: function (options) {
    options = options || {};
    var attrs = _.clone(this.attributes);

    // process cart collection
    if (this.isEditable() && this.cart) {
      attrs = this.prepareCartJSON(attrs, options);
    }

    // process coupons
    if (this.isEditable() && this.coupons) {
      attrs.coupon_lines = this.coupons.toJSON();
    }

    // process gateways
    if (this.isEditable() && this.gateways) {
      attrs.payment_details = this.gateways.getPaymentDetails();
    }

    // prepare remote JSON
    if (options.remote && this.name) {
      attrs = this.prepareRemoteJSON(attrs, options);
    }

    return attrs;
  },
  /* jshint +W071, +W074 */

  prepareCartJSON: function (attrs, options) {
    var taxes          = [],
        shipping_taxes = [];

    attrs.line_items = [];
    attrs.shipping_lines = [];
    attrs.fee_lines = [];

    /* jshint -W074 */
    this.cart.each(function (model) {

      switch (model.type) {
        case 'shipping':
          attrs.shipping_lines.push(model.toJSON(options));
          if (model.taxes) {
            shipping_taxes.push(model.taxes.toJSON(options));
          }
          break;
        case 'fee':
          attrs.fee_lines.push(model.toJSON(options));
          break;
        case 'product':
          attrs.line_items.push(model.toJSON(options));
          break;
      }

      if (model.taxes) {
        taxes.push(model.taxes.toJSON(options));
      }

    });
    /* jshint +W074 */

    attrs.tax_lines = this.mergeItemizedTaxes(taxes);
    attrs.shipping_tax = this.sumItemizedTaxes(
      this.mergeItemizedTaxes(shipping_taxes)
    );

    return attrs;
  },

  /**
   * @todo this could be part of model.save( attributes )?
   */
  updateTotals: function () {
    var total             = this.cart.sum('total'),
        subtotal          = this.cart.sum('subtotal'),
        total_tax         = this.cart.sum('total_tax'),
        subtotal_tax      = this.cart.sum('subtotal_tax'),
        cart_discount     = subtotal - total,
        cart_discount_tax = subtotal_tax - total_tax;

    total += total_tax;

    var totals = {
      'total'            : Utils.round(total, 4),
      'subtotal'         : Utils.round(subtotal, 4),
      'total_tax'        : Utils.round(total_tax, 4),
      'subtotal_tax'     : Utils.round(subtotal_tax, 4),
      'cart_discount'    : Utils.round(cart_discount, 4),
      'cart_discount_tax': Utils.round(cart_discount_tax, 4)
    };

    this.set(totals);
  },

  /**
   * Takes an array of itemized taxes and merges them into one combined array
   * - model.taxes.toJSON() ensures a shallow clone
   */
  mergeItemizedTaxes: function (taxes) {
    return _.reduce(taxes, function (merged, line_taxes) {
        _.each(line_taxes, function (tax) {
          var orig = _.find(merged, {rate_id: tax.rate_id});
          if (orig) {
            orig.total = _.sum([orig.total, tax.total]);
            orig.subtotal = _.sum([orig.subtotal, tax.subtotal]);
          } else {
            merged.push(tax);
          }
        });
        return merged;
      }) || [];
  },

  /**
   *
   */
  sumItemizedTaxes: function (taxes, attr) {
    attr = attr || 'total';
    return _.chain(taxes)
      .map(function (tax) {
        return tax[attr];
      })
      .sum()
      .value();
  },

  /**
   * Value displayed in cart
   */
  getDisplayTotal: function () {
    if (this.tax.tax_display_cart === 'incl') {
      return this.sum(['total', 'total_tax']);
    } else {
      return this.get('total');
    }
  },

  /**
   * Convenience method to sum attributes
   */
  sum: function (array) {
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
      sum += this.get(array[i]);
    }
    return Utils.round(sum, 4);
  },

  /**
   * Value displayed in cart
   */
  getDisplaySubtotal: function () {
    if (this.tax.tax_display_cart === 'incl') {
      return this.sum(['subtotal', 'subtotal_tax']);
    } else {
      return this.get('subtotal');
    }
  },

  /**
   * Value displayed in cart
   */
  getDisplayCartDiscount: function () {
    if (this.tax.tax_display_cart === 'incl') {
      return this.sum(['cart_discount', 'cart_discount_tax']);
    } else {
      return this.get('cart_discount');
    }
  },

  /**
   * Email receipt via ajax
   * @param model - { email: example@example.com }
   */
  emailReceipt: function (model) {
    return App.prototype.post(this.url() + 'notes', {
      order_note: model.toJSON()
    });
  },

  /**
   * Clean up attached cart
   */
  destroy: function () {
    if (this.cart) {
      this.cart.reset(null, {silent: true});
      this.cart.stopListening();
    }
    Parent.prototype.destroy.apply(this, arguments);
  },

  /**
   * Toggle taxes
   */
  toggleTax: function (rate_id) {
    var key = rate_id ? 'rate_' + rate_id : 'all';
    var val = this.get('pos_taxes.' + key);
    if(_.isUndefined(val)){
      val = true; // all taxes start as enabled
    }
    this.set('pos_taxes.' + key, !val);
  },

  /**
   * Check if tax rate is enabled by rate_id
   */
  taxRateEnabled: function (rate_id) {
    var itemized = _.get(this, ['tax', 'tax_total_display']) === 'itemized';
    var key = rate_id && itemized ? 'rate_' + rate_id : 'all';
    var val = this.get('pos_taxes.' + key);
    if(_.isUndefined(val)){
      val = true; // all taxes start as enabled
    }
    return val;
  },

  /**
   * Returns parsed tax rates for a given tax_rate
   */
  getTaxRates: function (tax_class) {
    if (this.tax_rates && this.tax_rates[tax_class]) {
      return this.tax_rates[tax_class].toJSON();
    }
  },

  /**
   * Helper function to construct the tab label
   * @todo: give users options on what to display, eg: customer name
   */
  getLabel: function () {
    var title = polyglot.t('titles.cart');
    if( this.hasRemoteId() ) {
      title = polyglot.t('titles.order') + ' #' + this.get('order_number');
    }
    else if (this.id !== 'new') {
      title += ' ' + Utils.formatMoney(this.get('total'));
    }
    return title;
  },

  /* jshint -W071, -W074 */
  attachCustomer: function (attributes) {
    var customers = Radio.request('entities', 'get', 'customers');
    if (attributes.customer_id || !customers) {
      return;
    }

    var self = this;
    var defaultCustomer = customers.getDefaultCustomer();
    attributes.customer_id = defaultCustomer.id;
    attributes.customer = defaultCustomer;

    if(attributes.customer_id === 0){
      return;
    }

    var model = customers.findWhere({id: defaultCustomer.id});
    attributes.customer = model ? model.toJSON() : defaultCustomer;

    if (!model) {
      model = customers.add(defaultCustomer);
      model.fetch({index: 'id'})
        .then(function (response) {
          self.set({customer: response});
        });
    }
  }
  /* jshint +W071, +W074 */

});

module.exports = OrderModel;
App.prototype.set('Entities.Order.Model', OrderModel);