var FormView = require('lib/config/form-view');
var AutoGrow = require('lib/components/autogrow/behavior');
var Numpad = require('lib/components/numpad/behavior');
var hbs = require('handlebars');
var $ = require('jquery');
var _ = require('underscore');
var bb = require('backbone');
var entitiesChannel = bb.Radio.channel('entities');

module.exports = FormView.extend({
  initialize: function() {
    this.template = hbs.compile( $('#tmpl-cart-item-drawer').html() );
  },

  behaviors: {
    AutoGrow: {
      behaviorClass: AutoGrow
    },
    Numpad: {
      behaviorClass: Numpad
    }
  },

  ui: {
    addMeta     : '.action-add-meta',
    removeMeta  : '.action-remove-meta',
    metaLabel   : 'input[name="meta.label"]',
    metaValue   : 'textarea[name="meta.value"]'
  },

  events: {
    'click @ui.addMeta'     : 'addMetaFields',
    'click @ui.removeMeta'  : 'removeMetaFields',
    'blur @ui.metaLabel'    : 'updateMeta',
    'blur @ui.metaValue'    : 'updateMeta'
  },

  bindings: {
    'input[name="regular_price"]'   : 'regular_price',
    'input[name="taxable"]'         : 'taxable',
    'select[name="tax_class"]'      : {
      observe: 'tax_class',
      selectOptions: {
        collection: function(){
          return entitiesChannel.request('get:options', 'tax_labels');
        }
      }
    },
    'select[name="shipping_method"]': {
      observe: 'shipping_method',
      selectOptions: {
        collection: function(){
          return entitiesChannel.request( 'get:options', 'shipping' );
        },
        comparator: function(){}
      }
    }
  },

  onShow: function() {
    this.$el.hide().slideDown(250);
  },

  remove: function() {
    this.$el.slideUp( 250, function() {
      bb.Marionette.ItemView.prototype.remove.call(this);
    }.bind(this));
  },

  updateMeta: function(e) {
    var el        = $(e.target),
        name      = el.attr('name').split('.'),
        attribute = name[0],
        value     = el.val(),
        data      = {};

    // special case product meta
    if( name.length > 1 && attribute === 'meta' ) {
      var key = el.parent('span').data('key');
      var meta = ( this.model.get('meta') || [] );

      // select row (or create new one)
      var row = _.where( meta, { 'key': key } );
      row = row.length > 0 ? row[0] : { 'key': key };
      row[ name[1] ] = value;

      // add the change row and make unique on key
      meta.push(row);
      value = _.uniq( meta, 'key' );
    }

    data[ attribute ] = value;

    this.model.save(data);
  },

  addMetaFields: function(e){
    e.preventDefault();

    var row = $(e.currentTarget).prev('span').data('key');
    var i = row ? row + 1 : 1 ;

    $('<span data-key="'+ i +'" />')
      .append('' +
        '<input type="text" name="meta.label">' +
        '<textarea name="meta.value"></textarea>' +
        '<a href="#" class="action-remove-meta">' +
        '<i class="icon icon-times"></i>' +
        '</a>')
      .insertBefore( $(e.currentTarget) );
  },

  removeMetaFields: function(e){
    e.preventDefault();

    var row = $(e.currentTarget).parent('span');
    var meta = ( this.model.get('meta') || [] );
    var index = _.findIndex( meta, { 'key': row.data('key') } );
    if( index >= 0 ){
      meta.splice( index, 1 );
      this.model.save({ 'meta': meta });
    }

    row.remove();
  }

});