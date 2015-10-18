var ItemView = require('lib/config/item-view');
var CollectionView = require('lib/config/collection-view');
var LineItem = require('./line/layout');
var App = require('lib/config/application');
var polyglot = require('lib/utilities/polyglot');

var Empty = ItemView.extend({
  tagName: 'li',
  className: 'empty',
  template: function(){
    return polyglot.t('messages.cart-empty');
  }
});

var View = CollectionView.extend({
  tagName: 'ul',
  childView: LineItem,
  emptyView: Empty,
  voidCart: function( order ){
    this.children.each(function(child){
      if( child instanceof Empty ){
        order.destroy();
      } else {
        child.getRegion('item').currentView.removeItem();
      }
    });
  }
});

module.exports = View;
App.prototype.set('POSApp.Cart.Views.Items', View);