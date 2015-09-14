var ReceiptView = require('lib/config/receipt-view');
var POS = require('lib/utilities/global');

var View = ReceiptView.extend({
  tagName: 'ul',
  template: 'pos.tmpl-receipt-totals'
});

module.exports = View;
POS.attach('POSApp.Receipt.Views.Totals', View);