var ReceiptView = require('lib/config/receipt-view');
var hbs = require('handlebars');

module.exports = ReceiptView.extend({

  tagName: 'iframe',

  template: function(){},

  onShow: function(){
    var template = hbs.compile( hbs.Templates.print.receipt ) ;
    this.window = this.el.contentWindow;
    this.window.document.write(template( this.data ));
  },

  print: function(){
    this.window.focus(); // required for IE
    this.window.print();
  }

});