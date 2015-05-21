var ReceiptView = require('lib/config/receipt-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
var $ = require('jquery');

var View = ReceiptView.extend({
  tagName: 'ul',
  template: hbs.compile( $('#tmpl-receipt-items').html() )
});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Items', View);