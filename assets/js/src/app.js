var Application = require('apps/app/application');
var EntitiesService = require('entities/service');
var HeaderService = require('apps/header/service');
var ModalService = require('lib/components/modal/service');
var PopoverService = require('lib/components/popover/service');
var PrintService = require('lib/components/print/service');
var TabsService = require('lib/components/tabs/service');
var ButtonsService = require('lib/components/buttons/service');
var NumpadService = require('lib/components/numpad/service');
var KeypressService = require('lib/components/keypress/service');
var POSRouter = require('apps/pos/router');
var SupportRouter = require('apps/support/router');
var _ = require('lodash');

/**
 * bootstrap Handlebars Helpers
 */
require('lib/utilities/handlebars-helpers');

/**
 * Create the app ...
 */
var app = new Application();

/**
 *  ... add Services which require layout and params
 */
app.on('before:start', function(options){

  // attach options
  this.options = options || {};

  // attach services to global App
  _.extend( this, {
    modalService      : new ModalService(),
    buttonsService    : new ButtonsService(),
    popoverService    : new PopoverService(),
    printService      : new PrintService(),
    tabsService       : new TabsService(),
    numpadService     : new NumpadService(),
    keypressService   : new KeypressService(),
    entitiesService   : new EntitiesService(options),
    headerService     : new HeaderService({
      headerContainer : this.layout.getRegion('header'),
      menuContainer   : this.layout.getRegion('menu')
    }),
    posApp            : new POSRouter({
      container       : this.layout.getRegion('main')
    }),
    supportApp        : new SupportRouter({
      container       : this.layout.getRegion('main')
    })
  } );

  // start services
  this.printService.start();

});

/**
 * Attach app to window for third party plugins
 */
module.exports = app;