var ReceiptView = require('lib/config/receipt-view');
var POS = require('lib/utilities/global');

var View = ReceiptView.extend({
  tagName: 'ul',
  template: 'pos.receipt.tmpl-items'
});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Items', View);