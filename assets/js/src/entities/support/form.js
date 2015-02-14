var Model = require('lib/config/model');
var Radio = require('backbone.radio');

module.exports = Model.extend({

  initialize: function() {
    this.url = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });
  },

  sync: function (method, model, options) {
    var nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'nonce'
    });

    var action   = 'action=wc_pos_send_email',
        security = 'security=' + nonce;

    //options.emulateHTTP = true;
    options.url = this.url + '?' + action + '&' + security;

    if(options.buttons){
      this.buttons(options);
    }

    // TODO: fix this
    model.unset('response');

    return Model.prototype.sync(method, model, options);
  },

  buttons: function(options){
    options.buttons.triggerMethod('Update', { message: 'spinner' });
    options.success = function(model, resp){
      var message = 'success';
      if(resp.response){
        message = {
          type: resp.response.result,
          text: resp.response.notice
        };
      }
      options.buttons.triggerMethod('Update', { message: message });
    };
    options.error = function(){
      options.buttons.triggerMethod('Update', { message: 'error' });
    };
  },

  parse: function (resp) {
    // ajax will return false if no option exists
    if(!resp){ resp = null; }
    return resp;
  }

});