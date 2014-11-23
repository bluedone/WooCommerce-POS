POS.module('POSApp', function(POSApp, POS, Backbone, Marionette, $, _) {

    POSApp.startWithParent = false;

    POSApp.channel = Backbone.Radio.channel('pos');

    // API
    var API = {
        init: function(){
            if( _.isUndefined( POSApp.layout ) ) {
                new POSApp.Products.Controller();
            }
        },
        cart: function(id) {
            this.init();
            new POSApp.Cart.Controller({ id: id });
        },
        checkout: function() {
            this.init();
            new POSApp.Checkout.Controller();
        },
        receipt: function() {
            this.init();
            new POSApp.Receipt.Controller();
        }
    };

    // add routes
    POS.addInitializer( function(){
        new Marionette.AppRouter({
            controller: API,
            appRoutes: {
                '' : 'cart',
                'cart' : 'cart',
                'cart/:id' : 'cart',
                'checkout' : 'checkout',
                'checkout/:id' : 'checkout',
                'receipt/:id' : 'receipt'
            }
        });
    });

    // radio API
    POSApp.channel.comply( 'show:cart', function(id) {
        id ? POS.navigate('cart/' + id) : POS.navigate('') ;
        API.cart(id);
    });

    POSApp.channel.comply( 'show:checkout', function(id) {
        id ? POS.navigate('checkout/' + id) : POS.navigate('checkout') ;
        API.checkout(id);
    });

    POSApp.channel.comply( 'show:receipt', function(id) {
        id ? POS.navigate('receipt/' + id) : POS.navigate('receipt') ;
        API.receipt(id);
    });

});