var Service = require('lib/config/service');
var TitleBar = require('./views/title-bar');
var Menu = require('./views/menu');
var App = require('lib/config/application');
var Radio = require('backbone.radio');
var routerChannel = Radio.channel('router');
var BrowserModal = require('./views/modals/browser');
var _ = require('lodash');
var Modernizr = global['Modernizr'];

var Service = Service.extend({
  channelName: 'header',

  initialize: function(options) {
    options = options || {};
    this.header = options.headerContainer;
    this.menu = options.menuContainer;

    this.listenToOnce(routerChannel, {
      'route': this.browserCheck
    });

    this.channel.reply({
      'update:title': this.updateTitle
    }, this);
  },

  onStart: function(){
    this.showTitleBar();
    this.showMenu();
  },

  showTitleBar: function(){
    var view = new TitleBar();
    this.header.show(view);
  },

  updateTitle: function(title){
    this.header.currentView.update(title);
  },

  showMenu: function(){
    var view = new Menu();

    this.channel.reply({
      'open:menu'   : view.open,
      'close:menu'  : view.close
    }, view);

    this.menu.show(view);
  },

  browserCheck: function(){
    // smil targets all IE: http://caniuse.com/#feat=svg-smil
    var props = ['flexbox', 'indexeddb', 'smil'],
        pass = _.every(props, function(prop){ return Modernizr[prop]; });

    if(!pass){
      var view = new BrowserModal();
      Radio.request('modal', 'open', view);
    }
  },

  onStop: function(){
    this.channel.reset();
  }
});

module.exports = Service;
App.prototype.set('HeaderApp.Service', Service);