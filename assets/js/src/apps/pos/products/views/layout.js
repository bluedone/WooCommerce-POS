var hbs = require('handlebars');
var LayoutView = require('lib/config/layout-view');
var POS = require('lib/utilities/global');

var Layout = LayoutView.extend({
  template: hbs.compile('' +
    '<div class="list-actions"></div>' +
    '<div class="list-tabs tabs infinite-tabs"></div>' +
    '<div class="list"></div>' +
    '<div class="list-footer"></div>'
  ),
  tagName: 'section',
  regions: {
    actionsRegion   : '.list-actions',
    tabsRegion      : '.list-tabs',
    listRegion      : '.list',
    footerRegion    : '.list-footer'
  },
  attributes: {
    'class'         : 'module products-module'
  }
});

module.exports = Layout;
POS.attach('POSApp.Products.Layout', Layout);