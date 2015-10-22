var ItemView = require('lib/config/item-view');
var App = require('lib/config/application');
var EmulateHTTP = require('lib/behaviors/emulateHTTP');

var View = ItemView.extend({

  template: 'status',

  attributes: {
    id: 'wc_pos-settings-status'
  },

  behaviors: {
    EmulateHTTP: {
      behaviorClass: EmulateHTTP
    }
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Status.View');