var bb = require('backbone');
var Model = require('./model');
var Radio = require('backbone.radio');

module.exports = bb.Collection.extend({

  model: Model,

  url: function(){
    var wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });
    return wc_api + 'pos/templates';
  }

});
