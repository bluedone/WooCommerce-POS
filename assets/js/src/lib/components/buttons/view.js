var ItemView = require('lib/config/item-view');
var hbs = require('handlebars');
var _ = require('lodash');
var tmpl = require('./buttons.hbs');
var polyglot = require('lib/utilities/polyglot');
var ButtonsBehavior = require('./behavior');

module.exports = ItemView.extend({

  viewOptions: ['buttons'],

  buttons: [{
    action: 'save',
    className: 'btn-primary'
  }],

  template: hbs.compile(tmpl),

  initialize: function(options){
    this.mergeOptions(options, this.viewOptions);
  },

  templateHelpers: function(){
    _.each(this.buttons, function(button){
      var type = button.type || 'button';
      button[type] = true;
      button.label = button.label || polyglot.t('buttons.' + button.action);
    });
    return {
      buttons: this.buttons
    };
  },

  behaviors: {
    Buttons: {
      behaviorClass: ButtonsBehavior
    }
  }

});