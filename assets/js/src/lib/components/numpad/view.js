var FormView = require('lib/config/form-view');
var App = require('lib/config/application');
var hbs = require('handlebars');
var Tmpl = require('./numpad.hbs');
var Model = require('./model');
var _ = require('lodash');
var $ = require('jquery');
var accounting = require('accounting');
var Radio = require('backbone.radio');
var AutoGrow = require('lib/behaviors/autogrow');
var cashKeys = require('./cashkeys');
var Utils = require('lib/utilities/utils');

// numpad header input btns
// - could be improved if _.result allowed custom bind?
var inputBtns = {
  amount: function(){
    return {
      left: { addOn: this.symbol }
    };
  },
  discount: function(){
    return {
      left: { btn: this.symbol },
      right: { btn: '%' },
      toggle: true
    };
  },
  cash: function(){
    return {
      left: { addOn: this.symbol }
    };
  },
  quantity: function(){
    return {
      left: { btn: '<i class="icon icon-minus"></i>' },
      right: { btn: '<i class="icon icon-plus"></i>' }
    };
  }
};

// numpad extra keys
// - could be improved if _.result allowed custom bind?
var extraKeys = {
  amount: function(){},
  discount: function(){
    var discountKeys = Radio.request('entities', 'get', {
      type: 'option',
      name: 'discount_keys'
    }) || {};
    return _.map(discountKeys, function(n){ return n + '%'; });
  },
  cash: function(value){
    var denominations = Radio.request('entities', 'get', {
      type: 'option',
      name: 'denominations'
    }) || {};
    return _.map(cashKeys(value, denominations), function(n){
      if(this.value === 0){ return n; }
      return Utils.formatNumber(n);
    }, this);
  },
  quantity: function(){}
};


var View = FormView.extend({
  template: hbs.compile(Tmpl),

  viewOptions: [
    'numpad', 'label', 'value', 'decimal', 'symbol'
  ],

  initialize: function(options){
    options = options || {};

    options = _.defaults(options, {
      label   : 'Numpad',
      numpad  : 'amount',
      value   : 0,
      decimal : accounting.settings.currency.decimal,
      symbol  : accounting.settings.currency.symbol
    });

    this.mergeOptions(options, this.viewOptions);

    this.model = new Model({}, options);
  },

  behaviors: {
    AutoGrow: {
      behaviorClass: AutoGrow
    }
  },

  bindings: {
    'input[name="value"]': {
      observe: ['value', 'percentage', 'active'],
      onGet: function(arr){
        var val = arr[2] === 'percentage' ? arr[1] : arr[0];
        //var precision;
        //if(arr[2] === 'percentage' || this.numpad === 'quantity'){
        //  precision = 'auto';
        //}
        //return Utils.formatNumber(val, precision);
        return val;
      },
      onSet: function(val, opts){
        opts.view.model.setActive(val);
      }
    },
    '.numpad-discount [data-btn="left"]': {
      updateMethod: 'html',
      observe: ['value', 'percentage', 'active'],
      onGet: function(arr){
        if(arr[2] === 'percentage'){
          return Utils.formatMoney(arr[0]);
        } else {
          return this.symbol;
        }
      }
    },
    '.numpad-discount [data-btn="right"]': {
      updateMethod: 'html',
      observe: ['percentage', 'value', 'active'],
      onGet: function(arr){
        if(arr[2] === 'percentage'){
          return '%';
        } else {
          return accounting.toFixed(arr[0], 0) + '%';
        }
      }
    }
  },

  templateHelpers: function(){
    var data = {
      numpad  : this.numpad,
      label   : this.label,
      input   : inputBtns[this.numpad].call(this),
      keys    : extraKeys[this.numpad].call(this, this.value),
      decimal : this.decimal,
      'return': 'return'
    };

    return data;
  },

  ui: {
    input   : '.numpad-header input[name="value"]',
    toggle  : '.numpad-header .input-group',
    common  : '.numpad-body .common .btn',
    discount: '.numpad-body .discount .btn',
    cash    : '.numpad-body .cash .btn',
    keys    : '.numpad-body .btn'
  },

  events: {
    'click @ui.toggle a': 'toggle',
    'click @ui.common'  : 'commonKeys',
    'click @ui.discount': 'discountKeys',
    'click @ui.cash'    : 'cashKeys',
    'mousedown @ui.keys': 'keyPress',
    'keyup @ui.input'   : 'enter'
  },

  onRender: function(){
    if(window.Modernizr.touch) {
      this.ui.input.attr('readonly', true);
    }
  },

  toggle: function(e){
    e.preventDefault();
    var modifier = $(e.currentTarget).data('btn');

    if(this.numpad === 'quantity'){
      this.model.quantity( modifier === 'right' ? 'increase' : 'decrease' );
    }

    if(this.numpad === 'discount'){
      this.ui.toggle.toggleClass('toggle');
      this.model.toggle('percentage');
    }
  },

  /* jshint -W074 */
  commonKeys: function(e){
    e.preventDefault();
    var key = $(e.currentTarget).data('key');

    switch(key) {
      case 'ret':
        this.trigger('input', this.model.getFloatValue(), this.model);
        return;
      case 'del':
        if(this._hasSelection) {
          this.model.clearInput();
        }
        this.model.backSpace();
        break;
      case '+/-':
        this.model.plusMinus();
        break;
      case '.':
        this.model.decimal();
        break;
      default:
        if(this._hasSelection) {
          this.model.clearInput();
        }
        this.model.key(key);
    }

  },
  /* jshint +W074 */

  discountKeys: function(e){
    e.preventDefault();
    var key = $(e.currentTarget).data('key');
    this.model.set('active', 'percentage');
    this.model.set('percentage', key.replace('%', ''));
    this.ui.toggle.addClass('toggle');
  },

  cashKeys: function(e){
    e.preventDefault();
    var key = $(e.currentTarget).data('key');
    key = Utils.unformat(key);
    this.model.clearInput().key(key);
  },

  // on keypress, check if input selected
  keyPress: function(){
    var sel = window.getSelection();
    this._hasSelection = sel.toString() === this.ui.input.val();
  },

  enter: function(e){
    if(e.which === 13){
      this.trigger('input', this.model.getFloatValue(), this.model);
    }
  }

});

module.exports = View;
App.prototype.set('Components.Numpad.View', View);