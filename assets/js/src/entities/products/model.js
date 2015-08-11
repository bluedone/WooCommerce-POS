var DualModel = require('lib/config/dual-model');
var _ = require('lodash');
var Radio = require('backbone.radio');
var Variations = require('../variations/collection');
var FilteredCollection = require('lib/config/obscura');

module.exports = DualModel.extend({
  name: 'product',

  // this is an array of fields used by FilterCollection.matchmaker()
  fields: ['title'],

  // the REST API gives string values for some attributes
  // this can cause confusion, so parse to float
  parse: function(resp){
    resp = resp.product || resp;
    _.each(['price', 'regular_price', 'sale_price'], function(attr){
      if( _.isString(resp[attr]) ){
        resp[attr] = parseFloat(resp[attr]);
      }
    });
    return resp;
  },

  /**
   * Helper functions for variation prices
   */
  min: function(attr){
    var variations = this.get('variations');
    if(attr === 'sale_price'){
      variations = _.where(variations, {on_sale: true});
    }
    var attrs = _.pluck(variations, attr);
    if(attrs.length > 0){
      return _(attrs).compact().min();
    }
    return this.get(attr);
  },

  max: function(attr){
    var attrs = _.pluck(this.get('variations'), attr);
    if(attrs.length > 0){
      return _(attrs).compact().max();
    }
    return this.get(attr);
  },

  range: function(attr){
    if(attr === 'sale_price'){
      var min = _.min([this.min('sale_price'), this.min('price')]);
      var max = _.max([this.max('sale_price'), this.max('price')]);
      return _.uniq([min, max]);
    }
    return _.uniq([this.min(attr), this.max(attr)]);
  },

  /**
   * Helper functions to display attributes vs variations
   */
  productAttributes: function(){
    return _.chain(this.get('attributes'))
      .where({variation: false})
      .where({visible: true})
      .value();
  },

  productVariations: function(){
    return _.where(this.get('attributes'), {variation: true});
  },

  /**
   * Special cases for product model filter
   * @param {Array} tokens An array of query tokens, see QParser
   * @param {Object} methods Helper match methods
   * @param {Function} callback
   */
  matchMaker: function(tokens, methods, callback){

    var match = _.all(tokens, function(token){

      // barcode
      if( token.type === 'prefix' && token.prefix === 'barcode' ){
        if(token.query){ return this.barcodeMatch(token.query); }
      }

      // cat
      if( token.type === 'prefix' && token.prefix === 'cat' ){
        token.prefix = 'categories';
        return methods.prefix(token, this);
      }

    }, this);

    if(match){
      return match;
    }

    // the original matchMaker
    return callback(tokens, this);

  },

  barcodeMatch: function(barcode){
    var type = this.get('type'),
        test = this.get('barcode').toLowerCase(),
        value = barcode.toString().toLowerCase();

    if(test === value) {
      if(type !== 'variable'){
        this.trigger('match:barcode', this);
      }
      return true;
    }

    if(type !== 'variable'){
      return this.partialBarcodeMatch(test, value);
    }

    return this.variableBarcodeMatch(test, value);
  },

  partialBarcodeMatch: function(test, value){
    if(test.indexOf( value ) !== -1) {
      return true;
    }
    return false;
  },

  variableBarcodeMatch: function(test, value){
    var match, variations = Radio.request('entities', 'get', {
      type: 'variations',
      parent: this
    });

    variations.superset().each(function(variation){
      var vtest = variation.get('barcode').toLowerCase();
      if(vtest === value){
        match = variation;
        return;
      }
      if(vtest.indexOf( value ) !== -1) {
        match = 'partial';
        return;
      }
    });

    if(match){
      if(match !== 'partial'){
        this.trigger('match:barcode', match, this);
      }
      return true;
    }

    return this.partialBarcodeMatch(test, value);
  },

  /**
   * Construct variable options from variation array
   * - variable.attributes includes all options, including those not used
   */
  getVariationOptions: function(){
    if( this._variationOptions ) {
      return this._variationOptions;
    }

    var variations = this.get('variations');

    // pluck all options, eg:
    // { Color: ['Black', 'Blue'], Size: ['Small', 'Large'] }
    var result = _.pluck(variations, 'attributes')
      .reduce(function(result, attrs){
        _.each(attrs, function(attr){
          if(result[attr.name]){
            return result[attr.name].push(attr.option);
          }
          result[attr.name] = [attr.option];
        });
        return result;
      }, {});

    // map options with consistent keys
    this._variationOptions = _.map(result, function(options, name){
      return {
        'name': name,
        'options': _.uniq( options )
      };
    });

    return this._variationOptions;
  },

  /**
   *
   */
  getVariations: function(){
    if(this._variations){
      return this._variations;
    }

    var variations = new Variations(this.get('variations'), { parent: this });
    this._variations = new FilteredCollection(variations);

    return this._variations;
  }

});