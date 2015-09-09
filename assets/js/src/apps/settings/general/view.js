var FormView = require('lib/config/form-view');
var $ = require('jquery');
var POS = require('lib/utilities/global');
var CustomerSelect = require('lib/behaviors/customer-select');
var Tooltip = require('lib/behaviors/tooltip');

var View = FormView.extend({

  template: function(){
    return $('script[data-id="general"]').html();
  },

  attributes: {
    id: 'wc-pos-settings-general'
  },

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip
    },
    CustomerSelect: {
      behaviorClass: CustomerSelect
    }
  },

  select2: {
    'discount_quick_keys': {
      maximumSelectionLength: 4
    }
  },

  modelEvents: {
    'change:id': 'render',
    'change:logged_in_user': function(model, toggle){
      this.ui.customerSelect.prop('disabled', toggle);
    }
  },

  ui: {
    customerSelect: 'select[data-select="customer"]'
  },

  onRender: function(){
    var self = this;

    // bind ordinary elements
    this.$('input, select, textarea').each(function(){
      var name = $(this).attr('name');
      if(name){
        self.addBinding(null, '*[name="' + name + '"]', name);
      }
    });

    // disable customer select if logged_in_user checked
    if( this.model.get('logged_in_user') ){
      this.ui.customerSelect.prop('disabled', true);
    }
  }

});

module.exports = View;
POS.attach('SettingsApp.General.View', View);