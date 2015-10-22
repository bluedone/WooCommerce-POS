var FormView = require('lib/config/form-view');
var App = require('lib/config/application');
var $ = require('jquery');

var View = FormView.extend({

  template: 'access',

  attributes: {
    id: 'wc_pos-settings-access'
  },

  ui: {
    tabs    : '.wc_pos-access-tabs > li',
    options : '.wc_pos-access-panel > li'
  },

  events: {
    'click @ui.tabs' : 'onTabClick'
  },

  modelEvents: {
    'change:id': 'render'
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

    // init the first tab
    this.ui.tabs.first().addClass('active');
    this.ui.options.first().addClass('active');
  },

  onTabClick: function(e){
    this.ui.tabs.each(function(){
      $(this).removeClass('active');
    });
    this.ui.options.each(function(){
      $(this).removeClass('active');
    });
    $(e.currentTarget).addClass('active');
    var option = $(e.currentTarget).data('id');
    $('#' + option).addClass('active');
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Access.View');