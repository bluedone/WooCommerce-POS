var LayoutView = require('lib/config/layout-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');

var Layout = LayoutView.extend({

  initialize: function(){
    this.template = hbs.compile('' +
      '<div class="list-header"></div>' +
      '<div class="list"></div>' +
      '<div class="list-actions"></div>' +
      '<div class="list-footer"></div>'
    );
  },

  tagName: 'section',

  regions: {
    header  : '.list-header',
    list    : '.list',
    actions : '.list-actions',
    footer  : '.list-footer'
  },

  attributes: {
    'class' : 'module checkout-module'
  }

});

module.exports = Layout;
POS.attach('POSApp.Checkout.Views.Layout', Layout);